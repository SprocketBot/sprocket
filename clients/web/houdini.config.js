/** @type {import('houdini').ConfigFile} */
const config = {
    // watchSchema: {
    //     url: ...
    // },
    schemaPath: './schema.gql',
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
