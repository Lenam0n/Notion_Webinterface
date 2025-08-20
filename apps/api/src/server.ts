// apps/api/src/server.ts
import express from "express";
import cors from "cors";
import { ENV } from "./env.js";
import { makeAdapter } from "./adapterFactory.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const adapter = makeAdapter("default");

app.get("/v1/health", (_req, res) => res.json({ ok: true }));

// NEU: Skills für Autocomplete
app.get("/v1/skills", async (_req, res) => {
  try {
    const skills = await adapter.getSkillOptions(); // <- Methode ist im Interface vorhanden
    res.json({ ok: true, skills });
  } catch (e) {
    res.status(500).json({ ok: false, error: (e as Error).message });
  }
});

// Beispiel-Endpunkt: einzelne Firma + Optionen (SyncOptions-ähnlich)
app.post("/v1/companies", async (req, res) => {
  try {
    // Keine Shared-Types im FE nötig – wir validieren hier serverseitig.
    const entry = req.body?.entry;
    const options = req.body?.options;
    if (!entry || !options?.applyDate) {
      return res
        .status(400)
        .json({ ok: false, error: "entry und options.applyDate erforderlich" });
    }
    await adapter.validateSchema();
    await adapter.syncCompanies([entry], options);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ ok: false, error: (e as Error).message });
  }
});

const port = ENV.PORT ?? 8787;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[api] listening on http://localhost:${port}`);
});

export {};
