// packages/ps-orchestrator/src/config.ts
import path from "path";
import {
  requireEnvVar,
  envVarOrDefault,
} from "../../shared/utils/dist/utils/env";

export const config = {
  apiBaseUrl: requireEnvVar("API_BASE_URL"),
  jobsDir: path.resolve(envVarOrDefault("JOBS_DIR", "./jobs/in")),
  outputDir: path.resolve(envVarOrDefault("OUTPUT_DIR", "./jobs/out")),
  templatesDir: path.resolve(envVarOrDefault("TEMPLATES_DIR", "./templates")),
};
