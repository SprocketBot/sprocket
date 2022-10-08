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
        gameModeId: number;
        mode: "TEAMS" | "ROUND_ROBIN";
        competitive: boolean;
        observable: boolean;
    };
    createGroup: boolean;
}

const mutationString = gql`
    mutation ($settings: ScrimSettingsInput!, $createGroup: Boolean) {
        createScrim(data: {settings: $settings, createGroup: $createGroup}) {
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
