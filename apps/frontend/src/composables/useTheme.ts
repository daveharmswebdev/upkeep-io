import { ref } from 'vue';
import { themeStorage } from '@/utils/storage';

// Shared state across all instances
const isDark = ref(false);
let isInitialized = false;
let hasManualPreference = false;
let mediaQueryListener: ((e: MediaQueryListEvent) => void) | null = null;

/**
 * Apply or remove dark class from document element
 * @param dark - Whether to apply dark mode
 */
const applyTheme = (dark: boolean) => {
  if (dark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

/**
 * Initialize theme from storage or system preference
 */
const initializeTheme = () => {
  if (isInitialized) return;

  const savedTheme = themeStorage.getTheme();

  if (savedTheme) {
    // User has manual preference
    hasManualPreference = true;
    isDark.value = savedTheme === 'dark';
  } else {
    // No saved preference, detect system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    isDark.value = prefersDark;
    themeStorage.setTheme(prefersDark ? 'dark' : 'light');
  }

  applyTheme(isDark.value);

  // Listen for system preference changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQueryListener = (e: MediaQueryListEvent) => {
    // Only respond to system changes if user hasn't manually set preference
    if (!hasManualPreference) {
      isDark.value = e.matches;
      themeStorage.setTheme(e.matches ? 'dark' : 'light');
      applyTheme(isDark.value);
    }
  };
  mediaQuery.addEventListener('change', mediaQueryListener);

  isInitialized = true;
};

/**
 * Reset theme state (for testing purposes)
 * @internal
 */
export const resetThemeState = () => {
  isDark.value = false;
  isInitialized = false;
  hasManualPreference = false;

  if (mediaQueryListener) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.removeEventListener('change', mediaQueryListener);
    mediaQueryListener = null;
  }

  document.documentElement.classList.remove('dark');
};

/**
 * Theme composable for dark mode functionality
 * Provides reactive dark mode state and toggle function
 * Persists preference to localStorage and respects system preference
 *
 * @returns Object with isDark ref and toggleTheme function
 * @example
 * const { isDark, toggleTheme } = useTheme();
 */
export function useTheme() {
  initializeTheme();

  /**
   * Toggle between light and dark themes
   * Sets manual preference flag to true
   */
  const toggleTheme = () => {
    hasManualPreference = true;
    isDark.value = !isDark.value;
    const newTheme = isDark.value ? 'dark' : 'light';
    themeStorage.setTheme(newTheme);
    applyTheme(isDark.value);
  };

  return {
    isDark,
    toggleTheme,
  };
}
