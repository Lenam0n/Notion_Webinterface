// apps/api/src/adapterFactory.ts
import { DefaultNotionAdapter } from "@notion/adapters";
import type { INotionAdapter } from "@notion/adapters";
import { ENV } from "./env.js";

export function makeAdapter(kind: "default" = "default"): INotionAdapter {
  switch (kind) {
    case "default":
    default:
      return new DefaultNotionAdapter({
        token: ENV.NOTION_TOKEN,
        db1: ENV.NOTION_DB_1_ID,
        db2: ENV.NOTION_DB_2_ID,
        db3: ENV.NOTION_DB_3_ID,
      });
  }
}
