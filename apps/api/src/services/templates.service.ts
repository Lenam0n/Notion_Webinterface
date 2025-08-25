// apps/api/src/services/templates.service.ts
import fs from "node:fs/promises";
import path from "node:path";

const ALLOWED_TPL_EXT = new Set([".psd", ".indd"]);
const ALLOWED_MAPPER_EXT = new Set([".ts", ".mjs", ".js"]);

function templatesDir(): string {
  const dir =
    process.env.TEMPLATES_DIR || path.resolve(process.cwd(), "templates");
  return dir;
}
function mappersDir(): string {
  // optional eigener Ordner; fallback: innerhalb templates
  return process.env.MAPPERS_DIR || path.join(templatesDir(), "mappers");
}

export async function ensureTemplateDirs() {
  await fs.mkdir(templatesDir(), { recursive: true });
  await fs.mkdir(mappersDir(), { recursive: true });
}

export type TemplateFile = {
  name: string;
  path: string;
  ext: string;
  size: number;
  mtime: string;
};
export type MapperFile = {
  name: string;
  path: string;
  ext: string;
  size: number;
  mtime: string;
};

export async function listTemplates(): Promise<TemplateFile[]> {
  await ensureTemplateDirs();
  const dir = templatesDir();
  const items = await fs.readdir(dir, { withFileTypes: true });
  const files: TemplateFile[] = [];
  for (const ent of items) {
    if (!ent.isFile()) continue;
    const ext = path.extname(ent.name).toLowerCase();
    if (!ALLOWED_TPL_EXT.has(ext)) continue;
    const full = path.join(dir, ent.name);
    const st = await fs.stat(full);
    files.push({
      name: ent.name,
      path: full,
      ext,
      size: st.size,
      mtime: st.mtime.toISOString(),
    });
  }
  // sort by mtime desc
  files.sort((a, b) => (a.mtime < b.mtime ? 1 : -1));
  return files;
}

export async function listMappers(): Promise<MapperFile[]> {
  await ensureTemplateDirs();
  const dir = mappersDir();
  const items = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  const files: MapperFile[] = [];
  for (const ent of items) {
    if (!ent.isFile()) continue;
    const ext = path.extname(ent.name).toLowerCase();
    if (!ALLOWED_MAPPER_EXT.has(ext)) continue;
    const full = path.join(dir, ent.name);
    const st = await fs.stat(full);
    files.push({
      name: ent.name,
      path: full,
      ext,
      size: st.size,
      mtime: st.mtime.toISOString(),
    });
  }
  files.sort((a, b) => (a.mtime < b.mtime ? 1 : -1));
  return files;
}

export function getTemplatesBase(): string {
  return templatesDir();
}
export function getMappersBase(): string {
  return mappersDir();
}

export const allowedTemplateExt = ALLOWED_TPL_EXT;
