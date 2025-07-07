module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: [
        "**/__tests__/**/*.test.ts",
    ],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    modulePaths: ['<rootDir>/src'],
    collectCoverageFrom: [
        "src/application/use-cases/**/*.ts",
        "!src/application/use-cases/**/index.ts"
    ],
    coverageDirectory: "coverage",
    coverageReporters: ["text", "lcov"],
    globalSetup: '<rootDir>/__tests__/setup/mongo-setup.ts',
    globalTeardown: '<rootDir>/__tests__/setup/mongo-teardown.ts',
};