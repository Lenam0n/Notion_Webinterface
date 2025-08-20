// packages/notion-adapters/__tests__/DefaultNotionAdapter.test.ts
import { DefaultNotionAdapter } from "../src/default/DefaultNotionAdapter";

const cfg = { token: "test", db1: "DB1", db2: "DB2", db3: "DB3" };

describe("DefaultNotionAdapter", () => {
  let adapter: DefaultNotionAdapter;

  beforeEach(() => {
    adapter = new DefaultNotionAdapter(cfg);
    jest.clearAllMocks();
  });

  test("validateSchema resolves without throwing (given mock props)", async () => {
    await expect(adapter.validateSchema()).resolves.toBeUndefined();
  });

  test("getSkillOptions returns default mocked options", async () => {
    const skills = await adapter.getSkillOptions();
    expect(skills).toEqual(expect.arrayContaining(["React", "TypeScript"]));
  });

  test("ensureSkillOptions updates DB1 when new skills appear", async () => {
    await adapter.ensureSkillOptions(["React", "Node.js"]);
    // update sollte einmal aufgerufen werden und 'Node.js' enthalten
    // @ts-ignore – Zugriff auf Mock
    const update = adapter["notion"].databases.update as jest.Mock;
    expect(update).toHaveBeenCalledTimes(1);
    const args = update.mock.calls[0][0];
    expect(args.database_id).toBe(cfg.db1);
    const options = args.properties.Skills.multi_select.options.map(
      (o: any) => o.name
    );
    expect(options).toEqual(
      expect.arrayContaining(["React", "TypeScript", "Node.js"])
    );
  });

  test("upsertCompany creates when not existing", async () => {
    const id = await adapter.upsertCompany({
      name: "ACME GmbH",
      adresse: { straße: "Main", plz: "12345", ort: "Berlin" },
      companyEmail: "info@acme.de",
      companyNumber: "+49 30 123456",
    });
    expect(id).toBe("new-page-id");
  });

  test("upsertJob ensures skills before creating page", async () => {
    const ensureSpy = jest
      .spyOn(adapter, "ensureSkillOptions")
      .mockResolvedValue();
    const id = await adapter.upsertJob({
      companyId: "C1",
      options: {
        jobName: "Bewerbung",
        applyDate: "2025-08-20",
        skills: ["Vite"],
      },
    });
    expect(ensureSpy).toHaveBeenCalledWith(["Vite"]);
    expect(id).toBe("new-page-id");
  });
});
