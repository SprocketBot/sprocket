from typing import Union
import os

import celery
import logging

from config import config
import files
import parser
from analytics import Analytics
from progress import Progress
import celeryconfig
from kombu import Producer, Connection


# Celery pipeline for starting jobs (broker) and returning results (backend)
app = celery.Celery(config_source=celeryconfig)

PARSER_VERSION = "1"

ANALYTICS_QUEUE = config["transport"]["analytics_queue"]
PARSED_OBJECT_PREFIX = f"{config['s3']['parsed_object_prefix']}/v{PARSER_VERSION}"
DISABLE_CACHE = config["disableCache"]

class BaseTask(celery.Task):
    name: str

    progress_queue: Union[str, None]
    progress: Progress

    analytics: Analytics

    __producer: Producer

    def connect(self):
        logging.debug("Creating RMQ connection")
        ssl_opts = {
            "server_hostname": celeryconfig._SERVER_HOSTNAME
        } if celeryconfig.SECURE else None

        self.__producer = Producer(Connection(config["transport"]["url"], ssl=ssl_opts))

    def publish_progress(self, msg: str):
        if not self.progress_queue:
            return
        if self.__producer == None or not self.__producer.connection.connected:
            self.connect()

        self.__producer.publish(msg, routing_key=self.progress_queue)

    def publish_analytics(self, msg: str):
        if self.__producer == None or not self.__producer.connection.connected:
            self.connect()

        self.__producer.publish(msg, ANALYTICS_QUEUE)

    def before_start(self, task_id: str, args, kwargs: dict):
        self.progress_queue = kwargs.get("progressQueue")
        self.connect()
        self.progress = Progress(task_id)
        self.analytics = Analytics(task_id)

    def on_failure(self, exc: Exception, task_id: str, args, kwargs, einfo):
        logging.error(f"Task failed, task_id={task_id} args={args} kwargs={kwargs} exc={exc} einfo={einfo}")

        self.publish_progress(
            self.progress.error(str(exc))
        )
        self.publish_analytics(
            self.analytics.fail()
        )


class ParseReplay(BaseTask):
    name = "parseReplay"

    def run(self, **kwargs: dict) -> dict:
        """Parses a replay. Sends progress updates to a RMQ queue.

        Keyword arguments:
            progress_queue (str, optional): The queue to send progress messages to.
            replayObjectPath (str): The object in the replays bucket to parse.

        Returns:
            dict: A dictionary containing the parsed replay.
        """
        self.publish_progress(
            self.progress.pending("Task started...", 10)
        )

        replay_object_path: Union[str, None] = kwargs.get("replayObjectPath")

        replay_hash = replay_object_path.split("/")[-1].split(".")[0]
        self.analytics.hash(replay_hash)

        parsed_object_path = f"{PARSED_OBJECT_PREFIX}/{replay_hash}.json"

        logging.info(f"Parsing replay {replay_object_path} with progress queue {self.progress_queue}")

        # Check if the replay has already been parsed and stats are in S3
        if DISABLE_CACHE is False:
            logging.debug("Checking for parsed results")

            parsed = files.get(parsed_object_path)
            if parsed:
                logging.info(f"Replay already parsed {parsed_object_path}")

                self.publish_progress(
                    self.progress.complete(parsed)
                )
                self.publish_analytics(
                    self.analytics.timer_split_get().cached(True).complete()
                )
            else:
                logging.debug("No parsed results found, parsing replay")
        else:
            logging.debug("Cache disabled, not checking for parsed results")

        logging.debug(f"Fetching object {replay_object_path} from S3")
        self.publish_progress(
            self.progress.pending("Fetching replay...", 20)
        )

        path = files.fget(replay_object_path)            
        self.analytics.timer_split_get()
        self.analytics.replay_size(os.path.getsize(path) * 1000)

        logging.debug(f"Parsing replay")
        self.publish_progress(
            self.progress.pending("Parsing replay...", 40)
        )

        try:
            parsed_data = parser.parse(
                path,
                lambda msg : self.publish_progress(self.progress.pending(msg))
            )
            self.publish_progress(
                self.progress.pending("Cleaning up...", 90)
            )
        except Exception as e:
            raise e
        finally:
            logging.debug(f"Deleting local data")
            os.remove(path)

        self.analytics.timer_split_parse()

        result = {
            "parser": config["parser"],
            "parserVersion": PARSER_VERSION,
            "outputPath": parsed_object_path,
            "data": parsed_data,
        }

        logging.info(f"Parsing complete")
        self.publish_progress(
            self.progress.complete(result)
        )

        logging.debug(f"Uploading to S3")
        files.put(parsed_object_path, result)

        self.publish_progress(
            self.progress.complete(result)
        )
        self.publish_analytics(
            self.analytics.timer_split_put().complete()
        )
        return result

app.register_task(ParseReplay())
