// apps/frontend/src/services/templateService.ts
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

const BASE = import.meta.env?.VITE_API_BASE || "http://localhost:4000";

export async function fetchTemplates(): Promise<TemplateFile[]> {
  const res = await fetch(`${BASE}/v1/templates`);
  if (!res.ok) throw new Error("Failed to load templates");
  const data = await res.json();
  return data.templates as TemplateFile[];
}

export async function fetchMappers(): Promise<MapperFile[]> {
  const res = await fetch(`${BASE}/v1/templates/mappers`);
  if (!res.ok) throw new Error("Failed to load mappers");
  const data = await res.json();
  return data.mappers as MapperFile[];
}

export async function uploadTemplate(
  file: File
): Promise<{ storedAs: string; path: string }> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${BASE}/v1/templates/upload`, {
    method: "POST",
    body: fd,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Upload failed");
  }
  return res.json();
}
