import {
  scoreToGrade,
  getImprovementTip,
  isRecentlyActiveFromScore,
  ConsistencyScoreResult
} from "../src/lib/consistency-score";
import { describe, it, expect } from "vitest";

describe("consistency-score utility functions", () => {
  describe("scoreToGrade", () => {
    it("should return S for scores >= 90", () => {
      expect(scoreToGrade(90)).toBe("S");
      expect(scoreToGrade(100)).toBe("S");
    });

    it("should return A for scores >= 75 and < 90", () => {
      expect(scoreToGrade(75)).toBe("A");
      expect(scoreToGrade(89)).toBe("A");
    });

    it("should return B for scores >= 60 and < 75", () => {
      expect(scoreToGrade(60)).toBe("B");
      expect(scoreToGrade(74)).toBe("B");
    });

    it("should return C for scores >= 40 and < 60", () => {
      expect(scoreToGrade(40)).toBe("C");
      expect(scoreToGrade(59)).toBe("C");
    });

    it("should return D for scores < 40", () => {
      expect(scoreToGrade(39)).toBe("D");
      expect(scoreToGrade(0)).toBe("D");
      expect(scoreToGrade(-10)).toBe("D");
    });
  });

  describe("getImprovementTip", () => {
    it("should return correct tip for scores < 40", () => {
      expect(getImprovementTip(39)).toBe("Try committing at least once every 2-3 days to build consistency");
    });

    it("should return correct tip for scores >= 40 and < 60", () => {
      expect(getImprovementTip(40)).toBe("You are making progress! Aim for 4+ active days per week");
      expect(getImprovementTip(59)).toBe("You are making progress! Aim for 4+ active days per week");
    });

    it("should return correct tip for scores >= 60 and < 75", () => {
      expect(getImprovementTip(60)).toBe("Good consistency! Try to reduce gaps between coding sessions");
      expect(getImprovementTip(74)).toBe("Good consistency! Try to reduce gaps between coding sessions");
    });

    it("should return correct tip for scores >= 75 and < 90", () => {
      expect(getImprovementTip(75)).toBe("Great work! Maintain your current streak to reach S tier");
      expect(getImprovementTip(89)).toBe("Great work! Maintain your current streak to reach S tier");
    });

    it("should return correct tip for scores >= 90", () => {
      expect(getImprovementTip(90)).toBe("Outstanding consistency! You are in the top tier of developers");
      expect(getImprovementTip(100)).toBe("Outstanding consistency! You are in the top tier of developers");
    });
  });

  describe("isRecentlyActiveFromScore", () => {
    const createBaseData = (
      score: number,
      weeklyConsistency: number,
      streakQuality: number,
      longestGap: number
    ): ConsistencyScoreResult => ({
      score,
      grade: "A",
      weeklyConsistency,
      monthlyTrend: [],
      longestGap,
      avgDailyCommits: 1,
      streakQuality,
      improvementTip: "tip"
    });

    it("should return true when recent activity bonus is >= 10 points", () => {
      // withoutRecent = Math.round( (100/100)*40 + 1.0*30 + (20 - min(20, 0/7)) )
      // withoutRecent = Math.round( 40 + 30 + 20 ) = 90
      // score = 100
      // score - withoutRecent = 10 >= 10 -> true
      const data = createBaseData(100, 100, 1.0, 0);
      expect(isRecentlyActiveFromScore(data)).toBe(true);
    });

    it("should return false when recent activity bonus is < 10 points", () => {
      // withoutRecent = Math.round( (50/100)*40 + 0.5*30 + (20 - min(20, 14/7)) )
      // withoutRecent = Math.round( 20 + 15 + (20 - 2) ) = Math.round(35 + 18) = 53
      // score = 58
      // score - withoutRecent = 5 < 10 -> false
      const data = createBaseData(58, 50, 0.5, 14);
      expect(isRecentlyActiveFromScore(data)).toBe(false);
    });

    it("should correctly handle boundaries", () => {
      // longestGap = 35 -> min(20, 35/7) -> min(20, 5) -> 5. gapPoints = 20 - 5 = 15.
      // withoutRecent = 20 + 15 + 15 = 50.
      
      // if score = 60, diff = 10 -> true
      const data1 = createBaseData(60, 50, 0.5, 35); 
      expect(isRecentlyActiveFromScore(data1)).toBe(true);

      // if score = 59, diff = 9 -> false
      const data2 = createBaseData(59, 50, 0.5, 35);
      expect(isRecentlyActiveFromScore(data2)).toBe(false);
    });
  });
});
