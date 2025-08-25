// apps/orchestrator/src/utils/photoshop.ts
import { spawn, ChildProcessWithoutNullStreams } from "node:child_process";
import os from "node:os";
import fs from "node:fs/promises";
import path from "node:path";
import http from "node:http";

export type PhotoshopProc = ChildProcessWithoutNullStreams & { _pid?: number };

export interface WaitForPluginOptions {
  healthUrl?: string; // z.B. http://127.0.0.1:8910/health
  timeoutMs?: number; // Default 90s
  pollEveryMs?: number; // Default 1000ms
  fallbackWatchDir?: string; // Optional: falls kein HTTP-Health verfügbar
}

function psPathFromEnv(): string {
  const p = process.env.PHOTOSHOP_PATH;
  if (!p || !p.trim()) {
    throw new Error(
      "PHOTOSHOP_PATH ist nicht gesetzt. Bitte ENV konfigurieren (Windows: Pfad zur Photoshop.exe, macOS: Pfad zum .app/Contents/MacOS/*)."
    );
  }
  return p;
}

export function startPhotoshop(extraArgs: string[] = []): PhotoshopProc {
  const psPath = psPathFromEnv();

  const args = [...extraArgs];
  // Tipp: Falls dein UXP-Plugin spezielle CLI-Flags braucht, hier ergänzen.

  const child = spawn(psPath, args, {
    stdio: "ignore", // oder ["ignore","pipe","pipe"] wenn du Logs sehen willst
    detached: os.platform() !== "win32", // macOS/Linux im eigenen Prozess-Group
  }) as PhotoshopProc;

  child._pid = child.pid;
  return child;
}

export async function waitForPluginReady(
  opts: WaitForPluginOptions
): Promise<void> {
  const healthUrl =
    opts.healthUrl ??
    process.env.PS_PLUGIN_HEALTH_URL ??
    "http://127.0.0.1:8910/health";
  const timeoutMs = opts.timeoutMs ?? 90_000;
  const pollEveryMs = opts.pollEveryMs ?? 1_000;

  const started = Date.now();
  const tryHttp = async (): Promise<boolean> =>
    new Promise((resolve) => {
      const req = http.get(healthUrl, (res) => {
        // 200 OK genügt
        resolve(res.statusCode === 200);
        res.resume();
      });
      req.on("error", () => resolve(false));
      req.setTimeout(3_000, () => {
        req.destroy();
        resolve(false);
      });
    });

  while (Date.now() - started < timeoutMs) {
    const ok = await tryHttp();
    if (ok) return;
    await new Promise((r) => setTimeout(r, pollEveryMs));
  }

  // Fallback: Wenn ein Watch-Dir spezifiziert wurde, prüfen wir ob das Plugin dort z. B. eine READY-Datei angelegt hat
  if (opts.fallbackWatchDir) {
    const marker = path.join(opts.fallbackWatchDir, ".plugin_ready");
    try {
      await fs.access(marker);
      return;
    } catch {
      // nope
    }
  }

  throw new Error(
    `Plugin-Healthcheck unter ${healthUrl} nach ${Math.round(
      timeoutMs / 1000
    )}s nicht erreichbar.`
  );
}

export async function requestPluginShutdown(url?: string): Promise<boolean> {
  const shutdownUrl =
    url ??
    process.env.PS_PLUGIN_SHUTDOWN_URL ??
    "http://127.0.0.1:8910/shutdown";

  return new Promise<boolean>((resolve) => {
    const req = http.request(
      shutdownUrl,
      { method: "POST", timeout: 5_000 },
      (res) => {
        res.resume();
        resolve(res.statusCode === 200);
      }
    );
    req.on("error", () => resolve(false));
    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
}

export async function killPhotoshop(
  proc: PhotoshopProc,
  signal: NodeJS.Signals = "SIGTERM"
): Promise<void> {
  if (os.platform() === "win32") {
    try {
      // /T: kill process tree; /F: force
      await new Promise<void>((resolve, reject) => {
        const killer = spawn("taskkill", [
          "/PID",
          String(proc.pid),
          "/T",
          "/F",
        ]);
        killer.on("exit", () => resolve());
        killer.on("error", reject);
      });
    } catch {
      // ignore
    }
  } else {
    try {
      process.kill(-proc.pid!, signal); // kill process group
    } catch {
      // ignore
    }
  }
}
