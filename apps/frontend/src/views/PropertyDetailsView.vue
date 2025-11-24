<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900">
    <!-- Header -->
    <header class="bg-white dark:bg-gray-800 px-8 py-6 shadow-md dark:border-b dark:border-gray-700">
      <div class="max-w-4xl mx-auto flex justify-between items-center">
        <div>
          <button
            @click="handleBackToList"
            class="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 flex items-center gap-2 mb-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Properties
          </button>
          <h1 class="text-2xl font-heading font-bold text-gray-800 dark:text-gray-100">Property Details</h1>
        </div>
      </div>
    </header>

    <main class="max-w-4xl mx-auto px-4 py-8">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-20">
        <div class="text-gray-600 dark:text-gray-400">Loading property details...</div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-primary-100 dark:bg-primary-900/30 text-primary-500 dark:text-primary-300 p-4 rounded dark:border dark:border-primary-700">
        {{ error }}
      </div>

      <!-- Property Not Found -->
      <div v-else-if="!property" class="text-center py-20">
        <div class="max-w-md mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow dark:border dark:border-gray-700">
          <h2 class="text-xl font-heading font-semibold text-gray-800 dark:text-gray-100 mb-4">Property Not Found</h2>
          <p class="text-gray-600 dark:text-gray-400 mb-6">The property you're looking for doesn't exist or you don't have access to it.</p>
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
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow dark:border dark:border-gray-700 p-8">
          <!-- Property Title Section -->
          <div class="mb-8">
            <h2 class="text-3xl font-heading font-bold text-gray-800 dark:text-gray-100 mb-2">
              {{ property.nickname || fullAddress }}
            </h2>
            <p v-if="property.nickname" class="text-lg text-gray-600 dark:text-gray-400">
              {{ fullAddress }}
            </p>
          </div>

          <!-- Location Section -->
          <div class="mb-8">
            <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">Location</h3>
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p class="text-lg text-gray-800 dark:text-gray-100">{{ fullAddress }}</p>
              <p class="text-gray-600 dark:text-gray-400">{{ property.city }}, {{ property.state }} {{ property.zipCode }}</p>
            </div>
          </div>

          <!-- Purchase Information Section -->
          <div v-if="property.purchasePrice || property.purchaseDate" class="mb-8">
            <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">Purchase Information</h3>
            <div class="grid md:grid-cols-2 gap-4">
              <div v-if="property.purchasePrice" class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Purchase Price</p>
                <p class="text-2xl font-semibold text-complement-500 dark:text-complement-400">${{ formatPrice(property.purchasePrice) }}</p>
              </div>
              <div v-if="property.purchaseDate" class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Purchase Date</p>
                <p class="text-xl font-medium text-gray-800 dark:text-gray-100">{{ formatDate(property.purchaseDate) }}</p>
              </div>
            </div>
          </div>

          <!-- Metadata Section -->
          <div class="border-t dark:border-gray-700 pt-6">
            <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">Record Information</h3>
            <div class="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-gray-600 dark:text-gray-400">Created:</span>
                <span class="ml-2 text-gray-800 dark:text-gray-100">{{ formatDateTime(property.createdAt) }}</span>
              </div>
              <div>
                <span class="text-gray-600 dark:text-gray-400">Last Updated:</span>
                <span class="ml-2 text-gray-800 dark:text-gray-100">{{ formatDateTime(property.updatedAt) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow dark:border dark:border-gray-700 p-6">
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
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow dark:border dark:border-gray-700 p-8">
          <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-4">Lease Information</h3>

          <!-- Loading Leases -->
          <div v-if="loading" class="text-center text-gray-600 dark:text-gray-400">
            Loading lease information...
          </div>

          <!-- Lease History Section (Collapsible) -->
          <div v-else-if="historicalLeases.length > 0" class="mb-6 border-b dark:border-gray-700 pb-6">
            <button
              @click="showHistory = !showHistory"
              class="flex items-center justify-between w-full text-left hover:bg-gray-50 dark:hover:bg-gray-700 p-3 rounded transition-colors"
            >
              <div class="flex items-center gap-2">
                <h4 class="text-md font-semibold text-gray-700 dark:text-gray-300">Lease History</h4>
                <span class="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-full font-medium">
                  {{ historicalLeases.length }}
                </span>
              </div>
              <svg
                class="w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform"
                :class="{ 'rotate-180': showHistory }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <!-- Historical Leases List -->
            <div v-if="showHistory" class="mt-4 space-y-3">
              <div
                v-for="lease in historicalLeases"
                :key="lease.id"
                class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
              >
                <div class="flex items-start justify-between mb-2">
                  <div>
                    <p class="text-sm font-medium text-gray-800 dark:text-gray-100">
                      {{ formatDate(lease.startDate) }}
                      <span v-if="lease.endDate"> - {{ formatDate(lease.endDate) }}</span>
                      <span v-else class="text-xs text-gray-600 dark:text-gray-400"> (Month-to-Month)</span>
                    </p>
                    <p v-if="lease.lessees && lease.lessees.length > 0" class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {{ lease.lessees.map(l => `${l.person.firstName} ${l.person.lastName}`).join(', ') }}
                    </p>
                  </div>
                  <span
                    class="px-2 py-1 text-xs font-medium rounded"
                    :class="{
                      'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300': lease.status === 'ENDED' || lease.status === 'VOIDED'
                    }"
                  >
                    {{ lease.status === 'ENDED' ? 'Ended' : lease.status === 'VOIDED' ? 'Voided' : lease.status }}
                  </span>
                </div>
                <p v-if="lease.voidedReason" class="text-xs text-gray-600 dark:text-gray-400 italic mt-2">
                  Void reason: {{ lease.voidedReason }}
                </p>
              </div>
            </div>
          </div>

          <!-- No Active Lease -->
          <div v-if="!activeLease" class="text-center py-6">
            <p class="text-gray-600 dark:text-gray-400 mb-4">No active lease for this property</p>
            <button
              @click="handleAddLease"
              class="px-6 py-3 bg-complement-300 text-white rounded font-medium hover:bg-complement-400 transition-colors"
            >
              Add Lease
            </button>
          </div>

          <!-- Active Lease Display -->
          <div v-else class="space-y-4">
            <!-- Lease Action Buttons -->
            <div class="flex flex-wrap gap-3 pb-4 border-b dark:border-gray-700">
              <button
                @click="handleEditLease"
                class="px-4 py-2 bg-secondary-1-300 text-white rounded font-medium hover:bg-secondary-1-400 transition-colors text-sm"
              >
                Edit Lease
              </button>
              <button
                @click="handleEndLease"
                class="px-4 py-2 bg-gray-500 text-white rounded font-medium hover:bg-gray-600 transition-colors text-sm"
              >
                End Lease
              </button>
              <button
                v-if="activeLease.status === 'ACTIVE'"
                @click="handleConvertToMonthToMonth"
                class="px-4 py-2 bg-secondary-2-300 text-white rounded font-medium hover:bg-secondary-2-400 transition-colors text-sm"
              >
                Convert to Month-to-Month
              </button>
              <button
                @click="handleVoidLease"
                class="px-4 py-2 bg-primary-300 text-white rounded font-medium hover:bg-primary-400 transition-colors text-sm"
              >
                Void Lease
              </button>
            </div>

            <div class="grid md:grid-cols-2 gap-4">
              <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Lease Term</p>
                <p class="text-lg font-medium text-gray-800 dark:text-gray-100">
                  {{ formatDate(activeLease.startDate) }}
                  <span v-if="activeLease.endDate"> - {{ formatDate(activeLease.endDate) }}</span>
                  <span v-else class="text-sm text-gray-600 dark:text-gray-400"> (Month-to-Month)</span>
                </p>
              </div>
              <div v-if="activeLease.monthlyRent" class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Monthly Rent</p>
                <p class="text-2xl font-semibold text-complement-500 dark:text-complement-400">${{ formatPrice(activeLease.monthlyRent) }}</p>
              </div>
              <div v-if="activeLease.securityDeposit" class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Security Deposit</p>
                <p class="text-xl font-medium text-gray-800 dark:text-gray-100">${{ formatPrice(activeLease.securityDeposit) }}</p>
              </div>
              <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
                <p class="text-lg font-medium text-gray-800 dark:text-gray-100">{{ activeLease.status }}</p>
              </div>
            </div>

            <!-- Lessees -->
            <div v-if="activeLease.lessees && activeLease.lessees.length > 0" class="border-t dark:border-gray-700 pt-4">
              <p class="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Lessees</p>
              <div class="space-y-2">
                <div v-for="lessee in activeLease.lessees" :key="lessee.id" class="bg-gray-50 dark:bg-gray-700 rounded p-3">
                  <p class="font-medium text-gray-800 dark:text-gray-100">
                    {{ lessee.person.firstName }} {{ lessee.person.lastName }}
                  </p>
                  <p class="text-sm text-gray-600 dark:text-gray-400">{{ lessee.person.email }} • {{ lessee.person.phone }}</p>
                  <p v-if="lessee.signedDate" class="text-xs text-gray-500 dark:text-gray-500">
                    Signed: {{ formatDate(lessee.signedDate) }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Notes -->
            <div v-if="activeLease.notes" class="border-t dark:border-gray-700 pt-4">
              <p class="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Notes</p>
              <p class="text-gray-700 dark:text-gray-300">{{ activeLease.notes }}</p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Delete Confirmation Modal -->
    <ConfirmModal
      v-if="showDeleteModal"
      title="Delete Property"
      :message="`Are you sure you want to delete ${fullAddress}?`"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />

    <!-- End Lease Confirmation Modal -->
    <ConfirmModal
      v-if="showEndLeaseModal"
      title="End Lease"
      message="Are you sure you want to mark this lease as ended? This action cannot be undone."
      @confirm="confirmEndLease"
      @cancel="cancelEndLease"
    />

    <!-- Convert to Month-to-Month Confirmation Modal -->
    <ConfirmModal
      v-if="showConvertModal"
      title="Convert to Month-to-Month"
      message="Are you sure you want to convert this lease to month-to-month? The end date will be removed."
      @confirm="confirmConvertToMonthToMonth"
      @cancel="cancelConvertToMonthToMonth"
    />

    <!-- Void Lease Modal -->
    <VoidLeaseModal
      v-if="showVoidModal"
      @confirm="confirmVoidLease"
      @cancel="cancelVoidLease"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { LeaseStatus } from '@domain/entities';
import { formatPrice, formatDate, formatDateTime } from '@/utils/formatters';
import { extractErrorMessage } from '@/utils/errorHandlers';
import { usePropertyDetails } from '@/composables/usePropertyDetails';
import { usePropertyStore } from '@/stores/property';
import { useLeaseStore } from '@/stores/lease';
import ConfirmModal from '@/components/ConfirmModal.vue';
import VoidLeaseModal from '@/components/VoidLeaseModal.vue';

const route = useRoute();
const router = useRouter();
const toast = useToast();

// Use property details composable
const propertyId = computed(() => route.params.id as string);
const { property, activeLease, historicalLeases, loading, error, fetchData } = usePropertyDetails(propertyId);

// Use property store for delete operation
const propertyStore = usePropertyStore();
const leaseStore = useLeaseStore();

// Modal state
const showDeleteModal = ref(false);
const showEndLeaseModal = ref(false);
const showConvertModal = ref(false);
const showVoidModal = ref(false);

// Lease history state
const showHistory = ref(false);

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
  showDeleteModal.value = true;
};

const confirmDelete = async () => {
  try {
    await propertyStore.deleteProperty(route.params.id as string);
    toast.success('Property deleted successfully');
    router.push('/properties');
  } catch (err: any) {
    error.value = extractErrorMessage(err, 'Failed to delete property');
    toast.error(error.value);
  } finally {
    showDeleteModal.value = false;
  }
};

const cancelDelete = () => {
  showDeleteModal.value = false;
};

const handleAddLease = () => {
  router.push(`/properties/${route.params.id}/leases/add`);
};

// Lease action handlers
const handleEditLease = () => {
  if (activeLease.value) {
    router.push(`/properties/${route.params.id}/leases/${activeLease.value.id}/edit`);
  }
};

const handleEndLease = () => {
  showEndLeaseModal.value = true;
};

const confirmEndLease = async () => {
  if (!activeLease.value) return;

  try {
    await leaseStore.updateLeaseStatus(activeLease.value.id, LeaseStatus.ENDED);
    toast.success('Lease ended successfully');
    await fetchData(); // Refresh data
  } catch (err: any) {
    error.value = extractErrorMessage(err, 'Failed to end lease');
    toast.error(error.value);
  } finally {
    showEndLeaseModal.value = false;
  }
};

const cancelEndLease = () => {
  showEndLeaseModal.value = false;
};

const handleConvertToMonthToMonth = () => {
  showConvertModal.value = true;
};

const confirmConvertToMonthToMonth = async () => {
  if (!activeLease.value) return;

  try {
    await leaseStore.updateLeaseStatus(activeLease.value.id, LeaseStatus.MONTH_TO_MONTH);
    toast.success('Lease converted to month-to-month successfully');
    await fetchData(); // Refresh data
  } catch (err: any) {
    error.value = extractErrorMessage(err, 'Failed to convert lease');
    toast.error(error.value);
  } finally {
    showConvertModal.value = false;
  }
};

const cancelConvertToMonthToMonth = () => {
  showConvertModal.value = false;
};

const handleVoidLease = () => {
  showVoidModal.value = true;
};

const confirmVoidLease = async (reason?: string) => {
  if (!activeLease.value) return;

  try {
    await leaseStore.updateLeaseStatus(activeLease.value.id, LeaseStatus.VOIDED, reason);
    toast.success('Lease voided successfully');
    await fetchData(); // Refresh data
  } catch (err: any) {
    error.value = extractErrorMessage(err, 'Failed to void lease');
    toast.error(error.value);
  } finally {
    showVoidModal.value = false;
  }
};

const cancelVoidLease = () => {
  showVoidModal.value = false;
};
</script>