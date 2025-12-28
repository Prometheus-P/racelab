// jest.config.ui.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  displayName: 'ui',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    // Handle module aliases (this will be automatically configured for you soon)
    '^@/(.*)$': '<rootDir>/src/$1',
    // Mock next-auth to avoid ESM import issues
    '^next-auth/react$': '<rootDir>/__mocks__/next-auth/react.js',
  },
  testEnvironment: 'jsdom',
  testMatch: [
    '**/src/components/**/*.test.tsx',
    '**/src/app/**/*.test.tsx',
    '**/src/hooks/**/*.test.ts',
    '**/tests/unit/components/**/*.test.tsx',
  ],
  // Transform ESM modules that Jest can't parse natively
  transformIgnorePatterns: [
    '/node_modules/(?!(next-auth|@auth|oauth4webapi|jose|openid-client|@panva)/)',
  ],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
