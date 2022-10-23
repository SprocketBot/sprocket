import {gql} from "@urql/core";
import type {FileUpload} from "graphql-upload";

import {client} from "../client";

export interface UploadReplaysResponse {
    parseReplays: string[];
}

export interface UploadReplaysVariables {
    files: FileUpload[];
    submissionId: string;
}

const mutationString = gql`
    mutation ($files: [Upload!]!, $submissionId: String!) {
        parseReplays(files: $files, submissionId: $submissionId)
    }
`;

export const uploadReplaysMutation = async (
    vars: UploadReplaysVariables,
): Promise<UploadReplaysResponse> => {
    const r = await client
        .mutation<UploadReplaysResponse, UploadReplaysVariables>(
            mutationString,
            vars,
        )
        .toPromise();
    if (r.data) return r.data;
    throw r.error as Error;
};
