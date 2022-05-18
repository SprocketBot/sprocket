import json
from util import now
from config import config

PARSER = config["parser"]

class Analytics:
    __task_id: str

    __analytics = {
        "taskId": None,
        "success": None,
        "cached": None,
        "hash": None,
        "replay_size": None,
        "get_duration": None,
        "parse_duration": None,
        "put_duration": None,
        "total_duration": None
    }

    __start_ms: int

    def __init__(self, task_id: str):
        self.__task_id = task_id
        self.__start_ms = now()

    def set_success(self, success: bool):
        self.__analytics["success"] = success

    def set_cached(self, cached: bool):
        self.__analytics["cached"] = cached

    def set_hash(self, hash: str):
        self.__analytics["hash"] = hash

    def set_replay_size(self, replay_size: int):
        self.__analytics["replay_size"] = replay_size

    def start_timer(self):
        self.__start_ms = now()
    
    def timer_split_get(self):
        self.__analytics["get_duration"] = now() - self.__start_ms

    def timer_split_parse(self):
        self.__analytics["parse_duration"] = now() - self.__start_ms

    def timer_split_put(self):
        self.__analytics["put_duration"] = now() - self.__start_ms

    def get_message(self) -> str:
        tags = [
            ["taskId", self.__task_id],
            ["hash", self.__get_hash()],
            ["success", self.__get_success()],
            ["cached", self.__get_cached()],
            ["parser", PARSER],
        ]
        booleans = [
            ["success", self.__get_success()],
            ["cached", self.__get_cached()]
        ]
        ints = [
            ["getMs", self.__get_get_duration()],
            ["parseMs", self.__get_parse_duration()],
            ["putMs", self.__get_put_duration()],
            ["totalMs", self.__get_total_duration()],
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
        return self.__analytics["success"]

    def __get_cached(self) -> bool:
        return self.__analytics["cached"]

    def __get_hash(self) -> str:
        return self.__analytics["hash"]

    def __get_replay_size(self) -> int:
        return self.__analytics["replay_size"]

    def __get_get_duration(self) -> int:
        return self.__analytics["get_duration"]

    def __get_parse_duration(self) -> int:
        return self.__analytics["parse_duration"]

    def __get_put_duration(self) -> int:
        return self.__analytics["put_duration"]

    def __get_total_duration(self) -> int:
        get_duration = self.__analytics["get_duration"] or 0
        parse_duration = self.__analytics["parse_duration"] or 0
        put_duration = self.__analytics["put_duration"] or 0
        return get_duration + parse_duration + put_duration
