const path = require('path');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  silent: false,
  roots: ['<rootDir>/src'],
  modulePaths: [path.resolve(__dirname, '..')],
  moduleNameMapper: {
    '^\\$db/(.*)$': '<rootDir>/src/database/$1',
    '^rxjs$': '<rootDir>/../node_modules/rxjs',
    '^rxjs/(.*)$': '<rootDir>/../node_modules/rxjs/$1',
  },
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
