// apps/api/jest.config.ts
import type { Config } from "jest";

const config: Config = {
  displayName: "api",
  rootDir: ".",
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.json" }],
  },
  testMatch: ["<rootDir>/__tests__/**/*.test.ts?(x)"],
  setupFilesAfterEnv: ["<rootDir>/../../tests/setup/jest.setup.ts"],
  moduleNameMapper: {
    "^@notion/adapters$":
      "<rootDir>/../..//packages/notion-adapters/src/default/DefaultNotionAdapter.ts",
    "^@shared/types$": "<rootDir>/../../packages/shared/src/types.ts",
  },
};

export default config;
