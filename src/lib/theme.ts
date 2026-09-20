export const THEME_STORAGE_KEY = 'bite-marks-theme';
export const THEME_CHANGE_EVENT = 'bite-marks-theme-change';

export type ThemePreference = 'light' | 'night' | 'system';
export type ResolvedTheme = Exclude<ThemePreference, 'system'>;

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === 'light' || value === 'night' || value === 'system';
}

export function resolveTheme(
  preference: ThemePreference,
  prefersNight: boolean,
): ResolvedTheme {
  return preference === 'system' ? (prefersNight ? 'night' : 'light') : preference;
}

export function readThemePreference(storage: Pick<Storage, 'getItem'>): ThemePreference {
  const stored = storage.getItem(THEME_STORAGE_KEY);
  return isThemePreference(stored) ? stored : 'system';
}

export function applyThemePreference(
  preference: ThemePreference,
  root: HTMLElement = document.documentElement,
  prefersNight = window.matchMedia('(prefers-color-scheme: dark)').matches,
): ResolvedTheme {
  const resolved = resolveTheme(preference, prefersNight);
  root.dataset.theme = resolved;
  root.style.colorScheme = resolved === 'night' ? 'dark' : 'light';
  return resolved;
}

export function saveThemePreference(preference: ThemePreference): ResolvedTheme {
  localStorage.setItem(THEME_STORAGE_KEY, preference);
  const resolved = applyThemePreference(preference);
  window.dispatchEvent(
    new CustomEvent<ThemePreference>(THEME_CHANGE_EVENT, { detail: preference }),
  );
  return resolved;
}
