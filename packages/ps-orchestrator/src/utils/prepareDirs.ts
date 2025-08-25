// packages/ps-orchestrator/src/utils/prepareDirs.ts
import { config } from "@config";
import { ensureDirExists } from "../../../shared/utils/dist/utils/fsUtils";

export async function prepareDirs() {
  await ensureDirExists(config.jobsDir);
  await ensureDirExists(config.outputDir);
  await ensureDirExists(config.templatesDir);
}
