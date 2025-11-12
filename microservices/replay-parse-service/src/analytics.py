import json
import logging
from util import now
from config import config

PARSER = config["parser"]

class Analytics:
    __task_id: str

    __start_ms: int

    __analytics = {
        "taskId": None,
        "success": None,
        "cached": None,
        "hash": None,
        "replay_size": None,
        "get_ms": None,
        "parse_ms": None,
        "put_ms": None,
        "total_ms": None
    }

    def __init__(self, task_id: str):
        logging.debug(f"Analytics __init__ {now()}")
        self.__task_id = task_id
        self.__start_ms = now()

    ###
    # Completers
    ###
    def complete(self) -> dict:
        msg = self.success(True).__timer_end().__get_message()
        logging.debug(f"Analytics.complete, msg = {json.dumps(msg)}")
        return msg

    def fail(self) -> dict:
        msg = self.success(False).__timer_end().__get_message()
        logging.debug(f"Analytics.fail, msg = {json.dumps(msg)}")
        return msg

    ###
    # Builders
    ###
    def success(self, success: bool) -> 'Analytics':
        logging.debug(f"Analytics.success <- {success}")
        self.__analytics["success"] = success
        return self

    def cached(self, cached: bool) -> 'Analytics':
        logging.debug(f"Analytics.cached <- {cached}")
        self.__analytics["cached"] = cached
        return self

    def hash(self, hash: str) -> 'Analytics':
        logging.debug(f"Analytics.hash <- {hash}")
        self.__analytics["hash"] = hash
        return self

    def replay_size(self, replay_size: int) -> 'Analytics':
        logging.debug(f"Analytics.replay_size <- {replay_size}")
        self.__analytics["replay_size"] = replay_size
        return self

    def timer_split_get(self) -> 'Analytics':
        logging.debug(f"Analytics timer_split_get {now()}")
        start = self.__start_ms
        if start is not None:
            get_ms = now() - self.__start_ms
            logging.debug(f"Analytics.get_ms <- {get_ms}")
            self.__analytics["get_ms"] = get_ms

        return self

    def timer_split_parse(self) -> 'Analytics':
        logging.debug(f"Analytics timer_split_parse {now()}")
        start = self.__start_ms
        get_ms = self.__analytics["get_ms"]
        if start is not None and get_ms is not None:
            parse_ms = now() - self.__start_ms - get_ms
            logging.debug(f"Analytics.parse_ms <- {parse_ms}")
            self.__analytics["parse_ms"] = parse_ms

        return self

    def timer_split_put(self) -> 'Analytics':
        logging.debug(f"Analytics timer_split_put {now()}")
        start = self.__start_ms
        parse_ms = self.__analytics["parse_ms"]
        get_ms = self.__analytics["get_ms"]
        if start is not None and parse_ms is not None and get_ms is not None:
            put_ms = now() - self.__start_ms - parse_ms - get_ms
            logging.debug(f"Analytics.put_ms <- {put_ms}")
            self.__analytics["put_ms"] = put_ms

        return self
    
    ###
    # Private setters/getters
    ###
    def __timer_end(self) -> 'Analytics':
        logging.debug(f"Analytics __timer_end {now()}")
        start = self.__start_ms
        if start is not None:
            total_ms = now() - self.__start_ms
            logging.debug(f"Analytics.total_ms <- {total_ms}")
            self.__analytics["total_ms"] = now() - self.__start_ms
        return self

    def __get_message(self) -> str:
        tags = [
            ["taskId", self.__task_id],
            ["hash", self.__get_hash()],
            ["success", Analytics.__stringify_bool(self.__get_success())],
            ["cached", Analytics.__stringify_bool(self.__get_cached())],
            ["parser", PARSER],
        ]
        booleans = [
            ["success", self.__get_success()],
            ["cached", self.__get_cached()]
        ]
        ints = [
            ["getMs", self.__get_get_ms()],
            ["parseMs", self.__get_parse_ms()],
            ["putMs", self.__get_put_ms()],
            ["totalMs", self.__get_total_ms()],
            ["replayKb", self.__get_replay_size()]
        ]

        return json.dumps({
            "pattern": "analytics",
            "data": {
                "name": "parseReplay",
                "tags": list(filter(lambda x: x[1] is not None, tags)),
                "booleans": list(filter(lambda x: x[1] is not None, booleans)),
                "ints": list(filter(lambda x: x[1] is not None, ints))
            }
        })

    def __get_success(self) -> bool:
        return bool(self.__analytics["success"])

    def __get_cached(self) -> bool:
        return bool(self.__analytics["cached"])

    def __get_hash(self) -> str:
        return self.__analytics["hash"]

    def __get_replay_size(self) -> int:
        return self.__analytics["replay_size"]

    def __get_get_ms(self) -> int:
        return self.__analytics["get_ms"]

    def __get_parse_ms(self) -> int:
        return self.__analytics["parse_ms"]

    def __get_put_ms(self) -> int:
        return self.__analytics["put_ms"]

    def __get_total_ms(self) -> int:
        return self.__analytics["total_ms"]
    
    @staticmethod
    def __stringify_bool(b: bool) -> str:
        if b == True:
            return 'true'
        else:
            return 'false'
    