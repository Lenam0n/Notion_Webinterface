// packages/ps-orchestrator/src/commands/createAnschreibenJob.ts
import path from "path";
import axios from "axios";

import { TemplateFactory } from "@factory/TemplateFactory";
import { config } from "@config";
import { envVarOrDefault, requireEnvVar } from "@shared/utils/env";
import { ensureDirExists, readJsonFile } from "@shared/utils/fsUtils";

import { buildAnschreibenPlaceholderMap } from "@template~ps/anschreiben.template";
import type { CompanyEntry } from "@interface/ICompany";
import type { TemplateKind } from "@interface/ITemplate";

type ExportFormat = "pdf" | "png" | "jpg";
type DataSourceMode = "rest" | "file";

function isCompanyEntry(x: any): x is CompanyEntry {
  return (
    !!x &&
    typeof x === "object" &&
    typeof x.name === "string" &&
    x.adresse &&
    typeof x.adresse === "object" &&
    typeof x.adresse.straße === "string" &&
    typeof x.adresse.plz === "string" &&
    typeof x.adresse.ort === "string" &&
    x.ansprechpartner &&
    typeof x.ansprechpartner === "object" &&
    typeof x.ansprechpartner.name === "string"
  );
}

function pickFromList(list: any, key?: string): CompanyEntry {
  if (Array.isArray(list)) {
    if (key) {
      const byName = list.find(
        (e: any) =>
          e &&
          typeof e.name === "string" &&
          e.name.trim().toLowerCase() === key.trim().toLowerCase()
      );
      if (byName && isCompanyEntry(byName)) return byName;
    }
    const first = list.find((e) => isCompanyEntry(e));
    if (first) return first as CompanyEntry;
  } else if (isCompanyEntry(list)) {
    return list;
  }
  throw new Error(
    "Konnte keinen gültigen CompanyEntry aus der Quelle bestimmen."
  );
}

async function loadCompanyFromFileByKey(
  baseDir: string,
  key: string
): Promise<CompanyEntry> {
  const abs = path.resolve(baseDir, `${key}.json`);
  const obj = await readJsonFile<any>(abs, null as any);
  return pickFromList(obj, key);
}

async function loadCompanyFromDataFile(
  dataFile: string,
  key?: string
): Promise<CompanyEntry> {
  const abs = path.resolve(dataFile);
  const obj = await readJsonFile<any>(abs, null as any);
  return pickFromList(obj, key);
}

async function loadCompanyFromRest(key: string): Promise<CompanyEntry> {
  const base = requireEnvVar("API_BASE_URL");
  const url = `${base.replace(/\/+$/, "")}/companies/${encodeURIComponent(
    key
  )}`;
  const { data } = await axios.get(url, { timeout: 15000 });
  return pickFromList(data, key);
}

export interface CreateAnschreibenJobOptions {
  templatePath: string;
  outputPath: string;
  kind?: TemplateKind;
  format?: ExportFormat;
  dataFile?: string;
  key?: string;
  source?: DataSourceMode;
  greetingStyle?: "neutral" | "formell";
  date?: Date;
}

export async function createAnschreibenJob(opts: CreateAnschreibenJobOptions) {
  const {
    templatePath,
    outputPath,
    kind = "photoshop",
    format = "pdf",
    dataFile,
    key,
    greetingStyle = "neutral",
    date,
  } = opts;

  await ensureDirExists(config.templatesDir);
  await ensureDirExists(config.jobsDir);
  await ensureDirExists(config.outputDir);

  let entry: CompanyEntry;

  if (dataFile) {
    entry = await loadCompanyFromDataFile(dataFile, key);
  } else {
    const mode = (opts.source ??
      envVarOrDefault("DATA_SOURCE", "file")) as DataSourceMode;

    if (!key) {
      throw new Error(`--key ist erforderlich (oder gib --dataFile an).`);
    }

    if (mode === "rest") {
      entry = await loadCompanyFromRest(key);
    } else {
      const dataDir = envVarOrDefault("DATA_DIR", "./data");
      entry = await loadCompanyFromFileByKey(dataDir, key);
    }
  }

  const placeholderMap = buildAnschreibenPlaceholderMap(entry, {
    greetingStyle,
    date,
  });

  const { jobId, jobPath } = await TemplateFactory.enqueue(kind, {
    templatePath,
    data: placeholderMap,
    outputPath,
    format,
    meta: {
      preset: "anschreiben",
      source: dataFile
        ? "dataFile"
        : opts.source ?? envVarOrDefault("DATA_SOURCE", "file"),
      key: key ?? null,
    },
  });

  return { jobId, jobPath };
}
