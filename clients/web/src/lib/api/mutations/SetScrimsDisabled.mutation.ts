import {gql} from "@urql/core";

import {client} from "../client";

type SetScrimsDisabledResponse = boolean;

interface SetScrimsDisabledVariables {
    disabled: boolean;
}

const setScrimsDisabledMutationString = gql`
    mutation (
        $disabled: Boolean!
    ){
        setScrimsDisabled(disabled: $disabled)
    }
`;

export const setScrimsDisabledMutation = async (vars: SetScrimsDisabledVariables): Promise<SetScrimsDisabledResponse> => {
    const r = await client.mutation<{setScrimsDisabled: SetScrimsDisabledResponse;}, SetScrimsDisabledVariables>(setScrimsDisabledMutationString, vars).toPromise();
    if (r.data) {
        return r.data.setScrimsDisabled;
    }
    throw r.error as Error;
};
