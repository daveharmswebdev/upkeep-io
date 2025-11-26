import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { LeaseWithDetails, LeaseStatus } from '@domain/entities';
import type { CreateLeaseInput, UpdateLeaseInput, AddLesseeInput, AddOccupantInput } from '@validators/lease';
import api from '@/api/client';
import { extractErrorMessage } from '@/utils/errorHandlers';

export const useLeaseStore = defineStore('lease', () => {
  const leases = ref<LeaseWithDetails[]>([]);
  const currentLease = ref<LeaseWithDetails | null>(null);
  const loading = ref(false);
  const error = ref('');

  async function fetchLeasesByProperty(propertyId: string) {
    loading.value = true;
    error.value = '';
    try {
      const response = await api.get<LeaseWithDetails[]>(`/leases/property/${propertyId}`);
      leases.value = response.data;
      return response.data;
    } catch (err: any) {
      error.value = extractErrorMessage(err, 'Failed to fetch leases');
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function createLease(data: CreateLeaseInput) {
    loading.value = true;
    error.value = '';
    try {
      const response = await api.post<LeaseWithDetails>('/leases', data);
      leases.value.push(response.data);
      return response.data;
    } catch (err: any) {
      error.value = extractErrorMessage(err, 'Failed to create lease');
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchLeaseById(id: string) {
    loading.value = true;
    error.value = '';
    try {
      const response = await api.get<LeaseWithDetails>(`/leases/${id}`);
      currentLease.value = response.data;
      return response.data;
    } catch (err: any) {
      error.value = extractErrorMessage(err, 'Failed to fetch lease');
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateLease(id: string, data: UpdateLeaseInput): Promise<LeaseWithDetails> {
    loading.value = true;
    error.value = '';
    try {
      const response = await api.put<LeaseWithDetails>(`/leases/${id}`, data);

      // Update lease in leases array if found
      const index = leases.value.findIndex(lease => lease.id === id);
      if (index !== -1) {
        leases.value[index] = response.data;
      }

      // Update currentLease if it matches
      if (currentLease.value?.id === id) {
        currentLease.value = response.data;
      }

      return response.data;
    } catch (err: any) {
      error.value = extractErrorMessage(err, 'Failed to update lease');
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateLeaseStatus(
    id: string,
    status: LeaseStatus,
    voidedReason?: string
  ): Promise<LeaseWithDetails> {
    loading.value = true;
    error.value = '';
    try {
      const payload: UpdateLeaseInput = { status };

      // Add voidedReason if status is VOIDED
      if (status === 'VOIDED' && voidedReason) {
        payload.voidedReason = voidedReason;
      }

      // Clear endDate if converting to MONTH_TO_MONTH
      if (status === 'MONTH_TO_MONTH') {
        payload.endDate = null;
      }

      const response = await api.put<LeaseWithDetails>(`/leases/${id}`, payload);

      // Update lease in leases array if found
      const index = leases.value.findIndex(lease => lease.id === id);
      if (index !== -1) {
        leases.value[index] = response.data;
      }

      // Update currentLease if it matches
      if (currentLease.value?.id === id) {
        currentLease.value = response.data;
      }

      return response.data;
    } catch (err: any) {
      error.value = extractErrorMessage(err, 'Failed to update lease status');
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function addLesseeToLease(leaseId: string, input: AddLesseeInput): Promise<{ newLeaseId: string }> {
    loading.value = true;
    error.value = '';
    try {
      const response = await api.post<{ newLeaseId: string }>(`/leases/${leaseId}/lessees`, input);

      // Remove old lease from array if present
      const oldIndex = leases.value.findIndex(lease => lease.id === leaseId);
      if (oldIndex !== -1) {
        leases.value.splice(oldIndex, 1);
      }

      return response.data;
    } catch (err: any) {
      error.value = extractErrorMessage(err, 'Failed to add lessee');
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function removeLesseeFromLease(
    leaseId: string,
    personId: string,
    input: { voidedReason: string; newLeaseData: any }
  ): Promise<{ newLeaseId: string }> {
    loading.value = true;
    error.value = '';
    try {
      const response = await api.delete<{ newLeaseId: string }>(`/leases/${leaseId}/lessees/${personId}`, {
        data: input
      });

      // Remove old lease from array if present
      const oldIndex = leases.value.findIndex(lease => lease.id === leaseId);
      if (oldIndex !== -1) {
        leases.value.splice(oldIndex, 1);
      }

      return response.data;
    } catch (err: any) {
      error.value = extractErrorMessage(err, 'Failed to remove lessee');
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function addOccupantToLease(leaseId: string, data: AddOccupantInput): Promise<LeaseWithDetails> {
    loading.value = true;
    error.value = '';
    try {
      const response = await api.post<LeaseWithDetails>(`/leases/${leaseId}/occupants`, data);

      // Update currentLease if it matches
      if (currentLease.value?.id === leaseId) {
        currentLease.value = response.data;
      }

      // Update lease in leases array if found
      const index = leases.value.findIndex(lease => lease.id === leaseId);
      if (index !== -1) {
        leases.value[index] = response.data;
      }

      return response.data;
    } catch (err: any) {
      error.value = extractErrorMessage(err, 'Failed to add occupant');
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function removeOccupantFromLease(leaseId: string, occupantId: string): Promise<LeaseWithDetails> {
    loading.value = true;
    error.value = '';
    try {
      const response = await api.delete<LeaseWithDetails>(`/leases/${leaseId}/occupants/${occupantId}`);

      // Update currentLease if it matches
      if (currentLease.value?.id === leaseId) {
        currentLease.value = response.data;
      }

      // Update lease in leases array if found
      const index = leases.value.findIndex(lease => lease.id === leaseId);
      if (index !== -1) {
        leases.value[index] = response.data;
      }

      return response.data;
    } catch (err: any) {
      error.value = extractErrorMessage(err, 'Failed to remove occupant');
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    leases,
    currentLease,
    loading,
    error,
    fetchLeasesByProperty,
    createLease,
    fetchLeaseById,
    updateLease,
    updateLeaseStatus,
    addLesseeToLease,
    removeLesseeFromLease,
    addOccupantToLease,
    removeOccupantFromLease,
  };
});
