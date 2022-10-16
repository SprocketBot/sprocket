import {gql} from "@urql/core";

import {client} from "../../client";
import {currentScrim} from "../../queries";

interface CreateScrimResponse {
    id: string;
    playerCount: number;
    settings: {
        competitive: boolean;
        mode: "TEAMS" | "ROUND_ROBIN";
    };
}

interface CreateScrimVariables {
    settings: {
        mode: "TEAMS" | "ROUND_ROBIN";
        competitive: boolean;
        observable: boolean;
    };
    gameModeId: number;
    createGroup: boolean;
    leaveAfter: number;
}

const mutationString = gql`
    mutation (
        $gameModeId: Int!
        $settings: ScrimSettingsInput!
        $leaveAfter: Int!
        $createGroup: Boolean
    ) {
        createScrim(data: {gameModeId: $gameModeId, settings: $settings, createGroup: $createGroup, leaveAfter: $leaveAfter}) {
            id
            playerCount
            settings {
                competitive
                mode
            }
        }
    }
`;

export const createScrimMutation = async (
    vars: CreateScrimVariables,
): Promise<CreateScrimResponse> => {
    const r = await client
        .mutation<CreateScrimResponse, CreateScrimVariables>(
            mutationString,
            vars,
        )
        .toPromise();
    if (r.data) {
        currentScrim.invalidate();
        return r.data;
    }
    throw r.error as Error;
};
