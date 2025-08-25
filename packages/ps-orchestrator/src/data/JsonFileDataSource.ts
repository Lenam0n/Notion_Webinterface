// packages/ps-orchestrator/src/data/JsonFileDataSource.ts
import path from "path";
import fs from "fs/promises";
import { IDataSource } from "@interface/IData";

export class JsonFileDataSource implements IDataSource {
  constructor(private baseDir: string) {}

  async fetch(key: string): Promise<Record<string, string>> {
    const file = path.resolve(this.baseDir, `${key}.json`);
    const raw = await fs.readFile(file, "utf8");
    const json = JSON.parse(raw);
    if (!json || typeof json !== "object") {
      throw new Error(`Invalid JSON in ${file}`);
    }
    return json as Record<string, string>;
  }
}
