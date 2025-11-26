import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import OccupantFormGroup from '../OccupantFormGroup.vue';
import FormInput from '../FormInput.vue';

describe('OccupantFormGroup', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  const defaultProps = {
    index: 0,
    showRemove: true,
  };

  describe('rendering', () => {
    it('should render header with occupant number', () => {
      const wrapper = mount(OccupantFormGroup, { props: defaultProps });
      expect(wrapper.text()).toContain('Occupant 1');
    });

    it('should render header with correct index', () => {
      const wrapper = mount(OccupantFormGroup, { props: { ...defaultProps, index: 2 } });
      expect(wrapper.text()).toContain('Occupant 3');
    });

    it('should render remove button when showRemove is true', () => {
      const wrapper = mount(OccupantFormGroup, { props: defaultProps });
      const removeButton = wrapper.find('button[aria-label="Remove occupant 1"]');
      expect(removeButton.exists()).toBe(true);
    });

    it('should not render remove button when showRemove is false', () => {
      const wrapper = mount(OccupantFormGroup, { props: { ...defaultProps, showRemove: false } });
      const removeButton = wrapper.find('button[aria-label="Remove occupant 1"]');
      expect(removeButton.exists()).toBe(false);
    });

    it('should render isAdult checkbox', () => {
      const wrapper = mount(OccupantFormGroup, { props: defaultProps });
      const checkbox = wrapper.find('input[type="checkbox"][name="occupants[0].isAdult"]');
      expect(checkbox.exists()).toBe(true);
    });

    it('should render all form fields', () => {
      const wrapper = mount(OccupantFormGroup, { props: defaultProps });

      // Check FormInput components
      const formInputs = wrapper.findAllComponents(FormInput);
      expect(formInputs.length).toBeGreaterThanOrEqual(5); // firstName, lastName, middleName, email, phone, moveInDate

      // Check notes textarea
      const notesTextarea = wrapper.find('textarea[name="occupants[0].notes"]');
      expect(notesTextarea.exists()).toBe(true);
    });

    it('should render firstName field with correct name attribute', () => {
      const wrapper = mount(OccupantFormGroup, { props: defaultProps });
      const formInputs = wrapper.findAllComponents(FormInput);
      const firstNameInput = formInputs.find(input => input.props('name') === 'occupants[0].firstName');
      expect(firstNameInput).toBeDefined();
    });

    it('should render lastName field with correct name attribute', () => {
      const wrapper = mount(OccupantFormGroup, { props: defaultProps });
      const formInputs = wrapper.findAllComponents(FormInput);
      const lastNameInput = formInputs.find(input => input.props('name') === 'occupants[0].lastName');
      expect(lastNameInput).toBeDefined();
    });

    it('should render email field with required prop based on isAdult', () => {
      const wrapper = mount(OccupantFormGroup, { props: defaultProps });
      const formInputs = wrapper.findAllComponents(FormInput);
      const emailInput = formInputs.find(input => input.props('name') === 'occupants[0].email');

      // Default isAdult is false, so email should not be required initially
      expect(emailInput?.props('required')).toBe(false);
    });

    it('should render phone field with required prop based on isAdult', () => {
      const wrapper = mount(OccupantFormGroup, { props: defaultProps });
      const formInputs = wrapper.findAllComponents(FormInput);
      const phoneInput = formInputs.find(input => input.props('name') === 'occupants[0].phone');

      // Default isAdult is false, so phone should not be required initially
      expect(phoneInput?.props('required')).toBe(false);
    });

    it('should render notes textarea with correct attributes', () => {
      const wrapper = mount(OccupantFormGroup, { props: defaultProps });
      const notesTextarea = wrapper.find('textarea[name="occupants[0].notes"]');

      expect(notesTextarea.attributes('placeholder')).toContain('Additional notes');
      expect(notesTextarea.attributes('rows')).toBe('2');
    });
  });

  describe('user interactions', () => {
    it('should emit remove event when remove button is clicked', async () => {
      const wrapper = mount(OccupantFormGroup, { props: defaultProps });
      const removeButton = wrapper.find('button[aria-label="Remove occupant 1"]');

      await removeButton.trigger('click');

      expect(wrapper.emitted()).toHaveProperty('remove');
      expect(wrapper.emitted().remove).toHaveLength(1);
      expect(wrapper.emitted().remove![0]).toEqual([0]);
    });

    it('should emit correct index when remove button is clicked', async () => {
      const wrapper = mount(OccupantFormGroup, { props: { ...defaultProps, index: 3 } });
      const removeButton = wrapper.find('button[aria-label="Remove occupant 4"]');

      await removeButton.trigger('click');

      expect(wrapper.emitted().remove![0]).toEqual([3]);
    });
  });

  describe('styling', () => {
    it('should have border and padding', () => {
      const wrapper = mount(OccupantFormGroup, { props: defaultProps });
      const container = wrapper.find('.border-2.border-secondary-1-300.rounded-lg.p-4');
      expect(container.exists()).toBe(true);
    });

    it('should have proper spacing between fields', () => {
      const wrapper = mount(OccupantFormGroup, { props: defaultProps });
      const fieldsContainer = wrapper.find('.space-y-4');
      expect(fieldsContainer.exists()).toBe(true);
    });

    it('should style remove button with primary color', () => {
      const wrapper = mount(OccupantFormGroup, { props: defaultProps });
      const removeButton = wrapper.find('button[aria-label="Remove occupant 1"]');
      expect(removeButton.classes()).toContain('text-primary-400');
    });
  });

  describe('accessibility', () => {
    it('should have proper aria-label for remove button', () => {
      const wrapper = mount(OccupantFormGroup, { props: defaultProps });
      const removeButton = wrapper.find('button');
      expect(removeButton.attributes('aria-label')).toBe('Remove occupant 1');
    });

    it('should have correct aria-label for different indices', () => {
      const wrapper = mount(OccupantFormGroup, { props: { ...defaultProps, index: 5 } });
      const removeButton = wrapper.find('button');
      expect(removeButton.attributes('aria-label')).toBe('Remove occupant 6');
    });

    it('should associate checkbox label with input', () => {
      const wrapper = mount(OccupantFormGroup, { props: defaultProps });
      const checkbox = wrapper.find('input[type="checkbox"]');
      const label = wrapper.find('label[for="occupants-0-isAdult"]');

      expect(checkbox.attributes('id')).toBe('occupants-0-isAdult');
      expect(label.exists()).toBe(true);
    });

    it('should associate notes label with textarea', () => {
      const wrapper = mount(OccupantFormGroup, { props: defaultProps });
      const textarea = wrapper.find('textarea');
      const label = wrapper.find('label[for="occupants-0-notes"]');

      expect(textarea.attributes('id')).toBe('occupants-0-notes');
      expect(label.exists()).toBe(true);
    });
  });
});
