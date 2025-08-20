// jest.config.ts (root)
import type { Config } from "jest";

const config: Config = {
  // Drei Teilprojekte
  projects: [
    "<rootDir>/packages/notion-adapters/jest.config.ts",
    "<rootDir>/apps/api/jest.config.ts",
    "<rootDir>/apps/frontend/jest.config.ts",
  ],
};

export default config;
