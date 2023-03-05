/// <references types="houdini-svelte">

/** @type {import('houdini').ConfigFile} */
const config = {
    "watchSchema": {
        url(env) {
            return `${env.PUBLIC_GQL_URL}/graphql`
        }
    },
    "plugins": {
        "houdini-svelte": {}
    },
}

export default config
