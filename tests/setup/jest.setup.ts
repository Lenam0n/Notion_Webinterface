// tests/setup/jest.setup.ts
import "@testing-library/jest-dom";

// Polyfill für fetch in Node-Umgebung (Frontend/Service-Tests)
if (!(global as any).fetch) {
  (global as any).fetch = jest.fn();
}
