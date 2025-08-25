// packages/ps-orchestrator/src/utils/parseArgs.ts
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import type { TemplateKind } from "@interface/ITemplate";

export type ExportFormat = "pdf" | "png" | "jpg";
export type DataSourceMode = "rest" | "file";

export type CliArgs = {
  template: string;
  output: string;
  key?: string;
  dataFile?: string;
  type: TemplateKind;
  format: ExportFormat;
  source?: DataSourceMode;
};

export function parseArgs(): CliArgs {
  const argv = yargs(hideBin(process.argv))
    .scriptName("psd-jobs")
    .usage(
      "$0 --template <path> --output <path> [--key <id> | --dataFile <file.json>] [--type photoshop|indesign] [--format pdf|png|jpg] [--source rest|file]"
    )
    .option("template", {
      type: "string",
      demandOption: true,
      describe: "Pfad zur Template-Datei (PSD/INDD)",
    })
    .option("output", {
      type: "string",
      demandOption: true,
      describe: "Zieldatei-Pfad für den Export (PDF/PNG/JPG)",
    })
    .option("key", {
      type: "string",
      describe: "Datensatz-Schlüssel (bei REST/File-lookup)",
    })
    .option("dataFile", {
      type: "string",
      describe: "Pfad zu einer lokalen JSON-Datei mit Platzhalter-Daten",
    })
    .option("type", {
      type: "string",
      choices: ["photoshop", "indesign"] as const,
      default: "photoshop",
      describe: "Template-Typ",
    })
    .option("format", {
      type: "string",
      choices: ["pdf", "png", "jpg"] as const,
      default: "pdf",
      describe: "Exportformat",
    })
    .option("source", {
      type: "string",
      choices: ["rest", "file"] as const,
      describe: "Datenquelle",
    })
    .help()
    .strict()
    .parseSync();

  return {
    template: argv.template,
    output: argv.output,
    key: argv.key,
    dataFile: argv.dataFile,
    type: argv.type as TemplateKind,
    format: argv.format as ExportFormat,
    source: argv.source as DataSourceMode | undefined,
  };
}
