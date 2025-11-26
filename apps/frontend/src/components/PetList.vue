<template>
  <div>
    <h2 class="text-xl font-heading font-semibold mb-2 text-gray-700 dark:text-gray-300">
      Pets
    </h2>
    <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
      Manage pets associated with this lease.
    </p>

    <!-- Empty State -->
    <div v-if="pets.length === 0" class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center">
      <p class="text-gray-600 dark:text-gray-400 mb-4">No pets added yet.</p>
      <button
        type="button"
        @click="handleAdd"
        class="text-secondary-2-500 hover:text-secondary-2-700 dark:text-secondary-2-400 dark:hover:text-secondary-2-300 font-medium flex items-center gap-2 mx-auto transition-colors focus:outline-none focus:ring-2 focus:ring-secondary-2-300 rounded p-1"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Add Pet
      </button>
    </div>

    <!-- Pet List -->
    <div v-else class="space-y-3">
      <div
        v-for="pet in pets"
        :key="pet.id"
        class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 relative"
      >
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <p class="font-medium text-gray-800 dark:text-gray-100">
                {{ pet.name }}
              </p>
              <span
                :class="speciesBadgeClass(pet.species)"
                class="px-2 py-0.5 text-xs font-semibold rounded"
              >
                {{ pet.species === 'cat' ? 'Cat' : 'Dog' }}
              </span>
            </div>
            <p v-if="pet.notes" class="text-sm text-gray-600 dark:text-gray-400">
              {{ pet.notes }}
            </p>
          </div>
          <button
            type="button"
            @click="handleRemove(pet.id)"
            class="text-primary-400 hover:text-primary-500 dark:text-primary-300 dark:hover:text-primary-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-300 rounded p-1"
            :aria-label="`Remove ${pet.name}`"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Add Pet Button -->
      <button
        type="button"
        @click="handleAdd"
        class="mt-4 text-secondary-2-500 hover:text-secondary-2-700 dark:text-secondary-2-400 dark:hover:text-secondary-2-300 font-medium flex items-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-secondary-2-300 rounded p-1"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Add Pet
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LeaseWithDetails } from '@domain/entities';

interface Props {
  pets: LeaseWithDetails['pets'];
}

defineProps<Props>();

const emit = defineEmits<{
  add: [];
  remove: [petId: string];
}>();

const speciesBadgeClass = (species: 'cat' | 'dog') => {
  if (species === 'cat') {
    return 'bg-secondary-1-200 dark:bg-secondary-1-600 text-secondary-1-800 dark:text-secondary-1-100';
  }
  return 'bg-complement-200 dark:bg-complement-600 text-complement-800 dark:text-complement-100';
};

const handleAdd = () => {
  emit('add');
};

const handleRemove = (petId: string) => {
  emit('remove', petId);
};
</script>
