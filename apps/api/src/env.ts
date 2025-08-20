import { z } from "zod";
import * as dotenv from "dotenv";
dotenv.config();

export const Env = z
  .object({
    PORT: z.coerce.number().default(8787),
    ADAPTER: z.enum(["default"]).default("default"), // später weitere Adapter möglich
    NOTION_TOKEN: z.string().min(1),
    NOTION_DB_1_ID: z.string().min(1),
    NOTION_DB_2_ID: z.string().min(1),
    NOTION_DB_3_ID: z.string().min(1),
  })
  .parse(process.env);
