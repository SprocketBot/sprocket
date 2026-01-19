import { gql } from '@urql/core';
import { client } from '../client';

type SetScrimLockedResponse = boolean;

interface SetScrimLockedVariables {
  scrimId: string;
}

const lockScrimMutationString = gql`
  mutation ($scrimId: String!) {
    lockScrim(scrimId: $scrimId)
  }
`;

const unlockScrimMutationString = gql`
  mutation ($scrimId: String!) {
    unlockScrim(scrimId: $scrimId)
  }
`;

export const lockScrimMutation = async (
  vars: SetScrimLockedVariables,
): Promise<SetScrimLockedResponse> => {
  const r = await client
    .mutation<{ lockScrim: SetScrimLockedResponse }, SetScrimLockedVariables>(
      lockScrimMutationString,
      vars,
    )
    .toPromise();
  if (r.data) {
    return r.data.lockScrim;
  }
  throw r.error as Error;
};

export const unlockScrimMutation = async (
  vars: SetScrimLockedVariables,
): Promise<SetScrimLockedResponse> => {
  const r = await client
    .mutation<{ unlockScrim: SetScrimLockedResponse }, SetScrimLockedVariables>(
      unlockScrimMutationString,
      vars,
    )
    .toPromise();
  if (r.data) {
    return r.data.unlockScrim;
  }
  throw r.error as Error;
};
