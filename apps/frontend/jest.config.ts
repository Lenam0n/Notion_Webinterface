// apps/frontend/jest.config.ts
import type { Config } from "jest";

const config: Config = {
  displayName: "frontend",
  rootDir: ".",
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(t|j)sx?$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.json" }],
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
};

export default config;
