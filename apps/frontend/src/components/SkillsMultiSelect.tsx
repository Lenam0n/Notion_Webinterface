// apps/frontend/src/components/SkillsMultiSelect.tsx
import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  /** aktuell gewählte Skills */
  value: string[] | undefined;
  /** wenn sich die Auswahl ändert */
  onChange: (skills: string[] | undefined) => void;
  /** lädt alle verfügbaren Optionen aus der API */
  fetchOptions: () => Promise<string[]>;
  label?: string;
  placeholder?: string;
};

export default function SkillsMultiSelect({
  value,
  onChange,
  fetchOptions,
  label = "Skills",
  placeholder = "Tippe, um zu suchen oder neue hinzuzufügen…",
}: Props) {
  const [allOptions, setAllOptions] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = value ?? [];
  const available = useMemo(
    () =>
      allOptions
        .filter((o) => !selected.includes(o))
        .filter((o) => o.toLowerCase().includes(query.toLowerCase())),
    [allOptions, selected, query]
  );

  useEffect(() => {
    let mounted = true;
    fetchOptions()
      .then((opts) => mounted && setAllOptions(opts))
      .catch(() => mounted && setAllOptions([]));
    return () => {
      mounted = false;
    };
  }, [fetchOptions]);

  const add = (s: string) => {
    const val = s.trim();
    if (!val) return;
    const next = [...selected, val];
    onChange(next);
    setQuery("");
    setOpen(false);
    if (!allOptions.includes(val)) setAllOptions((prev) => [...prev, val]);
    inputRef.current?.focus();
  };

  const remove = (s: string) => {
    const next = selected.filter((x) => x !== s);
    onChange(next.length ? next : undefined);
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter" || e.key === "," || e.key === "Tab") {
      e.preventDefault();
      if (query.trim()) add(query);
    } else if (e.key === "Backspace" && !query && selected.length) {
      remove(selected[selected.length - 1]);
    }
  };

  return (
    <div style={{ marginTop: ".5rem", position: "relative" }}>
      <label
        style={{ display: "block", marginBottom: ".25rem", fontSize: ".9rem" }}
      >
        {label} (Multi‑Select)
      </label>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          padding: 6,
          border: "1px solid #ccc",
          borderRadius: 4,
          minHeight: 42,
          cursor: "text",
        }}
        onClick={() => inputRef.current?.focus()}
      >
        {selected.map((s) => (
          <span
            key={s}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 8px",
              borderRadius: 12,
              background: "#f0f0f0",
              fontSize: ".85rem",
            }}
          >
            {s}
            <button
              type="button"
              onClick={() => remove(s)}
              aria-label={`Remove ${s}`}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              ×
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          style={{
            flex: 1,
            minWidth: 160,
            border: "none",
            outline: "none",
            fontSize: "1rem",
          }}
          placeholder={placeholder}
        />
      </div>

      {open && (available.length > 0 || query.trim()) && (
        <div
          style={{
            position: "absolute",
            zIndex: 20,
            top: "100%",
            left: 0,
            right: 0,
            border: "1px solid #ccc",
            background: "#fff",
            borderRadius: 4,
            marginTop: 4,
            maxHeight: 220,
            overflowY: "auto",
          }}
        >
          {available.slice(0, 20).map((opt) => (
            <div
              key={opt}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => add(opt)}
              style={{ padding: "8px 10px", cursor: "pointer" }}
            >
              {opt}
            </div>
          ))}

          {query.trim() && !allOptions.includes(query.trim()) && (
            <>
              {available.length > 0 && (
                <hr style={{ margin: 0, borderColor: "#eee" }} />
              )}
              <div
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => add(query)}
                style={{
                  padding: "8px 10px",
                  cursor: "pointer",
                  fontStyle: "italic",
                }}
              >
                Neu hinzufügen: “{query.trim()}”
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
