import { describe, expect, it } from "vitest";
import { detectBrowserLocale, detectLocale } from "@/i18n/detection";
import { translateMessage } from "@/i18n/translate";

describe("i18n locale detection", () => {
  it("uses user preference before cookie or browser language", () => {
    expect(
      detectLocale({
        preferredLocale: "es",
        cookieLocale: "en",
        acceptLanguage: "en-US,en;q=0.9",
      })
    ).toEqual({ locale: "es", source: "preference" });
  });

  it("uses cookie before browser language", () => {
    expect(
      detectLocale({
        cookieLocale: "es",
        acceptLanguage: "en-US,en;q=0.9",
      })
    ).toEqual({ locale: "es", source: "cookie" });
  });

  it("detects supported browser languages from Accept-Language", () => {
    expect(detectBrowserLocale("fr-CA,es;q=0.8,en;q=0.7")).toBe("es");
  });

  it("falls back to English for unsupported languages", () => {
    expect(
      detectLocale({
        acceptLanguage: "fr-CA,fr;q=0.9",
      })
    ).toEqual({ locale: "en", source: "default" });
  });
});

describe("i18n translation lookup", () => {
  it("renders Spanish strings", async () => {
    await expect(translateMessage("es", "navigation.settings")).resolves.toBe("Configuración");
  });

  it("falls back to English when locale is unsupported", async () => {
    await expect(translateMessage("fr", "navigation.settings")).resolves.toBe("Settings");
  });

  it("returns the key for missing translations", async () => {
    await expect(translateMessage("es", "missing.example")).resolves.toBe("missing.example");
  });
});

describe("detectLocale edge cases", () => {
  it("returns default when all inputs are null", () => {
    expect(
      detectLocale({
        preferredLocale: null,
        cookieLocale: null,
        acceptLanguage: null,
      })
    ).toEqual({ locale: "en", source: "default" });
  });

  it("returns default when all inputs are undefined", () => {
    expect(
      detectLocale({
        preferredLocale: undefined,
        cookieLocale: undefined,
        acceptLanguage: undefined,
      })
    ).toEqual({ locale: "en", source: "default" });
  });

  it("returns default when all inputs are empty string", () => {
    expect(
      detectLocale({
        preferredLocale: "",
        cookieLocale: "",
        acceptLanguage: "",
      })
    ).toEqual({ locale: "en", source: "default" });
  });

  it("ignores language region suffix and normalises to base tag", () => {
    expect(
      detectLocale({
        preferredLocale: "en-US",
        cookieLocale: null,
        acceptLanguage: null,
      })
    ).toEqual({ locale: "en", source: "preference" });
  });

  it("rejects invalid locale strings", () => {
    expect(
      detectLocale({
        preferredLocale: "fr",
        cookieLocale: null,
        acceptLanguage: null,
      })
    ).toEqual({ locale: "en", source: "default" });
  });
});

describe("detectBrowserLocale edge cases", () => {
  it("returns null for null input", () => {
    expect(detectBrowserLocale(null)).toBeNull();
  });

  it("returns null for undefined input", () => {
    expect(detectBrowserLocale(undefined)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(detectBrowserLocale("")).toBeNull();
  });

  it("returns null when no locale in header is supported", () => {
    expect(detectBrowserLocale("fr-FR,de-DE,it-IT")).toBeNull();
  });

  it("sorts by quality value descending", () => {
    expect(detectBrowserLocale("en;q=0.5,es;q=0.9,fr;q=0.7")).toBe("es");
  });

  it("defaults quality to 1 when not specified", () => {
    expect(detectBrowserLocale("en,es;q=0.9")).toBe("en");
  });

  it("handles case-insensitive language tags", () => {
    expect(detectBrowserLocale("EN-US,ES;q=0.8")).toBe("en");
  });

  it("returns first supported locale even when it has low quality", () => {
    expect(detectBrowserLocale("fr;q=0.9,en;q=0.1")).toBe("en");
  });
});