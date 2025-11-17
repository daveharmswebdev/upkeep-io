import type { Meta, StoryObj } from '@storybook/vue3';
import { action } from '@storybook/addon-actions';
import { createPinia } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import AppHeader from './AppHeader.vue';

/**
 * AppHeader component displays the application navigation header
 * with authentication state and responsive mobile menu.
 *
 * This story demonstrates how to mock Pinia stores in Storybook
 * by creating a fresh Pinia instance and populating the auth store
 * with mock data for each story variant.
 *
 * Key mocking techniques:
 * - Create new Pinia instance per story to avoid state pollution
 * - Populate auth store with mock user data
 * - Override logout function to use Storybook action logger
 * - Mock router handled globally in preview.ts via MockRouterLink
 */
const meta = {
  title: 'Components/AppHeader',
  component: AppHeader,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen', // Remove default padding to show header properly
  },
  argTypes: {
    isAuthenticated: {
      control: 'boolean',
      description: 'Whether the user is authenticated',
    },
    userName: {
      control: 'text',
      description: 'Name of the authenticated user',
    },
  },
  decorators: [
    (story: any, context: any) => ({
      components: { story },
      setup() {
        // Create a fresh Pinia instance for this story
        const pinia = createPinia();

        // Get the auth store and populate it with mock data
        const authStore = useAuthStore(pinia);

        if (context.args.isAuthenticated) {
          // Mock authenticated state
          authStore.user = {
            id: 'mock-user-id',
            name: context.args.userName || 'John Doe',
            email: 'john@example.com',
          };
          authStore.token = 'mock-jwt-token';

          // Override logout to use Storybook action
          const originalLogout = authStore.logout.bind(authStore);
          authStore.logout = () => {
            action('logout')();
            originalLogout();
          };
        } else {
          // Mock unauthenticated state
          authStore.user = null;
          authStore.token = null;
        }

        return { pinia };
      },
      template: `
        <div class="min-h-screen bg-gray-50">
          <story />
          <div class="container mx-auto px-4 py-8">
            <div class="bg-white rounded-lg shadow p-6">
              <h2 class="text-xl font-heading font-bold mb-4">Page Content</h2>
              <p class="text-gray-600">This is placeholder content to show the header in context.</p>
              <p class="text-sm text-gray-500 mt-2">Try clicking the navigation links to see console logs.</p>
            </div>
          </div>
        </div>
      `,
    }),
  ],
} as Meta<typeof AppHeader>;

export default meta;

// Custom args type for story controls (not component props)
type StoryArgs = {
  isAuthenticated: boolean;
  userName?: string;
};

type Story = StoryObj<StoryArgs>;

/**
 * Default authenticated state showing the header with navigation links
 * and user menu for desktop view.
 */
export const Authenticated: Story = {
  args: {
    isAuthenticated: true,
    userName: 'John Doe',
  },
};

/**
 * Unauthenticated state - in the current implementation,
 * only the logo is visible when not authenticated.
 */
export const Unauthenticated: Story = {
  args: {
    isAuthenticated: false,
  },
};

/**
 * Mobile view with menu open (requires authenticated state).
 * Note: You may need to resize the viewport to see the mobile menu button.
 * Use Storybook's viewport addon to switch to mobile view.
 */
export const MobileMenuOpen: Story = {
  args: {
    isAuthenticated: true,
    userName: 'Jane Smith',
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

/**
 * Mobile view showing the collapsed state (default).
 * Menu can be toggled by clicking the hamburger button.
 */
export const MobileMenuClosed: Story = {
  args: {
    isAuthenticated: true,
    userName: 'Alice Johnson',
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

/**
 * Long user name to test text overflow handling.
 */
export const LongUserName: Story = {
  args: {
    isAuthenticated: true,
    userName: 'Christopher Alexander Montgomery III',
  },
};
