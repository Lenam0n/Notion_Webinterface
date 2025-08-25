// apps/frontend/src/components/TemplatePicker.tsx
import React from "react";
import {
  fetchMappers,
  fetchTemplates,
  type MapperFile,
  type TemplateFile,
} from "../services/templateService";

export type TemplatePickerValue = {
  templatePath?: string;
  mapperPath?: string;
};

export default function TemplatePicker({
  value,
  onChange,
}: {
  value: TemplatePickerValue;
  onChange: (v: TemplatePickerValue) => void;
}) {
  const [templates, setTemplates] = React.useState<TemplateFile[]>([]);
  const [mappers, setMappers] = React.useState<MapperFile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const [t, m] = await Promise.all([fetchTemplates(), fetchMappers()]);
      setTemplates(t);
      setMappers(m);
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "flex-end",
          flexWrap: "wrap",
        }}
      >
        <div style={{ minWidth: 260 }}>
          <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>
            Template
          </label>
          <select
            style={{ width: "100%", padding: 8 }}
            value={value.templatePath || ""}
            onChange={(e) =>
              onChange({ ...value, templatePath: e.target.value || undefined })
            }
          >
            <option value="">– auswählen –</option>
            {templates.map((t) => (
              <option key={t.path} value={t.path}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ minWidth: 260 }}>
          <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>
            Mapper
          </label>
          <select
            style={{ width: "100%", padding: 8 }}
            value={value.mapperPath || ""}
            onChange={(e) =>
              onChange({ ...value, mapperPath: e.target.value || undefined })
            }
          >
            <option value="">– auswählen –</option>
            {mappers.map((m) => (
              <option key={m.path} value={m.path}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <button onClick={load} style={{ padding: "8px 12px" }}>
          ↻ Aktualisieren
        </button>
      </div>

      {loading && <div style={{ marginTop: 8 }}>Lade…</div>}
      {err && <div style={{ marginTop: 8, color: "crimson" }}>{err}</div>}
    </div>
  );
}
