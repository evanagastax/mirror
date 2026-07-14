/**
 * Tests for src/utils/url.ts
 *
 * isSafeUrl  — pure function, no mocks needed
 * openSafeUrl — async, mocks Linking and Alert from react-native
 */

import { isSafeUrl, openSafeUrl } from "../../utils/url";

// react-native is mocked via __mocks__/react-native.js
// We pull the mock references so we can configure return values per-test
const { Linking, Alert } = require("react-native");

beforeEach(() => {
  jest.clearAllMocks();
  // Default: canOpenURL resolves true
  Linking.canOpenURL.mockResolvedValue(true);
  Linking.openURL.mockResolvedValue(undefined);
});

// ─── isSafeUrl ────────────────────────────────────────────────────────────────

describe("isSafeUrl", () => {
  // ── Valid https URLs ──────────────────────────────────────────────────────
  it("accepts a standard https:// URL", () => {
    expect(isSafeUrl("https://example.com")).toBe(true);
  });

  it("accepts https:// with a path and query string", () => {
    expect(isSafeUrl("https://github.com/user/repo?tab=readme")).toBe(true);
  });

  it("accepts https:// with a subdomain", () => {
    expect(isSafeUrl("https://api.example.co.id/v1/data")).toBe(true);
  });

  it("trims whitespace before checking", () => {
    expect(isSafeUrl("  https://example.com  ")).toBe(true);
  });

  // ── Rejected schemes ──────────────────────────────────────────────────────
  it("rejects http:// (plaintext)", () => {
    expect(isSafeUrl("http://example.com")).toBe(false);
  });

  it("rejects javascript: scheme", () => {
    expect(isSafeUrl("javascript:alert(1)")).toBe(false);
  });

  it("rejects data: scheme", () => {
    expect(isSafeUrl("data:text/html,<script>alert(1)</script>")).toBe(false);
  });

  it("rejects blob: scheme", () => {
    expect(isSafeUrl("blob:https://example.com/uuid")).toBe(false);
  });

  it("rejects file: scheme", () => {
    expect(isSafeUrl("file:///etc/passwd")).toBe(false);
  });

  it("rejects ftp: scheme", () => {
    expect(isSafeUrl("ftp://example.com/file.txt")).toBe(false);
  });

  // ── Malformed / empty ─────────────────────────────────────────────────────
  it("rejects plain text with no scheme", () => {
    expect(isSafeUrl("notaurl")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isSafeUrl("")).toBe(false);
  });

  it("rejects whitespace-only string", () => {
    expect(isSafeUrl("   ")).toBe(false);
  });

  it("rejects a URL missing the domain", () => {
    expect(isSafeUrl("https://")).toBe(false);
  });

  // ── Type safety ───────────────────────────────────────────────────────────
  it("rejects null gracefully", () => {
    expect(isSafeUrl(null as any)).toBe(false);
  });

  it("rejects undefined gracefully", () => {
    expect(isSafeUrl(undefined as any)).toBe(false);
  });

  it("rejects a number", () => {
    expect(isSafeUrl(42 as any)).toBe(false);
  });
});

// ─── openSafeUrl ─────────────────────────────────────────────────────────────

describe("openSafeUrl", () => {
  // ── Happy path ────────────────────────────────────────────────────────────
  it("opens a valid https URL and returns true", async () => {
    const result = await openSafeUrl("https://example.com");
    expect(Linking.canOpenURL).toHaveBeenCalledWith("https://example.com");
    expect(Linking.openURL).toHaveBeenCalledWith("https://example.com");
    expect(result).toBe(true);
  });

  // ── Unsafe URL ────────────────────────────────────────────────────────────
  it("shows an alert and returns false for a javascript: URL", async () => {
    const result = await openSafeUrl("javascript:alert(1)");
    expect(Alert.alert).toHaveBeenCalledWith(
      "Unsafe link",
      expect.stringContaining("https://")
    );
    expect(Linking.openURL).not.toHaveBeenCalled();
    expect(result).toBe(false);
  });

  it("shows an alert and returns false for an http:// URL", async () => {
    const result = await openSafeUrl("http://example.com");
    expect(Alert.alert).toHaveBeenCalled();
    expect(Linking.openURL).not.toHaveBeenCalled();
    expect(result).toBe(false);
  });

  it("shows an alert and returns false for a data: URL", async () => {
    const result = await openSafeUrl("data:text/html,<h1>hi</h1>");
    expect(Alert.alert).toHaveBeenCalled();
    expect(Linking.openURL).not.toHaveBeenCalled();
    expect(result).toBe(false);
  });

  // ── Null / undefined ──────────────────────────────────────────────────────
  it("returns false silently when url is null", async () => {
    const result = await openSafeUrl(null);
    expect(Alert.alert).not.toHaveBeenCalled();
    expect(Linking.openURL).not.toHaveBeenCalled();
    expect(result).toBe(false);
  });

  it("returns false silently when url is undefined", async () => {
    const result = await openSafeUrl(undefined);
    expect(result).toBe(false);
    expect(Linking.openURL).not.toHaveBeenCalled();
  });

  // ── canOpenURL returns false ───────────────────────────────────────────────
  it("shows 'Cannot open link' alert and returns false when canOpenURL is false", async () => {
    Linking.canOpenURL.mockResolvedValue(false);
    const result = await openSafeUrl("https://example.com");
    expect(Alert.alert).toHaveBeenCalledWith(
      "Cannot open link",
      expect.any(String)
    );
    expect(Linking.openURL).not.toHaveBeenCalled();
    expect(result).toBe(false);
  });

  // ── Linking.openURL throws ────────────────────────────────────────────────
  it("shows 'Failed to open link' alert and returns false when openURL throws", async () => {
    Linking.openURL.mockRejectedValue(new Error("no handler"));
    const result = await openSafeUrl("https://example.com");
    expect(Alert.alert).toHaveBeenCalledWith(
      "Failed to open link",
      expect.any(String)
    );
    expect(result).toBe(false);
  });

  // ── Custom context label ──────────────────────────────────────────────────
  it("includes the context label in the unsafe-link alert message", async () => {
    await openSafeUrl("http://bad.com", "evidence link");
    expect(Alert.alert).toHaveBeenCalledWith(
      "Unsafe link",
      expect.stringContaining("evidence link")
    );
  });
});
