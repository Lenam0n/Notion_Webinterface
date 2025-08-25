// packages/ps-orchestrator/src/index.ts
import "dotenv/config";
import { parseArgs } from "@util/parseArgs";
import { prepareDirs } from "@util/prepareDirs";
import { loadData } from "@data/loadData";
import { createJob } from "@factory/createJob";

async function main() {
  const args = parseArgs();

  await prepareDirs();
  const data = await loadData(args);
  const { jobId, jobPath, context } = await createJob(args, data);

  console.log(`✔ Job erstellt: ${jobId}`);
  console.log(`   Datei: ${jobPath}`);
  console.log(`   Templates: ${context.templatesDir}`);
  console.log(`   Jobs In:  ${context.jobsDir}`);
  console.log(`   Jobs Out: ${context.outputDir}`);
}

main().catch((err) => {
  console.error("❌ Fehler:", err?.message ?? err);
  process.exit(1);
});
