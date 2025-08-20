// Lokal (JSON-Datei über Vite-Middleware) speichern
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function saveCompanyLocal(data: any): Promise<void> {
  const resp = await fetch("/api/contacts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Fehler beim Speichern: ${resp.status} ${text}`);
  }
}

// Remote an API-Backend senden (Notion-Pipeline)
export async function saveCompanyRemote(
  entry: unknown,
  options: {
    defaultJobName: string;
    defaultJobUrl?: string;
    defaultApplyDate?: string;
  }
) {
  const base = import.meta.env.VITE_API_BASE;
  if (!base) throw new Error("VITE_API_BASE nicht gesetzt (.env.development)!");
  const resp = await fetch(`${base}/v1/companies`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entry, options }),
  });
  if (!resp.ok) {
    let msg: string;
    try {
      msg = (await resp.json()).error ?? (await resp.text());
    } catch {
      msg = await resp.text();
    }
    throw new Error(`Remote-Fehler: ${resp.status} ${msg}`);
  }
}
