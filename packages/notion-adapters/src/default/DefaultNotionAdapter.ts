// packages/notion-adapters/src/default/DefaultNotionAdapter.ts

import { Client } from "@notionhq/client";
import type { CompanyEntry, SyncOptions } from "@shared/types";
import type { INotionAdapter, PageId } from "./INotionAdapter";

/**
 * Injected configuration (kein Top‑Level process.env mehr!)
 */
type NotionCfg = {
  token: string;
  db1: string; // DB_1 (Bewerbungen/Jobs)
  db2: string; // DB_2 (Ansprechpartner)
  db3: string; // DB_3 (Firmen)
};

/* -------------------- Property-Mappings ---------------------
   DB_1 (Jobs/Bewerbungen):
   - Firmen (relation -> DB_3) REQUIRED
   - Ansprechpartner (relation -> DB_2) OPTIONAL
   - Date (apply) REQUIRED
   - Date Nachfrage OPTIONAL
   - Date Rückmeldung OPTIONAL
   - Name (title) OPTIONAL (default "Bewerbung")
   - Skills (multi_select) OPTIONAL
   - Bemerkung (rich_text) OPTIONAL
   - Beworben (checkbox) OPTIONAL
   - Absage (checkbox) OPTIONAL
   - URL (url) OPTIONAL
*/
const DB1 = {
  firmen: "Firmen",
  ansprechpartner: "Ansprechpartner",
  date: "Date",
  dateNachfrage: "Date Nachfrage",
  dateRueckmeldung: "Date Rückmeldung",
  name: "Name",
  skills: "Skills",
  bemerkung: "Bemerkung",
  beworben: "Beworben",
  absage: "Absage",
  url: "URL",
} as const;

/* DB_2 bleibt unverändert */
const DB2 = {
  name: "Name",
  betrieb: "Betriebs_link", // Relation zu DB_3
  linkedin: "Linkedin",
} as const;

/* DB_3 (Firmen)
   NEU: Company Email (email) + Company Number (phone)
*/
const DB3 = {
  name: "Name",
  adresse: "Adresse",
  locations: "Locations",
  schonBeworben: "schon beworben",
  ansprechpartnerLink: "Ansprechpartner", // optionaler Backlink
  companyEmail: "Company Email",
  companyNumber: "Company Number",
} as const;

/* -------------------- pv-Helper --------------------- */
const pv = {
  title: (content: string) => ({ title: [{ text: { content } }] }),
  text: (content?: string) =>
    content && content.length
      ? { rich_text: [{ text: { content } }] }
      : { rich_text: [] },
  url: (value?: string) => ({ url: value && value.length ? value : null }),
  date: (iso?: string) => ({ date: iso && iso.length ? { start: iso } : null }),
  checkbox: (value?: boolean) =>
    value === undefined ? undefined : { checkbox: Boolean(value) },
  multiselect: (values?: ReadonlyArray<string>) =>
    values && values.length
      ? { multi_select: values.map((name) => ({ name })) }
      : { multi_select: [] },
  relation: (ids: ReadonlyArray<string>) => ({
    relation: ids.map((id) => ({ id })),
  }),
  email: (value?: string) => ({ email: value ?? null }),
  phone: (value?: string) => ({ phone_number: value ?? null }),
};

const formatAddress = (a: CompanyEntry["adresse"]) =>
  `${a["straße"]}, ${a.plz} ${a.ort}`;

/* ============================================================
 * DefaultNotionAdapter (mit injizierter Config)
 * ============================================================ */
export class DefaultNotionAdapter implements INotionAdapter {
  private notion: Client;
  private ENV: NotionCfg;

  private db1HasAnsprechpartner: boolean | null = null;
  private db3HasBacklink: boolean | null = null;
  private db3BacklinkWarned = false;

  constructor(cfg: NotionCfg) {
    this.ENV = cfg;
    this.notion = new Client({ auth: cfg.token });
  }

  /* -------- Schema Check (Required/Optional nach Vorgabe) -------- */
  async validateSchema(): Promise<void> {
    const check = async (
      dbId: string,
      required: Record<string, string>,
      optional?: Record<string, string>
    ) => {
      const db = (await this.notion.databases.retrieve({
        database_id: dbId,
      })) as any;
      const props = db.properties as Record<string, { type?: string }>;
      const err: string[] = [];
      const warn: string[] = [];
      for (const [n, t] of Object.entries(required)) {
        const actual = props[n]?.type;
        if (!actual) err.push(`- Property "${n}" fehlt`);
        else if (actual !== t)
          err.push(`- "${n}" Typ "${actual}" ≠ erwartet "${t}"`);
      }
      if (optional) {
        for (const [n, t] of Object.entries(optional)) {
          const actual = props[n]?.type;
          if (!actual) warn.push(`• Optionale "${n}" fehlt (übersprungen)`);
          else if (actual !== t)
            warn.push(
              `• Optionale "${n}" Typ "${actual}" ≠ "${t}" (übersprungen)`
            );
        }
      }
      if (warn.length)
        console.warn(`Warnungen in DB ${dbId}:\n${warn.join("\n")}`);
      if (err.length)
        throw new Error(
          `Notion Schema Mismatch in ${dbId}:\n${err.join("\n")}`
        );
    };

    // DB_1 required/optional nach neuem Schema
    await check(
      this.ENV.db1,
      {
        [DB1.firmen]: "relation",
        [DB1.date]: "date",
      },
      {
        [DB1.ansprechpartner]: "relation",
        [DB1.name]: "title",
        [DB1.skills]: "multi_select",
        [DB1.bemerkung]: "rich_text",
        [DB1.beworben]: "checkbox",
        [DB1.absage]: "checkbox",
        [DB1.url]: "url",
        [DB1.dateNachfrage]: "date",
        [DB1.dateRueckmeldung]: "date",
      }
    );

    // DB_2 unverändert
    await check(this.ENV.db2, {
      [DB2.name]: "title",
      [DB2.betrieb]: "relation",
      [DB2.linkedin]: "url",
    });

    // DB_3 neu mit Email/Phone, backlink optional
    await check(
      this.ENV.db3,
      {
        [DB3.name]: "title",
        [DB3.adresse]: "rich_text",
        [DB3.locations]: "multi_select",
        [DB3.schonBeworben]: "checkbox",
        [DB3.companyEmail]: "email",
        [DB3.companyNumber]: "phone_number",
      },
      { [DB3.ansprechpartnerLink]: "relation" }
    );
  }

  private async hasDb1ContactRelation(): Promise<boolean> {
    if (this.db1HasAnsprechpartner !== null) return this.db1HasAnsprechpartner;
    const db = (await this.notion.databases.retrieve({
      database_id: this.ENV.db1,
    })) as any;
    this.db1HasAnsprechpartner =
      db.properties?.[DB1.ansprechpartner]?.type === "relation";
    return this.db1HasAnsprechpartner;
  }

  private async hasDb3BacklinkRelation(): Promise<boolean> {
    if (this.db3HasBacklink !== null) return this.db3HasBacklink;
    const db = (await this.notion.databases.retrieve({
      database_id: this.ENV.db3,
    })) as any;
    this.db3HasBacklink =
      db.properties?.[DB3.ansprechpartnerLink]?.type === "relation";
    return this.db3HasBacklink;
  }

  /* -------------------- DB_3: Firmen -------------------- */
  private async findCompanyByName(name: string): Promise<PageId | null> {
    const res = await this.notion.databases.query({
      database_id: this.ENV.db3,
      filter: { property: DB3.name, title: { equals: name } },
    });
    return (res.results[0] as any)?.id ?? null;
  }

  async upsertCompany(entry: CompanyEntry): Promise<PageId> {
    const ex = await this.findCompanyByName(entry.name);
    if (ex) return ex;

    const props: any = {
      [DB3.name]: pv.title(entry.name),
      [DB3.adresse]: pv.text(formatAddress(entry.adresse)),
      [DB3.locations]: pv.multiselect([entry.adresse.ort]),
      [DB3.schonBeworben]: { checkbox: false },
      [DB3.companyEmail]: pv.email(entry.companyEmail),
      [DB3.companyNumber]: pv.phone(entry.companyNumber),
    };

    const res = await this.notion.pages.create({
      parent: { database_id: this.ENV.db3 },
      properties: props,
    });
    return (res as any).id;
  }

  /* -------------------- DB_2: Ansprechpartner -------------------- */
  private async findContactByNameAndCompany(
    name: string,
    companyId: PageId
  ): Promise<PageId | null> {
    const res = await this.notion.databases.query({
      database_id: this.ENV.db2,
      filter: {
        and: [
          { property: DB2.name, title: { equals: name } },
          { property: DB2.betrieb, relation: { contains: companyId } },
        ],
      },
    });
    return (res.results[0] as any)?.id ?? null;
  }

  async upsertContact(params: {
    companyId: PageId;
    name: string;
    linkedin?: string;
  }): Promise<PageId> {
    const ex = await this.findContactByNameAndCompany(
      params.name,
      params.companyId
    );
    if (ex) return ex;

    const props = {
      [DB2.name]: pv.title(params.name),
      [DB2.betrieb]: pv.relation([params.companyId]),
      [DB2.linkedin]: pv.url(params.linkedin),
    };

    const res = await this.notion.pages.create({
      parent: { database_id: this.ENV.db2 },
      properties: props,
    });
    return (res as any).id;
  }

  async addContactBacklink(
    companyId: PageId,
    contactId: PageId
  ): Promise<void> {
    if (!(await this.hasDb3BacklinkRelation())) {
      if (!this.db3BacklinkWarned) {
        console.warn(
          `Warnung: Optionale Backlink-Relation "${DB3.ansprechpartnerLink}" fehlt – übersprungen.`
        );
        this.db3BacklinkWarned = true;
      }
      return;
    }

    const page = (await this.notion.pages.retrieve({
      page_id: companyId,
    })) as any;
    const curr = page.properties?.[DB3.ansprechpartnerLink]?.relation ?? [];
    if (curr.some((r: any) => r.id === contactId)) return;

    await this.notion.pages.update({
      page_id: companyId,
      properties: {
        [DB3.ansprechpartnerLink]: { relation: [...curr, { id: contactId }] },
      },
    });
  }

  /* -------------------- DB_1: Bewerbungen/Jobs -------------------- */
  private async findJobByNameAndCompany(
    jobName: string,
    companyId: PageId
  ): Promise<PageId | null> {
    const res = await this.notion.databases.query({
      database_id: this.ENV.db1,
      filter: {
        and: [
          { property: DB1.name, title: { equals: jobName } },
          { property: DB1.firmen, relation: { contains: companyId } },
        ],
      },
    });
    return (res.results[0] as any)?.id ?? null;
  }

  async upsertJob(params: {
    companyId: PageId;
    contactId?: PageId;
    options: SyncOptions;
  }): Promise<PageId> {
    const {
      jobName = "Bewerbung",
      jobUrl,
      applyDate,
      dateNachfrage,
      dateRueckmeldung,
      skills,
      bemerkung,
      beworben,
      absage,
    } = params.options;

    const nameToUse = jobName || "Bewerbung";
    const ex = await this.findJobByNameAndCompany(nameToUse, params.companyId);
    if (ex) return ex;

    const props: any = {
      [DB1.name]: pv.title(nameToUse),
      [DB1.firmen]: pv.relation([params.companyId]),
      [DB1.date]: pv.date(applyDate), // REQUIRED
      [DB1.url]: pv.url(jobUrl),
      [DB1.skills]: pv.multiselect(skills),
      [DB1.bemerkung]: pv.text(bemerkung),
    };

    // optionale Booleans nur setzen, wenn übergeben (sonst Default in Notion belassen)
    const cbBeworben = pv.checkbox(beworben);
    if (cbBeworben) props[DB1.beworben] = cbBeworben;
    const cbAbsage = pv.checkbox(absage);
    if (cbAbsage) props[DB1.absage] = cbAbsage;

    // optionale Dates
    if (dateNachfrage) props[DB1.dateNachfrage] = pv.date(dateNachfrage);
    if (dateRueckmeldung)
      props[DB1.dateRueckmeldung] = pv.date(dateRueckmeldung);

    // optionale Relation Ansprechpartner nur setzen, wenn Spalte existiert
    if (params.contactId && (await this.hasDb1ContactRelation())) {
      props[DB1.ansprechpartner] = pv.relation([params.contactId]);
    }

    const created = await this.notion.pages.create({
      parent: { database_id: this.ENV.db1 },
      properties: props,
    });

    // Firma auf "schon beworben" = true
    await this.notion.pages.update({
      page_id: params.companyId,
      properties: { [DB3.schonBeworben]: { checkbox: true } },
    });

    return (created as any).id;
  }

  /* -------------------- High-level Prozess -------------------- */
  async syncCompanies(list: CompanyEntry[], opts: SyncOptions): Promise<void> {
    for (const entry of list) {
      const companyId = await this.upsertCompany(entry);

      let contactId: string | undefined;
      const ap = entry.ansprechpartner;
      if (ap?.name?.trim()) {
        contactId = await this.upsertContact({
          companyId,
          name: ap.name,
          linkedin: ap.linkedin,
        });
        await this.addContactBacklink(companyId, contactId);
      }

      await this.upsertJob({ companyId, contactId, options: opts });
    }
  }
}
