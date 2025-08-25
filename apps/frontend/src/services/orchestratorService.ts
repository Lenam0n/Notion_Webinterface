// apps/frontend/src/services/orchestratorService.ts
export type RunPayload = {
  templatePath: string;
  mapperPath: string;
  type?: "photoshop" | "indesign";
  format?: "pdf" | "png" | "jpg";
  source?: "rest" | "file";
  key?: string;
  keys?: string[];
  outputPattern?: string;
  greetingStyle?: "neutral" | "formell";
  date?: string;
  pluginTimeoutMs?: number;
  batchTimeoutMs?: number;
};

const BASE = import.meta.env?.VITE_API_BASE || "http://localhost:4000";

export async function runBatch(
  payload: RunPayload
): Promise<{ ok: boolean; pid: number; expected: string[] }> {
  const res = await fetch(`${BASE}/v1/orchestrator/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to start orchestrator");
  }
  return res.json();
}

export async function checkProgress(files: string[]): Promise<{
  found: string[];
  missing: string[];
  done: boolean;
  total: number;
  progress: number;
}> {
  const res = await fetch(`${BASE}/v1/orchestrator/progress`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ files }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to fetch progress");
  }
  return res.json();
}
