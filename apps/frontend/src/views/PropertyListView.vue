<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white px-8 py-6 shadow-md">
      <div class="max-w-7xl mx-auto flex justify-between items-center">
        <h1 class="text-2xl font-heading font-bold text-gray-800">Properties</h1>
        <button
          @click="handleAddProperty"
          class="px-6 py-2 bg-complement-300 text-white rounded font-medium hover:bg-complement-400 transition-colors"
        >
          Add Property
        </button>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 py-8">
      <!-- Loading State -->
      <div v-if="propertyStore.loading" class="flex justify-center items-center py-20">
        <div class="text-gray-600">Loading properties...</div>
      </div>

      <!-- Error State -->
      <div v-else-if="propertyStore.error" class="bg-primary-100 text-primary-500 p-4 rounded">
        {{ propertyStore.error }}
      </div>

      <!-- Empty State -->
      <div v-else-if="propertyStore.properties.length === 0" class="text-center py-20">
        <div class="max-w-md mx-auto bg-white p-8 rounded-lg shadow">
          <h2 class="text-xl font-heading font-semibold text-gray-800 mb-4">No Properties Yet</h2>
          <p class="text-gray-600 mb-6">Get started by adding your first rental property.</p>
          <button
            @click="handleAddProperty"
            class="px-6 py-3 bg-complement-300 text-white rounded font-medium hover:bg-complement-400 transition-colors"
          >
            Add Your First Property
          </button>
        </div>
      </div>

      <!-- Property Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PropertyCard
          v-for="property in propertyStore.properties"
          :key="property.id"
          :property="property"
          @click="handlePropertyClick"
        />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import type { Property } from '@domain/entities';
import { usePropertyStore } from '@/stores/property';
import PropertyCard from '@/components/PropertyCard.vue';

const router = useRouter();
const propertyStore = usePropertyStore();

onMounted(async () => {
  try {
    await propertyStore.fetchProperties();
  } catch (error) {
    // Error is already handled in the store
  }
});

const handleAddProperty = () => {
  router.push('/properties/add');
};

const handlePropertyClick = (property: Property) => {
  router.push(`/properties/${property.id}`);
};
</script>
