import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import apiClient from '@/api/client';

interface User {
  id: string;
  email: string;
  name: string;
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('auth_token'));
  const user = ref<User | null>(
    localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null
  );

  const isAuthenticated = computed(() => !!token.value);

  async function signup(email: string, password: string, name: string) {
    const response = await apiClient.post('/auth/signup', { email, password, name });
    token.value = response.data.token;
    user.value = response.data.user;
    localStorage.setItem('auth_token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }

  async function login(email: string, password: string) {
    const response = await apiClient.post('/auth/login', { email, password });
    token.value = response.data.token;
    user.value = response.data.user;
    localStorage.setItem('auth_token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }

  return {
    token,
    user,
    isAuthenticated,
    signup,
    login,
    logout,
  };
});
