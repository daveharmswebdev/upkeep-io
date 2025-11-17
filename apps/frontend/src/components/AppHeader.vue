<template>
  <header class="bg-primary-500 text-white shadow-md">
    <div class="container mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <!-- Logo/Brand -->
        <div class="text-2xl font-heading font-bold">
          <RouterLink
            to="/"
            aria-label="Upkeep Home"
            class="hover:text-primary-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-100 focus:ring-offset-2 focus:ring-offset-primary-500 rounded"
          >
            Upkeep
          </RouterLink>
        </div>

        <!-- Mobile menu button - only show if authenticated -->
        <button
          v-if="isAuthenticated"
          @click="mobileMenuOpen = !mobileMenuOpen"
          :aria-expanded="mobileMenuOpen"
          aria-label="Toggle navigation menu"
          class="md:hidden p-3 hover:text-primary-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-100 focus:ring-offset-2 focus:ring-offset-primary-500 rounded"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              v-if="!mobileMenuOpen"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
            <path
              v-else
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <!-- Desktop Navigation - only show if authenticated -->
        <nav v-if="isAuthenticated" class="hidden md:flex items-center gap-6">
          <RouterLink
            to="/dashboard"
            class="hover:text-primary-100 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-primary-100 focus:ring-offset-2 focus:ring-offset-primary-500 rounded flex items-center gap-2"
            active-class="text-primary-100 border-b-2 border-primary-100"
          >
            <svg class="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Dashboard
          </RouterLink>
          <RouterLink
            to="/properties"
            class="hover:text-primary-100 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-primary-100 focus:ring-offset-2 focus:ring-offset-primary-500 rounded flex items-center gap-2"
            active-class="text-primary-100 border-b-2 border-primary-100"
          >
            <svg class="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Properties
          </RouterLink>
          <RouterLink
            to="/tenants"
            class="hover:text-primary-100 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-primary-100 focus:ring-offset-2 focus:ring-offset-primary-500 rounded flex items-center gap-2"
            active-class="text-primary-100 border-b-2 border-primary-100"
          >
            <svg class="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Tenants
          </RouterLink>

          <!-- User menu -->
          <div class="flex items-center gap-4 ml-4 pl-4 border-l border-primary-300">
            <span class="text-sm">{{ user?.name }}</span>
            <button
              @click="handleLogout"
              class="bg-primary-400 hover:bg-primary-600 px-4 py-2 rounded-md transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-primary-100 focus:ring-offset-2 focus:ring-offset-primary-500 flex items-center gap-2"
            >
              <svg class="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </nav>
      </div>

      <!-- Mobile Navigation - only show if authenticated and menu is open -->
      <nav
        v-if="isAuthenticated && mobileMenuOpen"
        class="md:hidden mt-4 pt-4 border-t border-primary-300 space-y-2"
      >
        <RouterLink
          to="/dashboard"
          @click="mobileMenuOpen = false"
          class="block py-3 px-3 hover:bg-primary-400 rounded transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-primary-100 focus:ring-offset-2 focus:ring-offset-primary-500 flex items-center gap-2"
          active-class="bg-primary-400"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          Dashboard
        </RouterLink>
        <RouterLink
          to="/properties"
          @click="mobileMenuOpen = false"
          class="block py-3 px-3 hover:bg-primary-400 rounded transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-primary-100 focus:ring-offset-2 focus:ring-offset-primary-500 flex items-center gap-2"
          active-class="bg-primary-400"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Properties
        </RouterLink>
        <RouterLink
          to="/tenants"
          @click="mobileMenuOpen = false"
          class="block py-3 px-3 hover:bg-primary-400 rounded transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-primary-100 focus:ring-offset-2 focus:ring-offset-primary-500 flex items-center gap-2"
          active-class="bg-primary-400"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          Tenants
        </RouterLink>

        <!-- Mobile User menu -->
        <div class="pt-2 mt-2 border-t border-primary-300">
          <div class="text-sm mb-2 px-3">{{ user?.name }}</div>
          <button
            @click="handleLogout"
            class="w-full py-3 px-3 bg-primary-400 hover:bg-primary-600 rounded transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-primary-100 focus:ring-offset-2 focus:ring-offset-primary-500 flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import { useAuth } from '@/composables/useAuth';

const { isAuthenticated, user, logout } = useAuth();
const mobileMenuOpen = ref(false);

const handleLogout = logout;
</script>
