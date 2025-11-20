import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import LoginView from '@/views/LoginView.vue';
import SignupView from '@/views/SignupView.vue';
import DashboardView from '@/views/DashboardView.vue';
import PropertyListView from '@/views/PropertyListView.vue';
import PropertyFormView from '@/views/PropertyFormView.vue';
import PropertyDetailsView from '@/views/PropertyDetailsView.vue';
import LeaseFormView from '@/views/LeaseFormView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
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
      path: '/properties/:id/edit',
      name: 'property-edit',
      component: PropertyFormView,
      meta: { requiresAuth: true },
    },
    {
      path: '/properties/:id',
      name: 'property-details',
      component: PropertyDetailsView,
      meta: { requiresAuth: true },
    },
    {
      path: '/properties/:id/leases/add',
      name: 'lease-add',
      component: LeaseFormView,
      meta: { requiresAuth: true },
    },
  ],
});

// Navigation guards
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

export default router;
