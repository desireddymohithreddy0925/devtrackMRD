import { describe, expect, it } from 'vitest';
import { cleanUsername, formatRepositoryName } from '../src/lib/string-utils';

describe('cleanUsername', () => {
  it('returns a trimmed lowercase string for normal input', () => {
    expect(cleanUsername('username')).toBe('username');
  });

  it('handles leading and trailing whitespace', () => {
    expect(cleanUsername('  username  ')).toBe('username');
  });

  it('handles all-uppercase usernames', () => {
    expect(cleanUsername('USERNAME')).toBe('username');
  });

  it('handles mixed-case usernames', () => {
    expect(cleanUsername('UsErNaMe')).toBe('username');
  });

  it('handles empty string after trimming', () => {
    expect(cleanUsername('   ')).toBe('');
  });
});

describe('formatRepositoryName', () => {
  it('returns a trimmed lowercase string for normal input', () => {
    expect(formatRepositoryName('repository')).toBe('repository');
  });

  it('replaces spaces with hyphens', () => {
    expect(formatRepositoryName('my repository')).toBe('my-repository');
  });

  it('handles multiple consecutive spaces', () => {
    expect(formatRepositoryName('my   repository')).toBe('my-repository');
  });

  it('handles leading and trailing whitespace', () => {
    expect(formatRepositoryName('  my repository  ')).toBe('my-repository');
  });

  it('handles mixed-case inputs', () => {
    expect(formatRepositoryName('My RePoSiToRy')).toBe('my-repository');
  });

  it('handles empty string after trimming', () => {
    expect(formatRepositoryName('   ')).toBe('');
  });
});