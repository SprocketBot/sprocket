const baseConfig = require("../../core/.eslintrc.cjs");

module.exports = {
    ...baseConfig,
    parserOptions: {
        ...baseConfig.parserOptions,
        project: ["tsconfig.json"],
        tsconfigRootDir: __dirname,
    },
};
