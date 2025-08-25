// packages/ps-orchestrator/src/interfaces/IJob.ts
import { TemplateKind } from "@interface/ITemplate";

export type ExportFormat = "pdf" | "png" | "jpg";

export interface JobEnvelope {
  id: string;
  kind: TemplateKind;
  templatePath: string;
  data: Record<string, string>;
  outputPath: string;
  format: ExportFormat;
  createdAt: string; // ISO
  meta?: Record<string, unknown>;
}

export function serializeJob(job: JobEnvelope): string {
  return JSON.stringify(job, null, 2);
}
