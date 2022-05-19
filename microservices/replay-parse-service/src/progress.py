from enum import Enum
import json


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
        progressValue: int,
        progressMessage: str,
        result: dict = None,
        error: str = None
    ):
        return json.dumps({
            "taskId": self._task_id,
            "status": status,
            "progress": {
                "value": progressValue,
                "message": progressMessage,
            },
            "result": result,
            "error": error,
        })

    def pending(self, value: int, message: str) -> str:
        return self._get_msg(TaskProgressStatus.Pending, value, message)
    
    def complete(self, result: str) -> str:
        return self._get_msg(TaskProgressStatus.Complete, 100, "Done!", result, None)
    
    def error(self, error: str) -> str:
        return self._get_msg(TaskProgressStatus.Error, 100, "Failed", None, error)
