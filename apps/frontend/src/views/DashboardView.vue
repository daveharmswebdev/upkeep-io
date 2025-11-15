<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white px-8 py-6 shadow-md flex justify-between items-center">
      <h1 class="text-2xl font-heading font-bold text-gray-800">Property Management Dashboard</h1>
      <div class="flex items-center gap-4">
        <span class="text-gray-600">Welcome, {{ authStore.user?.name }}</span>
        <button
          @click="handleLogout"
          class="px-4 py-2 bg-primary-300 text-white rounded cursor-pointer text-sm font-medium hover:bg-primary-400 transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
    <main class="p-8 max-w-7xl mx-auto">
      <section class="bg-white p-8 rounded-lg shadow">
        <h2 class="text-xl font-heading font-semibold text-gray-800 mt-0 mb-4">Your Properties</h2>
        <p class="text-gray-600 mb-6">Manage your rental properties, track maintenance, and monitor expenses.</p>
        <button
          @click="router.push('/properties')"
          class="px-6 py-3 bg-complement-300 text-white rounded font-medium hover:bg-complement-400 transition-colors"
        >
          View Properties
        </button>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

function handleLogout() {
  authStore.logout();
  router.push('/login');
}
</script>
