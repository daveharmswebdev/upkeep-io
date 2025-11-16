module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^@upkeep-io/domain$': '<rootDir>/../../libs/domain/src/index.ts',
    '^@upkeep-io/validators$': '<rootDir>/../../libs/validators/src/index.ts',
    '^@upkeep-io/validators/(.*)$': '<rootDir>/../../libs/validators/src/$1',
    '^@upkeep-io/auth$': '<rootDir>/../../libs/auth/src/index.ts',
    '^@domain/(.*)$': '<rootDir>/../../libs/domain/src/$1',
    '^@validators/(.*)$': '<rootDir>/../../libs/validators/src/$1',
    '^@auth/(.*)$': '<rootDir>/../../libs/auth/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.test.ts',
    '!src/server.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
};
