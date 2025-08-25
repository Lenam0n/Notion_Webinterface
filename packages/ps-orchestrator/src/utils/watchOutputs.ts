// apps/orchestrator/src/utils/watchOutputs.ts
import fs from "node:fs/promises";

export async function waitForFileExists(
  p: string,
  timeoutMs = 120_000,
  pollEveryMs = 1500
): Promise<void> {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      await fs.access(p);
      return;
    } catch {
      // not yet
    }
    await new Promise((r) => setTimeout(r, pollEveryMs));
  }
  throw new Error(`Timeout: Datei wurde nicht erzeugt: ${p}`);
}

export async function watchForOutputs(opts: {
  outputs: string[];
  timeoutMs?: number;
  pollEveryMs?: number;
}) {
  const timeout = opts.timeoutMs ?? 120_000;
  const poll = opts.pollEveryMs ?? 1500;
  for (const out of opts.outputs) {
    // eslint-disable-next-line no-console
    console.log(`⏳ Warte auf Export: ${out}`);
    await waitForFileExists(out, timeout, poll);
    // eslint-disable-next-line no-console
    console.log(`✔ Export vorhanden: ${out}`);
  }
}
