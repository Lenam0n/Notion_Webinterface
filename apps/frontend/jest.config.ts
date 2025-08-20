import type { Config } from "jest";

const config: Config = {
  displayName: "frontend",
  rootDir: ".",
  testEnvironment: "jsdom",
  // ESM-Unterstützung für TS/TSX
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  transform: {
    "^.+\\.(t|j)sx?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: {
          module: "esnext",
          target: "es2022",
          jsx: "react-jsx",
          esModuleInterop: true,
          moduleResolution: "bundler",
          verbatimModuleSyntax: false, // <-- verhindert TS1286 in Tests
        },
        diagnostics: true,
      },
    ],
  },
  testMatch: ["<rootDir>/**/__tests__/**/*.test.ts?(x)"],
  setupFilesAfterEnv: ["<rootDir>/../../tests/setup/jest.setup.ts"],
  reporters: ["default"],
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "^@service/(.*)$": "<rootDir>/src/services/$1",
    "^@component/(.*)$": "<rootDir>/src/components/$1",
    "^@shared/(.*)$": "<rootDir>/../../packages/shared/src/$1",
  },
  // einige ESM-Pakete nicht ignorieren
  transformIgnorePatterns: [
    "/node_modules/(?!(@testing-library|react-router|@react-aria|nanoid)/)",
  ],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
};

export default config;
