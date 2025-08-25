// apps/orchestrator/src/utils/pluginClient.ts
import http from "node:http";

export type PluginStatus =
  | {
      ok: true;
      version?: string;
      queued?: number;
      running?: number;
      finished?: number;
    }
  | { ok: false; error: string };

export async function getPluginStatus(
  url = process.env.PS_PLUGIN_HEALTH_URL ?? "http://127.0.0.1:8910/health"
): Promise<PluginStatus> {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      let data = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch {
          resolve({ ok: res.statusCode === 200 } as any);
        }
      });
    });
    req.on("error", (err) => resolve({ ok: false, error: String(err) }));
    req.setTimeout(3_000, () => {
      req.destroy();
      resolve({ ok: false, error: "timeout" });
    });
  });
}
