from enum import Enum
import json

def get_progress_msg(taskId, status, progressValue, progressMessage, result=None, error=None):
    """Sends a progress message on the determined progress queue.
    Note: Must conform to the type TaskProgressMessage in sprocket-common

    Args:
        status (TaskProgressStatus): The status of the task.
        progressValue (int): The progress of this task, [0-100].
        progressMessage (str): A user friendly message describing the task's progress.
        result (_type_, optional): Data returned by the task. Should only be set when status == Complete. Defaults to None.
        error (_type_, optional): An error that occurred during task execution. Should only be set when status == Error. Defaults to None.
    """
    return json.dumps({
        "taskId": taskId,
        "status": status,
        "progress": {
            "value": progressValue,
            "message": progressMessage,
        },
        "result": result,
        "error": error,
    })

class TaskProgressStatus(str, Enum):
    Pending = "Pending"
    Complete = "Complete"
    Error = "Error"
