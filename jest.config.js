module.exports = {
    testEnvironment: "@happy-dom/jest-environment", // Use happy-dom for DOM tests
    setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
    transform: {
      "^.+\\.(ts|tsx)$": "ts-jest",
      "^.+\\.(css|less|scss|sass)$": "jest-transform-stub",
    },
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    moduleNameMapper: {
      '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    },
  };