export enum Task {
    ParseReplay = "ParseReplay",
}

export const taskNames: Record<Task, string> = {
    [Task.ParseReplay]: "parseReplay",
};

export interface TaskTypes {
    [Task.ParseReplay]: {
        args: {
            replayObjectPath: string;
        };
        return: {
            data: unknown; // TODO what do we want?
        };
    };
}

export type TaskArgs<T extends Task> = TaskTypes[T]["args"] & {
    progressQueue?: string;
};

export type TaskResult<T extends Task> = TaskTypes[T]["return"];

export interface RunOpts<T extends Task> {
    progressQueue?: string;
    cb?: (taskId: string, result: TaskResult<T> | null, error: Error | null) => void | Promise<void>;
}
