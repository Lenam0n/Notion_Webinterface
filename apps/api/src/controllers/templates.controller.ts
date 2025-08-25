// apps/api/src/controllers/templates.controller.ts
import type { Request, Response } from "express";
import path from "node:path";
import fs from "node:fs/promises";
import {
  allowedTemplateExt,
  ensureTemplateDirs,
  getMappersBase,
  getTemplatesBase,
  listMappers,
  listTemplates,
} from "@service/templates.service";

export class TemplatesController {
  static async list(req: Request, res: Response) {
    const data = await listTemplates();
    res.json({ templates: data, baseDir: getTemplatesBase() });
  }
  static async listMappers(req: Request, res: Response) {
    const data = await listMappers();
    res.json({ mappers: data, baseDir: getMappersBase() });
  }
  static async upload(req: Request, res: Response) {
    // multer hängt die Datei an req.file
    const file = (req as any).file as Express.Multer.File | undefined;
    if (!file) return res.status(400).json({ error: "missing file" });

    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedTemplateExt.has(ext)) {
      return res.status(400).json({ error: `unsupported file type: ${ext}` });
    }

    await ensureTemplateDirs();
    const base = getTemplatesBase();
    const safeName = file.originalname.replace(/[\\/:*?"<>|]/g, "_");
    const dest = path.join(base, safeName);

    await fs.rename(file.path, dest);

    res.status(201).json({ ok: true, storedAs: safeName, path: dest });
  }
}
