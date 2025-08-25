// packages/ps-orchestrator/src/factory/createJob.ts
import { TemplateFactory } from "@factory/TemplateFactory";
import { config } from "@config";
import type { CliArgs } from "@util/parseArgs";

export async function createJob(args: CliArgs, data: Record<string, string>) {
  const { jobId, jobPath } = await TemplateFactory.enqueue(args.type, {
    templatePath: args.template,
    data,
    outputPath: args.output,
    format: args.format,
    meta: {
      source: args.dataFile ? "dataFile" : args.source ?? "file",
      key: args.key ?? null,
    },
  });

  return {
    jobId,
    jobPath,
    context: {
      templatesDir: config.templatesDir,
      jobsDir: config.jobsDir,
      outputDir: config.outputDir,
    },
  };
}
