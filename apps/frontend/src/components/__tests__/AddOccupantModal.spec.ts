import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import AddOccupantModal from '../AddOccupantModal.vue';
import FormInput from '../FormInput.vue';

describe('AddOccupantModal', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('rendering', () => {
    it('should render modal title', () => {
      const wrapper = mount(AddOccupantModal);
      expect(wrapper.text()).toContain('Add Occupant to Lease');
    });

    it('should render isAdult checkbox', () => {
      const wrapper = mount(AddOccupantModal);
      const checkbox = wrapper.find('input[type="checkbox"][name="isAdult"]');
      expect(checkbox.exists()).toBe(true);
    });

    it('should render isAdult label', () => {
      const wrapper = mount(AddOccupantModal);
      const label = wrapper.find('label[for="isAdult"]');
      expect(label.text()).toContain('Is Adult (18+)');
    });

    it('should render occupant information section', () => {
      const wrapper = mount(AddOccupantModal);
      expect(wrapper.text()).toContain('Occupant Information');
    });

    it('should render all form fields', () => {
      const wrapper = mount(AddOccupantModal);
      const formInputs = wrapper.findAllComponents(FormInput);

      // firstName, lastName, middleName, email, phone, moveInDate
      expect(formInputs.length).toBeGreaterThanOrEqual(6);
    });

    it('should render notes textarea', () => {
      const wrapper = mount(AddOccupantModal);
      const notesTextarea = wrapper.find('textarea[name="notes"]');
      expect(notesTextarea.exists()).toBe(true);
    });

    it('should render Cancel button', () => {
      const wrapper = mount(AddOccupantModal);
      const buttons = wrapper.findAll('button');
      const cancelButton = buttons.find(btn => btn.text() === 'Cancel');
      expect(cancelButton).toBeDefined();
    });

    it('should render Add Occupant button', () => {
      const wrapper = mount(AddOccupantModal);
      const buttons = wrapper.findAll('button');
      const submitButton = buttons.find(btn => btn.text().includes('Add Occupant'));
      expect(submitButton).toBeDefined();
    });

    it('should have aria-modal attribute', () => {
      const wrapper = mount(AddOccupantModal);
      const dialog = wrapper.find('[role="dialog"]');
      expect(dialog.attributes('aria-modal')).toBe('true');
    });

    it('should have role="dialog"', () => {
      const wrapper = mount(AddOccupantModal);
      const dialog = wrapper.find('[role="dialog"]');
      expect(dialog.exists()).toBe(true);
    });

    it('should have aria-labelledby pointing to modal title', () => {
      const wrapper = mount(AddOccupantModal);
      const dialog = wrapper.find('[role="dialog"]');
      expect(dialog.attributes('aria-labelledby')).toBe('modal-title');
    });
  });

  describe('conditional field requirements', () => {
    it('should show email as optional when isAdult is false', () => {
      const wrapper = mount(AddOccupantModal);
      const formInputs = wrapper.findAllComponents(FormInput);
      const emailInput = formInputs.find(input => input.props('name') === 'email');

      expect(emailInput?.props('label')).toContain('Optional');
      expect(emailInput?.props('required')).toBe(false);
    });

    it('should show phone as optional when isAdult is false', () => {
      const wrapper = mount(AddOccupantModal);
      const formInputs = wrapper.findAllComponents(FormInput);
      const phoneInput = formInputs.find(input => input.props('name') === 'phone');

      expect(phoneInput?.props('label')).toContain('Optional');
      expect(phoneInput?.props('required')).toBe(false);
    });

    it('should show email as required when isAdult is true', async () => {
      const wrapper = mount(AddOccupantModal);
      const checkbox = wrapper.find('input[type="checkbox"][name="isAdult"]');

      await checkbox.setValue(true);
      await nextTick();

      const formInputs = wrapper.findAllComponents(FormInput);
      const emailInput = formInputs.find(input => input.props('name') === 'email');

      expect(emailInput?.props('label')).not.toContain('Optional');
      expect(emailInput?.props('required')).toBe(true);
    });

    it('should show phone as required when isAdult is true', async () => {
      const wrapper = mount(AddOccupantModal);
      const checkbox = wrapper.find('input[type="checkbox"][name="isAdult"]');

      await checkbox.setValue(true);
      await nextTick();

      const formInputs = wrapper.findAllComponents(FormInput);
      const phoneInput = formInputs.find(input => input.props('name') === 'phone');

      expect(phoneInput?.props('label')).not.toContain('Optional');
      expect(phoneInput?.props('required')).toBe(true);
    });
  });

  describe('user interactions', () => {
    it('should emit cancel when Cancel button is clicked', async () => {
      const wrapper = mount(AddOccupantModal);
      const buttons = wrapper.findAll('button');
      const cancelButton = buttons.find(btn => btn.text() === 'Cancel');

      await cancelButton!.trigger('click');

      expect(wrapper.emitted()).toHaveProperty('cancel');
      expect(wrapper.emitted().cancel).toHaveLength(1);
    });

    it('should emit cancel when Escape key is pressed', async () => {
      const wrapper = mount(AddOccupantModal, { attachTo: document.body });

      await wrapper.trigger('keydown.esc');

      expect(wrapper.emitted()).toHaveProperty('cancel');
      expect(wrapper.emitted().cancel).toHaveLength(1);

      wrapper.unmount();
    });

    it('should emit cancel when clicking backdrop', async () => {
      const wrapper = mount(AddOccupantModal);
      const backdrop = wrapper.find('.fixed.inset-0');

      await backdrop.trigger('click.self');

      expect(wrapper.emitted()).toHaveProperty('cancel');
      expect(wrapper.emitted().cancel).toHaveLength(1);
    });

    it('should toggle isAdult when checkbox is clicked', async () => {
      const wrapper = mount(AddOccupantModal);
      const checkbox = wrapper.find('input[type="checkbox"][name="isAdult"]') as any;

      expect(checkbox.element.checked).toBe(false);

      await checkbox.setValue(true);

      expect(checkbox.element.checked).toBe(true);
    });
  });

  describe('focus management', () => {
    it('should focus Cancel button on mount', async () => {
      const wrapper = mount(AddOccupantModal, { attachTo: document.body });

      await nextTick();

      const buttons = wrapper.findAll('button');
      const cancelButton = buttons.find(btn => btn.text() === 'Cancel');
      expect(cancelButton!.element).toBe(document.activeElement);

      wrapper.unmount();
    });
  });

  describe('styling', () => {
    it('should have correct overlay classes', () => {
      const wrapper = mount(AddOccupantModal);
      const overlay = wrapper.find('.fixed.inset-0.bg-black.bg-opacity-50');
      expect(overlay.exists()).toBe(true);
    });

    it('should have centered modal layout', () => {
      const wrapper = mount(AddOccupantModal);
      const overlay = wrapper.find('.flex.items-center.justify-center.z-50');
      expect(overlay.exists()).toBe(true);
    });

    it('should have white card with proper styling', () => {
      const wrapper = mount(AddOccupantModal);
      const modal = wrapper.find('.bg-white.dark\\:bg-gray-800.rounded-lg');
      expect(modal.exists()).toBe(true);
    });

    it('should have gray Cancel button', () => {
      const wrapper = mount(AddOccupantModal);
      const buttons = wrapper.findAll('button');
      const cancelButton = buttons.find(btn => btn.text() === 'Cancel');
      expect(cancelButton!.classes()).toContain('bg-gray-200');
    });

    it('should have complement-colored submit button', () => {
      const wrapper = mount(AddOccupantModal);
      const buttons = wrapper.findAll('button');
      const submitButton = buttons.find(btn => btn.text().includes('Add Occupant'));
      expect(submitButton!.classes()).toContain('bg-complement-300');
    });

    it('should have submit button with proper styling', () => {
      const wrapper = mount(AddOccupantModal);
      const buttons = wrapper.findAll('button');
      const submitButton = buttons.find(btn => btn.text().includes('Add Occupant'));

      expect(submitButton).toBeDefined();
      expect(submitButton!.classes()).toContain('bg-complement-300');
    });
  });

  describe('form fields', () => {
    it('should have firstName field', () => {
      const wrapper = mount(AddOccupantModal);
      const formInputs = wrapper.findAllComponents(FormInput);
      const firstNameInput = formInputs.find(input => input.props('name') === 'firstName');

      expect(firstNameInput).toBeDefined();
      expect(firstNameInput?.props('required')).toBe(true);
    });

    it('should have lastName field', () => {
      const wrapper = mount(AddOccupantModal);
      const formInputs = wrapper.findAllComponents(FormInput);
      const lastNameInput = formInputs.find(input => input.props('name') === 'lastName');

      expect(lastNameInput).toBeDefined();
      expect(lastNameInput?.props('required')).toBe(true);
    });

    it('should have optional middleName field', () => {
      const wrapper = mount(AddOccupantModal);
      const formInputs = wrapper.findAllComponents(FormInput);
      const middleNameInput = formInputs.find(input => input.props('name') === 'middleName');

      expect(middleNameInput).toBeDefined();
      expect(middleNameInput?.props('label')).toContain('Optional');
    });

    it('should have optional moveInDate field', () => {
      const wrapper = mount(AddOccupantModal);
      const formInputs = wrapper.findAllComponents(FormInput);
      const moveInDateInput = formInputs.find(input => input.props('name') === 'moveInDate');

      expect(moveInDateInput).toBeDefined();
      expect(moveInDateInput?.props('type')).toBe('date');
    });

    it('should have optional notes textarea', () => {
      const wrapper = mount(AddOccupantModal);
      const notesTextarea = wrapper.find('textarea[name="notes"]');
      const notesLabel = wrapper.find('label[for="notes"]');

      expect(notesTextarea.exists()).toBe(true);
      expect(notesLabel.text()).toContain('Optional');
    });
  });
});
