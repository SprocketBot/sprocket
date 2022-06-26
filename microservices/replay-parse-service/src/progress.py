from enum import Enum
import json
import logging


class TaskProgressStatus(str, Enum):
    Pending = "Pending"
    Complete = "Complete"
    Error = "Error"


class Progress:
    _task_id: str

    def __init__(self, task_id: str):
        self._task_id = task_id

    def _get_msg(
        self,
        status: TaskProgressStatus,
        progress_message: str,
        progress_value: int = None,
        result: dict = None,
        error: str = None
    ):
        return json.dumps({
            "taskId": self._task_id,
            "status": status,
            "progress": {
                "value": progress_value,
                "message": progress_message,
            },
            "result": result,
            "error": error,
        })

    def pending(self, message: str, value: int = None) -> str:
        return self._get_msg(TaskProgressStatus.Pending, message, value)
    
    def complete(self, result: str) -> str:
        return self._get_msg(TaskProgressStatus.Complete, "Done!", 100, result, None)
    
    def error(self, error: str) -> str:
        return self._get_msg(TaskProgressStatus.Error, "Failed", 100, None, error)
