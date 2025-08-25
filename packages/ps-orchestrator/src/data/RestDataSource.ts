// packages/ps-orchestrator/src/data/RestDataSource.ts
import axios from "axios";
import { IDataSource } from "@interface/IData";
import { config } from "@config";

export class RestDataSource implements IDataSource {
  constructor(private baseUrl = config.apiBaseUrl) {}

  async fetch(key: string): Promise<Record<string, string>> {
    const url = `${this.baseUrl.replace(/\/+$/, "")}/data/${encodeURIComponent(
      key
    )}`;
    const resp = await axios.get(url, { timeout: 15000 });

    if (typeof resp.data !== "object" || resp.data === null) {
      throw new Error("Unexpected API response: expected JSON object");
    }
    return resp.data as Record<string, string>;
  }
}
