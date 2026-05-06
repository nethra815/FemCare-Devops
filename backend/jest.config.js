export default {
  testEnvironment: "node",
  transform: {
    "^.+\\.js$": "babel-jest",
  },
  testMatch: ["**/src/tests/unit/**/*.test.js"],
  forceExit: true,
  testTimeout: 30000,
};