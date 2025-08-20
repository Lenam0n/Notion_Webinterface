// apps/frontend/src/services/contactService.ts

/**
 * Service-Funktionen für das Frontend:
 *  - Lokal in eine JSON-Datei speichern (Vite-Dev-Middleware unter /api/contacts)
 *  - Remote direkt an die API senden (Notion-Sync)
 *
 * Hinweis:
 *  - VITE_API_BASE muss in .env.development/.env.production gesetzt sein
 *    z. B. VITE_API_BASE=http://localhost:8787
 *  - Typing für import.meta.env wird über src/env.d.ts bereitgestellt
 */

/** Optionen für den Notion-Sync (entspricht dem SyncOptions-Schema im Backend) */
export type RemoteSyncOptions = {
  /** Bezeichnung (optional). Default im Backend ist "Bewerbung". */
  jobName?: string;
  /** URL der Stellenanzeige (optional) */
  jobUrl?: string;
  /** Datum der Bewerbung (YYYY-MM-DD) – Required laut neuem Schema */
  applyDate: string;

  /** Datum Nachfrage (YYYY-MM-DD, optional) */
  dateNachfrage?: string;
  /** Datum Rückmeldung (YYYY-MM-DD, optional) */
  dateRueckmeldung?: string;

  /** Skills als Array von Strings (optional) */
  skills?: string[];
  /** Freitext (optional) */
  bemerkung?: string;

  /** Checkboxen (optional) */
  beworben?: boolean;
  absage?: boolean;
};

/** Kleiner Helper für konsistente Fehlertexte */
function buildError(prefix: string, resp: Response, body: string) {
  return new Error(
    `${prefix}: ${resp.status} ${resp.statusText}${body ? ` — ${body}` : ""}`
  );
}

/** Lokal in die JSON-Datei schreiben (nur im Dev über Vite-Middleware verfügbar) */
export async function saveCompanyLocal(entry: unknown): Promise<void> {
  const resp = await fetch("/api/contacts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry),
  });

  if (!resp.ok) {
    let body = "";
    try {
      body = await resp.text();
    } catch {
      /* ignore */
    }
    throw buildError("Lokales Speichern fehlgeschlagen", resp, body);
  }
}

/** Alle lokal gespeicherten Companies lesen (für die Liste) – optionaler Helper */
export async function fetchCompaniesLocal<T = unknown[]>(): Promise<T> {
  const resp = await fetch("/api/contacts", { method: "GET" });
  if (!resp.ok) {
    let body = "";
    try {
      body = await resp.text();
    } catch {
      /* ignore */
    }
    throw buildError("Lokales Laden fehlgeschlagen", resp, body);
  }
  return (await resp.json()) as T;
}

/**
 * Remote an die API senden → Notion-Sync
 * - entry: Company-Objekt (mit name, adresse, optional companyEmail/companyNumber/ansprechpartner)
 * - options: RemoteSyncOptions (applyDate required)
 */
export async function saveCompanyRemote(
  entry: unknown,
  options: RemoteSyncOptions
): Promise<void> {
  const base = import.meta.env?.VITE_API_BASE;
  if (!base) {
    throw new Error(
      "VITE_API_BASE ist nicht gesetzt. Lege eine .env.development/.env.production mit VITE_API_BASE an (z. B. http://localhost:8787)."
    );
  }

  const resp = await fetch(`${base}/v1/companies`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entry, options }),
  });

  if (!resp.ok) {
    // Versuche, eine sinnvolle Fehlermeldung vom Backend zu lesen
    try {
      const ct = resp.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        const data = (await resp.json()) as { error?: string } | unknown;
        const msg = (data as any)?.error ?? JSON.stringify(data);
        throw buildError("Remote-Sync fehlgeschlagen", resp, String(msg));
      } else {
        const text = await resp.text();
        throw buildError("Remote-Sync fehlgeschlagen", resp, text);
      }
    } catch (e) {
      // Fallback, falls response body nicht lesbar war
      throw buildError(
        "Remote-Sync fehlgeschlagen",
        resp,
        (e as Error)?.message ?? ""
      );
    }
  }
}

export async function fetchSkillOptions(): Promise<string[]> {
  const base =
    (import.meta as any).env?.VITE_API_BASE || process.env.VITE_API_BASE;

  if (!base) throw new Error("VITE_API_BASE nicht gesetzt");
  const resp = await fetch(`${base}/v1/skills`);
  const data = await resp.json();
  return data.skills ?? [];
}
