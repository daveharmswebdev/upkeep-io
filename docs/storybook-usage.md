# Storybook Component Library

Storybook provides an interactive visual component library for the Upkeep property management system's Vue 3 frontend.

## Overview

Storybook allows you to:
- Browse all UI components in isolation
- Test components with different props and states
- View responsive layouts at different breakpoints
- Document component APIs with interactive controls
- Verify design system consistency (Tailwind CSS)

## Running Storybook

From the project root:

```bash
npm run storybook
```

Or from the frontend directory:

```bash
cd apps/frontend
npm run storybook
```

Storybook will start at **http://localhost:6006/**

## Building Storybook

To build a static version of Storybook for deployment:

```bash
cd apps/frontend
npm run build-storybook
```

The static build will be created in `apps/frontend/storybook-static/`

## Available Stories

### Components (Reusable)

**FormInput** (`components/FormInput.stories.ts`)
- VeeValidate-integrated form input component
- Stories: Default, Required, Password, WithoutLabel, Number, Telephone, URL
- Features: Error states, validation, different input types
- **Status**: ✅ Fully functional

**PropertyCard** (`components/PropertyCard.stories.ts`)
- Property display card with lease status
- Stories: ActiveLease, MonthToMonth, Vacant, LeaseEnded, Voided, WithoutNickname, WithoutPurchaseInfo, ExpensiveProperty
- Features: Status badges, purchase info, address display
- **Status**: ✅ Fully functional

### Components Not Included

Some components depend on external dependencies (Pinia stores, Vue Router) that are complex to mock in Storybook:

- **AppHeader** - Depends on auth store and router
- **View components** (PropertyFormView, LeaseFormView, etc.) - Depend on Pinia stores, router, and form context

These components work perfectly in the actual application but require significant mocking infrastructure for Storybook. We've focused on self-contained, reusable components that provide the most value in isolation

## Creating New Stories

Stories are co-located with their components using the naming convention `ComponentName.stories.ts`:

```typescript
import type { Meta, StoryObj } from '@storybook/vue3';
import YourComponent from './YourComponent.vue';

const meta = {
  title: 'Components/YourComponent',  // Category/Name in sidebar
  component: YourComponent,
  tags: ['autodocs'],  // Enables auto-generated documentation
  argTypes: {
    propName: { control: 'text' },  // Interactive controls
  },
} as Meta<typeof YourComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    propName: 'default value',
  },
};

export const Alternative: Story = {
  args: {
    propName: 'alternative value',
  },
};
```

### Best Practices

1. **Co-locate stories** - Place `.stories.ts` files next to component `.vue` files
2. **Multiple variants** - Create stories for different states (empty, filled, error, loading)
3. **Meaningful names** - Use descriptive story names (e.g., `ActiveLease`, `WithError`)
4. **Controls** - Add `argTypes` for interactive prop editing
5. **Documentation** - Use `autodocs` tag and add descriptions
6. **Mocks** - Mock external dependencies (router, stores, API calls)

## Configuration

### Tailwind CSS Integration

Storybook is configured to use the project's Tailwind CSS. The CSS file is imported in `apps/frontend/.storybook/preview.ts`:

```typescript
import type { Preview } from '@storybook/vue3-vite'
import '../src/assets/styles/main.css';

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
```

All custom Tailwind classes (primary, secondary-1, secondary-2, complement colors) and fonts (Montserrat, Lato) are available in stories.

### TypeScript Path Aliases

Configured in `apps/frontend/.storybook/main.ts` to match the frontend app:

```typescript
viteFinal: async (config) => {
  return mergeConfig(config, {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '../src'),
        '@domain': path.resolve(__dirname, '../../../libs/domain/src'),
        '@validators': path.resolve(__dirname, '../../../libs/validators/src'),
        '@auth': path.resolve(__dirname, '../../../libs/auth/src'),
      },
    },
  });
},
```

## Viewport Testing

Storybook includes responsive design testing. Click the viewport icon in the toolbar to test:
- Mobile (375px)
- Tablet (768px)
- Desktop (1024px+)

Our two-column form layouts automatically switch to single-column below 1024px (lg breakpoint).

## Accessibility Testing

The `@storybook/addon-a11y` addon is enabled. Click the "Accessibility" tab to:
- Check WCAG compliance
- Identify contrast issues
- Verify keyboard navigation
- Test screen reader compatibility

## Troubleshooting

### Version Compatibility Warnings

If you see warnings about package version mismatches, they can generally be ignored. The core functionality works despite version differences between Storybook core and addons.

### Stories Not Showing

Verify the story file:
1. Is in the `src/` directory
2. Matches the pattern `**/*.stories.@(js|jsx|mjs|ts|tsx)`
3. Has a default export with `Meta` configuration
4. Has at least one exported story

### Hot Reload Not Working

Restart Storybook if HMR (Hot Module Replacement) stops working:
```bash
# Kill the process
Ctrl+C

# Restart
npm run storybook
```

### Build Failures

If TypeScript errors occur:
1. Check that all imported types are available
2. Ensure mock data matches TypeScript interfaces
3. Verify path aliases are correctly configured

## Resources

- [Storybook for Vue Documentation](https://storybook.js.org/docs/vue/get-started/introduction)
- [Writing Stories](https://storybook.js.org/docs/vue/writing-stories/introduction)
- [Essential Addons](https://storybook.js.org/docs/vue/essentials/introduction)
- [Accessibility Testing](https://storybook.js.org/docs/vue/writing-tests/accessibility-testing)
