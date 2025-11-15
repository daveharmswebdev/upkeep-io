<template>
  <div
    class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
    @click="handleClick"
  >
    <div class="flex justify-between items-start mb-3">
      <div class="flex-1">
        <h3 class="text-lg font-heading font-semibold text-gray-800 mb-1">
          {{ property.nickname || property.address }}
        </h3>
        <p v-if="property.nickname" class="text-sm text-gray-600">
          {{ property.address }}
        </p>
      </div>
      <span class="px-3 py-1 bg-complement-100 text-complement-500 text-sm font-medium rounded-full">
        Vacant
      </span>
    </div>

    <div class="text-sm text-gray-600">
      <p>{{ property.city }}, {{ property.state }} {{ property.zipCode }}</p>
    </div>

    <div v-if="property.purchasePrice || property.purchaseDate" class="mt-4 pt-4 border-t border-gray-200">
      <div class="flex justify-between text-sm">
        <span v-if="property.purchasePrice" class="text-gray-600">
          Purchase Price: <span class="font-medium text-gray-800">${{ formatPrice(property.purchasePrice) }}</span>
        </span>
        <span v-if="property.purchaseDate" class="text-gray-600">
          {{ formatDate(property.purchaseDate) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Property } from '@domain/entities';

interface Props {
  property: Property;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  click: [property: Property];
}>();

const handleClick = () => {
  emit('click', props.property);
};

const formatPrice = (price: number): string => {
  return price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
</script>
