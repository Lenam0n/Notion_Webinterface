// apps/api/jest.config.ts
import type { Config } from "jest";

const config: Config = {
  displayName: "api",
  rootDir: ".",
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.json" }],
  },
  testMatch: ["<rootDir>/**/__tests__/**/*.test.ts?(x)"],
  setupFilesAfterEnv: ["<rootDir>/../../tests/setup/jest.setup.ts"],
  // wichtig: KEIN eigener JSON-Reporter hier
  reporters: ["default"],
  moduleNameMapper: {
    // Beispiel-Mappings – passe bei Bedarf an
    "^@notion/adapters$":
      "<rootDir>/../../packages/notion-adapters/src/default/DefaultNotionAdapter.ts",
    "^@shared/(.*)$": "<rootDir>/../../packages/shared/src/$1",
  },
};

export default config;
