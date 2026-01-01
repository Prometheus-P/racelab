// jest.config.api.js
module.exports = {
  displayName: 'api',
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '**/src/app/api/**/*.test.ts',
    '**/src/lib/**/*.test.ts',
    '**/src/config/**/*.test.ts',
    '**/tests/unit/ingestion/**/*.test.ts',
    '**/tests/unit/db/**/*.test.ts',
    '**/tests/unit/lib/**/*.test.ts',
    '**/tests/unit/app/**/*.test.ts',
    '**/tests/integration/db/**/*.test.ts',
    '**/tests/integration/strategy/**/*.test.ts',
  ],
};
