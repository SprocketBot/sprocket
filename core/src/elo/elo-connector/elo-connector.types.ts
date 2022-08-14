import type {z} from "zod";

import * as Schemas from "./schemas";

export const EloBullQueue = "elo";

export enum EloEndpoint {
    CalculateSalaries = "CalculateSalaries",
    CalculateEloForSeries = "CalculateEloForSeries",
    CalculateEloForNcp = "CalculateEloForNcp",
}

export const EloSchemas = {
    [EloEndpoint.CalculateSalaries]: {
        input: Schemas.CalculateSalaries_Input,
        output: Schemas.CalculateSalaries_Output,
    },
    [EloEndpoint.CalculateEloForSeries]: {
        input: Schemas.CalculateEloForSeries_Input,
        output: Schemas.CalculateEloForSeries_Output,
    },
    [EloEndpoint.CalculateEloForNcp]: {
        input: Schemas.CalculateEloForNcp_Input,
        output: Schemas.CalculateEloForNcp_Output,
    },
};

export type EloInput<T extends EloEndpoint> = z.infer<typeof EloSchemas[T]["input"]>;
export type EloOutput<T extends EloEndpoint> = z.infer<typeof EloSchemas[T]["output"]>;

export type JobListener<E extends EloEndpoint> = (d: EloOutput<E>) => Promise<void>;

export interface JobListenerPayload {
    endpoint: EloEndpoint;
    success: JobListener<EloEndpoint>;
    failure: (e: Error) => Promise<void>;
}
