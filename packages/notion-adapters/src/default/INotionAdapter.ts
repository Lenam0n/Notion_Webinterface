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
    jobName: string;
    url?: string;
    applyDateISO?: string;
    contactId?: PageId;
  }): Promise<PageId>;
  /** High-level Prozess: 1) Firma 2) Kontakt (+Backlink) 3) Job */
  syncCompanies(list: CompanyEntry[], opts: SyncOptions): Promise<void>;
}
