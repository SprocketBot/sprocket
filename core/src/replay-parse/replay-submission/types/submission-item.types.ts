import type {ProgressMessage, Task} from "@sprocketbot/common";

export interface ReplaySubmissionItem {
    taskId: string;
    originalFilename: string;
    inputPath: string;
    outputPath?: string;
    progress?: ProgressMessage<Task.ParseReplay>;
}
