// packages/ps-orchestrator/src/factory/TemplateFactory.ts
import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";
import { config } from "@config";
import { TemplateKind } from "@interface/ITemplate";
import { JobEnvelope, serializeJob } from "@interface/IJob";

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

export class TemplateFactory {
  static async enqueue(
    kind: TemplateKind,
    opts: {
      templatePath: string;
      data: Record<string, string>;
      outputPath: string;
      format?: "pdf" | "png" | "jpg";
      meta?: Record<string, unknown>;
    }
  ): Promise<{ jobId: string; jobPath: string }> {
    const jobId = randomUUID();
    const format = opts.format ?? "pdf";

    await ensureDir(config.jobsDir);

    const job: JobEnvelope = {
      id: jobId,
      kind,
      templatePath: path.resolve(opts.templatePath),
      data: opts.data,
      outputPath: path.resolve(opts.outputPath),
      format,
      createdAt: new Date().toISOString(),
      meta: opts.meta,
    };

    const filename = `${jobId}.${kind}.${format}.json`;
    const jobPath = path.join(config.jobsDir, filename);

    await fs.writeFile(jobPath, serializeJob(job), "utf8");

    return { jobId, jobPath };
  }
}
