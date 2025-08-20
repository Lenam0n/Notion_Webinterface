import type { CompanyEntry, SyncOptions } from "@shared/types";

export type PageId = string;

export interface INotionAdapter {
  validateSchema(): Promise<void>;

  upsertCompany(entry: CompanyEntry): Promise<PageId>;

  upsertContact(params: {
    companyId: PageId;
    name: string;
    linkedin?: string;
  }): Promise<PageId>;

  addContactBacklink(companyId: PageId, contactId: PageId): Promise<void>;

  upsertJob(params: {
    companyId: PageId;
    contactId?: PageId;
    options: SyncOptions;
  }): Promise<PageId>;

  /** Holt alle aktuellen Skill-Optionen (Multi-Select) aus DB_1 */
  getSkillOptions(): Promise<string[]>;

  /** Stellt sicher, dass alle übergebenen Skills im DB-Schema vorhanden sind */
  ensureSkillOptions(skills: string[]): Promise<void>;

  /** High-level Prozess für eine Liste */
  syncCompanies(list: CompanyEntry[], opts: SyncOptions): Promise<void>;
}
