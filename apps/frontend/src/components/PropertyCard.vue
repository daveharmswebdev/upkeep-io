<template>
  <div
    class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg dark:hover:shadow-xl transition-shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-complement-300 dark:focus:ring-complement-400 focus:ring-offset-2 dark:border dark:border-gray-700"
    tabindex="0"
    role="button"
    @click="handleClick"
    @keydown.enter="handleClick"
  >
    <div class="flex justify-between items-start mb-3">
      <div class="flex-1">
        <h3 class="text-lg font-heading font-semibold text-gray-800 dark:text-gray-100 mb-1">
          {{ property.nickname || fullAddress }}
        </h3>
        <p v-if="property.nickname" class="text-sm text-gray-600 dark:text-gray-400">
          {{ fullAddress }}
        </p>
      </div>
      <span
        :class="[
          'px-3 py-1 text-sm font-medium rounded-full',
          badgeClasses.bg,
          badgeClasses.text
        ]"
      >
        {{ statusText }}
      </span>
    </div>

    <div class="text-sm text-gray-600 dark:text-gray-400">
      <p>{{ property.city }}, {{ property.state }} {{ property.zipCode }}</p>
    </div>

    <div v-if="property.purchasePrice || property.purchaseDate" class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      <div class="flex justify-between text-sm">
        <span v-if="property.purchasePrice" class="text-gray-600 dark:text-gray-400">
          Purchase Price: <span class="font-semibold text-complement-500 dark:text-complement-400">${{ formatPrice(property.purchasePrice) }}</span>
        </span>
        <span v-if="property.purchaseDate" class="text-gray-600 dark:text-gray-400">
          {{ formatDate(property.purchaseDate, 'short') }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Property } from '@domain/entities';
import { LeaseStatus } from '@domain/entities';
import { formatPrice, formatDate } from '@/utils/formatters';
import { getLeaseStatusDisplay, getLeaseStatusBadgeClass } from '@/utils/leaseHelpers';

interface Props {
  property: Property;
  leaseStatus?: LeaseStatus;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  click: [property: Property];
}>();

const handleClick = () => {
  emit('click', props.property);
};

const fullAddress = computed(() => {
  const parts = [props.property.street];
  if (props.property.address2) {
    parts.push(props.property.address2);
  }
  return parts.join(' ');
});

const statusText = computed(() => getLeaseStatusDisplay(props.leaseStatus));
const badgeClasses = computed(() => getLeaseStatusBadgeClass(props.leaseStatus));
</script>
