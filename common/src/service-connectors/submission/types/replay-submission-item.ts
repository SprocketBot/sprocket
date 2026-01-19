import type { ProgressMessage, Task } from '../../../celery';

export interface ReplaySubmissionItem {
  taskId: string;
  originalFilename: string;
  inputPath: string;
  outputPath?: string;
  progress?: ProgressMessage<Task.ParseReplay>;
}
