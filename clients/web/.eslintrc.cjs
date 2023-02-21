module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        // This config extension tells ESLint to ignore things that prettier takes care of
        "prettier",
    ],
    plugins: [
        "svelte3",
        "@typescript-eslint",
        // We don't want to use the 'prettier' plugin here, that will make ESLint do prettiers job much slower!
    ],
    ignorePatterns: ["*.cjs"],
    overrides: [{files: ["*.svelte"], processor: "svelte3/svelte3"}],
    settings: {
        "svelte3/typescript": () => require("typescript"),
    },
    parserOptions: {
        sourceType: "module",
        ecmaVersion: 2020,
    },
    env: {
        browser: true,
        es2017: true,
        node: true,
    },
};
