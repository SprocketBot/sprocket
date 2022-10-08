import type {z} from "zod";

import * as Schemas from "./schemas";

export const EloBullQueue = "elo";

export enum EloEndpoint {
    CalculateSalaries = "CalculateSalaries",
    CalculateEloForMatch = "CalculateEloForMatch",
    CalculateEloForNcp = "CalculateEloForNcp",
    AddNewPlayers = "AddNewPlayers",
    AddPlayerBySalary = "AddPlayerBySalary",
    SGChange = "SGChange",
    EloChange = "EloChange",
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
    [EloEndpoint.AddPlayerBySalary]: {
        input: Schemas.AddPlayerBySalary_Input,
        output: Schemas.AddPlayerBySalary_Output,
    },
    [EloEndpoint.SGChange]: {
        input: Schemas.SGChange_Input,
        output: Schemas.SGChange_Output,
    },
    [EloEndpoint.EloChange]: {
        input: Schemas.EloChange_Input,
        output: Schemas.EloChange_Output,
    },
};

export type EloInput<T extends EloEndpoint> = z.infer<
    typeof EloSchemas[T]["input"]
>;
export type EloOutput<T extends EloEndpoint> = z.infer<
    typeof EloSchemas[T]["output"]
>;

export type JobListener<E extends EloEndpoint> = (
    d: EloOutput<E>,
) => Promise<void>;

export interface JobListenerPayload {
    endpoint: EloEndpoint;
    success: JobListener<EloEndpoint>;
    failure: (e: Error) => Promise<void>;
}
