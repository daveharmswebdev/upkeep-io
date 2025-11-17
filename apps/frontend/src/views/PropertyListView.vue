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
