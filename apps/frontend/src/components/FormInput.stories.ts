import type { Meta, StoryObj } from '@storybook/vue3';
import { useForm } from 'vee-validate';
import { z } from 'zod';
import { toTypedSchema } from '@vee-validate/zod';
import FormInput from './FormInput.vue';

const meta = {
  title: 'Components/FormInput',
  component: FormInput,
  tags: ['autodocs'],
  argTypes: {
    name: { control: 'text' },
    label: { control: 'text' },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url']
    },
    placeholder: { control: 'text' },
    required: { control: 'boolean' },
  },
  decorators: [
    (story: any, context: any) => ({
      components: { story },
      setup() {
        const validationRules: Record<string, any> = {};
        validationRules[context.args.name] = context.args.required
          ? z.string().min(1, 'This field is required')
          : z.string().optional();

        const schema = toTypedSchema(z.object(validationRules));

        const { handleSubmit } = useForm({
          validationSchema: schema,
        });

        return { handleSubmit };
      },
      template: '<form><story /></form>',
    }),
  ],
} as Meta<typeof FormInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: 'username',
    label: 'Username',
    placeholder: 'Enter your username',
    type: 'text',
    required: false,
  },
};

export const Required: Story = {
  args: {
    name: 'email',
    label: 'Email Address',
    placeholder: 'you@example.com',
    type: 'email',
    required: true,
  },
};

export const Password: Story = {
  args: {
    name: 'password',
    label: 'Password',
    placeholder: 'Enter your password',
    type: 'password',
    required: true,
  },
};

export const WithoutLabel: Story = {
  args: {
    name: 'search',
    placeholder: 'Search...',
    type: 'text',
  },
};

export const Number: Story = {
  args: {
    name: 'age',
    label: 'Age',
    type: 'number',
    placeholder: '25',
  },
};

export const Telephone: Story = {
  args: {
    name: 'phone',
    label: 'Phone Number',
    type: 'tel',
    placeholder: '(555) 123-4567',
  },
};

export const URL: Story = {
  args: {
    name: 'website',
    label: 'Website',
    type: 'url',
    placeholder: 'https://example.com',
  },
};
