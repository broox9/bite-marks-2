import { describe, expect, it } from 'vitest';
import { isThemePreference, readThemePreference, resolveTheme } from './theme';

describe('theme preferences', () => {
  it('resolves system from the operating-system preference', () => {
    expect(resolveTheme('system', true)).toBe('night');
    expect(resolveTheme('system', false)).toBe('light');
  });

  it('keeps an explicit preference regardless of the operating system', () => {
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('night', false)).toBe('night');
  });

  it('falls back to system for missing or invalid persisted values', () => {
    expect(readThemePreference({ getItem: () => null })).toBe('system');
    expect(readThemePreference({ getItem: () => 'sepia' })).toBe('system');
    expect(isThemePreference('night')).toBe(true);
  });
});
