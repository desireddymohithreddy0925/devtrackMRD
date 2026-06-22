import {
  safeCompare,
  getExpectedSignature,
  verifyGitHubSignature,
} from "../src/lib/crypto";
import { describe, it, expect } from "vitest";
import { createHmac } from "crypto";

describe("crypto utility functions", () => {
  describe("safeCompare", () => {
    it("should return true for matching strings", () => {
      expect(safeCompare("hello", "hello")).toBe(true);
      expect(safeCompare("a-very-long-matching-string-12345", "a-very-long-matching-string-12345")).toBe(true);
    });

    it("should return false for strings with non-matching lengths", () => {
      expect(safeCompare("hello", "hello world")).toBe(false);
      expect(safeCompare("short", "longer")).toBe(false);
    });

    it("should return false for strings of identical lengths but different content", () => {
      expect(safeCompare("hello", "world")).toBe(false);
      expect(safeCompare("abcde", "abcdf")).toBe(false);
    });
  });

  describe("getExpectedSignature", () => {
    it("should return correct HMAC-SHA256 prefixed with sha256=", () => {
      const secret = "my-secret";
      const body = '{"foo":"bar"}';
      
      const expectedHash = createHmac("sha256", secret).update(body).digest("hex");
      const expectedSignature = `sha256=${expectedHash}`;
      
      expect(getExpectedSignature(secret, body)).toBe(expectedSignature);
    });
  });

  describe("verifyGitHubSignature", () => {
    const secret = "my-secret";
    const body = '{"foo":"bar"}';
    const validSignature = getExpectedSignature(secret, body);

    it("should return true for valid signatures", () => {
      expect(verifyGitHubSignature(body, validSignature, secret)).toBe(true);
    });

    it("should return false for invalid signatures", () => {
      const invalidSignature = `sha256=${createHmac("sha256", "wrong-secret").update(body).digest("hex")}`;
      expect(verifyGitHubSignature(body, invalidSignature, secret)).toBe(false);
    });

    it("should return false for missing prefix", () => {
      const missingPrefixSignature = createHmac("sha256", secret).update(body).digest("hex");
      expect(verifyGitHubSignature(body, missingPrefixSignature, secret)).toBe(false);
    });

    it("should return false for null signature", () => {
      expect(verifyGitHubSignature(body, null, secret)).toBe(false);
    });
  });
});
