import {
  encryptToken,
  decryptToken,
  safeCompare,
  getExpectedSignature,
  verifyGitHubSignature,
} from "../src/lib/crypto";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createHmac } from "crypto";

describe("crypto utility functions", () => {
  const validKey = "a".repeat(64);
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = process.env;
    process.env = { ...originalEnv, ENCRYPTION_KEY: validKey };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("encryptToken and decryptToken", () => {
    it("should encrypt a token into non-empty hex strings for encrypted and iv", () => {
      const plaintext = "super-secret-token";
      const result = encryptToken(plaintext);

      expect(result).toHaveProperty("encrypted");
      expect(result).toHaveProperty("iv");
      expect(typeof result.encrypted).toBe("string");
      expect(typeof result.iv).toBe("string");
      expect(result.encrypted.length).toBeGreaterThan(0);
      expect(result.iv.length).toBeGreaterThan(0);
      
      // Should be hex
      expect(/^[0-9a-fA-F]+$/.test(result.encrypted)).toBe(true);
      expect(/^[0-9a-fA-F]+$/.test(result.iv)).toBe(true);
    });

    it("should correctly decrypt the output of encryptToken back to original plaintext", () => {
      const plaintext = "super-secret-token";
      const { encrypted, iv } = encryptToken(plaintext);
      
      const decrypted = decryptToken(encrypted, iv);
      expect(decrypted).toBe(plaintext);
    });

    it("should return null for tampered ciphertext", () => {
      const { encrypted, iv } = encryptToken("super-secret-token");
      
      // Tamper the ciphertext by replacing the last char
      const tampered = encrypted.slice(0, -1) + (encrypted.endsWith("a") ? "b" : "a");
      
      const decrypted = decryptToken(tampered, iv);
      expect(decrypted).toBeNull();
    });

    it("should return null for invalid IV", () => {
      const { encrypted } = encryptToken("super-secret-token");
      
      // Invalid IV (different IV but correct length)
      const invalidIv = "b".repeat(24);
      const decrypted = decryptToken(encrypted, invalidIv);
      expect(decrypted).toBeNull();
      
      // Invalid IV format
      expect(decryptToken(encrypted, "not-hex")).toBeNull();
    });
  });

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
