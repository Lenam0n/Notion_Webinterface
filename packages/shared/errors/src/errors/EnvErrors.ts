// packages/ps-orchestrator/src/errors/EnvErrors.ts
import { HttpError } from "@error/HttpError";

export class MissingEnvVarError extends HttpError {
  public statusCode = 500;
  constructor(public readonly key: string, details?: unknown) {
    super(
      `Environment variable "${key}" is required but was not provided.`,
      details
    );
    this.name = "MissingEnvVarError";
  }
}

export class InvalidEnvVarError extends HttpError {
  public statusCode = 500;
  constructor(
    public readonly key: string,
    public readonly value: string,
    details?: unknown
  ) {
    super(
      `Environment variable "${key}" has invalid value: "${value}".`,
      details
    );
    this.name = "InvalidEnvVarError";
  }
}
