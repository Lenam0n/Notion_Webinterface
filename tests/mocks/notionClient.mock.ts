// tests/mocks/notionClient.mock.ts
// Mock für @notionhq/client – steckbar für verschiedene Test-Cases
type QueryResult = { results: Array<{ id: string; [k: string]: any }> };

export class Client {
  public databases = {
    retrieve: jest.fn(async ({ database_id }: { database_id: string }) => {
      return {
        id: database_id,
        properties: {
          // standardmäßig Skills-Prop vorhanden
          Skills: {
            type: "multi_select",
            multi_select: {
              options: [{ name: "React" }, { name: "TypeScript" }],
            },
          },
          Date: { type: "date" },
          Firmen: { type: "relation" },
          Name: { type: "title" },
          Adresse: { type: "rich_text" },
          Locations: { type: "multi_select" },
          "schon beworben": { type: "checkbox" },
          "Company Email": { type: "email" },
          "Company Number": { type: "phone_number" },
          Ansprechpartner: { type: "relation" },
        },
      };
    }),
    query: jest.fn(async (_: any) => {
      const res: QueryResult = { results: [] };
      return res;
    }),
    update: jest.fn(async (_: any) => ({ ok: true })),
  };

  public pages = {
    create: jest.fn(async (_: any) => ({ id: "new-page-id" })),
    update: jest.fn(async (_: any) => ({ ok: true })),
    retrieve: jest.fn(async ({ page_id }: { page_id: string }) => ({
      id: page_id,
      properties: { Ansprechpartner: { relation: [] } },
    })),
  };
}
