// packages/notion-adapters/jest.config.ts
import type { Config } from "jest";

const config: Config = {
  displayName: "adapters",
  rootDir: ".",
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.json" }],
  },
  testMatch: ["<rootDir>/**/__tests__/**/*.test.ts?(x)"],
  setupFilesAfterEnv: ["<rootDir>/../../tests/setup/jest.setup.ts"],
  reporters: ["default"],
  moduleNameMapper: {
    "^@shared/(.*)$": "<rootDir>/../shared/src/$1",
    "^@notionhq/client$": "<rootDir>/../../tests/mocks/notionClient.mock.ts",
  },
};

export default config;
