export enum ProgressStatus {
  Pending = 'Pending',
  Complete = 'Complete',
  Error = 'Error',
}

export interface Progress {
  value: number;
  message: string;
}

export interface ProgressMessage<TaskResult> {
  taskId: string;

  status: ProgressStatus;
  progress: Progress;

  result: TaskResult | null;
  error: string | null;
}
