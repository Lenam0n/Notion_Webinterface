// apps/api/__tests__/adapterFactory.test.ts
jest.mock("@notion/adapters", () => {
  return {
    DefaultNotionAdapter: jest.fn().mockImplementation((_cfg: any) => ({
      validateSchema: jest.fn(),
      getSkillOptions: jest.fn().mockResolvedValue(["React"]),
      ensureSkillOptions: jest.fn(),
      upsertCompany: jest.fn().mockResolvedValue("C1"),
      upsertContact: jest.fn().mockResolvedValue("P1"),
      addContactBacklink: jest.fn(),
      upsertJob: jest.fn().mockResolvedValue("J1"),
      syncCompanies: jest.fn(),
    })),
  };
});

import { makeAdapter } from "../src/adapterFactory";
import { DefaultNotionAdapter } from "@notion/adapters";

describe("adapterFactory", () => {
  test("returns DefaultNotionAdapter instance with config", () => {
    const a = makeAdapter("default");
    expect(DefaultNotionAdapter).toHaveBeenCalledTimes(1);
    expect(a).toBeTruthy();
    expect(typeof (a as any).getSkillOptions).toBe("function");
  });
});
