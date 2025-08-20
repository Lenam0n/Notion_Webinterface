// jest.config.ts (im Repo-Root)
import type { Config } from "jest";

const config: Config = {
  // Wir fahren alle Subprojekte; jede hat ihre eigene jest.config.ts
  projects: [
    "<rootDir>/apps/api/jest.config.ts",
    "<rootDir>/apps/frontend/jest.config.ts",
    "<rootDir>/packages/notion-adapters/jest.config.ts",
  ],

  // Nur der Root konfiguriert den JSON-Reporter → erzeugt EINE Datei
  reporters: [
    "default",
    [
      "<rootDir>/tests/reporters/aggregate-json-reporter.js",
      {
        outputFile: "<rootDir>/tests/results/test-results.json",
        includeConsoleOutput: true,
      },
    ],
  ],
};

export default config;
