import type { Preview } from '@storybook/vue3-vite';
import { setup } from '@storybook/vue3';
import { createMemoryHistory, createRouter } from 'vue-router';
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';
import '../src/assets/styles/main.css';

// Create a mock router for Storybook with minimal routes
const routes = [
  { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
  { path: '/dashboard', name: 'dashboard', component: { template: '<div>Dashboard</div>' } },
  { path: '/properties', name: 'properties', component: { template: '<div>Properties</div>' } },
  { path: '/tenants', name: 'tenants', component: { template: '<div>Tenants</div>' } },
  { path: '/login', name: 'login', component: { template: '<div>Login</div>' } },
];

const router = createRouter({
  history: createMemoryHistory(),
  routes,
});

// Intercept router navigation to log in console (useful for debugging stories)
router.beforeEach((to, from, next) => {
  console.log('Router navigation:', from.path, '->', to.path);
  next();
});

// Setup global plugins and mocks for all stories
setup((app) => {
  // Install Vue Router with mock routes
  app.use(router);

  // Install Vue Toastification with minimal config
  app.use(Toast, {
    position: 'top-right',
    timeout: 3000,
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 0.6,
    showCloseButtonOnHover: false,
    hideProgressBar: false,
    closeButton: 'button',
    icon: true,
    rtl: false,
  });
});

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;