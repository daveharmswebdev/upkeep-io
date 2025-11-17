import type { Meta, StoryObj } from '@storybook/vue3';
import type { Property } from '@domain/entities';
import { LeaseStatus } from '@domain/entities';
import PropertyCard from './PropertyCard.vue';

const meta = {
  title: 'Components/PropertyCard',
  component: PropertyCard,
  tags: ['autodocs'],
  argTypes: {
    leaseStatus: {
      control: 'select',
      options: [undefined, ...Object.values(LeaseStatus)],
    },
  },
} as Meta<typeof PropertyCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleProperty: Property = {
  id: '123',
  address: '123 Main St',
  city: 'Springfield',
  state: 'IL',
  zipCode: '62701',
  nickname: 'Downtown Condo',
  purchasePrice: 250000,
  purchaseDate: new Date('2020-05-15'),
  userId: 'user-123',
  createdAt: new Date('2020-05-15'),
  updatedAt: new Date('2020-05-15'),
};

const propertyWithoutNickname: Property = {
  id: '456',
  address: '456 Oak Avenue',
  city: 'Portland',
  state: 'OR',
  zipCode: '97201',
  userId: 'user-123',
  createdAt: new Date('2021-01-10'),
  updatedAt: new Date('2021-01-10'),
};

const propertyWithoutPurchaseInfo: Property = {
  id: '789',
  address: '789 Pine Street',
  city: 'Seattle',
  state: 'WA',
  zipCode: '98101',
  nickname: 'Seattle Rental',
  userId: 'user-123',
  createdAt: new Date('2022-03-20'),
  updatedAt: new Date('2022-03-20'),
};

export const ActiveLease: Story = {
  args: {
    property: sampleProperty,
    leaseStatus: LeaseStatus.ACTIVE,
  },
};

export const MonthToMonth: Story = {
  args: {
    property: sampleProperty,
    leaseStatus: LeaseStatus.MONTH_TO_MONTH,
  },
};

export const Vacant: Story = {
  args: {
    property: sampleProperty,
    leaseStatus: undefined,
  },
};

export const LeaseEnded: Story = {
  args: {
    property: sampleProperty,
    leaseStatus: LeaseStatus.ENDED,
  },
};

export const Voided: Story = {
  args: {
    property: sampleProperty,
    leaseStatus: LeaseStatus.VOIDED,
  },
};

export const WithoutNickname: Story = {
  args: {
    property: propertyWithoutNickname,
    leaseStatus: LeaseStatus.ACTIVE,
  },
};

export const WithoutPurchaseInfo: Story = {
  args: {
    property: propertyWithoutPurchaseInfo,
    leaseStatus: undefined,
  },
};

export const ExpensiveProperty: Story = {
  args: {
    property: {
      ...sampleProperty,
      nickname: 'Luxury Penthouse',
      address: '1000 Park Avenue',
      city: 'New York',
      state: 'NY',
      zipCode: '10028',
      purchasePrice: 2500000,
      purchaseDate: new Date('2023-01-10'),
      createdAt: new Date('2023-01-10'),
      updatedAt: new Date('2023-01-10'),
    },
    leaseStatus: LeaseStatus.ACTIVE,
  },
};
