import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';
import { usePropertyDetails } from '../usePropertyDetails';
import { LeaseStatus } from '@domain/entities';

// Mock dependencies
vi.mock('@/stores/property', () => ({
  usePropertyStore: vi.fn()
}));

vi.mock('@/stores/lease', () => ({
  useLeaseStore: vi.fn()
}));

vi.mock('@/utils/errorHandlers', () => ({
  extractErrorMessage: vi.fn((err, fallback) => {
    if (err.message) {
      return err.message;
    }
    return fallback;
  })
}));

import { usePropertyStore } from '@/stores/property';
import { useLeaseStore } from '@/stores/lease';
import { extractErrorMessage } from '@/utils/errorHandlers';

describe('usePropertyDetails', () => {
  let mockPropertyStore: any;
  let mockLeaseStore: any;

  beforeEach(() => {
    mockPropertyStore = {
      currentProperty: null,
      fetchPropertyById: vi.fn().mockResolvedValue(undefined)
    };

    mockLeaseStore = {
      leases: [],
      fetchLeasesByProperty: vi.fn().mockResolvedValue(undefined)
    };

    vi.mocked(usePropertyStore).mockReturnValue(mockPropertyStore);
    vi.mocked(useLeaseStore).mockReturnValue(mockLeaseStore);
  });

  describe('fetchData', () => {
    it('should set loading to true during fetch', async () => {
      const propertyId = ref('property-123');
      const { loading, fetchData } = usePropertyDetails(propertyId);

      const fetchPromise = fetchData();
      expect(loading.value).toBe(true);

      await fetchPromise;
    });

    it('should set loading to false after successful fetch', async () => {
      const propertyId = ref('property-123');
      const { loading, fetchData } = usePropertyDetails(propertyId);

      await fetchData();

      expect(loading.value).toBe(false);
    });

    it('should set loading to false after failed fetch', async () => {
      const propertyId = ref('property-123');
      mockPropertyStore.fetchPropertyById.mockRejectedValue(new Error('Failed'));

      const { loading, fetchData } = usePropertyDetails(propertyId);

      try {
        await fetchData();
      } catch {
        // Expected to throw
      }

      expect(loading.value).toBe(false);
    });

    it('should clear error on new fetch', async () => {
      const propertyId = ref('property-123');
      const { error, fetchData } = usePropertyDetails(propertyId);

      // First fetch - set error
      mockPropertyStore.fetchPropertyById.mockRejectedValueOnce(new Error('Failed'));
      try {
        await fetchData();
      } catch {
        // Expected to throw
      }
      expect(error.value).toBeTruthy();

      // Second fetch - should clear error
      mockPropertyStore.fetchPropertyById.mockResolvedValueOnce(undefined);
      await fetchData();

      expect(error.value).toBe('');
    });

    it('should fetch property by ID', async () => {
      const propertyId = ref('property-123');
      const { fetchData } = usePropertyDetails(propertyId);

      await fetchData();

      expect(mockPropertyStore.fetchPropertyById).toHaveBeenCalledWith('property-123');
    });

    it('should fetch leases by property ID', async () => {
      const propertyId = ref('property-123');
      const { fetchData } = usePropertyDetails(propertyId);

      await fetchData();

      expect(mockLeaseStore.fetchLeasesByProperty).toHaveBeenCalledWith('property-123');
    });

    it('should fetch property and leases in parallel', async () => {
      const propertyId = ref('property-123');
      const { fetchData } = usePropertyDetails(propertyId);

      await fetchData();

      expect(mockPropertyStore.fetchPropertyById).toHaveBeenCalled();
      expect(mockLeaseStore.fetchLeasesByProperty).toHaveBeenCalled();
    });

    it('should set error if property ID is missing', async () => {
      const propertyId = ref('');
      const { error, fetchData } = usePropertyDetails(propertyId);

      await fetchData();

      expect(error.value).toBe('Property ID is required');
      expect(mockPropertyStore.fetchPropertyById).not.toHaveBeenCalled();
      expect(mockLeaseStore.fetchLeasesByProperty).not.toHaveBeenCalled();
    });

    it('should set error on fetch failure', async () => {
      const propertyId = ref('property-123');
      mockPropertyStore.fetchPropertyById.mockRejectedValue(new Error('Network error'));

      const { error, fetchData } = usePropertyDetails(propertyId);

      try {
        await fetchData();
      } catch {
        // Expected to throw
      }

      // The mock extracts the error message from err.message if present
      expect(error.value).toBe('Network error');
      expect(extractErrorMessage).toHaveBeenCalled();
    });

    it('should extract custom error message', async () => {
      const propertyId = ref('property-123');
      mockPropertyStore.fetchPropertyById.mockRejectedValue(new Error('Custom error'));

      const { error, fetchData } = usePropertyDetails(propertyId);

      try {
        await fetchData();
      } catch {
        // Expected to throw
      }

      expect(error.value).toBe('Custom error');
    });

    it('should re-throw error for caller to handle', async () => {
      const propertyId = ref('property-123');
      const fetchError = new Error('Fetch failed');
      mockPropertyStore.fetchPropertyById.mockRejectedValue(fetchError);

      const { fetchData } = usePropertyDetails(propertyId);

      await expect(fetchData()).rejects.toThrow('Fetch failed');
    });
  });

  describe('computed properties', () => {
    it('should return current property from store', () => {
      const propertyId = ref('property-123');
      const mockProperty = { id: 'property-123', address: '123 Main St' };
      mockPropertyStore.currentProperty = mockProperty;

      const { property } = usePropertyDetails(propertyId);

      expect(property.value).toEqual(mockProperty);
    });

    it('should return null when no current property', () => {
      const propertyId = ref('property-123');
      mockPropertyStore.currentProperty = null;

      const { property } = usePropertyDetails(propertyId);

      expect(property.value).toBeNull();
    });

    it('should return all leases from store', () => {
      const propertyId = ref('property-123');
      const mockLeases = [
        { id: 'lease-1', status: LeaseStatus.ACTIVE },
        { id: 'lease-2', status: LeaseStatus.MONTH_TO_MONTH }
      ];
      mockLeaseStore.leases = mockLeases;

      const { leases } = usePropertyDetails(propertyId);

      expect(leases.value).toEqual(mockLeases);
    });

    it('should return empty array when no leases', () => {
      const propertyId = ref('property-123');
      mockLeaseStore.leases = [];

      const { leases } = usePropertyDetails(propertyId);

      expect(leases.value).toEqual([]);
    });

    it('should return active lease when one exists', () => {
      const propertyId = ref('property-123');
      const activeLease = { id: 'lease-1', status: LeaseStatus.ACTIVE };
      const endedLease = { id: 'lease-2', status: LeaseStatus.ENDED };
      mockLeaseStore.leases = [activeLease, endedLease];

      const { activeLease: activeLeaseComputed } = usePropertyDetails(propertyId);

      expect(activeLeaseComputed.value).toEqual(activeLease);
    });

    it('should return undefined when no active lease', () => {
      const propertyId = ref('property-123');
      mockLeaseStore.leases = [
        { id: 'lease-1', status: LeaseStatus.ENDED },
        { id: 'lease-2', status: LeaseStatus.VOIDED }
      ];

      const { activeLease } = usePropertyDetails(propertyId);

      expect(activeLease.value).toBeUndefined();
    });

    it('should return historical leases (non-active)', () => {
      const propertyId = ref('property-123');
      const lease1 = { id: 'lease-1', status: LeaseStatus.ACTIVE };
      const lease2 = { id: 'lease-2', status: LeaseStatus.ENDED };
      const lease3 = { id: 'lease-3', status: LeaseStatus.VOIDED };
      mockLeaseStore.leases = [lease1, lease2, lease3];

      const { historicalLeases } = usePropertyDetails(propertyId);

      expect(historicalLeases.value).toEqual([lease2, lease3]);
    });

    it('should return empty array when all leases are active', () => {
      const propertyId = ref('property-123');
      mockLeaseStore.leases = [
        { id: 'lease-1', status: LeaseStatus.ACTIVE }
      ];

      const { historicalLeases } = usePropertyDetails(propertyId);

      expect(historicalLeases.value).toEqual([]);
    });

    it('should return all leases as historical when none are active', () => {
      const propertyId = ref('property-123');
      const leases = [
        { id: 'lease-1', status: LeaseStatus.ENDED },
        { id: 'lease-2', status: LeaseStatus.VOIDED }
      ];
      mockLeaseStore.leases = leases;

      const { historicalLeases } = usePropertyDetails(propertyId);

      expect(historicalLeases.value).toEqual(leases);
    });

    it('should return MONTH_TO_MONTH lease as active', () => {
      const propertyId = ref('property-123');
      const monthToMonthLease = { id: 'lease-1', status: LeaseStatus.MONTH_TO_MONTH };
      const endedLease = { id: 'lease-2', status: LeaseStatus.ENDED };
      mockLeaseStore.leases = [monthToMonthLease, endedLease];

      const { activeLease } = usePropertyDetails(propertyId);

      expect(activeLease.value).toEqual(monthToMonthLease);
    });

    it('should exclude MONTH_TO_MONTH leases from historical leases', () => {
      const propertyId = ref('property-123');
      const activeLease = { id: 'lease-1', status: LeaseStatus.ACTIVE };
      const monthToMonthLease = { id: 'lease-2', status: LeaseStatus.MONTH_TO_MONTH };
      const endedLease = { id: 'lease-3', status: LeaseStatus.ENDED };
      mockLeaseStore.leases = [activeLease, monthToMonthLease, endedLease];

      const { historicalLeases } = usePropertyDetails(propertyId);

      expect(historicalLeases.value).toEqual([endedLease]);
    });

    it('should return first active lease when both ACTIVE and MONTH_TO_MONTH exist', () => {
      const propertyId = ref('property-123');
      const activeLease = { id: 'lease-1', status: LeaseStatus.ACTIVE };
      const monthToMonthLease = { id: 'lease-2', status: LeaseStatus.MONTH_TO_MONTH };
      mockLeaseStore.leases = [activeLease, monthToMonthLease];

      const { activeLease: activeLeaseComputed } = usePropertyDetails(propertyId);

      // Should return the first one found (ACTIVE)
      expect(activeLeaseComputed.value).toEqual(activeLease);
    });
  });

  describe('reactive propertyId', () => {
    it('should use updated propertyId when changed', async () => {
      const propertyId = ref('property-123');
      const { fetchData } = usePropertyDetails(propertyId);

      await fetchData();
      expect(mockPropertyStore.fetchPropertyById).toHaveBeenCalledWith('property-123');

      // Change property ID
      propertyId.value = 'property-456';
      await fetchData();

      expect(mockPropertyStore.fetchPropertyById).toHaveBeenCalledWith('property-456');
    });
  });
});
