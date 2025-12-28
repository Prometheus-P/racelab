// __mocks__/next-auth/react.js
// Mock for next-auth/react to avoid ESM import issues in Jest

const mockSession = {
  user: {
    name: 'Test User',
    email: 'test@example.com',
    image: null,
  },
  expires: '2099-01-01T00:00:00.000Z',
};

module.exports = {
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated',
    update: jest.fn(),
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  getSession: jest.fn(() => Promise.resolve(null)),
  SessionProvider: ({ children }) => children,
  // For tests that need authenticated state
  __mockSession: mockSession,
  __setMockSession: (session) => {
    module.exports.useSession.mockReturnValue({
      data: session,
      status: session ? 'authenticated' : 'unauthenticated',
      update: jest.fn(),
    });
  },
};
