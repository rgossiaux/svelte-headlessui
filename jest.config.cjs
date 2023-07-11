module.exports = {
  transform: {
    "^.+\\.svelte$": ["svelte-jester", { preprocess: true }],
    "^.+\\.js$": "babel-jest",
    "^.+\\.ts$": ["ts-jest", { babelConfig: true, useESM: true }],
  },
  setupFilesAfterEnv: ["@testing-library/jest-dom/extend-expect"],
  testEnvironment: "jsdom",
  moduleFileExtensions: ["js", "ts", "svelte"],
  moduleNameMapper: {
    "\\$lib/(.+)$": "<rootDir>/src/lib/$1",
  },
};
