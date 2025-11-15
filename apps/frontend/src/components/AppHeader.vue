<template>
  <header class="bg-primary-500 text-white shadow-md">
    <div class="container mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <!-- Logo/Brand -->
        <div class="text-2xl font-heading font-bold">
          <RouterLink to="/" class="hover:text-primary-100 transition-colors">
            Upkeep
          </RouterLink>
        </div>

        <!-- Navigation - only show if authenticated -->
        <nav v-if="isAuthenticated" class="flex items-center gap-6">
          <RouterLink
            to="/dashboard"
            class="hover:text-primary-100 transition-colors font-medium"
            active-class="text-primary-100 border-b-2 border-primary-100"
          >
            Dashboard
          </RouterLink>
          <RouterLink
            to="/properties"
            class="hover:text-primary-100 transition-colors font-medium"
            active-class="text-primary-100 border-b-2 border-primary-100"
          >
            Properties
          </RouterLink>
          <RouterLink
            to="/tenants"
            class="hover:text-primary-100 transition-colors font-medium"
            active-class="text-primary-100 border-b-2 border-primary-100"
          >
            Tenants
          </RouterLink>

          <!-- User menu -->
          <div class="flex items-center gap-4 ml-4 pl-4 border-l border-primary-300">
            <span class="text-sm">{{ user?.name }}</span>
            <button
              @click="handleLogout"
              class="bg-primary-400 hover:bg-primary-600 px-4 py-2 rounded-md transition-colors font-medium"
            >
              Logout
            </button>
          </div>
        </nav>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'vue-toastification';

const authStore = useAuthStore();
const router = useRouter();
const toast = useToast();

const isAuthenticated = computed(() => authStore.isAuthenticated);
const user = computed(() => authStore.user);

const handleLogout = () => {
  authStore.logout();
  toast.success('Logged out successfully');
  router.push('/login');
};
</script>
