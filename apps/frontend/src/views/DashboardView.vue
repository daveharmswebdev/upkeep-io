<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900">

    <main class="p-8 max-w-7xl mx-auto">
      <section class="bg-white dark:bg-gray-800 p-8 rounded-lg shadow dark:border dark:border-gray-700">
        <h2 class="text-xl font-heading font-semibold text-gray-800 dark:text-gray-100 mt-0 mb-4">Your Properties</h2>
        <p class="text-gray-600 dark:text-gray-400 mb-6">Manage your rental properties, track maintenance, and monitor expenses.</p>
        <div class="flex flex-wrap gap-4">
          <button
            @click="router.push('/properties')"
            class="px-6 py-3 bg-complement-300 text-white rounded font-medium hover:bg-complement-400 transition-colors"
          >
            View Properties
          </button>
          <button
            @click="router.push('/properties/add')"
            class="px-6 py-3 bg-primary-300 text-white rounded font-medium hover:bg-primary-400 transition-colors flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Property
          </button>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();
</script>
