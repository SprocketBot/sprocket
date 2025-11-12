module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
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
};
