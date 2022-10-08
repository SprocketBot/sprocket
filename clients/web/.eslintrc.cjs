module.exports = {
    plugins: ["svelte3"],
    env: {
        browser: true,
    },
    overrides: [
        {
            files: ["*.svelte"],
            processor: "svelte3/svelte3",
        },
    ],
    settings: {
        "svelte3/typescript": () => require("typescript"), // pass the TypeScript package to the Svelte plugin
        "svelte3/ignore-styles": () => true,
    },
};
