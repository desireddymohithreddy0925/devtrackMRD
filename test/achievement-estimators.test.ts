import { describe, it, expect } from "vitest";
import {
  calculateNextTier,
  calculatePercentage,
} from "../src/lib/achievement-estimators";

describe("Achievement Estimators", () => {
  describe("calculateNextTier", () => {
    it("should return the first tier when current is below it", () => {
      const tiers = [10, 50, 100];
      expect(calculateNextTier(5, tiers)).toBe(10);
      expect(calculateNextTier(0, tiers)).toBe(10);
    });

    it("should return the next tier when current is equal to a tier", () => {
      const tiers = [10, 50, 100];
      expect(calculateNextTier(10, tiers)).toBe(50);
      expect(calculateNextTier(50, tiers)).toBe(100);
    });

    it("should return null when current is above all tiers (maxed)", () => {
      const tiers = [10, 50, 100];
      expect(calculateNextTier(100, tiers)).toBeNull();
      expect(calculateNextTier(150, tiers)).toBeNull();
    });

    it("should return null for an empty tiers array", () => {
      expect(calculateNextTier(5, [])).toBeNull();
      expect(calculateNextTier(0, [])).toBeNull();
    });
  });

  describe("calculatePercentage", () => {
    it("should return the correct percentage when current is below nextTier", () => {
      expect(calculatePercentage(5, 10)).toBe(50);
      expect(calculatePercentage(2, 10)).toBe(20);
      expect(calculatePercentage(33, 100)).toBe(33);
      expect(calculatePercentage(0, 50)).toBe(0);
    });

    it("should return 100 when current is equal to nextTier", () => {
      expect(calculatePercentage(10, 10)).toBe(100);
      expect(calculatePercentage(50, 50)).toBe(100);
    });

    it("should return 100 when current is above nextTier", () => {
      expect(calculatePercentage(15, 10)).toBe(100);
      expect(calculatePercentage(100, 50)).toBe(100);
    });

    it("should return 100 when nextTier is null (maxed scenario)", () => {
      expect(calculatePercentage(150, null)).toBe(100);
      expect(calculatePercentage(0, null)).toBe(100);
    });
  });
});
