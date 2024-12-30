import {gql} from "@urql/core";
import {currentScrim} from "../../queries";
import {client} from "../../client";

interface CreateLFSScrimResponse {
    id: string;
    playerCount: number;
    settings: {
        competitive: boolean;
        mode: "TEAMS" | "ROUND_ROBIN";
    };
}

interface CreateLFSScrimVariables {
    settings: {
        mode: "TEAMS" | "ROUND_ROBIN";
        competitive: boolean;
        observable: boolean;
        lfs: boolean;
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
        $numRounds: Int!
        $createGroup: Boolean
    ) {
        createLFSScrim(data: {gameModeId: $gameModeId, settings: $settings, createGroup: $createGroup, leaveAfter: $leaveAfter, numRounds: $numRounds}) {
            id
            playerCount
            settings {
                competitive
                mode
                lfs
            }
        }
    }
`;

export const createLFSScrimMutation = async (vars: CreateLFSScrimVariables): Promise<CreateLFSScrimResponse> => {
    console.log("Trying LFS mutation.");
    const r = await client.mutation<CreateLFSScrimResponse, CreateLFSScrimVariables>(mutationString, vars).toPromise();
    if (r.data) {
        currentScrim.invalidate();
        return r.data;
    }
    throw r.error as Error;
};
