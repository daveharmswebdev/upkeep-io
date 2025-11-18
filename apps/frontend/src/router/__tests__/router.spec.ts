import { describe, it, expect, beforeEach } from 'vitest';
import { createRouter, createWebHistory, type Router } from 'vue-router';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '@/stores/auth';

// Import the router configuration
import LoginView from '@/views/LoginView.vue';
import SignupView from '@/views/SignupView.vue';
import DashboardView from '@/views/DashboardView.vue';
import PropertyListView from '@/views/PropertyListView.vue';
import PropertyFormView from '@/views/PropertyFormView.vue';
import PropertyDetailsView from '@/views/PropertyDetailsView.vue';

describe('Router Navigation Guards', () => {
  let router: Router;
  let authStore: ReturnType<typeof useAuthStore>;

  beforeEach(() => {
    // Create a fresh pinia instance for each test
    setActivePinia(createPinia());
    authStore = useAuthStore();

    // Create router with the same configuration as the main router
    router = createRouter({
      history: createWebHistory(),
      routes: [
        {
          path: '/',
          redirect: '/dashboard',
        },
        {
          path: '/login',
          name: 'login',
          component: LoginView,
          meta: { requiresGuest: true },
        },
        {
          path: '/signup',
          name: 'signup',
          component: SignupView,
          meta: { requiresGuest: true },
        },
        {
          path: '/dashboard',
          name: 'dashboard',
          component: DashboardView,
          meta: { requiresAuth: true },
        },
        {
          path: '/properties',
          name: 'properties',
          component: PropertyListView,
          meta: { requiresAuth: true },
        },
        {
          path: '/properties/add',
          name: 'properties-add',
          component: PropertyFormView,
          meta: { requiresAuth: true },
        },
        {
          path: '/properties/:id',
          name: 'property-details',
          component: PropertyDetailsView,
          meta: { requiresAuth: true },
        },
      ],
    });

    // Add the same navigation guard
    router.beforeEach((to, _from, next) => {
      const authStore = useAuthStore();

      if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        next('/login');
      } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
        next('/dashboard');
      } else {
        next();
      }
    });
  });

  describe('Unauthenticated User', () => {
    beforeEach(() => {
      // Ensure user is logged out
      authStore.logout();
    });

    it('should redirect to login when accessing dashboard', async () => {
      await router.push('/dashboard');
      await router.isReady();
      expect(router.currentRoute.value.path).toBe('/login');
    });

    it('should redirect to login when accessing properties', async () => {
      await router.push('/properties');
      await router.isReady();
      expect(router.currentRoute.value.path).toBe('/login');
    });

    it('should redirect to login when accessing property add form', async () => {
      await router.push('/properties/add');
      await router.isReady();
      expect(router.currentRoute.value.path).toBe('/login');
    });

    it('should redirect to login when accessing property details', async () => {
      await router.push('/properties/123');
      await router.isReady();
      expect(router.currentRoute.value.path).toBe('/login');
    });

    it('should allow access to login page', async () => {
      await router.push('/login');
      await router.isReady();
      expect(router.currentRoute.value.path).toBe('/login');
    });

    it('should allow access to signup page', async () => {
      await router.push('/signup');
      await router.isReady();
      expect(router.currentRoute.value.path).toBe('/signup');
    });
  });

  describe('Authenticated User', () => {
    beforeEach(() => {
      // Mock authenticated state
      authStore.token = 'mock-token';
      authStore.user = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      };
    });

    it('should allow access to dashboard', async () => {
      await router.push('/dashboard');
      await router.isReady();
      expect(router.currentRoute.value.path).toBe('/dashboard');
    });

    it('should allow access to properties', async () => {
      await router.push('/properties');
      await router.isReady();
      expect(router.currentRoute.value.path).toBe('/properties');
    });

    it('should allow access to property add form', async () => {
      await router.push('/properties/add');
      await router.isReady();
      expect(router.currentRoute.value.path).toBe('/properties/add');
    });

    it('should allow access to property details', async () => {
      await router.push('/properties/123');
      await router.isReady();
      expect(router.currentRoute.value.path).toBe('/properties/123');
    });

    it('should redirect to dashboard when accessing login page', async () => {
      await router.push('/login');
      await router.isReady();
      expect(router.currentRoute.value.path).toBe('/dashboard');
    });

    it('should redirect to dashboard when accessing signup page', async () => {
      await router.push('/signup');
      await router.isReady();
      expect(router.currentRoute.value.path).toBe('/dashboard');
    });
  });

  describe('Route Metadata', () => {
    it('should have requiresAuth meta on all protected routes', () => {
      const protectedRoutes = [
        '/dashboard',
        '/properties',
        '/properties/add',
      ];

      protectedRoutes.forEach((path) => {
        const route = router.resolve(path);
        expect(route.meta.requiresAuth).toBe(true);
      });
    });

    it('should have requiresGuest meta on auth routes', () => {
      const guestRoutes = ['/login', '/signup'];

      guestRoutes.forEach((path) => {
        const route = router.resolve(path);
        expect(route.meta.requiresGuest).toBe(true);
      });
    });
  });
});
