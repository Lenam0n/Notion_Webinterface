// apps/orchestrator/src/utils/parseBatchArgs.ts
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

export type BatchArgs = {
  template: string; // PSD/INDD
  outputPattern: string; // z.B. ./jobs/out/{key}.{format}
  mapper: string; // Pfad zu deiner template.ts (export buildPlaceholderMap)
  type: "photoshop" | "indesign";
  format: "pdf" | "png" | "jpg";
  source?: "rest" | "file";
  key?: string;
  keys?: string[];
  dataFile?: string;
  greetingStyle?: "neutral" | "formell";
  date?: string;
  pluginTimeoutMs?: number;
  batchTimeoutMs?: number;
};

export function parseBatchArgs(): BatchArgs {
  const argv = yargs(hideBin(process.argv))
    .scriptName("ps-batch")
    .usage(
      "$0 --template <PSD> --mapper <TS> --outputPattern <path> [--key foo | --keys a,b,c | --dataFile data.json] [options]"
    )
    .option("template", {
      type: "string",
      demandOption: true,
      describe: "Pfad zur PSD/INDD-Template-Datei",
    })
    .option("mapper", {
      type: "string",
      demandOption: true,
      describe: "Pfad zur Mapping-Datei (export buildPlaceholderMap)",
    })
    .option("outputPattern", {
      type: "string",
      demandOption: true,
      describe:
        "Ziel-Muster, z. B. ./jobs/out/{key}.{format} (Platzhalter: {key}, {format})",
    })
    .option("type", {
      choices: ["photoshop", "indesign"] as const,
      default: "photoshop",
      describe: "Template-Typ",
    })
    .option("format", {
      choices: ["pdf", "png", "jpg"] as const,
      default: "pdf",
      describe: "Exportformat",
    })
    .option("source", {
      choices: ["rest", "file"] as const,
      describe: "Datenquelle",
    })
    .option("key", { type: "string", describe: "Einzelner Key" })
    .option("keys", {
      type: "string",
      describe: "Kommagetrennte Liste von Keys",
    })
    .option("dataFile", {
      type: "string",
      describe: "Direkter JSON-Dateipfad als Datenquelle",
    })
    .option("greetingStyle", {
      choices: ["neutral", "formell"] as const,
      default: "neutral",
    })
    .option("date", {
      type: "string",
      describe: "Fixes Datum (ISO), wird an Mapper gereicht",
    })
    .option("pluginTimeoutMs", { type: "number", default: 90_000 })
    .option("batchTimeoutMs", {
      type: "number",
      describe: "Gesamt-Timeout für Batch (ms)",
    })
    .help()
    .strict()
    .parseSync();

  const keys = argv.keys
    ? String(argv.keys)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : undefined;

  return {
    template: argv.template,
    mapper: argv.mapper,
    outputPattern: argv.outputPattern,
    type: argv.type as any,
    format: argv.format as any,
    source: argv.source as any,
    key: argv.key,
    keys,
    dataFile: argv.dataFile,
    greetingStyle: argv.greetingStyle as any,
    date: argv.date,
    pluginTimeoutMs: argv.pluginTimeoutMs,
    batchTimeoutMs: argv.batchTimeoutMs,
  };
}
