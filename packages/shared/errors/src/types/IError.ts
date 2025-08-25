// packages/ps-orchestrator/src/interfaces/IError.ts
export interface IError {
  name: string;
  message: string;
  statusCode: number;
  details?: unknown;
  stack?: string;
}
