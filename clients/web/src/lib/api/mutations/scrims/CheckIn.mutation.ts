import {gql} from "@urql/core";
import {client} from "../../client";

type CheckInResponse = Boolean;

interface CheckInVariables {
    scrimId: string;
}

const mutationString = gql`
    mutation {
        checkInToScrim
    }
`;

export const checkInMutation = async (vars: CheckInVariables): Promise<CheckInResponse> => {
    const r = await client.mutation<CheckInResponse, CheckInVariables>(mutationString, vars).toPromise();
    if (r.data) return r.data;
    throw r.error as Error;
};

