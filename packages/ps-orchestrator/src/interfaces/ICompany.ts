// packages/ps-orchestrator/src/interfaces/ICompany.ts
export interface CompanyAddress {
  straße: string;
  plz: string;
  ort: string;
  email?: string;
  telefon?: string;
}

export interface CompanyContact {
  name: string;
  email?: string;
  linkedin?: string;
}

export interface CompanyEntry {
  name: string;
  adresse: CompanyAddress;
  ansprechpartner: CompanyContact;
}

/** Platzhalter-Key→Wert (entspricht Layer/Frame-Namen) */
export type PlaceholderMap = Record<string, string>;
