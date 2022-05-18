import {gql} from "@urql/core";
import {client} from "../client";

export interface UploadReplaysResponse {
    parseReplays: string[];
}

export interface UploadReplaysVariables {
    files: File[];
    submissionId: string;
}

const mutationString = gql`
    mutation($files: [Upload!]!, $submissionId: String!) {
        parseReplays(files: $files, submissionId: $submissionId)
    }
`;

export const uploadReplaysMutation = async (vars: UploadReplaysVariables): Promise<UploadReplaysResponse> => {
    console.log({...vars, submissionId: "scrim-test"});
    const r = await client.mutation<UploadReplaysResponse, UploadReplaysVariables>(
        mutationString,
        {...vars, submissionId: "scrim-test"},
    ).toPromise();
    if (r.data) return r.data;
    throw r.error;
};
