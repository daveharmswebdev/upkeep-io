import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { LeaseWithDetails } from '@domain/entities';
import type { CreateLeaseInput } from '@validators/lease';
import api from '@/api/client';

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
      error.value = err.response?.data?.error || 'Failed to fetch leases';
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
      error.value = err.response?.data?.error || 'Failed to create lease';
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
      error.value = err.response?.data?.error || 'Failed to fetch lease';
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
  };
});
