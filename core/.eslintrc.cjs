module.exports = {
    extends: ["../.eslintrc.cjs"],
    parserOptions: {
        ecmaVersion: 12,
        sourceType: "module",
        project: ["tsconfig.json"],
        tsconfigRootDir: __dirname,
    },
    rules: {
        "@typescript-eslint/consistent-type-imports": ["error", {
            "prefer": "type-imports"
        }],

        "@typescript-eslint/no-unnecessary-condition": "error",

        "@typescript-eslint/return-await": "error",

        "@typescript-eslint/no-unnecessary-type-assertion": "error",
    }
}
