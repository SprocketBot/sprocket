import time
import logging
import psycopg2
import json
import os
from typing import Union, Dict, Any
from minio import S3Error

from config import config
import files
import parser
from analytics import Analytics
from progress import Progress

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

PARSER_VERSION = "1"
PARSED_OBJECT_PREFIX = f"{config['minio']['parsed_object_prefix']}/v{PARSER_VERSION}"
DISABLE_CACHE = config["disableCache"]

# Database connection parameters
DB_HOST = config["db"]["host"]
DB_PORT = config["db"]["port"]
DB_USER = config["db"]["username"]
DB_PASSWORD = config["db"]["password"]
DB_NAME = config["db"]["database"]

def get_db_connection():
    return psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        dbname=DB_NAME
    )

def process_replay(task_id: str, payload: Dict[str, Any]):
    logging.info(f"Processing task {task_id}")
    
    progress = Progress(task_id)
    analytics = Analytics(task_id)
    
    # Mock publishing progress/analytics since we don't have RMQ anymore
    # In a real scenario, we might want to write these to the DB or another service
    def publish_progress(msg):
        logging.debug(f"Progress: {msg}")

    def publish_analytics(msg):
        logging.debug(f"Analytics: {msg}")

    publish_progress(progress.pending("Task started...", 10))

    replay_object_path: Union[str, None] = payload.get("replayObjectPath")
    if not replay_object_path:
        raise ValueError("replayObjectPath is missing in payload")

    replay_hash = replay_object_path.split("/")[-1].split(".")[0]
    analytics.hash(replay_hash)

    parsed_object_path = f"{PARSED_OBJECT_PREFIX}/{replay_hash}.json"

    logging.info(f"Parsing replay {replay_object_path}")

    # Check if the replay has already been parsed and stats are in minio
    if DISABLE_CACHE is False:
        try:
            logging.debug("Checking for results in minio")

            already_parsed = files.get(parsed_object_path)
            logging.info(f"Replay already parsed {parsed_object_path}")

            publish_progress(progress.complete(already_parsed))
            publish_analytics(analytics.timer_split_get().cached(True).complete())

            return already_parsed
        except S3Error as e:
            if e.code == "NoSuchKey":
                logging.debug("No results found in minio, parsing replay")
                pass
        except Exception:
            raise

    logging.debug(f"Fetching object {replay_object_path} from minio")
    publish_progress(progress.pending("Fetching replay...", 20))

    path = files.fget(replay_object_path)
    analytics.timer_split_get()
    analytics.replay_size(os.path.getsize(path) * 1000)

    logging.debug(f"Parsing replay")
    publish_progress(progress.pending("Parsing replay...", 40))

    try:
        parsed_data = parser.parse(
            path,
            lambda msg: publish_progress(progress.pending(msg))
        )
        publish_progress(progress.pending("Cleaning up...", 90))
    except Exception as e:
        raise e
    finally:
        logging.debug(f"Deleting local data")
        if os.path.exists(path):
            os.remove(path)

    analytics.timer_split_parse()

    result = {
        "parser": config["parser"],
        "parserVersion": PARSER_VERSION,
        "outputPath": parsed_object_path,
        "data": parsed_data,
    }

    logging.info(f"Parsing complete")
    publish_progress(progress.complete(result))

    try:
        logging.debug(f"Uploading to minio")
        files.put(parsed_object_path, result)
    except Exception as e:
        logging.warn(f"Failed uploading parsed JSON to minio {e}")

    publish_progress(progress.complete(result))
    publish_analytics(analytics.timer_split_put().complete())
    
    return result

def main():
    logging.info("Starting Replay Parse Service (Polling Mode)")
    
    while True:
        conn = None
        try:
            conn = get_db_connection()
            cur = conn.cursor()

            # Poll for new tasks
            cur.execute("""
                SELECT id, payload, "retryCount"
                FROM event_queue
                WHERE status = 'PENDING' AND "targetService" = 'REPLAY_PARSE'
                ORDER BY "createdAt" ASC
                LIMIT 1
                FOR UPDATE SKIP LOCKED
            """)
            
            row = cur.fetchone()
            
            if row:
                task_id, payload, retry_count = row
                logging.info(f"Picked up task {task_id}")
                
                try:
                    process_replay(str(task_id), payload)
                    
                    # Mark as processed
                    cur.execute("""
                        UPDATE event_queue
                        SET status = 'PROCESSED', "processedAt" = NOW()
                        WHERE id = %s
                    """, (task_id,))
                    conn.commit()
                    logging.info(f"Task {task_id} processed successfully")
                    
                except Exception as e:
                    logging.error(f"Error processing task {task_id}: {e}")
                    
                    # Mark as failed and increment retry count
                    cur.execute("""
                        UPDATE event_queue
                        SET status = 'FAILED', "retryCount" = "retryCount" + 1
                        WHERE id = %s
                    """, (task_id,))
                    conn.commit()
            else:
                # No tasks found, sleep for a bit
                conn.commit() # Commit to release any potential locks, though SELECT ... FOR UPDATE SKIP LOCKED shouldn't hold if no rows
                time.sleep(1)
                
        except Exception as e:
            logging.error(f"Database polling error: {e}")
            time.sleep(5) # Sleep longer on DB error
        finally:
            if conn:
                conn.close()

if __name__ == "__main__":
    main()
