import {z} from "zod";

import type {Task, TaskResult} from "../index";

export enum ProgressStatus {
    Pending = "Pending",
    Complete = "Complete",
    Error = "Error",
}

export interface Progress {
    value: number;
    message: string;
}

export interface ProgressMessage<T extends Task> {
    taskId: string;

    status: ProgressStatus;
    progress: Progress;

    result?: TaskResult<T> | null;
    error?: string | null;
}

export const ProgressMessageSchema = z.object({
    taskId: z.string(),
    status: z.nativeEnum(ProgressStatus),
    progress: z.object({
        value: z.number(),
        message: z.string(),
    }),
    error: z.string().nullable().optional(),
});
