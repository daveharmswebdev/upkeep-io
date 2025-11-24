/**
 * LocalStorage abstraction for authentication data
 * Provides testable interface and centralizes storage operations
 */

export interface User {
  id: string;
  email: string;
  name: string;
}

/**
 * Authentication storage abstraction
 * Provides testable interface for localStorage operations
 */
export const authStorage = {
  /**
   * Get authentication token from storage
   * @returns JWT token or null if not found
   */
  getToken: (): string | null => {
    return localStorage.getItem('auth_token');
  },

  /**
   * Save authentication token to storage
   * @param token - JWT token to store
   */
  setToken: (token: string): void => {
    localStorage.setItem('auth_token', token);
  },

  /**
   * Remove authentication token from storage
   */
  removeToken: (): void => {
    localStorage.removeItem('auth_token');
  },

  /**
   * Get user data from storage
   * @returns User object or null if not found or invalid JSON
   */
  getUser: (): User | null => {
    const userJson = localStorage.getItem('user');
    if (!userJson) return null;

    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  },

  /**
   * Save user data to storage
   * @param user - User object to store
   */
  setUser: (user: User): void => {
    localStorage.setItem('user', JSON.stringify(user));
  },

  /**
   * Remove user data from storage
   */
  removeUser: (): void => {
    localStorage.removeItem('user');
  },

  /**
   * Clear all authentication data from storage
   * Removes both token and user data
   */
  clear: (): void => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },
};

/**
 * Theme type for dark mode functionality
 */
export type Theme = 'light' | 'dark';

/**
 * Theme storage abstraction
 * Provides testable interface for theme preference persistence
 */
export const themeStorage = {
  /**
   * Get theme preference from storage
   * @returns Theme preference or null if not found
   */
  getTheme: (): Theme | null => {
    const theme = localStorage.getItem('theme');
    if (theme === 'light' || theme === 'dark') {
      return theme;
    }
    return null;
  },

  /**
   * Save theme preference to storage
   * @param theme - Theme preference to store
   */
  setTheme: (theme: Theme): void => {
    localStorage.setItem('theme', theme);
  },

  /**
   * Remove theme preference from storage
   */
  removeTheme: (): void => {
    localStorage.removeItem('theme');
  },
};

/**
 * Create mock storage for testing
 * Returns storage interface backed by in-memory object instead of localStorage
 * @returns Mock storage with same interface as authStorage
 * @example
 * const mockStorage = createMockStorage();
 * mockStorage.setToken('test-token');
 * mockStorage.getToken() // "test-token"
 */
export const createMockStorage = () => {
  const store: Record<string, string> = {};

  return {
    getToken: () => store.auth_token || null,
    setToken: (token: string) => {
      store.auth_token = token;
    },
    removeToken: () => {
      delete store.auth_token;
    },
    getUser: () => {
      if (!store.user) return null;
      try {
        return JSON.parse(store.user);
      } catch {
        return null;
      }
    },
    setUser: (user: User) => {
      store.user = JSON.stringify(user);
    },
    removeUser: () => {
      delete store.user;
    },
    clear: () => {
      delete store.auth_token;
      delete store.user;
    },
  };
};
