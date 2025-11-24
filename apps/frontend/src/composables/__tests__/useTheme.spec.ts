import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useTheme, resetThemeState } from '../useTheme';
import { themeStorage } from '@/utils/storage';

describe('useTheme', () => {
  let matchMediaMock: any;
  let documentElement: HTMLElement;

  beforeEach(() => {
    // Reset theme state before each test
    resetThemeState();

    // Clear localStorage before each test
    localStorage.clear();

    // Store original documentElement
    documentElement = document.documentElement;

    // Mock matchMedia
    matchMediaMock = {
      matches: false,
      media: '(prefers-color-scheme: dark)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation(() => matchMediaMock),
    });
  });

  afterEach(() => {
    // Clean up dark class and reset state
    documentElement.classList.remove('dark');
    resetThemeState();
  });

  describe('initialization', () => {
    it('should initialize with saved preference (dark)', () => {
      themeStorage.setTheme('dark');

      const { isDark } = useTheme();

      expect(isDark.value).toBe(true);
      expect(documentElement.classList.contains('dark')).toBe(true);
    });

    it('should initialize with saved preference (light)', () => {
      themeStorage.setTheme('light');

      const { isDark } = useTheme();

      expect(isDark.value).toBe(false);
      expect(documentElement.classList.contains('dark')).toBe(false);
    });

    it('should detect system preference when no saved preference (light)', () => {
      matchMediaMock.matches = false; // Light mode

      const { isDark } = useTheme();

      expect(isDark.value).toBe(false);
      expect(documentElement.classList.contains('dark')).toBe(false);
    });

    it('should detect system preference when no saved preference (dark)', () => {
      matchMediaMock.matches = true; // Dark mode

      const { isDark } = useTheme();

      expect(isDark.value).toBe(true);
      expect(documentElement.classList.contains('dark')).toBe(true);
    });

    it('should prefer saved preference over system preference', () => {
      themeStorage.setTheme('light');
      matchMediaMock.matches = true; // System prefers dark

      const { isDark } = useTheme();

      expect(isDark.value).toBe(false); // Saved preference wins
    });

    it('should add event listener for system preference changes', () => {
      useTheme();

      expect(matchMediaMock.addEventListener).toHaveBeenCalledWith(
        'change',
        expect.any(Function)
      );
    });
  });

  describe('toggleTheme', () => {
    it('should toggle from light to dark', () => {
      themeStorage.setTheme('light');

      const { isDark, toggleTheme } = useTheme();

      expect(isDark.value).toBe(false);

      toggleTheme();

      expect(isDark.value).toBe(true);
      expect(documentElement.classList.contains('dark')).toBe(true);
      expect(themeStorage.getTheme()).toBe('dark');
    });

    it('should toggle from dark to light', () => {
      themeStorage.setTheme('dark');

      const { isDark, toggleTheme } = useTheme();

      expect(isDark.value).toBe(true);

      toggleTheme();

      expect(isDark.value).toBe(false);
      expect(documentElement.classList.contains('dark')).toBe(false);
      expect(themeStorage.getTheme()).toBe('light');
    });

    it('should toggle multiple times', () => {
      const { isDark, toggleTheme } = useTheme();

      toggleTheme();
      expect(isDark.value).toBe(true);

      toggleTheme();
      expect(isDark.value).toBe(false);

      toggleTheme();
      expect(isDark.value).toBe(true);
    });

    it('should save preference to storage', () => {
      const { toggleTheme } = useTheme();

      toggleTheme();
      expect(themeStorage.getTheme()).toBe('dark');

      toggleTheme();
      expect(themeStorage.getTheme()).toBe('light');
    });
  });

  describe('DOM updates', () => {
    it('should add dark class to documentElement when dark', () => {
      const { toggleTheme } = useTheme();

      toggleTheme();

      expect(documentElement.classList.contains('dark')).toBe(true);
    });

    it('should remove dark class from documentElement when light', () => {
      themeStorage.setTheme('dark');
      const { toggleTheme } = useTheme();

      toggleTheme();

      expect(documentElement.classList.contains('dark')).toBe(false);
    });

    it('should update class immediately when toggling', () => {
      const { toggleTheme } = useTheme();

      expect(documentElement.classList.contains('dark')).toBe(false);

      toggleTheme();
      expect(documentElement.classList.contains('dark')).toBe(true);

      toggleTheme();
      expect(documentElement.classList.contains('dark')).toBe(false);
    });
  });

  describe('system preference changes', () => {
    it('should not respond to system changes when user has manual preference', () => {
      themeStorage.setTheme('light');
      const { isDark } = useTheme();

      // Simulate system preference change to dark
      matchMediaMock.matches = true;
      const changeHandler = matchMediaMock.addEventListener.mock.calls[0][1];
      changeHandler({ matches: true });

      // Should stay light because user manually set it
      expect(isDark.value).toBe(false);
    });

    it('should respond to system changes when no manual preference', () => {
      const { isDark } = useTheme();

      // Initially light
      expect(isDark.value).toBe(false);

      // Simulate system preference change to dark
      matchMediaMock.matches = true;
      const changeHandler = matchMediaMock.addEventListener.mock.calls[0][1];
      changeHandler({ matches: true });

      // Should update to match system
      expect(isDark.value).toBe(true);
      expect(documentElement.classList.contains('dark')).toBe(true);
    });

    it('should update storage when responding to system changes', () => {
      useTheme();

      // Simulate system preference change to dark
      matchMediaMock.matches = true;
      const changeHandler = matchMediaMock.addEventListener.mock.calls[0][1];
      changeHandler({ matches: true });

      expect(themeStorage.getTheme()).toBe('dark');
    });
  });

  describe('multiple instances', () => {
    it('should share state between instances', () => {
      const instance1 = useTheme();
      const instance2 = useTheme();

      expect(instance1.isDark.value).toBe(instance2.isDark.value);

      instance1.toggleTheme();

      expect(instance1.isDark.value).toBe(instance2.isDark.value);
    });
  });
});
