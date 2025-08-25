// apps/api/src/controllers/orchestrator.controller.ts
import type { Request, Response } from "express";
import { spawn } from "node:child_process";
import path from "node:path";
import fs from "node:fs/promises";

type RunBody = {
  templatePath: string; // absolute oder relative Pfade
  mapperPath: string;
  type?: "photoshop" | "indesign";
  format?: "pdf" | "png" | "jpg";
  source?: "rest" | "file";
  key?: string;
  keys?: string[]; // mehrere Keys für Batch
  outputPattern?: string; // z.B. ./jobs/out/{key}.pdf
  greetingStyle?: "neutral" | "formell";
  date?: string;
  pluginTimeoutMs?: number;
  batchTimeoutMs?: number;
};

function resolveOut(pattern: string, key: string, format: string) {
  const replaced = pattern
    .replace(/\{key\}/g, key)
    .replace(/\{format\}/g, format);
  return path.resolve(replaced);
}

async function exists(p: string) {
  try {
    await fs.stat(p);
    return true;
  } catch {
    return false;
  }
}

export class OrchestratorController {
  static run = async (req: Request, res: Response) => {
    const body = req.body as RunBody;
    if (!body?.templatePath || !body?.mapperPath) {
      return res
        .status(400)
        .json({ error: "templatePath and mapperPath are required" });
    }
    const format = body.format || "pdf";
    const pattern = body.outputPattern || "./jobs/out/{key}.{format}";

    const keys = (
      body.keys && body.keys.length ? body.keys : body.key ? [body.key] : []
    )
      .map((k) => k.trim())
      .filter(Boolean);
    if (!keys.length) {
      return res
        .status(400)
        .json({ error: "provide 'key' or non-empty 'keys' array" });
    }

    // Erwartete Ausgabedateien vorab berechnen
    const expected = keys.map((k) => resolveOut(pattern, k, format));

    // monorepo-root (von apps/api aus zwei Ebenen hoch)
    const repoRoot = path.resolve(process.cwd(), "..", "..");
    const orchestratorPkg = "@tools/orchestrator";

    const args = [
      "--filter",
      orchestratorPkg,
      "batch",
      "--",
      "--template",
      path.resolve(body.templatePath),
      "--mapper",
      path.resolve(body.mapperPath),
      "--outputPattern",
      path.resolve(pattern),
      "--type",
      body.type || "photoshop",
      "--format",
      format,
      ...(body.source ? ["--source", body.source] : []),
      ...(body.key ? ["--key", body.key] : []),
      ...(body.keys?.length ? ["--keys", body.keys.join(",")] : []),
      ...(body.greetingStyle ? ["--greetingStyle", body.greetingStyle] : []),
      ...(body.date ? ["--date", body.date] : []),
      ...(body.pluginTimeoutMs
        ? ["--pluginTimeoutMs", String(body.pluginTimeoutMs)]
        : []),
      ...(body.batchTimeoutMs
        ? ["--batchTimeoutMs", String(body.batchTimeoutMs)]
        : []),
    ];

    const child = spawn(
      process.platform === "win32" ? "pnpm.cmd" : "pnpm",
      args,
      {
        cwd: repoRoot,
        stdio: "ignore",
        env: process.env,
        detached: true,
      }
    );

    res.status(202).json({ ok: true, pid: child.pid, expected, args });
  };

  static progress = async (req: Request, res: Response) => {
    const { files } = req.body as { files: string[] };
    if (!Array.isArray(files) || !files.length) {
      return res.status(400).json({ error: "files array required" });
    }
    const found: string[] = [];
    const missing: string[] = [];
    for (const f of files) {
      // absolute machen (falls relativ geschickt wurde)
      const abs = path.resolve(f);
      // eslint-disable-next-line no-await-in-loop
      const ok = await exists(abs);
      (ok ? found : missing).push(abs);
    }
    res.json({
      found,
      missing,
      done: missing.length === 0,
      total: files.length,
      progress: files.length ? found.length / files.length : 0,
    });
  };
}
