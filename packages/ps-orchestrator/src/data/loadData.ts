// packages/ps-orchestrator/src/data/loadData.ts
import path from "path";
import { envVarOrDefault } from "../../../shared/utils/dist/utils/env";
import { readJsonFile } from "../../../shared/utils/dist/utils/fsUtils";
import {
  DataSourceFactory,
  type DataSourceMode,
} from "@factory/DataSourceFactory";
import type { CliArgs } from "@util/parseArgs";

export async function loadData(args: CliArgs): Promise<Record<string, string>> {
  if (args.dataFile) {
    const abs = path.resolve(args.dataFile);
    return readJsonFile<Record<string, string>>(abs, {});
  }

  const mode = (args.source ??
    envVarOrDefault("DATA_SOURCE", "file")) as DataSourceMode;
  const ds = DataSourceFactory.create(mode);

  if (!args.key) {
    throw new Error(
      `Fehlender --key: Für source=${mode} brauchst du einen Datensatz-Schlüssel (oder nutze --dataFile).`
    );
  }

  return ds.fetch(args.key);
}
