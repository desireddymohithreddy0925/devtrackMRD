import {
  isThemeId,
  getThemeDefinition,
  isDarkTheme,
  nextThemeId,
  THEME_OPTIONS,
  ThemeId
} from "../src/lib/themes";
import { describe, it, expect } from "vitest";

describe("themes utility functions", () => {
  describe("isThemeId", () => {
    it("should return true for valid theme IDs", () => {
      expect(isThemeId("classic-dark")).toBe(true);
      expect(isThemeId("modern-light-blue")).toBe(true);
      expect(isThemeId("nordic-frost")).toBe(true);
      expect(isThemeId("cyberpunk-matrix")).toBe(true);
    });

    it("should return false for invalid theme IDs", () => {
      expect(isThemeId("unknown-theme")).toBe(false);
      expect(isThemeId("")).toBe(false);
      expect(isThemeId("classic")).toBe(false);
    });

    it("should return false for null and undefined", () => {
      expect(isThemeId(null)).toBe(false);
      expect(isThemeId(undefined)).toBe(false);
    });
  });

  describe("getThemeDefinition", () => {
    it("should return the correct ThemeDefinition for each known theme ID", () => {
      expect(getThemeDefinition("classic-dark")).toEqual(THEME_OPTIONS[0]);
      expect(getThemeDefinition("modern-light-blue")).toEqual(THEME_OPTIONS[1]);
      expect(getThemeDefinition("nordic-frost")).toEqual(THEME_OPTIONS[2]);
      expect(getThemeDefinition("cyberpunk-matrix")).toEqual(THEME_OPTIONS[3]);
    });

    it("should fall back to classic-dark for unknown IDs", () => {
      expect(getThemeDefinition("unknown-theme" as ThemeId)).toEqual(THEME_OPTIONS[0]);
      expect(getThemeDefinition("" as ThemeId)).toEqual(THEME_OPTIONS[0]);
    });
  });

  describe("isDarkTheme", () => {
    it("should return true for dark-mode themes", () => {
      expect(isDarkTheme("classic-dark")).toBe(true);
      expect(isDarkTheme("nordic-frost")).toBe(true);
      expect(isDarkTheme("cyberpunk-matrix")).toBe(true);
    });

    it("should return false for light-mode themes", () => {
      expect(isDarkTheme("modern-light-blue")).toBe(false);
    });
    
    it("should handle unknown themes by falling back to default (classic-dark, which is dark)", () => {
      expect(isDarkTheme("unknown-theme" as ThemeId)).toBe(true);
    });
  });

  describe("nextThemeId", () => {
    it("should cycle correctly through all theme options", () => {
      expect(nextThemeId("classic-dark")).toBe("modern-light-blue");
      expect(nextThemeId("modern-light-blue")).toBe("nordic-frost");
      expect(nextThemeId("nordic-frost")).toBe("cyberpunk-matrix");
      expect(nextThemeId("cyberpunk-matrix")).toBe("classic-dark");
    });

    it("should handle unknown input gracefully", () => {
      // For unknown input, fallbackIndex is 0 (classic-dark), so next is index 1 (modern-light-blue).
      expect(nextThemeId("unknown-theme" as ThemeId)).toBe("modern-light-blue");
      expect(nextThemeId("" as ThemeId)).toBe("modern-light-blue");
    });
  });
});
