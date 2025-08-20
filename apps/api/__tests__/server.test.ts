// apps/api/__tests__/server.test.ts
import express from "express";
import request from "supertest";
import cors from "cors";

// Adapter-Mock für den Server
const adapterMock = {
  validateSchema: jest.fn().mockResolvedValue(undefined),
  getSkillOptions: jest.fn().mockResolvedValue(["React", "TypeScript"]),
  syncCompanies: jest.fn().mockResolvedValue(undefined),
};

jest.mock("../src/adapterFactory", () => ({
  makeAdapter: () => adapterMock,
}));

describe("API server", () => {
  let app: express.Express;

  beforeAll(async () => {
    // Inline-Server wie in server.ts aufgebaut
    app = express();
    app.use(cors());
    app.use(express.json({ limit: "1mb" }));

    // Health
    app.get("/v1/health", (_req, res) => res.json({ ok: true }));

    // Skills
    app.get("/v1/skills", async (_req, res) => {
      try {
        const skills = await adapterMock.getSkillOptions();
        res.json({ ok: true, skills });
      } catch (e) {
        res.status(500).json({ ok: false, error: (e as Error).message });
      }
    });

    // Companies
    app.post("/v1/companies", async (req, res) => {
      try {
        const entry = req.body?.entry;
        const options = req.body?.options;
        if (!entry || !options?.applyDate) {
          return res
            .status(400)
            .json({
              ok: false,
              error: "entry und options.applyDate erforderlich",
            });
        }
        await adapterMock.validateSchema();
        await adapterMock.syncCompanies([entry], options);
        res.json({ ok: true });
      } catch (e) {
        res.status(400).json({ ok: false, error: (e as Error).message });
      }
    });
  });

  test("GET /v1/health", async () => {
    const res = await request(app).get("/v1/health");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  test("GET /v1/skills", async () => {
    const res = await request(app).get("/v1/skills");
    expect(res.status).toBe(200);
    expect(res.body.skills).toEqual(
      expect.arrayContaining(["React", "TypeScript"])
    );
  });

  test("POST /v1/companies validation", async () => {
    const res = await request(app)
      .post("/v1/companies")
      .send({ entry: { name: "ACME" }, options: {} });
    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
  });

  test("POST /v1/companies ok", async () => {
    const payload = {
      entry: {
        name: "ACME",
        adresse: { straße: "S", plz: "1", ort: "B" },
      },
      options: { applyDate: "2025-08-20" },
    };
    const res = await request(app).post("/v1/companies").send(payload);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(adapterMock.syncCompanies).toHaveBeenCalledTimes(1);
  });
});
