import type {z} from "zod";

import * as Schemas from "./schemas";

export const EloBullQueue = "elo";

export interface CurrentEloValues {
    player_id: number;
    elo: number;
    league: string;
    salary: number;
    name: string;
}

export enum EloEndpoint {
    CalculateSalaries = "CalculateSalaries",
    CalculateEloForMatch = "CalculateEloForMatch",
    CalculateEloForNcp = "CalculateEloForNcp",
    AddNewPlayers = "AddNewPlayers",
}

export const EloSchemas = {
    [EloEndpoint.CalculateSalaries]: {
        input: Schemas.CalculateSalaries_Input,
        output: Schemas.CalculateSalaries_Output,
    },
    [EloEndpoint.CalculateEloForMatch]: {
        input: Schemas.CalculateEloForMatch_Input,
        output: Schemas.CalculateEloForMatch_Output,
    },
    [EloEndpoint.CalculateEloForNcp]: {
        input: Schemas.CalculateEloForNcp_Input,
        output: Schemas.CalculateEloForNcp_Output,
    },
    [EloEndpoint.AddNewPlayers]: {
        input: Schemas.AddPlayers_Input,
        output: Schemas.AddPlayers_Output,
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
