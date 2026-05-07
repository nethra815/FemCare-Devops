export default {
  testEnvironment: "node",

  transform: {
    "^.+\\.js$": "babel-jest",
  },

  testMatch: ["**/src/tests/unit/**/*.test.js"],

  collectCoverage: true,

  collectCoverageFrom: [
    "src/**/*.js",
    "!src/tests/**",
    "!**/node_modules/**"
  ],

  coverageDirectory: "coverage",

  coverageReporters: ["text", "lcov"],

  forceExit: true,

  testTimeout: 30000,
};