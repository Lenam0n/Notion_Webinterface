import { promises as fs } from "fs";
import path from "path";

export async function ensureDirExists(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

export async function readJsonFile<T>(
  filePath: string,
  defaultValue: T
): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch (err: any) {
    if (err.code === "ENOENT") return defaultValue;
    throw err;
  }
}

export async function writeJsonFile<T>(
  filePath: string,
  data: T
): Promise<void> {
  const dir = path.dirname(filePath);
  await ensureDirExists(dir);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export async function deleteFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
  } catch (err: any) {
    if (err.code !== "ENOENT") throw err;
  }
}
