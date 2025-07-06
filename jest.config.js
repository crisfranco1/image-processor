module.exports = {
    preset: 'ts-jest',             // Use ts-jest for TypeScript support
    testEnvironment: 'node',       // Test environment (Node.js)
    testMatch: [
        "**/__tests__/**/*.test.ts", // Look for .test.ts files in __tests__ subdirectories
    ],
    moduleNameMapper: {
        // This maps paths so Jest can resolve imports correctly.
        // It's useful if you're using path aliases in tsconfig.json.
        // For our current simple structure, `modulePaths` might be sufficient,
        // but this is good practice for complex projects.
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    modulePaths: ['<rootDir>/src'], // Look for modules in the src directory
    collectCoverageFrom: [
        "src/application/use-cases/**/*.ts", // Collect coverage for use cases
        "!src/application/use-cases/**/index.ts" // Exclude index files if any
    ],
    coverageDirectory: "coverage",
    coverageReporters: ["text", "lcov"],
};