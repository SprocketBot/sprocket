import {gql} from "@urql/core";
import {client} from "../../client";
import type {FeatureCode} from "./feature.types";

interface SetGameFeatureVariables {
    code: FeatureCode;
    gameId: number;
    value: boolean;
}

const enableGameFeatureMutationString = gql`
    mutation ($code: FeatureCode!, $gameId: Float!) {
        enableFeature(code: $code, gameId: $gameId) {
            feature {
                feature {
                    code
                }
            }
        }
    }
`;

const disableGameFeatureMutationString = gql`
    mutation ($code: FeatureCode!, $gameId: Float!) {
        disableFeature(code: $code, gameId: $gameId) {
            feature {
                feature {
                    code
                }
            }
        }
    }
`;

const enableGameFeatureMutation = async (vars: Omit<SetGameFeatureVariables, "value">): Promise<void> => {
    const r = await client.mutation<{}, Omit<SetGameFeatureVariables, "value">>(enableGameFeatureMutationString, vars).toPromise();
    if (r.data) {
        return;
    }
    throw r.error as Error;
};

const disableGameFeatureMutation = async (vars: Omit<SetGameFeatureVariables, "value">): Promise<void> => {
    const r = await client.mutation<{}, Omit<SetGameFeatureVariables, "value">>(disableGameFeatureMutationString, vars).toPromise();
    if (r.data) {
        return;
    }
    throw r.error as Error;
};

export const setGameFeatureMutation = async (vars: SetGameFeatureVariables): Promise<void> => {
    const {value, ...rest} = vars;
    if (value) {
        return enableGameFeatureMutation(rest);
    }
    return disableGameFeatureMutation(rest);
    
};
