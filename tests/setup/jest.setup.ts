// tests/setup/jest.setup.ts

/**
 * Zentrales Jest-Setup für alle Workspaces (api, frontend, adapters)
 * Läuft vor jedem Test.
 */

// Bessere DOM-Assertions (toBeInTheDocument etc.)
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("@testing-library/jest-dom");
} catch {
  // optional, falls im Workspace nicht installiert
}

// ---------------------------------------------------------
// Node <-> jsdom Polyfills / Shims (ohne globale Typ-Deklarationen)
// ---------------------------------------------------------

// TextEncoder/TextDecoder nur dann aus 'util' füllen, wenn wirklich nicht vorhanden
// -> keine declare global mehr; nur Runtime-Zuweisung mit any-casts
(() => {
  try {
    if (typeof (globalThis as any).TextEncoder === "undefined") {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { TextEncoder } = require("util");
      (globalThis as any).TextEncoder = TextEncoder;
    }
    if (typeof (globalThis as any).TextDecoder === "undefined") {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { TextDecoder } = require("util");
      (globalThis as any).TextDecoder = TextDecoder;
    }
  } catch {
    // ignore on environments that already provide DOM encoders/decoders
  }
})();

// matchMedia-Stub für Komponenten, die Media Queries nutzen
if (typeof window !== "undefined" && !(window as any).matchMedia) {
  (window as any).matchMedia = () => ({
    matches: false,
    media: "",
    onchange: null,
    addListener: () => {}, // deprecated (für ältere Libs)
    removeListener: () => {}, // deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

// ---------------------------------------------------------
// Env-Fallbacks (z. B. wenn Frontend-Services process.env lesen)
// ---------------------------------------------------------

if (!process.env.VITE_API_BASE) {
  process.env.VITE_API_BASE = "http://localhost:8787";
}

// ---------------------------------------------------------
// Sonstige Defaults
// ---------------------------------------------------------

// Du kannst global Real/Modern Timer wählen. (Pro Test überschreibbar.)
jest.useRealTimers();
