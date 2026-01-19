module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  silent: false,
  coverageReporters: [
    'text',
    [
      'lcov',
      {
        file: '../reports/coverage.xml',
      },
    ],
  ],
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: './reports',
        outputName: 'report.xml',
        includeConsoleOutput: true,
        usePathForSuiteName: true,
      },
    ],
  ],
  moduleNameMapper: {
    '^\\$db/(.*)$': '<rootDir>/src/database/$1',
  },
};
