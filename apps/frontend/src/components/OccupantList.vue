<template>
  <div>
    <h2 class="text-xl font-heading font-semibold mb-2 text-gray-700 dark:text-gray-300">
      Occupants
    </h2>
    <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
      Manage occupants living at this property. Occupants can be adults or children.
    </p>

    <!-- Empty State -->
    <div v-if="occupants.length === 0" class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center">
      <p class="text-gray-600 dark:text-gray-400 mb-4">No occupants added yet.</p>
      <button
        type="button"
        @click="handleAdd"
        class="text-secondary-2-500 hover:text-secondary-2-700 dark:text-secondary-2-400 dark:hover:text-secondary-2-300 font-medium flex items-center gap-2 mx-auto transition-colors focus:outline-none focus:ring-2 focus:ring-secondary-2-300 rounded p-1"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Add Occupant
      </button>
    </div>

    <!-- Occupant List -->
    <div v-else class="space-y-3">
      <div
        v-for="occupant in occupants"
        :key="occupant.id"
        class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 relative"
      >
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <p class="font-medium text-gray-800 dark:text-gray-100">
                {{ occupant.person.firstName }} {{ occupant.person.lastName }}
              </p>
              <span
                v-if="occupant.isAdult"
                class="px-2 py-0.5 text-xs font-semibold rounded bg-complement-200 dark:bg-complement-600 text-complement-800 dark:text-complement-100"
              >
                Adult
              </span>
              <span
                v-else
                class="px-2 py-0.5 text-xs font-semibold rounded bg-secondary-2-200 dark:bg-secondary-2-600 text-secondary-2-800 dark:text-secondary-2-100"
              >
                Child
              </span>
            </div>
            <p v-if="occupant.person.email" class="text-sm text-gray-600 dark:text-gray-400">
              {{ occupant.person.email }}
            </p>
            <p v-if="occupant.person.phone" class="text-sm text-gray-600 dark:text-gray-400">
              {{ occupant.person.phone }}
            </p>
            <p v-if="occupant.moveInDate" class="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Move-in: {{ formatDate(occupant.moveInDate) }}
            </p>
          </div>
          <button
            type="button"
            @click="handleRemove(occupant.id)"
            class="text-primary-400 hover:text-primary-500 dark:text-primary-300 dark:hover:text-primary-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-300 rounded p-1"
            :aria-label="`Remove ${occupant.person.firstName} ${occupant.person.lastName}`"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Add Occupant Button -->
      <button
        type="button"
        @click="handleAdd"
        class="mt-4 text-secondary-2-500 hover:text-secondary-2-700 dark:text-secondary-2-400 dark:hover:text-secondary-2-300 font-medium flex items-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-secondary-2-300 rounded p-1"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Add Occupant
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LeaseWithDetails } from '@domain/entities';
import { formatDate } from '@/utils/formatters';

interface Props {
  occupants: LeaseWithDetails['occupants'];
}

defineProps<Props>();

const emit = defineEmits<{
  add: [];
  remove: [occupantId: string];
}>();

const handleAdd = () => {
  emit('add');
};

const handleRemove = (occupantId: string) => {
  emit('remove', occupantId);
};
</script>
