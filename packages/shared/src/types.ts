import { z } from "zod";

/* ---------------- Adressen & Kontakt ---------------- */
export const AddressSchema = z.object({
  straße: z.string().min(1, "Straße fehlt"),
  plz: z.string().min(1, "PLZ fehlt"),
  ort: z.string().min(1, "Ort fehlt"),
});
export type Address = z.infer<typeof AddressSchema>;

export const AnsprechpartnerSchema = z.object({
  name: z.string().min(1, "Ansprechpartner-Name fehlt"),
  linkedin: z.string().url().or(z.literal("")).default(""),
});
export type Ansprechpartner = z.infer<typeof AnsprechpartnerSchema>;

/* ---------------- Company (DB_3) ----------------
   NEU: companyEmail (Email) + companyNumber (Phone)
*/
export const CompanyEntrySchema = z.object({
  name: z.string().min(1, "Firmenname fehlt"),
  adresse: AddressSchema,
  companyEmail: z.string().email().optional(),
  companyNumber: z.string().optional(),
  ansprechpartner: AnsprechpartnerSchema.optional(),
});
export type CompanyEntry = z.infer<typeof CompanyEntrySchema>;

export const CompanyListSchema = z.array(CompanyEntrySchema);
export type CompanyList = z.infer<typeof CompanyListSchema>;

/* ---------------- Bewerbungs-Optionen (DB_1) ---------------
   Name optional → default "Bewerbung"
   Date (apply) REQUIRED laut deiner Vorgabe (Tag der Bewerbung)
   Rest optional
*/
export const SyncOptionsSchema = z.object({
  jobName: z.string().default("Bewerbung"),
  jobUrl: z.string().optional(),
  applyDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD erwartet"),

  dateNachfrage: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  dateRueckmeldung: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),

  skills: z.array(z.string().min(1)).optional(),
  bemerkung: z.string().optional(),

  beworben: z.boolean().optional(),
  absage: z.boolean().optional(),
});
export type SyncOptions = z.infer<typeof SyncOptionsSchema>;
