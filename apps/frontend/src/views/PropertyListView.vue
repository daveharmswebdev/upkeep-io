<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900">
    <header class="bg-white dark:bg-gray-800 px-8 py-6 shadow-md dark:border-b dark:border-gray-700">
      <div class="max-w-7xl mx-auto flex justify-between items-center">
        <h1 class="text-2xl font-heading font-bold text-gray-800 dark:text-gray-100">Properties</h1>
        <button
          @click="handleAddProperty"
          class="px-6 py-2 bg-complement-300 text-white rounded font-medium hover:bg-complement-400 transition-colors flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Property
        </button>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 py-8">
      <!-- Loading State -->
      <div v-if="propertyStore.loading" class="flex justify-center items-center py-20">
        <div class="flex items-center gap-3 text-gray-600 dark:text-gray-400">
          <svg class="w-6 h-6 animate-spin text-complement-300 dark:text-complement-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Loading properties...</span>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="propertyStore.error" class="bg-primary-100 dark:bg-primary-900/30 text-primary-500 dark:text-primary-300 p-4 rounded dark:border dark:border-primary-700">
        {{ propertyStore.error }}
      </div>

      <!-- Empty State -->
      <div v-else-if="propertyStore.properties.length === 0" class="text-center py-20">
        <div class="max-w-md mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow dark:border dark:border-gray-700">
          <svg class="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <h2 class="text-xl font-heading font-semibold text-gray-800 dark:text-gray-100 mb-4">No Properties Yet</h2>
          <p class="text-gray-600 dark:text-gray-400 mb-6">Get started by adding your first rental property.</p>
          <button
            @click="handleAddProperty"
            class="px-6 py-3 bg-complement-300 text-white rounded font-medium hover:bg-complement-400 transition-colors flex items-center gap-2 mx-auto"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
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
          :lease-status="getPropertyLeaseStatus(property.id)"
          @click="handlePropertyClick"
        />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import type { Property } from '@domain/entities';
import { LeaseStatus } from '@domain/entities';
import { usePropertyStore } from '@/stores/property';
import { useLeaseStore } from '@/stores/lease';
import { isActiveLease } from '@/utils/leaseHelpers';
import PropertyCard from '@/components/PropertyCard.vue';

const router = useRouter();
const propertyStore = usePropertyStore();
const leaseStore = useLeaseStore();

// Map to store lease status for each property
const propertyLeaseStatuses = ref<Map<string, LeaseStatus>>(new Map());

onMounted(async () => {
  try {
    await propertyStore.fetchProperties();
    // Fetch leases for all properties
    await fetchAllPropertyLeases();
  } catch (error) {
    // Error is already handled in the store
  }
});

/**
 * Fetch leases for all properties and store their active lease status
 */
const fetchAllPropertyLeases = async () => {
  const fetchPromises = propertyStore.properties.map(async (property) => {
    try {
      const leases = await leaseStore.fetchLeasesByProperty(property.id);
      // Find the active lease (ACTIVE or MONTH_TO_MONTH)
      const activeLease = leases.find(lease => isActiveLease(lease.status));
      if (activeLease) {
        propertyLeaseStatuses.value.set(property.id, activeLease.status);
      }
    } catch (error) {
      // Ignore errors for individual properties
      console.error(`Failed to fetch leases for property ${property.id}`, error);
    }
  });

  await Promise.all(fetchPromises);
};

/**
 * Get the lease status for a specific property
 */
const getPropertyLeaseStatus = (propertyId: string): LeaseStatus | undefined => {
  return propertyLeaseStatuses.value.get(propertyId);
};

const handleAddProperty = () => {
  router.push('/properties/add');
};

const handlePropertyClick = (property: Property) => {
  router.push(`/properties/${property.id}`);
};
</script>
