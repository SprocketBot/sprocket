from typing import Union
import json
import logging
import os
import time
import uuid

import healthz
import psycopg2
import psycopg2.extras
from minio import S3Error

from config import config
import files
import parser
from analytics import Analytics
from progress import Progress

healthz.start()

PARSER_VERSION = "4"

ANALYTICS_QUEUE = config["transport"]["analytics_queue"]
PARSED_OBJECT_PREFIX = f"{config['minio']['parsed_object_prefix']}/v{PARSER_VERSION}"
DISABLE_CACHE = config["disableCache"]
POLL_SECONDS = float(os.environ.get("TASK_POLL_SECONDS", "0.5"))


def connect_db():
    return psycopg2.connect(
        host=config["db"]["host"],
        port=config["db"]["port"],
        user=config["db"]["username"],
        password=config["db"]["password"],
        dbname=config["db"]["database"],
    )


class ParseReplay:
    name = "parseReplay"

    def __init__(self, task_id: str, progress_queue: Union[str, None], db):
        self.task_id = task_id
        self.progress_queue = progress_queue
        self.progress = Progress(task_id)
        self.analytics = Analytics(task_id)
        self.db = db

    def publish_progress(self, msg: str):
        if not self.progress_queue:
            return
        with self.db.cursor() as cur:
            cur.execute(
                """
                    INSERT INTO sprocket.platform_task_progress (task_id, progress_queue, message)
                    VALUES (%s, %s, %s)
                """,
                (self.task_id, self.progress_queue, psycopg2.extras.Json(json.loads(msg))),
            )
        self.db.commit()

    def publish_analytics(self, msg: str):
        analytics_message = json.loads(msg)
        with self.db.cursor() as cur:
            cur.execute(
                """
                    INSERT INTO sprocket.platform_rpc_queue (id, queue, pattern, payload)
                    VALUES (%s, %s, %s, %s)
                """,
                (
                    str(uuid.uuid4()),
                    ANALYTICS_QUEUE,
                    analytics_message["pattern"],
                    psycopg2.extras.Json(analytics_message["data"]),
                ),
            )
        self.db.commit()

    def run(self, **kwargs: dict) -> dict:
        """Parses a replay and writes progress updates to Postgres."""
        self.publish_progress(
            self.progress.pending("Task started...", 10)
        )

        replay_object_path: Union[str, None] = kwargs.get("replayObjectPath")
        if replay_object_path is None:
            raise ValueError("Missing replayObjectPath")

        replay_hash = replay_object_path.split("/")[-1].split(".")[0]
        self.analytics.hash(replay_hash)

        parsed_object_path = f"{PARSED_OBJECT_PREFIX}/{replay_hash}.json"

        logging.info(f"Parsing replay {replay_object_path} with progress queue {self.progress_queue}")

        if DISABLE_CACHE is False:
            try:
                logging.debug("Checking for results in minio")

                already_parsed = files.get(parsed_object_path)
                logging.info(f"Replay already parsed {parsed_object_path}")

                self.publish_progress(
                    self.progress.complete(already_parsed)
                )
                self.publish_analytics(
                    self.analytics.timer_split_get().cached(True).complete()
                )

                return already_parsed
            except S3Error as e:
                if e.code == "NoSuchKey":
                    logging.debug("No results found in minio, parsing replay")
                    pass
            except:
                raise

        logging.debug(f"Fetching object {replay_object_path} from minio")
        self.publish_progress(
            self.progress.pending("Fetching replay...", 20)
        )

        path = files.fget(replay_object_path)
        self.analytics.timer_split_get()
        self.analytics.replay_size(os.path.getsize(path) * 1000)

        logging.debug("Parsing replay")
        self.publish_progress(
            self.progress.pending("Parsing replay...", 40)
        )

        try:
            parsed_data = parser.parse(
                path,
                lambda msg: self.publish_progress(self.progress.pending(msg))
            )
            self.publish_progress(
                self.progress.pending("Cleaning up...", 90)
            )
        except Exception as e:
            raise e
        finally:
            logging.debug("Deleting local data")
            os.remove(path)

        self.analytics.timer_split_parse()

        parser_metadata = parser.get_result_metadata()
        result = {
            **parser_metadata,
            "parserVersion": PARSER_VERSION,
            "outputPath": parsed_object_path,
            "data": parsed_data,
        }

        logging.info("Parsing complete")
        self.publish_progress(
            self.progress.complete(result)
        )

        try:
            logging.debug("Uploading to minio")
            files.put(parsed_object_path, result)
        except Exception as e:
            logging.warning(f"Failed uploading parsed JSON to minio {e}")

        self.publish_progress(
            self.progress.complete(result)
        )
        self.publish_analytics(
            self.analytics.timer_split_put().complete()
        )
        return result


def ensure_schema(db):
    with db.cursor() as cur:
        cur.execute("CREATE SCHEMA IF NOT EXISTS sprocket")
        cur.execute("""
            CREATE TABLE IF NOT EXISTS sprocket.platform_task_queue (
                id text NOT NULL,
                task text NOT NULL,
                args jsonb NOT NULL,
                progress_queue text,
                status text NOT NULL DEFAULT 'pending',
                result jsonb,
                error jsonb,
                created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                locked_at TIMESTAMPTZ,
                CONSTRAINT "PK_platform_task_queue" PRIMARY KEY (id)
            )
        """)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS sprocket.platform_task_progress (
                id BIGSERIAL NOT NULL,
                task_id text NOT NULL,
                progress_queue text NOT NULL,
                message jsonb NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                CONSTRAINT "PK_platform_task_progress" PRIMARY KEY (id)
            )
        """)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS sprocket.platform_rpc_queue (
                id uuid NOT NULL,
                queue text NOT NULL,
                pattern text NOT NULL,
                payload jsonb NOT NULL,
                response jsonb,
                error jsonb,
                status text NOT NULL DEFAULT 'pending',
                created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                locked_at TIMESTAMPTZ,
                CONSTRAINT "PK_platform_rpc_queue" PRIMARY KEY (id)
            )
        """)
    db.commit()


def reserve_task(db):
    with db.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
        cur.execute("BEGIN")
        cur.execute(
            """
                SELECT id, task, args, progress_queue
                FROM sprocket.platform_task_queue
                WHERE status = 'pending'
                ORDER BY created_at ASC
                FOR UPDATE SKIP LOCKED
                LIMIT 1
            """
        )
        row = cur.fetchone()
        if not row:
            db.commit()
            return None
        cur.execute(
            """
                UPDATE sprocket.platform_task_queue
                SET status = 'processing', locked_at = now(), updated_at = now()
                WHERE id = %s
            """,
            (row["id"],),
        )
        db.commit()
        return row


def complete_task(db, task_id: str, result: dict):
    with db.cursor() as cur:
        cur.execute(
            """
                UPDATE sprocket.platform_task_queue
                SET status = 'completed', result = %s, updated_at = now()
                WHERE id = %s
            """,
            (psycopg2.extras.Json(result), task_id),
        )
    db.commit()


def fail_task(db, task_id: str, error: Exception):
    with db.cursor() as cur:
        cur.execute(
            """
                UPDATE sprocket.platform_task_queue
                SET status = 'failed', error = %s, updated_at = now()
                WHERE id = %s
            """,
            (psycopg2.extras.Json({"message": str(error)}), task_id),
        )
    db.commit()


def run_task(db, row):
    if row["task"] != ParseReplay.name:
        raise ValueError(f"Unsupported task {row['task']}")
    task = ParseReplay(row["id"], row["progress_queue"], db)
    return task.run(**row["args"])


def main():
    logging.basicConfig(level=os.environ.get("LOG_LEVEL", "INFO"))
    db = connect_db()
    ensure_schema(db)
    logging.info("Replay parse worker polling Postgres task queue")

    while True:
        row = reserve_task(db)
        if not row:
            time.sleep(POLL_SECONDS)
            continue
        try:
            result = run_task(db, row)
            complete_task(db, row["id"], result)
        except Exception as error:
            logging.exception(f"Task failed task_id={row['id']}")
            try:
                ParseReplay(row["id"], row["progress_queue"], db).publish_progress(
                    Progress(row["id"]).error(str(error))
                )
            finally:
                fail_task(db, row["id"], error)


if __name__ == "__main__":
    main()
