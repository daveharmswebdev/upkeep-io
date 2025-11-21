<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <header class="bg-white px-8 py-6 shadow-md">
      <div class="max-w-4xl mx-auto flex justify-between items-center">
        <div>
          <button
            @click="handleBackToList"
            class="text-gray-600 hover:text-gray-800 flex items-center gap-2 mb-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Properties
          </button>
          <h1 class="text-2xl font-heading font-bold text-gray-800">Property Details</h1>
        </div>
      </div>
    </header>

    <main class="max-w-4xl mx-auto px-4 py-8">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-20">
        <div class="text-gray-600">Loading property details...</div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-primary-100 text-primary-500 p-4 rounded">
        {{ error }}
      </div>

      <!-- Property Not Found -->
      <div v-else-if="!property" class="text-center py-20">
        <div class="max-w-md mx-auto bg-white p-8 rounded-lg shadow">
          <h2 class="text-xl font-heading font-semibold text-gray-800 mb-4">Property Not Found</h2>
          <p class="text-gray-600 mb-6">The property you're looking for doesn't exist or you don't have access to it.</p>
          <button
            @click="handleBackToList"
            class="px-6 py-3 bg-complement-300 text-white rounded font-medium hover:bg-complement-400 transition-colors"
          >
            Back to Properties
          </button>
        </div>
      </div>

      <!-- Property Details -->
      <div v-else class="space-y-6">
        <!-- Main Property Card -->
        <div class="bg-white rounded-lg shadow p-8">
          <!-- Property Title Section -->
          <div class="mb-8">
            <h2 class="text-3xl font-heading font-bold text-gray-800 mb-2">
              {{ property.nickname || fullAddress }}
            </h2>
            <p v-if="property.nickname" class="text-lg text-gray-600">
              {{ fullAddress }}
            </p>
          </div>

          <!-- Location Section -->
          <div class="mb-8">
            <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">Location</h3>
            <div class="bg-gray-50 rounded-lg p-4">
              <p class="text-lg text-gray-800">{{ fullAddress }}</p>
              <p class="text-gray-600">{{ property.city }}, {{ property.state }} {{ property.zipCode }}</p>
            </div>
          </div>

          <!-- Purchase Information Section -->
          <div v-if="property.purchasePrice || property.purchaseDate" class="mb-8">
            <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">Purchase Information</h3>
            <div class="grid md:grid-cols-2 gap-4">
              <div v-if="property.purchasePrice" class="bg-gray-50 rounded-lg p-4">
                <p class="text-sm text-gray-600 mb-1">Purchase Price</p>
                <p class="text-2xl font-semibold text-complement-500">${{ formatPrice(property.purchasePrice) }}</p>
              </div>
              <div v-if="property.purchaseDate" class="bg-gray-50 rounded-lg p-4">
                <p class="text-sm text-gray-600 mb-1">Purchase Date</p>
                <p class="text-xl font-medium text-gray-800">{{ formatDate(property.purchaseDate) }}</p>
              </div>
            </div>
          </div>

          <!-- Metadata Section -->
          <div class="border-t pt-6">
            <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">Record Information</h3>
            <div class="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-gray-600">Created:</span>
                <span class="ml-2 text-gray-800">{{ formatDateTime(property.createdAt) }}</span>
              </div>
              <div>
                <span class="text-gray-600">Last Updated:</span>
                <span class="ml-2 text-gray-800">{{ formatDateTime(property.updatedAt) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex gap-4">
            <button
              @click="handleEdit"
              class="flex-1 px-6 py-3 bg-secondary-1-300 text-white rounded font-medium hover:bg-secondary-1-400 transition-colors"
            >
              Edit Property
            </button>
            <button
              @click="handleDelete"
              class="px-6 py-3 bg-primary-300 text-white rounded font-medium hover:bg-primary-400 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>

        <!-- Lease Information Section -->
        <div class="bg-white rounded-lg shadow p-8">
          <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-4">Lease Information</h3>

          <!-- Loading Leases -->
          <div v-if="loading" class="text-center text-gray-600">
            Loading lease information...
          </div>

          <!-- No Active Lease -->
          <div v-else-if="!activeLease" class="text-center py-6">
            <p class="text-gray-600 mb-4">No active lease for this property</p>
            <button
              @click="handleAddLease"
              class="px-6 py-3 bg-complement-300 text-white rounded font-medium hover:bg-complement-400 transition-colors"
            >
              Add Lease
            </button>
          </div>

          <!-- Active Lease Display -->
          <div v-else class="space-y-4">
            <div class="grid md:grid-cols-2 gap-4">
              <div class="bg-gray-50 rounded-lg p-4">
                <p class="text-sm text-gray-600 mb-1">Lease Term</p>
                <p class="text-lg font-medium text-gray-800">
                  {{ formatDate(activeLease.startDate) }}
                  <span v-if="activeLease.endDate"> - {{ formatDate(activeLease.endDate) }}</span>
                  <span v-else class="text-sm text-gray-600"> (Month-to-Month)</span>
                </p>
              </div>
              <div v-if="activeLease.monthlyRent" class="bg-gray-50 rounded-lg p-4">
                <p class="text-sm text-gray-600 mb-1">Monthly Rent</p>
                <p class="text-2xl font-semibold text-complement-500">${{ formatPrice(activeLease.monthlyRent) }}</p>
              </div>
              <div v-if="activeLease.securityDeposit" class="bg-gray-50 rounded-lg p-4">
                <p class="text-sm text-gray-600 mb-1">Security Deposit</p>
                <p class="text-xl font-medium text-gray-800">${{ formatPrice(activeLease.securityDeposit) }}</p>
              </div>
              <div class="bg-gray-50 rounded-lg p-4">
                <p class="text-sm text-gray-600 mb-1">Status</p>
                <p class="text-lg font-medium text-gray-800">{{ activeLease.status }}</p>
              </div>
            </div>

            <!-- Lessees -->
            <div v-if="activeLease.lessees && activeLease.lessees.length > 0" class="border-t pt-4">
              <p class="text-sm font-semibold text-gray-600 mb-2">Lessees</p>
              <div class="space-y-2">
                <div v-for="lessee in activeLease.lessees" :key="lessee.id" class="bg-gray-50 rounded p-3">
                  <p class="font-medium text-gray-800">
                    {{ lessee.person.firstName }} {{ lessee.person.lastName }}
                  </p>
                  <p class="text-sm text-gray-600">{{ lessee.person.email }} • {{ lessee.person.phone }}</p>
                  <p v-if="lessee.signedDate" class="text-xs text-gray-500">
                    Signed: {{ formatDate(lessee.signedDate) }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Notes -->
            <div v-if="activeLease.notes" class="border-t pt-4">
              <p class="text-sm font-semibold text-gray-600 mb-2">Notes</p>
              <p class="text-gray-700">{{ activeLease.notes }}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { formatPrice, formatDate, formatDateTime } from '@/utils/formatters';
import { usePropertyDetails } from '@/composables/usePropertyDetails';

const route = useRoute();
const router = useRouter();
const toast = useToast();

// Use property details composable
const propertyId = computed(() => route.params.id as string);
const { property, activeLease, loading, error, fetchData } = usePropertyDetails(propertyId);

// Compute full address from street and address2
const fullAddress = computed(() => {
  if (!property.value) return '';
  const parts = [property.value.street];
  if (property.value.address2) {
    parts.push(property.value.address2);
  }
  return parts.join(' ');
});

// Fetch property and leases on component mount
onMounted(fetchData);

// Navigation handlers
const handleBackToList = () => {
  router.push('/properties');
};

const handleEdit = () => {
  router.push(`/properties/${route.params.id}/edit`);
};

const handleDelete = () => {
  // For future implementation - will show confirmation modal
  toast.warning('Delete functionality coming soon!');
  // In future: Show confirmation modal, then call propertyStore.deleteProperty(route.params.id)
};

const handleAddLease = () => {
  router.push(`/properties/${route.params.id}/leases/add`);
};
</script>