// packages/ps-orchestrator/src/utils/env.ts
import {
  MissingEnvVarError,
  InvalidEnvVarError,
} from "@shared/errors/EnvErrors";

export function requireEnvVar<K extends string>(key: K): string {
  const val = process.env[key];
  if (val === undefined || val === "") {
    throw new MissingEnvVarError(key);
  }
  return val;
}

export function envVarOrDefault<K extends string>(
  key: K,
  defaultValue = ""
): string {
  const val = process.env[key];
  if (val === undefined) return defaultValue;
  if (val === "" && defaultValue !== "") {
    throw new InvalidEnvVarError(key, val);
  }
  return val;
}
