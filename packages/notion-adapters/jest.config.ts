// packages/notion-adapters/jest.config.ts
import type { Config } from "jest";
import path from "path";

const config: Config = {
  displayName: "adapters",
  rootDir: ".",
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.json" }],
  },
  testMatch: ["<rootDir>/__tests__/**/*.test.ts?(x)"],
  setupFilesAfterEnv: ["<rootDir>/../../tests/setup/jest.setup.ts"],
  moduleNameMapper: {
    "^@shared/types$": "<rootDir>/../shared/src/types.ts", // wenn vorhanden
    "^@notionhq/client$": "<rootDir>/../../tests/mocks/notionClient.mock.ts",
  },
};

export default config;
