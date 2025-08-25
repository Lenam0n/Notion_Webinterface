// packages/ps-orchestrator/src/interfaces/ITemplate.ts
export type TemplateKind = "photoshop" | "indesign";

export interface ITemplateBase {
  load(sourcePath: string): Promise<void>;
  getPlaceholders(): string[];
  applyData(data: Record<string, string>): Promise<void>;
  export(targetPath: string, format: "pdf" | "png" | "jpg"): Promise<void>;
}

export interface IPhotoshopTemplate extends ITemplateBase {
  listTextLayers(): Promise<Array<{ id: string; name: string }>>;
}

export interface IInDesignTemplate extends ITemplateBase {
  listTextFrames(): Promise<Array<{ frameId: string; style?: string }>>;
}
