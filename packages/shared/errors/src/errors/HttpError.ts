// packages/ps-orchestrator/src/errors/HttpError.ts
import { IError } from "@type/IError";

export abstract class HttpError extends Error implements IError {
  public abstract statusCode: number;
  public details?: unknown;
  constructor(message: string, details?: unknown) {
    super(message);
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class BadRequestError extends HttpError {
  statusCode = 400;
  constructor(message = "Bad Request", details?: unknown) {
    super(message, details);
  }
}
export class UnauthorizedError extends HttpError {
  statusCode = 401;
  constructor(message = "Unauthorized", details?: unknown) {
    super(message, details);
  }
}
export class ForbiddenError extends HttpError {
  statusCode = 403;
  constructor(message = "Forbidden", details?: unknown) {
    super(message, details);
  }
}
export class NotFoundError extends HttpError {
  statusCode = 404;
  constructor(message = "Not Found", details?: unknown) {
    super(message, details);
  }
}
export class ConflictError extends HttpError {
  statusCode = 409;
  constructor(message = "Conflict", details?: unknown) {
    super(message, details);
  }
}
export class InternalServerError extends HttpError {
  statusCode = 500;
  constructor(message = "Internal Server Error", details?: unknown) {
    super(message, details);
  }
}
