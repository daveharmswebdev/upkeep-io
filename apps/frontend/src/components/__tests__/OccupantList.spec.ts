import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import OccupantList from '../OccupantList.vue';
import type { LeaseWithDetails } from '@domain/entities';

describe('OccupantList', () => {
  const mockOccupants: LeaseWithDetails['occupants'] = [
    {
      id: '1',
      personId: 'p1',
      isAdult: true,
      moveInDate: new Date('2024-01-01'),
      person: {
        id: 'p1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '555-1234',
      },
    },
    {
      id: '2',
      personId: 'p2',
      isAdult: false,
      person: {
        id: 'p2',
        firstName: 'Jane',
        lastName: 'Doe',
      },
    },
  ];

  describe('rendering', () => {
    it('should render heading', () => {
      const wrapper = mount(OccupantList, { props: { occupants: [] } });
      expect(wrapper.text()).toContain('Occupants');
    });

    it('should render description text', () => {
      const wrapper = mount(OccupantList, { props: { occupants: [] } });
      expect(wrapper.text()).toContain('Manage occupants living at this property');
    });

    it('should render empty state when no occupants', () => {
      const wrapper = mount(OccupantList, { props: { occupants: [] } });
      expect(wrapper.text()).toContain('No occupants added yet');
    });

    it('should render Add Occupant button in empty state', () => {
      const wrapper = mount(OccupantList, { props: { occupants: [] } });
      const buttons = wrapper.findAll('button');
      expect(buttons.some(btn => btn.text().includes('Add Occupant'))).toBe(true);
    });

    it('should render occupant cards when occupants exist', () => {
      const wrapper = mount(OccupantList, { props: { occupants: mockOccupants } });
      const cards = wrapper.findAll('.bg-gray-50.dark\\:bg-gray-700.rounded-lg.p-4');
      expect(cards.length).toBe(2);
    });

    it('should render occupant names', () => {
      const wrapper = mount(OccupantList, { props: { occupants: mockOccupants } });
      expect(wrapper.text()).toContain('John Doe');
      expect(wrapper.text()).toContain('Jane Doe');
    });

    it('should render Adult badge for adult occupants', () => {
      const wrapper = mount(OccupantList, { props: { occupants: mockOccupants } });
      const adultBadge = wrapper.find('.bg-complement-200');
      expect(adultBadge.text()).toBe('Adult');
    });

    it('should render Child badge for child occupants', () => {
      const wrapper = mount(OccupantList, { props: { occupants: mockOccupants } });
      const childBadge = wrapper.find('.bg-secondary-2-200');
      expect(childBadge.text()).toBe('Child');
    });

    it('should render email when provided', () => {
      const wrapper = mount(OccupantList, { props: { occupants: mockOccupants } });
      expect(wrapper.text()).toContain('john@example.com');
    });

    it('should render phone when provided', () => {
      const wrapper = mount(OccupantList, { props: { occupants: mockOccupants } });
      expect(wrapper.text()).toContain('555-1234');
    });

    it('should not render email when not provided', () => {
      const wrapper = mount(OccupantList, { props: { occupants: mockOccupants } });
      const cards = wrapper.findAll('.bg-gray-50.dark\\:bg-gray-700.rounded-lg.p-4');
      const childCard = cards[1];
      expect(childCard.text()).not.toContain('@');
    });

    it('should render move-in date when provided', () => {
      const wrapper = mount(OccupantList, { props: { occupants: mockOccupants } });
      expect(wrapper.text()).toContain('Move-in:');
    });

    it('should render remove button for each occupant', () => {
      const wrapper = mount(OccupantList, { props: { occupants: mockOccupants } });
      const removeButtons = wrapper.findAll('button[aria-label^="Remove"]');
      expect(removeButtons.length).toBe(2);
    });

    it('should render Add Occupant button when occupants exist', () => {
      const wrapper = mount(OccupantList, { props: { occupants: mockOccupants } });
      const buttons = wrapper.findAll('button');
      const addButton = buttons.find(btn => btn.text().includes('Add Occupant'));
      expect(addButton).toBeDefined();
    });
  });

  describe('user interactions', () => {
    it('should emit add event when Add Occupant button clicked in empty state', async () => {
      const wrapper = mount(OccupantList, { props: { occupants: [] } });
      const addButton = wrapper.find('button');

      await addButton.trigger('click');

      expect(wrapper.emitted()).toHaveProperty('add');
      expect(wrapper.emitted().add).toHaveLength(1);
    });

    it('should emit add event when Add Occupant button clicked with existing occupants', async () => {
      const wrapper = mount(OccupantList, { props: { occupants: mockOccupants } });
      const buttons = wrapper.findAll('button');
      const addButton = buttons.find(btn => btn.text().includes('Add Occupant'));

      await addButton!.trigger('click');

      expect(wrapper.emitted()).toHaveProperty('add');
      expect(wrapper.emitted().add).toHaveLength(1);
    });

    it('should emit remove event with occupantId when remove button clicked', async () => {
      const wrapper = mount(OccupantList, { props: { occupants: mockOccupants } });
      const removeButtons = wrapper.findAll('button[aria-label^="Remove"]');

      await removeButtons[0].trigger('click');

      expect(wrapper.emitted()).toHaveProperty('remove');
      expect(wrapper.emitted().remove).toHaveLength(1);
      expect(wrapper.emitted().remove![0]).toEqual(['1']);
    });

    it('should emit correct occupantId for second occupant', async () => {
      const wrapper = mount(OccupantList, { props: { occupants: mockOccupants } });
      const removeButtons = wrapper.findAll('button[aria-label^="Remove"]');

      await removeButtons[1].trigger('click');

      expect(wrapper.emitted().remove![0]).toEqual(['2']);
    });
  });

  describe('styling', () => {
    it('should have proper spacing between occupant cards', () => {
      const wrapper = mount(OccupantList, { props: { occupants: mockOccupants } });
      const listContainer = wrapper.find('.space-y-3');
      expect(listContainer.exists()).toBe(true);
    });

    it('should style Adult badge with complement color', () => {
      const wrapper = mount(OccupantList, { props: { occupants: mockOccupants } });
      const adultBadge = wrapper.find('.bg-complement-200');
      expect(adultBadge.classes()).toContain('text-complement-800');
    });

    it('should style Child badge with secondary-2 color', () => {
      const wrapper = mount(OccupantList, { props: { occupants: mockOccupants } });
      const childBadge = wrapper.find('.bg-secondary-2-200');
      expect(childBadge.classes()).toContain('text-secondary-2-800');
    });

    it('should style remove button with primary color', () => {
      const wrapper = mount(OccupantList, { props: { occupants: mockOccupants } });
      const removeButton = wrapper.find('button[aria-label^="Remove"]');
      expect(removeButton.classes()).toContain('text-primary-400');
    });

    it('should style Add Occupant button with secondary-2 color', () => {
      const wrapper = mount(OccupantList, { props: { occupants: mockOccupants } });
      const buttons = wrapper.findAll('button');
      const addButton = buttons.find(btn => btn.text().includes('Add Occupant'));
      expect(addButton!.classes()).toContain('text-secondary-2-500');
    });
  });

  describe('accessibility', () => {
    it('should have proper aria-label for remove buttons', () => {
      const wrapper = mount(OccupantList, { props: { occupants: mockOccupants } });
      const removeButtons = wrapper.findAll('button[aria-label^="Remove"]');

      expect(removeButtons[0].attributes('aria-label')).toBe('Remove John Doe');
      expect(removeButtons[1].attributes('aria-label')).toBe('Remove Jane Doe');
    });

    it('should have proper button type attributes', () => {
      const wrapper = mount(OccupantList, { props: { occupants: mockOccupants } });
      const buttons = wrapper.findAll('button');

      buttons.forEach(button => {
        expect(button.attributes('type')).toBe('button');
      });
    });
  });

  describe('edge cases', () => {
    it('should handle occupant without move-in date', () => {
      const occupantsWithoutMoveIn: LeaseWithDetails['occupants'] = [
        {
          id: '1',
          personId: 'p1',
          isAdult: true,
          person: {
            id: 'p1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            phone: '555-1234',
          },
        },
      ];

      const wrapper = mount(OccupantList, { props: { occupants: occupantsWithoutMoveIn } });
      expect(wrapper.text()).not.toContain('Move-in:');
    });

    it('should handle occupant with middle name', () => {
      const occupantsWithMiddleName: LeaseWithDetails['occupants'] = [
        {
          id: '1',
          personId: 'p1',
          isAdult: true,
          person: {
            id: 'p1',
            firstName: 'John',
            lastName: 'Doe',
            middleName: 'Michael',
            email: 'john@example.com',
            phone: '555-1234',
          },
        },
      ];

      const wrapper = mount(OccupantList, { props: { occupants: occupantsWithMiddleName } });
      // Middle name is in the data model but not displayed in this component
      expect(wrapper.text()).toContain('John Doe');
    });

    it('should handle single occupant', () => {
      const singleOccupant: LeaseWithDetails['occupants'] = [mockOccupants[0]];
      const wrapper = mount(OccupantList, { props: { occupants: singleOccupant } });

      const cards = wrapper.findAll('.bg-gray-50.dark\\:bg-gray-700.rounded-lg.p-4');
      expect(cards.length).toBe(1);
    });

    it('should handle many occupants', () => {
      const manyOccupants: LeaseWithDetails['occupants'] = Array.from({ length: 10 }, (_, i) => ({
        id: `${i + 1}`,
        personId: `p${i + 1}`,
        isAdult: i % 2 === 0,
        person: {
          id: `p${i + 1}`,
          firstName: `Person${i + 1}`,
          lastName: 'Doe',
          email: `person${i + 1}@example.com`,
        },
      }));

      const wrapper = mount(OccupantList, { props: { occupants: manyOccupants } });
      const cards = wrapper.findAll('.bg-gray-50.dark\\:bg-gray-700.rounded-lg.p-4');
      expect(cards.length).toBe(10);
    });
  });
});
