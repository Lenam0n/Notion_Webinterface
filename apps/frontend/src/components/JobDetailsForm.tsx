import { useState } from "react";

export type JobDetails = {
  jobName?: string;
  jobUrl?: string;
  applyDate: string;
  dateNachfrage?: string;
  dateRueckmeldung?: string;
  skills?: string[]; // CSV -> Array
  bemerkung?: string;
  beworben?: boolean;
  absage?: boolean;
};

type Props = {
  value: JobDetails;
  onChange: (v: JobDetails) => void;
};

export default function JobDetailsForm({ value, onChange }: Props) {
  const [skillsCsv, setSkillsCsv] = useState<string>(
    (value.skills ?? []).join(", ")
  );

  const set = <K extends keyof JobDetails>(k: K, v: JobDetails[K]) =>
    onChange({ ...value, [k]: v });

  return (
    <fieldset
      style={{
        marginTop: "1rem",
        padding: "1rem",
        border: "1px solid #ccc",
        borderRadius: 4,
      }}
    >
      <legend style={{ fontWeight: 700 }}>Bewerbungsdetails</legend>

      <label>Bezeichnung (optional)</label>
      <input
        style={{ width: "100%", padding: ".5rem", marginBottom: ".75rem" }}
        value={value.jobName ?? ""}
        placeholder='z.B. "Bewerbung"'
        onChange={(e) => set("jobName", e.target.value)}
      />

      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ flex: 1 }}>
          <label>URL (optional)</label>
          <input
            style={{ width: "100%", padding: ".5rem", marginBottom: ".75rem" }}
            value={value.jobUrl ?? ""}
            onChange={(e) => set("jobUrl", e.target.value)}
          />
        </div>
        <div style={{ width: 180 }}>
          <label>Datum Bewerbung (YYYY-MM-DD)</label>
          <input
            style={{ width: "100%", padding: ".5rem", marginBottom: ".75rem" }}
            value={value.applyDate}
            onChange={(e) => set("applyDate", e.target.value)}
            required
            placeholder="2025-08-20"
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ width: 180 }}>
          <label>Datum Nachfrage (optional)</label>
          <input
            style={{ width: "100%", padding: ".5rem", marginBottom: ".75rem" }}
            value={value.dateNachfrage ?? ""}
            onChange={(e) => set("dateNachfrage", e.target.value)}
            placeholder="YYYY-MM-DD"
          />
        </div>
        <div style={{ width: 180 }}>
          <label>Datum Rückmeldung (optional)</label>
          <input
            style={{ width: "100%", padding: ".5rem", marginBottom: ".75rem" }}
            value={value.dateRueckmeldung ?? ""}
            onChange={(e) => set("dateRueckmeldung", e.target.value)}
            placeholder="YYYY-MM-DD"
          />
        </div>
      </div>

      <label>Skills (Komma‑getrennt, optional)</label>
      <input
        style={{ width: "100%", padding: ".5rem", marginBottom: ".75rem" }}
        value={skillsCsv}
        onChange={(e) => {
          setSkillsCsv(e.target.value);
          const arr = e.target.value
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
          set("skills", arr.length ? arr : undefined);
        }}
        placeholder="TypeScript, React, Notion API"
      />

      <label>Bemerkung (optional)</label>
      <textarea
        style={{
          width: "100%",
          padding: ".5rem",
          minHeight: 80,
          marginBottom: ".75rem",
        }}
        value={value.bemerkung ?? ""}
        onChange={(e) => set("bemerkung", e.target.value)}
      />

      <div style={{ display: "flex", gap: 16 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <input
            type="checkbox"
            checked={Boolean(value.beworben)}
            onChange={(e) => set("beworben", e.target.checked)}
          />
          Beworben
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <input
            type="checkbox"
            checked={Boolean(value.absage)}
            onChange={(e) => set("absage", e.target.checked)}
          />
          Absage
        </label>
      </div>
    </fieldset>
  );
}
