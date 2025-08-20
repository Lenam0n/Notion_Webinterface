// tests/setup/jest.setup.ts
import "@testing-library/jest-dom";

if (!(global as any).fetch) {
  (global as any).fetch = jest.fn();
}
