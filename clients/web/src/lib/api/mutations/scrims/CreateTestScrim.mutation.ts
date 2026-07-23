import {gql} from "@urql/core";
import {client} from "../../client";

export interface CreateTestScrimResponse {
    createTestScrim: {
        id: string;
        submissionId?: string;
        testRunId?: string;
        status: string;
    };
}

export interface CreateTestScrimVariables {
    gameModeId: number;
    skillGroupId: number;
}

const mutationString = gql`
  mutation ($gameModeId: Int!, $skillGroupId: Int!) {
    createTestScrim(data: {gameModeId: $gameModeId, skillGroupId: $skillGroupId}) {
      id
      submissionId
      testRunId
      status
    }
  }
`;

export const createTestScrimMutation = async (vars: CreateTestScrimVariables): Promise<CreateTestScrimResponse> => {
    const result = await client.mutation<CreateTestScrimResponse, CreateTestScrimVariables>(mutationString, vars).toPromise();
    if (result.data) return result.data;
    throw result.error as Error;
};
