import { describe, expect, it } from 'vitest';
import {
  isThemeId,
  getThemeDefinition,
  isDarkTheme,
  nextThemeId,
  THEME_OPTIONS,
  DEFAULT_THEME,
} from '../src/lib/themes';

describe('themes utilities', () => {
  describe('Constants', () => {
    it('has exactly 4 entries in THEME_OPTIONS', () => {
      expect(THEME_OPTIONS).toHaveLength(4);
    });

    it('has classic-dark as DEFAULT_THEME', () => {
      expect(DEFAULT_THEME).toBe('classic-dark');
    });
  });

  describe('isThemeId', () => {
    it('returns true for all valid ThemeId strings', () => {
      expect(isThemeId('classic-dark')).toBe(true);
      expect(isThemeId('modern-light-blue')).toBe(true);
      expect(isThemeId('nordic-frost')).toBe(true);
      expect(isThemeId('cyberpunk-matrix')).toBe(true);
    });

    it('returns false for null and undefined', () => {
      expect(isThemeId(null)).toBe(false);
      expect(isThemeId(undefined)).toBe(false);
    });

    it('returns false for invalid strings', () => {
      expect(isThemeId('invalid-theme')).toBe(false);
      expect(isThemeId('')).toBe(false);
      expect(isThemeId('CLASSIC-DARK')).toBe(false);
    });
  });

  describe('getThemeDefinition', () => {
    it('returns the correct ThemeDefinition for each known theme ID', () => {
      const classicDark = getThemeDefinition('classic-dark');
      expect(classicDark.id).toBe('classic-dark');
      expect(classicDark.mode).toBe('dark');

      const modernLight = getThemeDefinition('modern-light-blue');
      expect(modernLight.id).toBe('modern-light-blue');
      expect(modernLight.mode).toBe('light');

      const nordicFrost = getThemeDefinition('nordic-frost');
      expect(nordicFrost.id).toBe('nordic-frost');
      expect(nordicFrost.mode).toBe('dark');

      const cyberpunk = getThemeDefinition('cyberpunk-matrix');
      expect(cyberpunk.id).toBe('cyberpunk-matrix');
      expect(cyberpunk.mode).toBe('dark');
    });

    it('falls back to classic-dark (index 0) for unknown IDs', () => {
      const fallback = getThemeDefinition('unknown-theme' as any);
      expect(fallback.id).toBe('classic-dark');
    });
  });

  describe('isDarkTheme', () => {
    it('returns true for dark-mode themes', () => {
      expect(isDarkTheme('classic-dark')).toBe(true);
      expect(isDarkTheme('nordic-frost')).toBe(true);
      expect(isDarkTheme('cyberpunk-matrix')).toBe(true);
    });

    it('returns false for light-mode themes', () => {
      expect(isDarkTheme('modern-light-blue')).toBe(false);
    });
  });

  describe('nextThemeId', () => {
    it('cycles correctly through all four theme options in order', () => {
      // Order in THEME_OPTIONS is:
      // 0: classic-dark
      // 1: modern-light-blue
      // 2: nordic-frost
      // 3: cyberpunk-matrix
      expect(nextThemeId('classic-dark')).toBe('modern-light-blue');
      expect(nextThemeId('modern-light-blue')).toBe('nordic-frost');
      expect(nextThemeId('nordic-frost')).toBe('cyberpunk-matrix');
    });

    it('wraps around from the last to the first', () => {
      expect(nextThemeId('cyberpunk-matrix')).toBe('classic-dark');
    });

    it('handles unknown input gracefully by cycling from the fallback', () => {
      // Fallback index is 0 ('classic-dark'), so next is index 1 ('modern-light-blue')
      expect(nextThemeId('unknown-theme' as any)).toBe('modern-light-blue');
    });
  });
});
