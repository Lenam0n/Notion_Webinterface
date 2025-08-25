// apps/frontend/src/components/OrchestratorPanel.tsx
import React from "react";
import TemplateUpload from "./TemplateUpload";
import TemplatePicker, { type TemplatePickerValue } from "./TemplatePicker";
import { runBatch, checkProgress } from "../services/orchestratorService";
import { useToast } from "./Toast";

type ItemState = { path: string; status: "pending" | "done" };

export default function OrchestratorPanel() {
  const { push } = useToast();

  const [pick, setPick] = React.useState<TemplatePickerValue>({});
  const [source, setSource] = React.useState<"file" | "rest">("file");
  const [keys, setKeys] = React.useState<string>("");
  const [format, setFormat] = React.useState<"pdf" | "png" | "jpg">("pdf");
  const [type, setType] = React.useState<"photoshop" | "indesign">("photoshop");
  const [greet, setGreet] = React.useState<"neutral" | "formell">("neutral");
  const [outPattern, setOutPattern] = React.useState<string>(
    "./jobs/out/{key}.{format}"
  );

  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);
  const [err, setErr] = React.useState<string | null>(null);

  const [items, setItems] = React.useState<ItemState[]>([]);
  const [pid, setPid] = React.useState<number | null>(null);

  // polling
  React.useEffect(() => {
    if (!busy || !items.length) return;

    let cancelled = false;
    let lastFound = 0;
    const startedAt = Date.now();
    const hardTimeout = 20 * 60 * 1000; // 20 min safeguard
    const idleTimeout = 120 * 1000; // 2 min ohne Fortschritt ⇒ Fehler

    async function tick() {
      try {
        const paths = items.map((i) => i.path);
        const p = await checkProgress(paths);
        if (cancelled) return;

        const foundSet = new Set(p.found.map((x) => x.toLowerCase()));
        setItems((prev) =>
          prev.map((it) => ({
            ...it,
            status: foundSet.has(it.path.toLowerCase()) ? "done" : "pending",
          }))
        );

        const nowFound = p.found.length;
        const progressed = nowFound > lastFound;
        if (progressed) lastFound = nowFound;

        if (p.done) {
          setBusy(false);
          setMsg(`Batch abgeschlossen (${p.total}/${p.total}).`);
          push(`Batch abgeschlossen: ${p.total} Datei(en)`, "success");
          return; // stop polling
        }

        const age = Date.now() - startedAt;
        if (age > hardTimeout) {
          setBusy(false);
          setErr("Batch‑Timeout (Hard‑Timeout erreicht).");
          push("Batch‑Timeout: zu lange Laufzeit", "error");
          return;
        }

        if (!progressed && age > idleTimeout) {
          setBusy(false);
          setErr("Keine Fortschritte seit 2 Minuten – bitte Logs prüfen.");
          push("Keine Fortschritte – bitte prüfen", "error");
          return;
        }

        setTimeout(tick, 2000);
      } catch (e: any) {
        if (cancelled) return;
        setBusy(false);
        setErr(e?.message ?? String(e));
        push(`Fehler beim Progress: ${e?.message ?? String(e)}`, "error");
      }
    }

    const id = setTimeout(tick, 2000);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [busy, items, push]);

  async function handleRun() {
    setBusy(true);
    setErr(null);
    setMsg(null);
    setPid(null);
    setItems([]);
    try {
      if (!pick.templatePath || !pick.mapperPath)
        throw new Error("Template und Mapper auswählen.");
      const keyList = keys
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (!keyList.length)
        throw new Error("Mindestens einen Key angeben (Komma‑getrennt).");

      const payload = {
        templatePath: pick.templatePath,
        mapperPath: pick.mapperPath,
        source,
        keys: keyList,
        type,
        format,
        greetingStyle: greet,
        outputPattern: outPattern,
      } as const;

      const res = await runBatch(payload);
      setPid(res.pid);
      setItems(
        res.expected.map((p) => ({ path: p, status: "pending" as const }))
      );
      setMsg(
        `Gestartet (PID ${res.pid}). Beobachte ${res.expected.length} Ausgabedatei(en)…`
      );
      push("Batch gestartet", "info");
      // Polling startet via useEffect
    } catch (e: any) {
      setBusy(false);
      setErr(e?.message ?? String(e));
      push(`Start fehlgeschlagen: ${e?.message ?? String(e)}`, "error");
    }
  }

  return (
    <section style={{ display: "grid", gap: 16 }}>
      <h2>Photoshop‑Batch orchestrieren</h2>

      <TemplateUpload
        onUploaded={() => {
          setMsg("Upload ok. Dropdowns mit ↻ aktualisieren.");
        }}
      />

      <TemplatePicker value={pick} onChange={setPick} />

      <div
        style={{
          display: "grid",
          gap: 12,
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        }}
      >
        <div>
          <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>
            Quelle
          </label>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value as any)}
            style={{ width: "100%", padding: 8 }}
          >
            <option value="file">file (DATA_DIR)</option>
            <option value="rest">rest (API)</option>
          </select>
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>
            Keys (Komma‑getrennt)
          </label>
          <input
            value={keys}
            onChange={(e) => setKeys(e.target.value)}
            placeholder="Acme GmbH, Firma XY"
            style={{ width: "100%", padding: 8 }}
          />
          <div style={{ fontSize: 12, color: "#666" }}>
            Jeder Key erzeugt einen Export nach dem Output‑Pattern.
          </div>
        </div>
        <div>
          <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>
            Exportformat
          </label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as any)}
            style={{ width: "100%", padding: 8 }}
          >
            <option>pdf</option>
            <option>png</option>
            <option>jpg</option>
          </select>
        </div>
        <div>
          <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>
            Template‑Typ
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            style={{ width: "100%", padding: 8 }}
          >
            <option>photoshop</option>
            <option>indesign</option>
          </select>
        </div>
        <div>
          <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>
            Anrede
          </label>
          <select
            value={greet}
            onChange={(e) => setGreet(e.target.value as any)}
            style={{ width: "100%", padding: 8 }}
          >
            <option value="neutral">neutral</option>
            <option value="formell">formell</option>
          </select>
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>
            Output‑Pattern
          </label>
          <input
            value={outPattern}
            onChange={(e) => setOutPattern(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
          <div style={{ fontSize: 12, color: "#666" }}>
            Platzhalter: {"{key}"} und {"{format}"}. Beispiel:{" "}
            <code>./jobs/out/&lbrace;key&rbrace;.&lbrace;format&rbrace;</code>
          </div>
        </div>
      </div>

      <button
        disabled={busy}
        onClick={handleRun}
        style={{ padding: "10px 14px", fontWeight: 600 }}
      >
        {busy ? "Wird ausgeführt…" : "Batch starten"}
      </button>

      {msg && <div style={{ color: "seagreen" }}>{msg}</div>}
      {err && <div style={{ color: "crimson" }}>{err}</div>}

      {/* Fortschrittsliste */}
      {!!items.length && (
        <div style={{ border: "1px solid #eee", borderRadius: 8, padding: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>
            Fortschritt {items.filter((i) => i.status === "done").length}/
            {items.length}
            {pid ? ` · PID ${pid}` : ""}
          </div>
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "grid",
              gap: 6,
            }}
          >
            {items.map((it) => (
              <li
                key={it.path}
                style={{ display: "flex", gap: 8, alignItems: "center" }}
              >
                <span
                  aria-label={it.status === "done" ? "done" : "pending"}
                  title={it.status}
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: it.status === "done" ? "seagreen" : "#bbb",
                    display: "inline-block",
                    flex: "0 0 auto",
                  }}
                />
                <code style={{ fontSize: 12, color: "#333" }}>{it.path}</code>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
