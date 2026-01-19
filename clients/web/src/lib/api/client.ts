import { browser } from '$app/env';
import { SubscriptionClient } from 'subscriptions-transport-ws';

import {
  Client,
  cacheExchange,
  dedupExchange,
  ssrExchange,
  subscriptionExchange,
} from '@urql/core';
import { multipartFetchExchange } from '@urql/exchange-multipart-fetch';

let clientAvailable: CallableFunction;

export let client: Client;
export const clientPromise: Promise<void> = new Promise(r => {
  clientAvailable = r;
});
import { session } from '$app/stores';

export function initializeClient(sessionInput: App.Session): void {
  let sessionData: App.Session = sessionInput;
  session.subscribe(d => {
    sessionData = d;
  });

  const { secure, gqlUrl } = sessionData.config;

  const wsClient = browser
    ? new SubscriptionClient(`ws${secure ? 's' : ''}://${gqlUrl}/graphql`, {
        minTimeout: 10000,
        reconnect: true,
        lazy: true,
        reconnectionAttempts: 10,
      })
    : null;

  client = new Client({
    url: `http${secure ? 's' : ''}://${gqlUrl}/graphql`,
    exchanges: [
      dedupExchange,
      cacheExchange,
      subscriptionExchange({
        forwardSubscription: op => {
          if (!browser || !wsClient)
            throw new Error(
              'You cannot initialize subscriptions on the server. Gate your gql subscription on `browser` from `$app/env`',
            );
          const r = wsClient?.request({
            ...op,
            context: {
              ...op.context,
              authorization: `Bearer ${sessionData.token}`,
            },
          });
          return r;
        },
      }),
      ssrExchange({
        isClient: typeof window !== 'undefined',
        initialState: typeof window !== 'undefined' ? window.__URQL_DATA__ : undefined,
      }),
      // https://formidable.com/open-source/urql/docs/api/multipart-fetch-exchange/
      multipartFetchExchange,
    ],
    fetchOptions: () => {
      if (sessionData.token) {
        return {
          headers: {
            Authorization: `Bearer ${sessionData.token}`,
          },
        };
      }
      return {};
    },
  });
  if (clientAvailable) clientAvailable();
}
