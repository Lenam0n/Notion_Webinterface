// apps/api/src/routes/templates.routes.ts
import { Router } from "express";
import multer from "multer";
import os from "node:os";
import path from "node:path";
import { TemplatesController } from "@controller/templates.controller";

const tmp = path.join(os.tmpdir(), "tpl-upload");
const upload = multer({ dest: tmp });

export const templatesRouter: Router = Router();

templatesRouter.get("/", TemplatesController.list);
templatesRouter.get("/mappers", TemplatesController.listMappers);
templatesRouter.post(
  "/upload",
  upload.single("file"),
  TemplatesController.upload
);
