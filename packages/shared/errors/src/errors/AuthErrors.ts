// packages/ps-orchestrator/src/errors/AuthErrors.ts
import { HttpError, UnauthorizedError, ForbiddenError } from "@error/HttpError";

export class MissingAuthTokenError extends UnauthorizedError {
  constructor(
    message = "Missing or invalid x-auth-token header",
    details?: unknown
  ) {
    super(message, details);
    this.name = "MissingAuthTokenError";
  }
}

export class AccessDeniedError extends ForbiddenError {
  constructor(message = "Access denied by auth server", details?: unknown) {
    super(message, details);
    this.name = "AccessDeniedError";
  }
}

export class AuthRequestError extends HttpError {
  public statusCode = 502;
  constructor(
    message = "Bad Gateway: Fehler beim Auth-Request",
    details?: unknown
  ) {
    super(message, details);
    this.name = "AuthRequestError";
  }
}

export class AuthTimeoutError extends HttpError {
  public statusCode = 504;
  constructor(
    message = "Gateway Timeout: Auth-Server reagiert nicht",
    details?: unknown
  ) {
    super(message, details);
    this.name = "AuthTimeoutError";
  }
}
