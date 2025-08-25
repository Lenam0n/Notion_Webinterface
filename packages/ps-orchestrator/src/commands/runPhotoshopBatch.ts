// apps/orchestrator/src/commands/runPhotoshopBatch.ts
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  startPhotoshop,
  waitForPluginReady,
  requestPluginShutdown,
  killPhotoshop,
} from "../utils/photoshop.js";
import { envVarOrDefault } from "../../../shared/utils/dist/utils/env.js";
import { ensureDirExists } from "../../../shared/utils/dist/utils/fsUtils.js";
import { DataSourceFactory } from "@factory/DataSourceFactory.js";
import { TemplateFactory } from "@factory/TemplateFactory.js";
import { parseBatchArgs } from "@util/parseBatchArgs.js";
import { watchForOutputs } from "@util/watchOutputs.js";

type MapperFn = (
  data: any,
  opts?: Record<string, any>
) => Record<string, string>;

async function loadMapper(absMapperPath: string): Promise<MapperFn> {
  const fileUrl = pathToFileURL(absMapperPath).href;
  const mod = await import(fileUrl);
  const fn: MapperFn =
    mod.buildPlaceholderMap ??
    mod.buildAnschreibenPlaceholderMap ??
    mod.default;
  if (typeof fn !== "function") {
    throw new Error(
      `Mapper "${absMapperPath}" exportiert keine Funktion buildPlaceholderMap/buildAnschreibenPlaceholderMap/default.`
    );
  }
  return fn;
}

export async function runPhotoshopBatch() {
  const args = parseBatchArgs();
  const jobsDir = envVarOrDefault("JOBS_DIR", "./jobs/in");
  const outDir = envVarOrDefault("OUTPUT_DIR", "./jobs/out");

  await ensureDirExists(jobsDir);
  await ensureDirExists(outDir);
  await ensureDirExists(path.dirname(args.outputPattern));

  // Photoshop starten
  const ps = startPhotoshop();

  try {
    // Auf Plugin warten (HTTP oder .plugin_ready Marker)
    await waitForPluginReady({
      healthUrl: process.env.PS_PLUGIN_HEALTH_URL,
      fallbackWatchDir: outDir,
      timeoutMs: args.pluginTimeoutMs ?? 90_000,
    });

    // Mapper laden (z. B. .../templates/photoshop/anschreiben.template.ts)
    const absMapper = path.resolve(args.mapper);
    const buildPlaceholderMap = await loadMapper(absMapper);

    // DataSource wählen
    const ds = DataSourceFactory.create(args.source ?? "file");

    // Keys sammeln
    const keys = args.keys?.length ? args.keys : args.key ? [args.key] : [];
    if (!keys.length && !args.dataFile) {
      throw new Error(
        "Bitte --key oder --keys angeben (oder --dataFile für direkte JSON-Datei)."
      );
    }

    const total = keys.length || 1;
    const expectedOutputs = new Set<string>();

    if (args.dataFile) {
      // Single direct file → einmalige Daten
      const data = await ds.fetch(path.resolve(args.dataFile));
      const map = buildPlaceholderMap(data, {
        greetingStyle: args.greetingStyle,
        date: args.date,
      });
      const outPath = args.outputPattern
        .replace("{key}", "dataFile")
        .replace("{format}", args.format);
      const { jobPath } = await TemplateFactory.enqueue(args.type, {
        templatePath: path.resolve(args.template),
        data: map,
        outputPath: path.resolve(outPath),
        format: args.format,
        meta: { preset: "batch", mapper: path.basename(absMapper) },
      });
      expectedOutputs.add(path.resolve(outPath));
      // eslint-disable-next-line no-console
      console.log(`→ Job geschrieben: ${jobPath}`);
    } else {
      // Mehrere Keys
      for (const key of keys) {
        const record = await ds.fetch(key);
        const map = buildPlaceholderMap(record, {
          greetingStyle: args.greetingStyle,
          date: args.date,
          key,
        });
        const outPath = args.outputPattern
          .replace("{key}", key.replace(/[\\/:*?"<>|]/g, "_"))
          .replace("{format}", args.format);
        const { jobPath } = await TemplateFactory.enqueue(args.type, {
          templatePath: path.resolve(args.template),
          data: map,
          outputPath: path.resolve(outPath),
          format: args.format,
          meta: { preset: "batch", mapper: path.basename(absMapper), key },
        });
        expectedOutputs.add(path.resolve(outPath));
        // eslint-disable-next-line no-console
        console.log(`→ Job für "${key}" geschrieben: ${jobPath}`);
      }
    }

    // Auf Outputs warten (Dateiwatch-Fallback, falls Plugin kein HTTP hat)
    await watchForOutputs({
      outputs: [...expectedOutputs],
      timeoutMs: args.batchTimeoutMs ?? Math.max(120_000, total * 60_000), // 1min/Job default
      pollEveryMs: 1500,
    });

    // Plugin freundlich um Shutdown bitten (falls unterstützt)
    const ok = await requestPluginShutdown();
    // eslint-disable-next-line no-console
    console.log(
      ok
        ? "✔ Plugin shutdown requested."
        : "ℹ︎ Plugin shutdown not acknowledged (continue)."
    );
  } finally {
    // Photoshop-Prozess sicher beenden
    await killPhotoshop(ps);
  }
}
