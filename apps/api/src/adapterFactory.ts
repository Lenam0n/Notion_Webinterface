import type { INotionAdapter } from "@notion/adapters";
import { DefaultNotionAdapter } from "@notion/adapters";

export function makeAdapter(kind: "default"): INotionAdapter {
  switch (kind) {
    case "default":
    default:
      return new DefaultNotionAdapter();
  }
}
