/** @type {import('houdini').ConfigFile} */
const config = {
	watchSchema: {
		url: (env) => {
			// Use URL to remove the port if it matches the protocol (e.g. 443 doesn't need to be specified if it's https)
			const {
				PUBLIC_API_URL,
				PUBLIC_API_PORT,
				INTERNAL_API_URL,
				INTERNAL_API_PORT,
				PUBLIC_API_SECURE
			} = env;
			const rawUrl = INTERNAL_API_URL
				? new URL(`http://${INTERNAL_API_URL}:${INTERNAL_API_PORT ?? 3000}`).toString()
				: new URL(
						`${PUBLIC_API_SECURE.toLowerCase() === 'true' ? 'https' : 'http'}://${PUBLIC_API_URL}:${PUBLIC_API_PORT ?? 443}`
					).toString();
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
