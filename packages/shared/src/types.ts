import { z } from "zod";

export const AddressSchema = z.object({
  straße: z.string().min(1),
  plz: z.string().min(1),
  ort: z.string().min(1),
});
export type Address = z.infer<typeof AddressSchema>;

export const AnsprechpartnerSchema = z.object({
  name: z.string().min(1),
  linkedin: z.string().url().or(z.literal("")).default(""),
});
export type Ansprechpartner = z.infer<typeof AnsprechpartnerSchema>;

export const CompanyEntrySchema = z.object({
  name: z.string().min(1),
  adresse: AddressSchema,
  ansprechpartner: AnsprechpartnerSchema.optional(),
});
export type CompanyEntry = z.infer<typeof CompanyEntrySchema>;

export const CompanyListSchema = z.array(CompanyEntrySchema);
export type CompanyList = z.infer<typeof CompanyListSchema>;

export const SyncOptionsSchema = z.object({
  defaultJobName: z.string(),
  defaultJobUrl: z.string().optional().default(""),
  defaultApplyDate: z.string().optional().default(""), // YYYY-MM-DD
});
export type SyncOptions = z.infer<typeof SyncOptionsSchema>;
