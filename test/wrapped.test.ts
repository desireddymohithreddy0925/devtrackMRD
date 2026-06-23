import { describe, expect, it, vi, beforeEach, afterEach, Mock } from 'vitest';
import * as wrapped from '../src/lib/wrapped';

vi.mock('@/lib/streak', () => ({
  calculateStreak: vi.fn(),
}));

import { calculateStreak } from '@/lib/streak';

describe('wrapped utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getYearRange', () => {
    it('returns a full year range in the past', () => {
      const now = new Date('2026-06-23T10:00:00Z');
      const result = wrapped.getYearRange(2025, now);
      
      expect(result.startDate).toBe('2025-01-01');
      expect(result.endDate).toBe('2025-12-31');
      expect(result.partial).toBe(false);
      expect(result.start.toISOString()).toBe('2025-01-01T00:00:00.000Z');
      expect(result.end.toISOString()).toBe('2025-12-31T23:59:59.000Z');
    });

    it('returns a partial range for the current year', () => {
      const now = new Date('2026-06-23T10:00:00.000Z');
      const result = wrapped.getYearRange(2026, now);
      
      expect(result.startDate).toBe('2026-01-01');
      expect(result.endDate).toBe('2026-06-23');
      expect(result.partial).toBe(true);
      expect(result.start.toISOString()).toBe('2026-01-01T00:00:00.000Z');
      expect(result.end.toISOString()).toBe('2026-06-23T10:00:00.000Z');
    });

    it('handles leap year boundaries correctly', () => {
      const now = new Date('2025-01-01T00:00:00Z');
      const result = wrapped.getYearRange(2024, now);
      
      expect(result.startDate).toBe('2024-01-01');
      expect(result.endDate).toBe('2024-12-31');
      expect(result.partial).toBe(false);
    });
  });

  describe('calculateLongestStreak', () => {
    it('handles an empty contributions map', () => {
      (calculateStreak as Mock).mockReturnValue({ longestStreak: 0 });
      const result = wrapped.calculateLongestStreak({});
      expect(result).toBe(0);
      expect(calculateStreak).toHaveBeenCalledWith([]);
    });

    it('calculates for a single active day', () => {
      (calculateStreak as Mock).mockReturnValue({ longestStreak: 1 });
      const result = wrapped.calculateLongestStreak({ '2025-01-01': 5 });
      expect(result).toBe(1);
      expect(calculateStreak).toHaveBeenCalledWith([new Date('2025-01-01T00:00:00Z')]);
    });

    it('handles multiple active days', () => {
      (calculateStreak as Mock).mockReturnValue({ longestStreak: 3 });
      const result = wrapped.calculateLongestStreak({
        '2025-01-01': 5,
        '2025-01-02': 1,
        '2025-01-03': 3,
        '2025-01-05': 2,
      });
      expect(result).toBe(3);
      expect(calculateStreak).toHaveBeenCalledWith([
        new Date('2025-01-01T00:00:00Z'),
        new Date('2025-01-02T00:00:00Z'),
        new Date('2025-01-03T00:00:00Z'),
        new Date('2025-01-05T00:00:00Z'),
      ]);
    });

    it('ignores days with zero contributions', () => {
      (calculateStreak as Mock).mockReturnValue({ longestStreak: 1 });
      const result = wrapped.calculateLongestStreak({
        '2025-01-01': 5,
        '2025-01-02': 0,
      });
      expect(result).toBe(1);
      expect(calculateStreak).toHaveBeenCalledWith([
        new Date('2025-01-01T00:00:00Z'),
      ]);
    });
  });

  describe('getMostProductiveMonth', () => {
    it('returns index 0 if contributions are uniform', () => {
      const contributions = {
        '2025-01-01': 1,
        '2025-02-01': 1,
        '2025-03-01': 1,
      };
      const result = wrapped.getMostProductiveMonth(contributions);
      expect(result).toEqual({ name: 'January', commits: 1 });
    });

    it('finds the single month with the highest count', () => {
      const contributions = {
        '2025-01-01': 1,
        '2025-05-15': 10,
        '2025-05-16': 5,
        '2025-12-31': 2,
      };
      const result = wrapped.getMostProductiveMonth(contributions);
      expect(result).toEqual({ name: 'May', commits: 15 });
    });

    it('returns January for empty contributions map', () => {
      const result = wrapped.getMostProductiveMonth({});
      expect(result).toEqual({ name: 'January', commits: 0 });
    });
  });

  describe('getMostContributedRepo', () => {
    it('handles an empty commits array', () => {
      const result = wrapped.getMostContributedRepo([]);
      expect(result).toEqual({ name: 'No repository data', commits: 0 });
    });

    it('returns the single repo if only one exists', () => {
      const result = wrapped.getMostContributedRepo([
        { date: '2025-01-01', repo: 'user/repoA' },
      ]);
      expect(result).toEqual({ name: 'user/repoA', commits: 1 });
    });

    it('returns the repo with the most commits', () => {
      const result = wrapped.getMostContributedRepo([
        { date: '2025-01-01', repo: 'user/repoA' },
        { date: '2025-01-02', repo: 'user/repoB' },
        { date: '2025-01-03', repo: 'user/repoA' },
      ]);
      expect(result).toEqual({ name: 'user/repoA', commits: 2 });
    });
  });

  describe('getPeakCodingHour', () => {
    it('handles an empty hours array', () => {
      const result = wrapped.getPeakCodingHour([]);
      expect(result).toEqual({ hour: null, label: 'Not enough data yet', commits: 0 });
    });

    it('returns correct hour and label for a single valid hour', () => {
      const result = wrapped.getPeakCodingHour([15]); // 3pm
      expect(result).toEqual({ hour: 15, label: '3pm', commits: 1 });
    });

    it('ignores invalid hours (out of range, non-integer)', () => {
      const result = wrapped.getPeakCodingHour([-1, 24, 1.5, 8, 8]);
      expect(result).toEqual({ hour: 8, label: '8am', commits: 2 });
    });

    it('resolves ties by lower hour index', () => {
      const result = wrapped.getPeakCodingHour([10, 10, 12, 12]);
      expect(result).toEqual({ hour: 10, label: '10am', commits: 2 });
    });

    it('formats 0 (midnight) correctly', () => {
      const result = wrapped.getPeakCodingHour([0]);
      expect(result).toEqual({ hour: 0, label: '12am', commits: 1 });
    });

    it('formats 12 (noon) correctly', () => {
      const result = wrapped.getPeakCodingHour([12]);
      expect(result).toEqual({ hour: 12, label: '12pm', commits: 1 });
    });
  });

  describe('calculateLanguagePercentages', () => {
    it('handles empty totals', () => {
      const result = wrapped.calculateLanguagePercentages({});
      expect(result).toEqual([]);
    });

    it('calculates for a single language', () => {
      const result = wrapped.calculateLanguagePercentages({ TypeScript: 100 });
      expect(result).toEqual([{ name: 'TypeScript', bytes: 100, percentage: 100 }]);
    });

    it('sorts multiple languages by bytes descending', () => {
      const result = wrapped.calculateLanguagePercentages({
        HTML: 50,
        TypeScript: 100,
        CSS: 25,
      });
      expect(result).toEqual([
        { name: 'TypeScript', bytes: 100, percentage: 57.1 },
        { name: 'HTML', bytes: 50, percentage: 28.6 },
        { name: 'CSS', bytes: 25, percentage: 14.3 },
      ]);
    });

    it('respects the limit parameter', () => {
      const result = wrapped.calculateLanguagePercentages({
        HTML: 50,
        TypeScript: 100,
        CSS: 25,
      }, 2);
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('TypeScript');
      expect(result[1].name).toBe('HTML');
    });

    it('handles zero total bytes gracefully', () => {
      const result = wrapped.calculateLanguagePercentages({
        HTML: 0,
        TypeScript: 0,
      });
      expect(result).toEqual([
        { name: 'HTML', bytes: 0, percentage: 0 },
        { name: 'TypeScript', bytes: 0, percentage: 0 },
      ]);
    });
  });

  describe('calculatePersonality', () => {
    it('identifies Weekend Warrior', () => {
      // 2025-01-04 is Saturday, 2025-01-05 is Sunday
      const contributions = {
        '2025-01-04': 50,
        '2025-01-05': 50,
        '2025-01-01': 10, // Wednesday
      };
      const result = wrapped.calculatePersonality(
        contributions,
        110, // totalCommits
        0, // prsMerged
        { hour: 12 }, // peakCodingHour
        1, // longestStreak
        3 // activeDays
      );
      
      expect(result.id).toBe('weekend_warrior');
      expect(result.icon).toBe('🔥');
      expect(result.name).toBe('Weekend Warrior');
    });

    it('identifies Night Architect', () => {
      const result = wrapped.calculatePersonality(
        {}, 10, 0, { hour: 2 }, 1, 1
      );
      expect(result.id).toBe('night_architect');
      expect(result.icon).toBe('🌙');
    });

    it('identifies Sprint Builder', () => {
      const result = wrapped.calculatePersonality(
        {}, 100, 0, { hour: 12 }, 1, 10
      ); // 10 commits per active day
      expect(result.id).toBe('sprint_builder');
      expect(result.icon).toBe('⚡');
    });

    it('identifies Silent Architect', () => {
      const result = wrapped.calculatePersonality(
        {}, 600, 3, { hour: 12 }, 1, 100
      );
      expect(result.id).toBe('silent_architect');
      expect(result.icon).toBe('🏗️');
    });

    it('defaults to Consistency Monk for high streak', () => {
      const result = wrapped.calculatePersonality(
        {}, 100, 10, { hour: 12 }, 25, 25
      );
      expect(result.id).toBe('consistency_monk');
      expect(result.icon).toBe('🧘');
      expect(result.reason).toContain('25-day streak');
    });

    it('defaults to Consistency Monk for high active days', () => {
      const result = wrapped.calculatePersonality(
        {}, 200, 10, { hour: 12 }, 5, 150
      );
      expect(result.id).toBe('consistency_monk');
      expect(result.icon).toBe('🧘');
      expect(result.reason).toContain('150 different days');
    });

    it('defaults to Consistency Monk basic fallback', () => {
      const result = wrapped.calculatePersonality(
        {}, 10, 1, { hour: 12 }, 5, 10
      );
      expect(result.id).toBe('consistency_monk');
      expect(result.icon).toBe('🧘');
      expect(result.reason).toContain('steady, reliable habits');
    });
  });
});
