import type {z} from "zod";

import {ParseReplay_Request, ParseReplay_Response} from "./schemas";

export enum Task {
    ParseReplay = "ParseReplay",
}

export const taskNames: Record<Task, string> = {
    [Task.ParseReplay]: "parseReplay",
};

export const TaskSchemas = {
    [Task.ParseReplay]: {
        args: ParseReplay_Request,
        result: ParseReplay_Response,
    },
};

export interface AllTaskArgs {
    progressQueue?: string;
}

export type TaskArgs<T extends Task> = z.infer<typeof TaskSchemas[T]["args"]> &
    AllTaskArgs;

export type TaskResult<T extends Task> = z.infer<
    typeof TaskSchemas[T]["result"]
>;

export interface RunOpts<T extends Task> {
    progressQueue?: string;
    cb?: (
        taskId: string,
        result: TaskResult<T> | null,
        error: Error | null,
    ) => void | Promise<void>;
}
