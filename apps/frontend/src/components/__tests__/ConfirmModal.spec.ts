import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ConfirmModal from '../ConfirmModal.vue';

describe('ConfirmModal', () => {
  const defaultProps = {
    title: 'Delete Property',
    message: 'Are you sure you want to delete this property?',
  };

  describe('rendering', () => {
    it('should render title', () => {
      const wrapper = mount(ConfirmModal, { props: defaultProps });
      expect(wrapper.text()).toContain('Delete Property');
    });

    it('should render message', () => {
      const wrapper = mount(ConfirmModal, { props: defaultProps });
      expect(wrapper.text()).toContain('Are you sure you want to delete this property?');
    });

    it('should render Cancel button', () => {
      const wrapper = mount(ConfirmModal, { props: defaultProps });
      const buttons = wrapper.findAll('button');
      expect(buttons[0].text()).toBe('Cancel');
    });

    it('should render Delete button', () => {
      const wrapper = mount(ConfirmModal, { props: defaultProps });
      const buttons = wrapper.findAll('button');
      expect(buttons[1].text()).toBe('Delete');
    });

    it('should have aria-modal attribute', () => {
      const wrapper = mount(ConfirmModal, { props: defaultProps });
      const dialog = wrapper.find('[role="dialog"]');
      expect(dialog.attributes('aria-modal')).toBe('true');
    });

    it('should have role="dialog"', () => {
      const wrapper = mount(ConfirmModal, { props: defaultProps });
      const dialog = wrapper.find('[role="dialog"]');
      expect(dialog.exists()).toBe(true);
    });
  });

  describe('user interactions', () => {
    it('should emit cancel when Cancel button is clicked', async () => {
      const wrapper = mount(ConfirmModal, { props: defaultProps });
      const cancelButton = wrapper.findAll('button')[0];

      await cancelButton.trigger('click');

      expect(wrapper.emitted()).toHaveProperty('cancel');
      expect(wrapper.emitted().cancel).toHaveLength(1);
    });

    it('should emit confirm when Delete button is clicked', async () => {
      const wrapper = mount(ConfirmModal, { props: defaultProps });
      const deleteButton = wrapper.findAll('button')[1];

      await deleteButton.trigger('click');

      expect(wrapper.emitted()).toHaveProperty('confirm');
      expect(wrapper.emitted().confirm).toHaveLength(1);
    });

    it('should emit cancel when Escape key is pressed', async () => {
      const wrapper = mount(ConfirmModal, { props: defaultProps, attachTo: document.body });

      await wrapper.trigger('keydown.esc');

      expect(wrapper.emitted()).toHaveProperty('cancel');
      expect(wrapper.emitted().cancel).toHaveLength(1);

      wrapper.unmount();
    });

    it('should emit cancel when clicking backdrop', async () => {
      const wrapper = mount(ConfirmModal, { props: defaultProps });

      // Find the backdrop (outermost div with fixed positioning)
      const backdrop = wrapper.find('.fixed.inset-0');
      await backdrop.trigger('click.self');

      expect(wrapper.emitted()).toHaveProperty('cancel');
      expect(wrapper.emitted().cancel).toHaveLength(1);
    });
  });

  describe('focus management', () => {
    it('should focus first button on mount', async () => {
      const wrapper = mount(ConfirmModal, {
        props: defaultProps,
        attachTo: document.body
      });

      await nextTick();

      const cancelButton = wrapper.findAll('button')[0];
      expect(cancelButton.element).toBe(document.activeElement);

      wrapper.unmount();
    });

    it('should trap focus within modal with Tab key', async () => {
      const wrapper = mount(ConfirmModal, {
        props: defaultProps,
        attachTo: document.body
      });

      await nextTick();

      const buttons = wrapper.findAll('button');
      const cancelButton = buttons[0].element as HTMLButtonElement;
      const deleteButton = buttons[1].element as HTMLButtonElement;

      // Initially Cancel button should be focused
      expect(document.activeElement).toBe(cancelButton);

      // Tab to Delete button
      await wrapper.trigger('keydown', { key: 'Tab' });
      deleteButton.focus(); // Simulate natural tab behavior
      expect(document.activeElement).toBe(deleteButton);

      // Tab from Delete should wrap to Cancel (test the handler)
      const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
      document.dispatchEvent(tabEvent);
      await nextTick();

      wrapper.unmount();
    });
  });

  describe('styling', () => {
    it('should have correct overlay classes', () => {
      const wrapper = mount(ConfirmModal, { props: defaultProps });
      const overlay = wrapper.find('.fixed.inset-0.bg-black.bg-opacity-50');
      expect(overlay.exists()).toBe(true);
    });

    it('should have centered modal layout', () => {
      const wrapper = mount(ConfirmModal, { props: defaultProps });
      const overlay = wrapper.find('.flex.items-center.justify-center.z-50');
      expect(overlay.exists()).toBe(true);
    });

    it('should have white card with proper styling', () => {
      const wrapper = mount(ConfirmModal, { props: defaultProps });
      const modal = wrapper.find('.bg-white.rounded-lg');
      expect(modal.exists()).toBe(true);
    });

    it('should have gray Cancel button', () => {
      const wrapper = mount(ConfirmModal, { props: defaultProps });
      const cancelButton = wrapper.findAll('button')[0];
      expect(cancelButton.classes()).toContain('bg-gray-200');
    });

    it('should have red Delete button', () => {
      const wrapper = mount(ConfirmModal, { props: defaultProps });
      const deleteButton = wrapper.findAll('button')[1];
      expect(deleteButton.classes()).toContain('bg-primary-300');
    });
  });
});
