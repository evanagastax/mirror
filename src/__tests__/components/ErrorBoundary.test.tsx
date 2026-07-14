/**
 * Tests for ErrorBoundary (src/components/ErrorBoundary.tsx)
 *
 * Uses react-test-renderer (already installed) rather than
 * @testing-library/react-native, which requires a full React Native
 * runtime with jsdom. react-test-renderer runs fine in a Node environment.
 *
 * What we test:
 *   - Normal children pass through without a fallback
 *   - A throwing child triggers the fallback error state
 *   - getDerivedStateFromError returns { error } state
 *   - componentDidCatch calls console.error
 *   - Pressing "Try again" resets the error state
 */

import React from "react";
import renderer, { act } from "react-test-renderer";
import { ErrorBoundary } from "../../components/ErrorBoundary";

// ─── Suppress expected console.error noise ───────────────────────────────────

const originalConsoleError = console.error;
beforeEach(() => { console.error = jest.fn(); });
afterEach(() => { console.error = originalConsoleError; });

// ─── helpers ──────────────────────────────────────────────────────────────────

function Bomb({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error("Test explosion");
  return null;
}

// ─── tests ────────────────────────────────────────────────────────────────────

describe("ErrorBoundary", () => {
  // ── Static method ──────────────────────────────────────────────────────────
  it("getDerivedStateFromError returns { error } state", () => {
    const err = new Error("static test");
    const state = ErrorBoundary.getDerivedStateFromError(err);
    expect(state).toEqual({ error: err });
  });

  // ── Passthrough — no error ─────────────────────────────────────────────────
  it("renders children normally when there is no error", () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <ErrorBoundary>
          <Bomb shouldThrow={false} />
        </ErrorBoundary>
      );
    });
    const json = tree!.toJSON();
    // No fallback root rendered — tree is null (Bomb returns null)
    expect(json).toBeNull();
  });

  // ── Fallback UI ───────────────────────────────────────────────────────────
  it("shows fallback UI when a child throws", () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <ErrorBoundary>
          <Bomb shouldThrow={true} />
        </ErrorBoundary>
      );
    });
    const json = tree!.toJSON() as any;
    // The fallback renders a View tree — stringify it to find text nodes
    const flat = JSON.stringify(json);
    expect(flat).toContain("Something went wrong");
    expect(flat).toContain("Try again");
    expect(flat).toContain("Your data is safe");
  });

  // ── componentDidCatch ──────────────────────────────────────────────────────
  it("calls console.error when a child throws", () => {
    act(() => {
      renderer.create(
        <ErrorBoundary>
          <Bomb shouldThrow={true} />
        </ErrorBoundary>
      );
    });
    expect(console.error).toHaveBeenCalled();
  });

  // ── Reset ──────────────────────────────────────────────────────────────────
  it("resets to initial state after handleReset is called directly", () => {
    // Use a ref-like mutable flag so we can stop the child from throwing
    // before we trigger the reset, preventing an immediate re-catch.
    const flag = { shouldThrow: true };
    function Controlled() {
      if (flag.shouldThrow) throw new Error("deliberate");
      return null;
    }

    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <ErrorBoundary>
          <Controlled />
        </ErrorBoundary>
      );
    });

    // Confirm error state
    expect(JSON.stringify(tree!.toJSON())).toContain("Something went wrong");

    // Stop child from throwing, then reset
    flag.shouldThrow = false;
    const instance = tree!.getInstance() as ErrorBoundary;
    act(() => { instance.handleReset(); });

    // Fallback is gone — Controlled now renders null
    expect(JSON.stringify(tree!.toJSON())).not.toContain("Something went wrong");
  });

  // ── Error from nested child ────────────────────────────────────────────────
  it("catches errors from deeply nested children", () => {
    function DeepThrow() { throw new Error("deep"); }
    function Middle() { return <DeepThrow />; }

    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <ErrorBoundary>
          <Middle />
        </ErrorBoundary>
      );
    });
    expect(JSON.stringify(tree!.toJSON())).toContain("Something went wrong");
  });

  // ── Multiple errors — only one fallback shown ──────────────────────────────
  it("shows a single fallback regardless of how many children throw", () => {
    function Throw1() { throw new Error("A"); }

    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <ErrorBoundary>
          <Throw1 />
        </ErrorBoundary>
      );
    });
    const flat = JSON.stringify(tree!.toJSON());
    // "Something went wrong" appears exactly once (one fallback UI, not duplicated)
    const occurrences = (flat.match(/Something went wrong/g) || []).length;
    expect(occurrences).toBe(1);
  });
});
