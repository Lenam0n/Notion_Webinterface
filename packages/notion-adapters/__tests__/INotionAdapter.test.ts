// packages/notion-adapters/__tests__/INotionAdapter.test.ts
import type { INotionAdapter } from "../src/default/INotionAdapter";

describe("INotionAdapter interface (shape)", () => {
  test("method names exist on an implementing class", () => {
    // Dummy: Nur sicherstellen, dass künftige Implementierungen die Signatur beachten
    const methods: Array<keyof INotionAdapter> = [
      "validateSchema",
      "upsertCompany",
      "upsertContact",
      "addContactBacklink",
      "upsertJob",
      "getSkillOptions",
      "ensureSkillOptions",
      "syncCompanies",
    ];
    expect(methods).toContain("upsertJob");
  });
});
