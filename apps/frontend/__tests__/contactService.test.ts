// apps/frontend/__tests__/contactService.test.ts
import {
  fetchSkillOptions,
  saveCompanyLocal,
  saveCompanyRemote,
} from "../src/services/contactService";

describe("contactService", () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockReset();
    (global as any).importMeta = {
      env: { VITE_API_BASE: "http://localhost:8787" },
    };
    // Für Vite import.meta.env Nutzung in Tests:
    Object.defineProperty(global, "importMeta", {
      value: { env: { VITE_API_BASE: "http://localhost:8787" } },
      writable: true,
    });
  });

  test("fetchSkillOptions returns skills", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true, skills: ["React"] }),
    });
    const skills = await fetchSkillOptions();
    expect(skills).toEqual(["React"]);
  });

  test("saveCompanyLocal posts to /api/contacts", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      text: async () => "",
    });
    await expect(saveCompanyLocal({ foo: "bar" })).resolves.toBeUndefined();
    expect(fetch).toHaveBeenCalledWith(
      "/api/contacts",
      expect.objectContaining({ method: "POST" })
    );
  });

  test("saveCompanyRemote posts to API", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true }),
    });
    await expect(
      saveCompanyRemote(
        { name: "ACME", adresse: { straße: "S", plz: "1", ort: "B" } },
        { applyDate: "2025-08-20" }
      )
    ).resolves.toBeUndefined();

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8787/v1/companies",
      expect.objectContaining({ method: "POST" })
    );
  });
});
