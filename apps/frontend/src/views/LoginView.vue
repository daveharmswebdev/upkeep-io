<template>
  <div class="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
    <div class="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg dark:border dark:border-gray-700 w-full max-w-md">
      <h1 class="text-3xl font-heading font-bold mb-6 text-gray-800 dark:text-gray-100 text-center">Login</h1>
      <form @submit.prevent="handleLogin">
        <div class="mb-4">
          <label for="email" class="block mb-2 text-gray-700 dark:text-gray-300 font-medium">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            placeholder="Enter your email"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-complement-300 dark:focus:border-complement-400 focus:ring-2 focus:ring-complement-200 dark:focus:ring-complement-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
        <div class="mb-4">
          <label for="password" class="block mb-2 text-gray-700 dark:text-gray-300 font-medium">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            placeholder="Enter your password"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-complement-300 dark:focus:border-complement-400 focus:ring-2 focus:ring-complement-200 dark:focus:ring-complement-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
        <div v-if="error" class="text-primary-400 dark:text-primary-300 mt-2 text-sm">{{ error }}</div>
        <button
          type="submit"
          :disabled="loading"
          class="w-full px-3 py-3 mt-4 bg-complement-300 text-white rounded font-medium cursor-pointer hover:bg-complement-400 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
      </form>
      <p class="mt-6 text-center text-gray-600 dark:text-gray-400">
        Don't have an account?
        <router-link to="/signup" class="text-complement-300 dark:text-complement-400 hover:underline">Sign up</router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useAuthForm } from '@/composables/useAuthForm';

const authStore = useAuthStore();

const email = ref('');
const password = ref('');

const { loading, error, submitAuth } = useAuthForm();

const handleLogin = () =>
  submitAuth(
    () => authStore.login(email.value, password.value),
    '/dashboard',
    'Login failed. Please try again.'
  );
</script>
