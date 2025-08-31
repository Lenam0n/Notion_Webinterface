// apps/api/src/routes/orchestrator.routes.ts
import { Router } from "express";
import { OrchestratorController } from "@controller/orchestrator.controller";

export const orchestratorRouter: Router = Router();
orchestratorRouter.post("/run", OrchestratorController.run);
orchestratorRouter.post("/progress", OrchestratorController.progress);
