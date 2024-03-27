import { HoudiniClient, subscription } from '$houdini';
import { SubscriptionClient } from 'subscriptions-transport-ws';

import { apiUrl } from './lib/constants';
import type { ToastStore } from '@skeletonlabs/skeleton';

let toastStore: ToastStore;

export const setToastStore = (store: ToastStore) => {
	toastStore = store;
};

console.log(`Using Houdini API (client) @ ${apiUrl}`);
export const houdiniClient = new HoudiniClient({
	url: `${apiUrl}/graphql`,

	plugins: [
		subscription(() => {
			const gqlUrl = apiUrl.replace('http', 'ws') + '/graphql';
			console.log(`Using Houdini WS (client) @ ${gqlUrl}`);
			const client = new SubscriptionClient(gqlUrl, { reconnect: true, lazy: false });

			let disconnectNotified = false;
			client.onDisconnected(() => {
				if (toastStore) {
					if (!disconnectNotified) {
						disconnectNotified = true;
						toastStore.trigger({
							timeout: 2000,
							autohide: true,
							message: 'Disconnected from server',
							background: 'variant-filled-error'
						});
					} else {
						toastStore.trigger({
							timeout: 2000,
							autohide: true,
							message: `Reconnecting... (Attempt ${reconnectIdx++})`,
							background: 'variant-filled-warning'
						});
					}
				}
			});
			let reconnectIdx = 0;
			client.onReconnecting(() => {
				if (toastStore) {
					toastStore.trigger({
						timeout: 2000,
						autohide: true,
						message: `Reconnecting... (Attempt ${reconnectIdx++})`,
						background: 'variant-filled-warning'
					});
				}
			});
			client.onReconnected(() => {
				reconnectIdx = 0;
				disconnectNotified = false;
				if (toastStore) {
					toastStore.trigger({
						timeout: 2000,
						autohide: true,
						message: 'Reconnected to server!',
						background: 'variant-filled-success'
					});
				}
			});
			return {
				subscribe(payload, handlers) {
					// send the request

					const { unsubscribe } = client
						.request({ ...payload, variables: payload.variables ?? {} })
						.subscribe(handlers);

					// return the function to unsubscribe
					return unsubscribe;
				}
			};
		}),
		() => ({
			beforeNetwork(ctx, { next }) {
				if (globalThis.fetch) {
					// This is needed because the default ctx.fetch seems to have issues on the server
					ctx.fetch = globalThis.fetch;
				}
				return next(ctx);
			}
		})
	],

	// uncomment this to configure the network call (for things like authentication)
	// for more information, please visit here: https://www.houdinigraphql.com/guides/authentication
	fetchParams() {
		return {
			credentials: 'include'
		};
	}
});

export default houdiniClient;
