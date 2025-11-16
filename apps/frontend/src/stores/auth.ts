import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import apiClient from '@/api/client';
import { authStorage, type User } from '@/utils/storage';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(authStorage.getToken());
  const user = ref<User | null>(authStorage.getUser());

  const isAuthenticated = computed(() => !!token.value);

  async function signup(email: string, password: string, name: string) {
    const response = await apiClient.post('/auth/signup', { email, password, name });
    token.value = response.data.token;
    user.value = response.data.user;
    authStorage.setToken(response.data.token);
    authStorage.setUser(response.data.user);
  }

  async function login(email: string, password: string) {
    const response = await apiClient.post('/auth/login', { email, password });
    token.value = response.data.token;
    user.value = response.data.user;
    authStorage.setToken(response.data.token);
    authStorage.setUser(response.data.user);
  }

  function logout() {
    token.value = null;
    user.value = null;
    authStorage.clear();
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
