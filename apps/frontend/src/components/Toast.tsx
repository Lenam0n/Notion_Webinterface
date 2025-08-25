// apps/frontend/src/components/Toast.tsx
import React from "react";

type Toast = { id: string; msg: string; kind: "success" | "error" | "info" };

const Ctx = React.createContext<{
  toasts: Toast[];
  push: (msg: string, kind?: Toast["kind"]) => void;
  remove: (id: string) => void;
}>({ toasts: [], push: () => {}, remove: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const remove = React.useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = React.useCallback(
    (msg: string, kind: Toast["kind"] = "info") => {
      const id = Math.random().toString(36).slice(2);
      setToasts((t) => [...t, { id, msg, kind }]);
      // Auto-hide
      setTimeout(() => remove(id), 4500);
    },
    [remove]
  );

  return (
    <Ctx.Provider value={{ toasts, push, remove }}>
      {children}
      <div
        style={{
          position: "fixed",
          top: 12,
          right: 12,
          display: "grid",
          gap: 8,
          zIndex: 9999,
          maxWidth: 360,
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              color: "#fff",
              background:
                t.kind === "success"
                  ? "seagreen"
                  : t.kind === "error"
                  ? "#c0392b"
                  : "#333",
              boxShadow: "0 6px 22px rgba(0,0,0,.18)",
            }}
          >
            {t.msg}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  return React.useContext(Ctx);
}
