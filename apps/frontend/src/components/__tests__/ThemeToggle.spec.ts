import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ThemeToggle from '../ThemeToggle.vue';
import { resetThemeState } from '@/composables/useTheme';
import { themeStorage } from '@/utils/storage';

describe('ThemeToggle', () => {
  beforeEach(() => {
    // Reset theme state before each test
    resetThemeState();
    localStorage.clear();

    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    resetThemeState();
  });

  describe('rendering', () => {
    it('should render button element', () => {
      const wrapper = mount(ThemeToggle);
      const button = wrapper.find('button');
      expect(button.exists()).toBe(true);
    });

    it('should render moon icon when light mode active', () => {
      // Set light mode
      themeStorage.setTheme('light');

      const wrapper = mount(ThemeToggle);
      const svg = wrapper.find('svg');

      // Check for moon icon (crescent path)
      expect(svg.exists()).toBe(true);
      expect(wrapper.html()).toContain('M21 12.79A9 9 0 1 1 11.21 3');
    });

    it('should render sun icon when dark mode active', () => {
      // Set dark mode
      themeStorage.setTheme('dark');

      const wrapper = mount(ThemeToggle);
      const svg = wrapper.find('svg');

      // Check for sun icon (circle)
      expect(svg.exists()).toBe(true);
      expect(wrapper.html()).toContain('<circle');
    });
  });

  describe('accessibility', () => {
    it('should have aria-label for light mode', () => {
      themeStorage.setTheme('light');

      const wrapper = mount(ThemeToggle);
      const button = wrapper.find('button');

      expect(button.attributes('aria-label')).toBe('Switch to dark mode');
    });

    it('should have aria-label for dark mode', () => {
      themeStorage.setTheme('dark');

      const wrapper = mount(ThemeToggle);
      const button = wrapper.find('button');

      expect(button.attributes('aria-label')).toBe('Switch to light mode');
    });

    it('should have type="button"', () => {
      const wrapper = mount(ThemeToggle);
      const button = wrapper.find('button');

      expect(button.attributes('type')).toBe('button');
    });

    it('should have focus states', () => {
      const wrapper = mount(ThemeToggle);
      const button = wrapper.find('button');

      // Check for focus-visible class (Tailwind)
      expect(button.classes()).toContain('focus:outline-none');
    });
  });

  describe('user interactions', () => {
    it('should toggle theme when button is clicked', async () => {
      themeStorage.setTheme('light');

      const wrapper = mount(ThemeToggle);
      const button = wrapper.find('button');

      // Initially light mode - should show moon icon
      expect(wrapper.html()).toContain('M21 12.79A9 9 0 1 1 11.21 3');

      // Click to toggle
      await button.trigger('click');
      await wrapper.vm.$nextTick();

      // Should switch to dark mode - show sun icon
      expect(wrapper.html()).toContain('<circle');
      expect(themeStorage.getTheme()).toBe('dark');
    });

    it('should update icon when toggled multiple times', async () => {
      const wrapper = mount(ThemeToggle);
      const button = wrapper.find('button');

      // Initially should show moon icon (light mode)
      expect(wrapper.html()).toContain('M21 12.79A9 9 0 1 1 11.21 3');

      // Toggle to dark
      await button.trigger('click');
      await wrapper.vm.$nextTick();
      expect(wrapper.html()).toContain('<circle');

      // Toggle back to light
      await button.trigger('click');
      await wrapper.vm.$nextTick();
      expect(wrapper.html()).toContain('M21 12.79A9 9 0 1 1 11.21 3');
    });
  });

  describe('styling', () => {
    it('should have proper button classes', () => {
      const wrapper = mount(ThemeToggle);
      const button = wrapper.find('button');

      // Check for common classes
      expect(button.classes()).toContain('p-2');
      expect(button.classes()).toContain('rounded-lg');
    });

    it('should have hover state', () => {
      const wrapper = mount(ThemeToggle);
      const button = wrapper.find('button');

      expect(button.classes().some((c) => c.includes('hover:'))).toBe(true);
    });

    it('should have transition classes', () => {
      const wrapper = mount(ThemeToggle);
      const button = wrapper.find('button');

      expect(button.classes()).toContain('transition-colors');
    });
  });
});
