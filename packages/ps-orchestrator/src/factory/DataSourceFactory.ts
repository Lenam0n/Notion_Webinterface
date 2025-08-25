// packages/ps-orchestrator/src/factory/DataSourceFactory.ts
import { IDataSource } from "@interface/IData";
import { RestDataSource } from "@data/RestDataSource";
import { JsonFileDataSource } from "@data/JsonFileDataSource";
import {
  envVarOrDefault,
  requireEnvVar,
} from "../../../shared/utils/dist/utils/env";

export type DataSourceMode = "rest" | "file";

export class DataSourceFactory {
  static create(mode: DataSourceMode): IDataSource {
    if (mode === "file") {
      const dir = envVarOrDefault("DATA_DIR", "./data");
      return new JsonFileDataSource(dir);
    }
    const base = requireEnvVar("API_BASE_URL");
    return new RestDataSource(base);
  }
}
