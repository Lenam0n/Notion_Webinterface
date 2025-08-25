// packages/ps-orchestrator/src/templates/photoshop/anschreiben.template.ts
import type { CompanyEntry, PlaceholderMap } from "@interface/ICompany";

/**
 * Mappt CompanyEntry → Platzhalter in deiner PSD.
 * Passe die Placeholder-Namen links exakt an die Layernamen im PSD an.
 */
export function buildAnschreibenPlaceholderMap(
  entry: CompanyEntry,
  opts?: { greetingStyle?: "neutral" | "formell"; date?: Date }
): PlaceholderMap {
  const today = (opts?.date ?? new Date()).toLocaleDateString("de-DE");
  const greeting =
    opts?.greetingStyle === "formell"
      ? `Sehr geehrte Damen und Herren`
      : `Hallo ${entry.ansprechpartner.name}`;

  const addr = entry.adresse;
  return {
    "<DATUM>": today,
    "<ANREDE>": greeting,
    "<FIRMA_NAME>": entry.name,
    "<FIRMA_STRASSE>": addr.straße,
    "<FIRMA_PLZ>": addr.plz,
    "<FIRMA_ORT>": addr.ort,
    "<KONTAKT_NAME>": entry.ansprechpartner.name,
    "<KONTAKT_EMAIL>": entry.ansprechpartner.email ?? "",
    "<KONTAKT_LINKEDIN>": entry.ansprechpartner.linkedin ?? "",
  };
}
