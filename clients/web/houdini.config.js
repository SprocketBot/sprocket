/** @type {import('houdini').ConfigFile} */
const config = {
	watchSchema: {
		url: (env) => {
			let rawUrl

			if (typeof window === "undefined") {
				// we are in server land
				rawUrl = new URL(
					`${env.PRIVATE_API_SECURE.toLowerCase() === 'true' ? 'https' : 'http'}://${env.PRIVATE_API_URL}:${env.PRIVATE_API_PORT ?? 443}`
				).toString();
			} else {
				// we are in browser land
				rawUrl = new URL(
					`${env.PUBLIC_API_SECURE.toLowerCase() === 'true' ? 'https' : 'http'}://${env.PUBLIC_API_URL}:${env.PUBLIC_API_PORT ?? 443}`
				).toString();
			}

			// Use URL to remove the port if it matches the protocol (e.g. 443 doesn't need to be specified if it's https)
			// Remove the trailing '/' to make it easier to work with
			const apiUrl = rawUrl.endsWith('/') ? rawUrl.substring(0, rawUrl.length - 1) : rawUrl;
			console.log(`Using Houdini (config) API @ ${apiUrl}/graphql`);
			return `${apiUrl}/graphql`;
		},
		interval: 1000
	},
	plugins: {
		'houdini-svelte': {
			framework: 'kit'
		}
	},
	scalars: {
		DateTime: {
			type: Date.name,
			/** @param {Date} v */
			marshal: (v) => v.toISOString(),
			/** @param {string} v */
			unmarshal: (v) => new Date(v)			
		}
	},
	features: {
		imperativeCache: true
	}
};

export default config;
