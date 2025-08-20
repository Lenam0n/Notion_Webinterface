import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "jsdom",

  // Wurzelverzeichnisse für Tests
  roots: ["<rootDir>/src", "<rootDir>/__tests__"],

  // Welche Dateiendungen Jest erkennen soll
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],

  // Transpile mit ts-jest und dem lokalen tsconfig
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
        isolatedModules: true,
      },
    ],
  },

  // Alias-Handling (falls du @shared/types etc. nutzt)
  moduleNameMapper: {
    "^@shared/(.*)$": "<rootDir>/../../packages/shared/$1",
  },

  // Reporter (JSON-Reporter hängt global dran, aber Frontend kann auch eigene haben)
  reporters: [
    "default",
    "<rootDir>/../../tests/reporters/aggregate-json-reporter.js",
  ],

  // Setup-Dateien, falls du z.B. react-testing-library erweitern willst
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
};

export default config;
