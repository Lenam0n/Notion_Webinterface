// apps/api/src/env.ts
import { z } from "zod";
import "dotenv/config";

const EnvSchema = z.object({
  PORT: z.coerce.number().default(8787),
  ADAPTER: z.string().default("default"),
  NOTION_TOKEN: z.string().min(1),
  NOTION_DB_1_ID: z.string().min(1),
  NOTION_DB_2_ID: z.string().min(1),
  NOTION_DB_3_ID: z.string().min(1),
});
export const ENV = EnvSchema.parse(process.env);
