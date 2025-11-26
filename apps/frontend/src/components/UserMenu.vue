<template>
  <div ref="menuRef" class="relative">
    <!-- Menu Button -->
    <button
      @click="toggleMenu"
      @keydown.enter="toggleMenu"
      @keydown.space.prevent="toggleMenu"
      @keydown.escape="closeMenu"
      :aria-expanded="isOpen"
      aria-haspopup="true"
      aria-label="User menu"
      class="flex items-center gap-2 px-3 py-2 rounded-md transition-colors hover:bg-primary-400 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-100 dark:focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-primary-500 dark:focus:ring-offset-gray-800"
    >
      <!-- User Icon -->
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
      <!-- User Name -->
      <span class="text-sm font-medium hidden md:inline">{{ displayName }}</span>
      <!-- Dropdown Icon -->
      <svg
        class="w-4 h-4 transition-transform"
        :class="{ 'rotate-180': isOpen }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Dropdown Menu -->
    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
        role="menu"
        aria-orientation="vertical"
        :aria-labelledby="'user-menu-button'"
      >
        <div class="py-1">
          <!-- My Profile Link -->
          <RouterLink
            to="/profile"
            @click="closeMenu"
            class="group flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700"
            role="menuitem"
            tabindex="0"
            @keydown.enter="navigateToProfile"
            @keydown.escape="closeMenu"
          >
            <svg class="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            My Profile
          </RouterLink>

          <div class="border-t border-gray-100 dark:border-gray-700"></div>

          <!-- Logout Button -->
          <button
            @click="handleLogout"
            class="group w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700"
            role="menuitem"
            tabindex="0"
            @keydown.enter="handleLogout"
            @keydown.escape="closeMenu"
          >
            <svg class="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { useProfileStore } from '@/stores/profile';

const router = useRouter();
const { logout, user } = useAuth();
const profileStore = useProfileStore();

const isOpen = ref(false);
const menuRef = ref<HTMLElement | null>(null);

/**
 * Display name: profile full name or user email fallback
 */
const displayName = computed(() => {
  if (profileStore.fullName) {
    return profileStore.fullName;
  }
  return user.value?.email || 'User';
});

/**
 * Toggle menu open/close
 */
function toggleMenu() {
  isOpen.value = !isOpen.value;
}

/**
 * Close menu
 */
function closeMenu() {
  isOpen.value = false;
}

/**
 * Navigate to profile and close menu
 */
function navigateToProfile() {
  closeMenu();
  router.push('/profile');
}

/**
 * Handle logout
 */
async function handleLogout() {
  closeMenu();
  await logout();
}

/**
 * Click outside handler
 */
function handleClickOutside(event: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    closeMenu();
  }
}

/**
 * Keyboard escape handler (global)
 */
function handleEscapeKey(event: KeyboardEvent) {
  if (event.key === 'Escape' && isOpen.value) {
    closeMenu();
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  document.addEventListener('keydown', handleEscapeKey);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('keydown', handleEscapeKey);
});
</script>
