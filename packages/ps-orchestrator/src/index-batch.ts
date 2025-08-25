// apps/orchestrator/src/index-batch.ts
import { runPhotoshopBatch } from "./commands/runPhotoshopBatch";

runPhotoshopBatch()
  .then(() => {
    // eslint-disable-next-line no-console
    console.log("✅ Batch abgeschlossen.");
    process.exit(0);
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error("❌ Batch fehlgeschlagen:", err?.message ?? err);
    process.exit(1);
  });
