/**
 * Jest Mock für @notionhq/client
 * Stellt vereinfachte Versionen der Notion-API bereit,
 * damit Tests ohne echte Notion-Calls laufen.
 */

export class Client {
  public databases = {
    retrieve: jest.fn(async ({ database_id }: { database_id: string }) => {
      // --- DB1: Bewerbungen ---
      if (database_id === "DB1") {
        return {
          id: "DB1",
          properties: {
            Name: { type: "title" },
            Firmen: { type: "relation" }, // Relation zu DB3
            Ansprechpartner: { type: "relation" }, // optional, Relation zu DB2
            Date: { type: "date" },
            "Date Nachfrage": { type: "date" },
            "Date Rückmeldung": { type: "date" },
            Skills: {
              type: "multi_select",
              multi_select: {
                options: [
                  { name: "React" },
                  { name: "TypeScript" },
                  { name: "Notion API" },
                ],
              },
            },
            Bemerkung: { type: "rich_text" },
            Beworben: { type: "checkbox" },
            Absage: { type: "checkbox" },
            URL: { type: "url" },
          },
        };
      }

      // --- DB2: Ansprechpartner ---
      if (database_id === "DB2") {
        return {
          id: "DB2",
          properties: {
            Name: { type: "title" },
            Betriebs_link: { type: "relation" }, // Relation zu DB3
            Linkedin: { type: "url" },
            "Contact Number": { type: "phone_number" },
            "Contact Email": { type: "email" },
          },
        };
      }

      // --- DB3: Firmen ---
      if (database_id === "DB3") {
        return {
          id: "DB3",
          properties: {
            Name: { type: "title" },
            Adresse: { type: "rich_text" },
            Locations: { type: "multi_select" },
            "schon beworben": { type: "checkbox" },
            Ansprechpartner: { type: "relation" }, // backlink auf DB2
            "Company Email": { type: "email" },
            "Company Number": { type: "phone_number" },
          },
        };
      }

      // Fallback: leere Struktur
      return { id: database_id, properties: {} };
    }),

    query: jest.fn(async () => ({
      results: [],
    })),

    update: jest.fn(async (_: any) => ({ ok: true })),
  };

  public pages = {
    create: jest.fn(async (_: any) => ({
      id: "new-page-id",
    })),
    update: jest.fn(async (_: any) => ({ ok: true })),
    retrieve: jest.fn(async ({ page_id }: { page_id: string }) => ({
      id: page_id,
      properties: {
        Ansprechpartner: { relation: [] },
      },
    })),
  };
}

// Standardexport wie bei @notionhq/client
export default { Client };
