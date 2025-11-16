import { ref, computed, type Ref } from 'vue';
import { usePropertyStore } from '@/stores/property';
import { useLeaseStore } from '@/stores/lease';
import { LeaseStatus } from '@domain/entities';
import { extractErrorMessage } from '@/utils/errorHandlers';

/**
 * Composable for property details page
 * Handles fetching property and related leases, provides computed properties
 */
export function usePropertyDetails(propertyId: Ref<string>) {
  const propertyStore = usePropertyStore();
  const leaseStore = useLeaseStore();

  const loading = ref(false);
  const error = ref('');

  /**
   * Fetch property and all related data
   */
  const fetchData = async () => {
    if (!propertyId.value) {
      error.value = 'Property ID is required';
      return;
    }

    loading.value = true;
    error.value = '';

    try {
      await Promise.all([
        propertyStore.fetchPropertyById(propertyId.value),
        leaseStore.fetchLeasesByProperty(propertyId.value)
      ]);
    } catch (err: any) {
      error.value = extractErrorMessage(err, 'Failed to fetch property details');
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Computed property for the current property
   */
  const property = computed(() => propertyStore.currentProperty);

  /**
   * Computed property for all leases
   */
  const leases = computed(() => leaseStore.leases);

  /**
   * Computed property for the active lease (if any)
   */
  const activeLease = computed(() =>
    leaseStore.leases.find(lease => lease.status === LeaseStatus.ACTIVE)
  );

  /**
   * Computed property for historical leases
   */
  const historicalLeases = computed(() =>
    leaseStore.leases.filter(lease => lease.status !== LeaseStatus.ACTIVE)
  );

  return {
    // Data
    property,
    leases,
    activeLease,
    historicalLeases,

    // State
    loading,
    error,

    // Actions
    fetchData
  };
}
