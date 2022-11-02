const { pathsToModuleNameMapper } = require('ts-jest')
const { compilerOptions: { paths: tsconfigPaths } } = require('./tsconfig')

module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    verbose: true,
    silent: false,
    coverageReporters: [
        "text",
        [
            "lcov",
            {
                file: "../reports/coverage.xml",
            },
        ],
    ],
    reporters: [
        "default",
        [
            "jest-junit",
            {
                outputDirectory: "./reports",
                outputName: "report.xml",
                includeConsoleOutput: true,
                usePathForSuiteName: true,
            },
        ],
    ],
    moduleDirectories: [
        "<rootDir>",
        "src",
        "node_modules"
    ],
    moduleNameMapper: {
        ...pathsToModuleNameMapper(
            tsconfigPaths,
        )
    },
};
