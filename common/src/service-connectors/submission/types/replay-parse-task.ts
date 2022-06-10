import type {
    ProgressStatus, Task, TaskResult,
} from "../../../celery";

export interface ReplayParseTask {
    status: ProgressStatus;
    result: TaskResult<Task.ParseReplay> | null;
    error: Error | null;
    taskId: string;
}
