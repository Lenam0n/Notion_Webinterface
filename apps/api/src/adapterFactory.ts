// apps/api/src/adapterFactory.ts
import { ENV } from "./env";
import { DefaultNotionAdapter } from "@notion/adapters";

export function makeAdapter(kind: "default" = "default") {
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
