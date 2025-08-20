import express from "express";
import cors from "cors";
import { Env } from "./env";
import { makeAdapter } from "./adapterFactory";
import {
  CompanyEntrySchema,
  CompanyListSchema,
  SyncOptionsSchema,
} from "@shared/types";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const adapter = makeAdapter(Env.ADAPTER);

app.get("/v1/health", (_req, res) => res.json({ ok: true }));

app.post("/v1/validate", async (_req, res) => {
  try {
    await adapter.validateSchema();
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ ok: false, error: (e as Error).message });
  }
});

/** Einzel-Company annehmen und sofort verarbeiten */
app.post("/v1/companies", async (req, res) => {
  try {
    const entry = CompanyEntrySchema.parse(req.body?.entry);
    const opts = SyncOptionsSchema.parse(
      req.body?.options ?? { defaultJobName: "Initiativbewerbung" }
    );
    await adapter.syncCompanies([entry], opts);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ ok: false, error: (e as Error).message });
  }
});

/** Bulk-JSON (Liste) annehmen – entspricht deinem CLI-Usecase */
app.post("/v1/sync", async (req, res) => {
  try {
    const list = CompanyListSchema.parse(req.body?.list);
    const opts = SyncOptionsSchema.parse(
      req.body?.options ?? { defaultJobName: "Initiativbewerbung" }
    );
    await adapter.validateSchema();
    await adapter.syncCompanies(list, opts);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ ok: false, error: (e as Error).message });
  }
});

app.listen(Env.PORT, () => {
  console.log(`[api] listening on :${Env.PORT}`);
});
