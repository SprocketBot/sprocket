import os
import time

import celery
import logging
from minio import S3Error

from config import config
import files
import parser
from progress import get_progress_msg, TaskProgressStatus
from analytics import get_analytics_msg
import celeryconfig
from kombu import Connection, Exchange, Queue, Producer


# Celery pipeline for starting jobs (broker) and publishing results (backend)
app = celery.Celery(config_source=celeryconfig)

PARSER_VERSION = "1"

ANALYTICS_QUEUE = config["transport"]["analytics_queue"]
PARSED_OBJECT_PREFIX = f"{config['minio']['parsed_object_prefix']}/v{PARSER_VERSION}"

class BaseTask(celery.Task):
    def on_failure(self, exc: Exception, task_id, args, kwargs, einfo):
        self.publish(self.progress_queue, get_progress_msg(
            taskId=self.request.id,
            status=TaskProgressStatus.Error,
            progressValue=100,
            progressMessage="Failed",
            error=str(exc)
        ))
        self.analytics["success"] = False
        self.publish(ANALYTICS_QUEUE, get_analytics_msg(self.analytics))
        logging.error(f"Task failed, task_id={task_id} args={args} kwargs={kwargs} exc={exc} einfo={einfo}")

class ParseReplay(BaseTask):
    name = "parseReplay"
    analytics = {}
    _producer = None

    def __init__(self):
        self.connect()

    def connect(self):
        self._producer = Producer(Connection(config["transport"]["url"]))
    
    def close(self):
        self._producer.close()

    def publish(self, queue, msg):
        if not queue:
            return
        if not self._producer or not self._producer.connection.connected:
            logging.warn("Creating RMQ connection")
            self.connect()
        self._producer.publish(msg, routing_key=queue)

    def run(self, **kwargs):
        """Parses a replay. Sends progress updates to a RMQ queue.

        Keyword arguments:
            progress_queue (str, optional): The name of the progress queue to send progress messages to.
            object_name (str): The name of the object in the replays bucket to parse.

        Returns:
            dict: A dictionary containing the parsed replay.
        """

        self.analytics = {}
        start_time = time.time()

        self.progress_queue = kwargs.get("progressQueue")
        replay_object_path = kwargs.get("replayObjectPath")

        self.publish(self.progress_queue, get_progress_msg(
            taskId=self.request.id,
            status=TaskProgressStatus.Pending,
            progressValue=10,
            progressMessage="Task started...",
        ))

        hash = replay_object_path.split("/")[-1].split(".")[0]
        self.analytics["hash"] = hash

        parsed_object_path = f"{PARSED_OBJECT_PREFIX}/{hash}.json"

        logging.info(f"Parsing replay {replay_object_path} with progress queue {self.progress_queue}")

        # Check if the replay has already been parsed and stats are in minio
        try:
            already_parsed = files.get(parsed_object_path)
            logging.info(f"Replay already parsed")
            self.publish(self.progress_queue, get_progress_msg(
                taskId=self.request.id,
                status=TaskProgressStatus.Complete,
                progressValue=100,
                progressMessage="Done!",
                result=already_parsed
            ))

            self.analytics["success"] = True
            self.analytics["cached"] = True
            self.analytics["totalMs"] = (time.time() - start_time) * 1000
            self.publish(ANALYTICS_QUEUE, get_analytics_msg(self.analytics))

            return already_parsed
        except S3Error as e:
            if e.code == "NoSuchKey":
                pass
        except:
            self.analytics["totalMs"] = (time.time() - start_time) * 1000
            raise

        logging.debug(f"Fetching object {replay_object_path} from minio")
        self.publish(self.progress_queue, get_progress_msg(
            taskId=self.request.id,
            status=TaskProgressStatus.Pending,
            progressValue=20,
            progressMessage="Fetching replay...",
        ))

        path = files.fget(replay_object_path)

        self.analytics["replayKb"] = os.path.getsize(path) * 1000
        get_time = time.time()
        self.analytics["getMs"] = (get_time - start_time) * 1000
        
        logging.debug(f"Parsing replay")
        self.publish(self.progress_queue, get_progress_msg(
            taskId=self.request.id,
            status=TaskProgressStatus.Pending,
            progressValue=40,
            progressMessage="Parsing replay...",
        ))

        try:
            parsed_data = parser.parse(path)
        except Exception as e:
            raise e
        finally:
            logging.debug(f"Deleting local data")
            self.publish(self.progress_queue, get_progress_msg(
                taskId=self.request.id,
                status=TaskProgressStatus.Pending,
                progressValue=90,
                progressMessage="Cleaning up...",
            ))

            os.remove(path)
        
        parse_time = time.time()
        self.analytics["parseMs"] = (parse_time - get_time) * 1000

        result = { "data": parsed_data }

        logging.info(f"Parsing complete")
        self.publish(self.progress_queue, get_progress_msg(
            taskId=self.request.id,
            status=TaskProgressStatus.Complete,
            progressValue=100,
            progressMessage="Done!",
            result=result
        ))

        try:
            logging.debug(f"Uploading to minio")
            files.put(parsed_object_path, result)
        except Exception as e:
            logging.error(f"Failed uploading parsed JSON to minio {e}")

        put_time = time.time()
        self.analytics["success"] = True
        self.analytics["cached"] = False
        self.analytics["putMs"] = (put_time - parse_time) * 1000
        self.analytics["totalMs"] = (put_time - start_time) * 1000

        self.publish(ANALYTICS_QUEUE, get_analytics_msg(self.analytics))

        # Clean up Kombu connection
        self.close()

        return result

app.register_task(ParseReplay())
