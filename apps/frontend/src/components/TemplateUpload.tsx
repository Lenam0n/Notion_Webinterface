// apps/frontend/src/components/TemplateUpload.tsx
import React from "react";
import { uploadTemplate } from "../services/templateService";

export default function TemplateUpload({
  onUploaded,
}: {
  onUploaded: () => void;
}) {
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setBusy(true);
    setError(null);
    try {
      await uploadTemplate(f);
      onUploaded();
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  return (
    <div
      style={{ border: "1px dashed #aaa", padding: "1rem", borderRadius: 8 }}
    >
      <label
        style={{ display: "block", marginBottom: ".5rem", fontWeight: 600 }}
      >
        PSD/INDD hochladen
      </label>
      <input
        type="file"
        accept=".psd,.indd"
        onChange={onChange}
        disabled={busy}
      />
      {busy && <div style={{ marginTop: ".5rem" }}>Upload…</div>}
      {error && (
        <div style={{ marginTop: ".5rem", color: "crimson" }}>{error}</div>
      )}
      <div style={{ fontSize: 12, marginTop: ".5rem", color: "#666" }}>
        Erlaubt: .psd / .indd. Datei wird in <code>TEMPLATES_DIR</code>{" "}
        gespeichert.
      </div>
    </div>
  );
}
