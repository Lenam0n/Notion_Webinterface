import type { Config } from "jest";

const config: Config = {
  displayName: "api",
  rootDir: ".",
  testEnvironment: "node",
  // WICHTIG: Wir kompilieren Tests nach CJS, mit esModuleInterop
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          module: "commonjs",
          esModuleInterop: true,
          verbatimModuleSyntax: false,
          // nur im Test-Build abschwächen, um _req/res any-Fehler in Testdateien zu vermeiden
          noImplicitAny: false,
        },
        diagnostics: true,
      },
    ],
  },
  testMatch: ["<rootDir>/**/__tests__/**/*.test.ts?(x)"],
  setupFilesAfterEnv: ["<rootDir>/../../tests/setup/jest.setup.ts"],
  reporters: ["default"],
  moduleNameMapper: {
    // mappt ./env.js im Code auf einen Test-Stub
    "^\\.\\/env\\.js$": "<rootDir>/__tests__/stubs/env.ts",
    "^@notion/adapters$":
      "<rootDir>/../../packages/notion-adapters/src/default/DefaultNotionAdapter.ts",
    "^@shared/(.*)$": "<rootDir>/../../packages/shared/src/$1",
  },
  // erlaubt absolute Imports, wenn nötig
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
};

export default config;
