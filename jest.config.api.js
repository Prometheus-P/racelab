// jest.config.api.js
module.exports = {
  displayName: 'api',
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['**/src/app/api/**/*.test.ts'],
};
