import json
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
        self.__task_id = task_id
        self.__start_ms = now()

    ###
    # Completers
    ###
    def complete(self) -> dict:
        self.__analytics["success"] = True
        self.__timer_end()
        return self.__get_message()

    def fail(self) -> dict:
        self.__analytics["success"] = False
        self.__timer_end()
        return self.__get_message()

    ###
    # Builders
    ###
    def cached(self, cached: bool) -> 'Analytics':
        self.__analytics["cached"] = cached
        return self

    def hash(self, hash: str) -> 'Analytics':
        self.__analytics["hash"] = hash
        return self

    def replay_size(self, replay_size: int) -> 'Analytics':
        self.__analytics["replay_size"] = replay_size
        return self

    def timer_start(self) -> 'Analytics':
        self.__start_ms = now()
        return self
    
    def timer_split_get(self) -> 'Analytics':
        self.__analytics["get_ms"] = now() - self.__start_ms
        return self

    def timer_split_parse(self) -> 'Analytics':
        self.__analytics["parse_ms"] = now() - self.__start_ms
        return self

    def timer_split_put(self) -> 'Analytics':
        self.__analytics["put_ms"] = now() - self.__start_ms
        return self
    
    ###
    # Private setters/getters
    ###
    def __timer_end(self):
        self.__analytics["total_ms"] = now() - self.__start_ms

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
    