import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Property, CreatePropertyData } from '@domain/entities';
import api from '@/api/client';
import { extractErrorMessage } from '@/utils/errorHandlers';

export const usePropertyStore = defineStore('property', () => {
  const properties = ref<Property[]>([]);
  const currentProperty = ref<Property | null>(null);
  const loading = ref(false);
  const error = ref('');

  async function fetchProperties() {
    loading.value = true;
    error.value = '';
    try {
      const response = await api.get<Property[]>('/properties');
      properties.value = response.data;
    } catch (err: any) {
      error.value = extractErrorMessage(err, 'Failed to fetch properties');
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function createProperty(data: Omit<CreatePropertyData, 'userId'>) {
    loading.value = true;
    error.value = '';
    try {
      const response = await api.post<Property>('/properties', data);
      properties.value.push(response.data);
      return response.data;
    } catch (err: any) {
      error.value = extractErrorMessage(err, 'Failed to create property');
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchPropertyById(id: string) {
    loading.value = true;
    error.value = '';
    try {
      const response = await api.get<Property>(`/properties/${id}`);
      currentProperty.value = response.data;
      return response.data;
    } catch (err: any) {
      error.value = extractErrorMessage(err, 'Failed to fetch property');
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateProperty(id: string, data: Partial<Omit<CreatePropertyData, 'userId'>>) {
    loading.value = true;
    error.value = '';
    try {
      const response = await api.put<Property>(`/properties/${id}`, data);
      const index = properties.value.findIndex((p) => p.id === id);
      if (index !== -1) {
        properties.value[index] = response.data;
      }
      if (currentProperty.value?.id === id) {
        currentProperty.value = response.data;
      }
      return response.data;
    } catch (err: any) {
      error.value = extractErrorMessage(err, 'Failed to update property');
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteProperty(id: string) {
    loading.value = true;
    error.value = '';
    try {
      await api.delete(`/properties/${id}`);
      properties.value = properties.value.filter((p) => p.id !== id);
      if (currentProperty.value?.id === id) {
        currentProperty.value = null;
      }
    } catch (err: any) {
      error.value = extractErrorMessage(err, 'Failed to delete property');
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    properties,
    currentProperty,
    loading,
    error,
    fetchProperties,
    createProperty,
    fetchPropertyById,
    updateProperty,
    deleteProperty,
  };
});
