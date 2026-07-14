/**
 * Tests for auth input validation (app/(auth)/index.tsx)
 *
 * Rules as of the current source:
 *
 *   Sign-in:
 *     1. email.trim() AND password must be non-empty
 *     2. email must match EMAIL_RE (basic format check)
 *
 *   Sign-up:
 *     1. email.trim() AND password must be non-empty
 *     2. email must match EMAIL_RE
 *     3. password must be >= 10 characters
 *     4. username (optional) is normalised: lowercased + trimmed before save
 *     5. duplicate username error detected via "unique" / "duplicate" in message
 *        or Postgres code "23505"
 *
 *   Forgot password:
 *     1. email.trim() must be non-empty
 *     2. email must match EMAIL_RE
 */

// ─── replicated helpers (mirror app/(auth)/index.tsx exactly) ────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
function isValidEmail(v: string): boolean {
  return EMAIL_RE.test(v.trim());
}

function validateSignIn(email: string, password: string): string | null {
  if (!email.trim() || !password) return "Fill in email and password.";
  if (!isValidEmail(email))        return "Enter a valid email address.";
  return null;
}

function validateSignUp(email: string, password: string): string | null {
  if (!email.trim() || !password) return "Fill in email and password.";
  if (!isValidEmail(email))        return "Enter a valid email address.";
  if (password.length < 10)        return "Password must be at least 10 characters.";
  return null;
}

function validateForgotPassword(email: string): string | null {
  if (!email.trim())    return "Enter your email first.";
  if (!isValidEmail(email)) return "Enter a valid email address.";
  return null;
}

function normaliseUsername(username: string): string {
  return username.toLowerCase().trim();
}

function isUsernameTakenError(msg: string, code?: string): boolean {
  return (
    msg.toLowerCase().includes("unique") ||
    msg.toLowerCase().includes("duplicate") ||
    code === "23505"
  );
}

// ─── isValidEmail ─────────────────────────────────────────────────────────────

describe("isValidEmail", () => {
  it("accepts a standard email address", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
  });

  it("accepts subdomains", () => {
    expect(isValidEmail("user@mail.example.co.id")).toBe(true);
  });

  it("accepts plus-addressing", () => {
    expect(isValidEmail("user+tag@example.com")).toBe(true);
  });

  it("rejects plain text with no @", () => {
    expect(isValidEmail("notanemail")).toBe(false);
  });

  it("rejects missing TLD", () => {
    expect(isValidEmail("user@example")).toBe(false);
  });

  it("rejects @ with nothing before it", () => {
    expect(isValidEmail("@example.com")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidEmail("")).toBe(false);
  });

  it("trims surrounding whitespace before checking", () => {
    expect(isValidEmail("  user@example.com  ")).toBe(true);
  });

  it("rejects whitespace-only string", () => {
    expect(isValidEmail("   ")).toBe(false);
  });

  it("rejects double @", () => {
    expect(isValidEmail("a@@b.com")).toBe(false);
  });
});

// ─── Sign-in validation ───────────────────────────────────────────────────────

describe("validateSignIn", () => {
  it("passes for valid email and non-empty password", () => {
    expect(validateSignIn("user@example.com", "secret123")).toBeNull();
  });

  it("fails when email is empty", () => {
    expect(validateSignIn("", "password")).toBe("Fill in email and password.");
  });

  it("fails when password is empty", () => {
    expect(validateSignIn("user@example.com", "")).toBe("Fill in email and password.");
  });

  it("fails when both fields are empty", () => {
    expect(validateSignIn("", "")).toBe("Fill in email and password.");
  });

  it("fails when email is only whitespace (now caught by trim check)", () => {
    expect(validateSignIn("   ", "password")).toBe("Fill in email and password.");
  });

  it("fails when email has no @ symbol", () => {
    expect(validateSignIn("notanemail", "password")).toBe("Enter a valid email address.");
  });

  it("fails when email has no TLD", () => {
    expect(validateSignIn("user@example", "password")).toBe("Enter a valid email address.");
  });

  it("empty-check takes priority over format check", () => {
    expect(validateSignIn("", "pass")).toBe("Fill in email and password.");
  });
});

// ─── Sign-up validation ───────────────────────────────────────────────────────

describe("validateSignUp", () => {
  it("passes for valid email and password >= 10 chars", () => {
    expect(validateSignUp("user@example.com", "strongpass1")).toBeNull();
  });

  it("fails when email is empty", () => {
    expect(validateSignUp("", "strongpass1")).toBe("Fill in email and password.");
  });

  it("fails when email is only whitespace", () => {
    expect(validateSignUp("   ", "strongpass1")).toBe("Fill in email and password.");
  });

  it("fails when password is empty", () => {
    expect(validateSignUp("user@example.com", "")).toBe("Fill in email and password.");
  });

  it("fails when email format is invalid", () => {
    expect(validateSignUp("notanemail", "strongpass1")).toBe("Enter a valid email address.");
  });

  it("fails when password is exactly 9 characters (min is 10)", () => {
    expect(validateSignUp("u@e.com", "123456789")).toBe(
      "Password must be at least 10 characters."
    );
  });

  it("passes when password is exactly 10 characters", () => {
    expect(validateSignUp("u@e.com", "1234567890")).toBeNull();
  });

  it("passes when password is longer than 10 characters", () => {
    expect(validateSignUp("u@e.com", "a-very-long-passphrase")).toBeNull();
  });

  it("empty-check takes priority over format and length checks", () => {
    expect(validateSignUp("", "")).toBe("Fill in email and password.");
  });

  it("format check takes priority over length check", () => {
    // Invalid email + short password → email error fires first
    expect(validateSignUp("bad", "short")).toBe("Enter a valid email address.");
  });
});

// ─── Forgot-password validation ───────────────────────────────────────────────

describe("validateForgotPassword", () => {
  it("passes when email is valid", () => {
    expect(validateForgotPassword("user@example.com")).toBeNull();
  });

  it("fails when email is empty", () => {
    expect(validateForgotPassword("")).toBe("Enter your email first.");
  });

  it("fails when email is only whitespace", () => {
    expect(validateForgotPassword("   ")).toBe("Enter your email first.");
  });

  it("fails when email format is invalid", () => {
    expect(validateForgotPassword("notanemail")).toBe("Enter a valid email address.");
  });
});

// ─── Username normalisation ───────────────────────────────────────────────────

describe("normaliseUsername", () => {
  it("lowercases the username", () => {
    expect(normaliseUsername("AGASTYA")).toBe("agastya");
  });

  it("trims surrounding whitespace", () => {
    expect(normaliseUsername("  agastya  ")).toBe("agastya");
  });

  it("lowercases AND trims simultaneously", () => {
    expect(normaliseUsername("  Made_AGASTYA  ")).toBe("made_agastya");
  });

  it("returns empty string when only whitespace is given", () => {
    expect(normaliseUsername("   ")).toBe("");
  });

  it("leaves already-normalised usernames unchanged", () => {
    expect(normaliseUsername("mirror_user_1")).toBe("mirror_user_1");
  });
});

// ─── Username-taken error detection ──────────────────────────────────────────

describe("isUsernameTakenError", () => {
  it("detects 'unique' in the error message (case-insensitive)", () => {
    expect(isUsernameTakenError("violates unique constraint")).toBe(true);
    expect(isUsernameTakenError("UNIQUE constraint failed")).toBe(true);
  });

  it("detects 'duplicate' in the error message", () => {
    expect(isUsernameTakenError("duplicate key value violates constraint")).toBe(true);
  });

  it("detects Postgres error code 23505", () => {
    expect(isUsernameTakenError("some other message", "23505")).toBe(true);
  });

  it("returns false for unrelated error messages and codes", () => {
    expect(isUsernameTakenError("network error", "500")).toBe(false);
    expect(isUsernameTakenError("permission denied")).toBe(false);
  });

  it("returns false for empty error message with no code", () => {
    expect(isUsernameTakenError("")).toBe(false);
  });
});
