<template>
  <div class="min-h-screen bg-gray-100">

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
