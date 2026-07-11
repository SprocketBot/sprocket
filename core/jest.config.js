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
  setupFiles: ['<rootDir>/test/jest.setup.js'],
  moduleNameMapper: {
    '^\\$db/(.*)$': '<rootDir>/src/database/$1',
    '^src/(.*)$': '<rootDir>/src/$1',
  },
};
