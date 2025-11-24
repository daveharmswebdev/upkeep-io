import { describe, it, expect, vi } from 'vitest';
import { useTextareaInput } from '../useTextareaInput';

describe('useTextareaInput', () => {
  describe('createTextareaHandler (input event)', () => {
    it('should create a handler that sets field value without trimming', () => {
      const { createTextareaHandler } = useTextareaInput();
      const setFieldValue = vi.fn();

      const handler = createTextareaHandler(setFieldValue, 'notes');
      const event = {
        target: { value: 'Some notes here' }
      } as unknown as Event;

      handler(event);

      expect(setFieldValue).toHaveBeenCalledWith('notes', 'Some notes here');
    });

    it('should set undefined for empty string', () => {
      const { createTextareaHandler } = useTextareaInput();
      const setFieldValue = vi.fn();

      const handler = createTextareaHandler(setFieldValue, 'notes');
      const event = {
        target: { value: '' }
      } as unknown as Event;

      handler(event);

      expect(setFieldValue).toHaveBeenCalledWith('notes', undefined);
    });

    it('should NOT trim whitespace during input (allow typing spaces)', () => {
      const { createTextareaHandler } = useTextareaInput();
      const setFieldValue = vi.fn();

      const handler = createTextareaHandler(setFieldValue, 'notes');
      const event = {
        target: { value: '   ' }
      } as unknown as Event;

      handler(event);

      // Should preserve whitespace during input
      expect(setFieldValue).toHaveBeenCalledWith('notes', '   ');
    });

    it('should NOT trim leading and trailing whitespace during input', () => {
      const { createTextareaHandler } = useTextareaInput();
      const setFieldValue = vi.fn();

      const handler = createTextareaHandler(setFieldValue, 'notes');
      const event = {
        target: { value: '  Some notes  ' }
      } as unknown as Event;

      handler(event);

      // Should preserve leading/trailing spaces during typing
      expect(setFieldValue).toHaveBeenCalledWith('notes', '  Some notes  ');
    });

    it('should work with different field names', () => {
      const { createTextareaHandler } = useTextareaInput();
      const setFieldValue = vi.fn();

      const handler = createTextareaHandler(setFieldValue, 'description');
      const event = {
        target: { value: 'A description' }
      } as unknown as Event;

      handler(event);

      expect(setFieldValue).toHaveBeenCalledWith('description', 'A description');
    });

    it('should preserve internal whitespace and line breaks', () => {
      const { createTextareaHandler } = useTextareaInput();
      const setFieldValue = vi.fn();

      const handler = createTextareaHandler(setFieldValue, 'notes');
      const event = {
        target: { value: 'Line 1\nLine 2\n  Line 3' }
      } as unknown as Event;

      handler(event);

      expect(setFieldValue).toHaveBeenCalledWith('notes', 'Line 1\nLine 2\n  Line 3');
    });

    it('should preserve multiple internal spaces between words', () => {
      const { createTextareaHandler } = useTextareaInput();
      const setFieldValue = vi.fn();

      const handler = createTextareaHandler(setFieldValue, 'notes');
      const event = {
        target: { value: '  This  has   multiple    spaces   between   words  ' }
      } as unknown as Event;

      handler(event);

      // Should preserve ALL spaces during input
      expect(setFieldValue).toHaveBeenCalledWith('notes', '  This  has   multiple    spaces   between   words  ');
    });

    it('should preserve internal spaces in typical note text with trailing spaces', () => {
      const { createTextareaHandler } = useTextareaInput();
      const setFieldValue = vi.fn();

      const handler = createTextareaHandler(setFieldValue, 'notes');
      const event = {
        target: { value: '  Tenant is responsible for lawn care and utilities.  ' }
      } as unknown as Event;

      handler(event);

      // Should preserve leading/trailing spaces during input
      expect(setFieldValue).toHaveBeenCalledWith('notes', '  Tenant is responsible for lawn care and utilities.  ');
    });
  });

  describe('createTextareaBlurHandler (blur event)', () => {
    it('should trim whitespace on blur', () => {
      const { createTextareaBlurHandler } = useTextareaInput();
      const setFieldValue = vi.fn();

      const handler = createTextareaBlurHandler(setFieldValue, 'notes');
      const event = {
        target: { value: '  Some notes  ' }
      } as unknown as Event;

      handler(event);

      expect(setFieldValue).toHaveBeenCalledWith('notes', 'Some notes');
    });

    it('should set undefined for whitespace-only strings on blur', () => {
      const { createTextareaBlurHandler } = useTextareaInput();
      const setFieldValue = vi.fn();

      const handler = createTextareaBlurHandler(setFieldValue, 'notes');
      const event = {
        target: { value: '   ' }
      } as unknown as Event;

      handler(event);

      expect(setFieldValue).toHaveBeenCalledWith('notes', undefined);
    });

    it('should set undefined for empty strings on blur', () => {
      const { createTextareaBlurHandler } = useTextareaInput();
      const setFieldValue = vi.fn();

      const handler = createTextareaBlurHandler(setFieldValue, 'notes');
      const event = {
        target: { value: '' }
      } as unknown as Event;

      handler(event);

      expect(setFieldValue).toHaveBeenCalledWith('notes', undefined);
    });

    it('should preserve internal spaces while trimming edges on blur', () => {
      const { createTextareaBlurHandler } = useTextareaInput();
      const setFieldValue = vi.fn();

      const handler = createTextareaBlurHandler(setFieldValue, 'notes');
      const event = {
        target: { value: '  This  has   multiple    spaces  ' }
      } as unknown as Event;

      handler(event);

      // Should trim leading/trailing but preserve internal spaces
      expect(setFieldValue).toHaveBeenCalledWith('notes', 'This  has   multiple    spaces');
    });

    it('should preserve line breaks while trimming on blur', () => {
      const { createTextareaBlurHandler } = useTextareaInput();
      const setFieldValue = vi.fn();

      const handler = createTextareaBlurHandler(setFieldValue, 'notes');
      const event = {
        target: { value: '  Line 1\nLine 2\n  Line 3  ' }
      } as unknown as Event;

      handler(event);

      expect(setFieldValue).toHaveBeenCalledWith('notes', 'Line 1\nLine 2\n  Line 3');
    });
  });
});
