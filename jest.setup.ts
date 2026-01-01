// jest.setup.ts
// Configure testing framework before each test.
// This file extends Jest matchers with @testing-library/jest-dom
import '@testing-library/jest-dom';
import { toHaveNoViolations } from 'jest-axe';

// Extend Jest matchers with accessibility testing
expect.extend(toHaveNoViolations);
