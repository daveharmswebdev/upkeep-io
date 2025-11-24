import { describe, it, expect, vi } from 'vitest';
import { useTextareaInput } from '../useTextareaInput';

describe('useTextareaInput', () => {
  describe('createTextareaHandler', () => {
    it('should create a handler that sets field value with trimmed text', () => {
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

    it('should trim whitespace and set undefined if only whitespace', () => {
      const { createTextareaHandler } = useTextareaInput();
      const setFieldValue = vi.fn();

      const handler = createTextareaHandler(setFieldValue, 'notes');
      const event = {
        target: { value: '   ' }
      } as unknown as Event;

      handler(event);

      expect(setFieldValue).toHaveBeenCalledWith('notes', undefined);
    });

    it('should trim leading and trailing whitespace from text', () => {
      const { createTextareaHandler } = useTextareaInput();
      const setFieldValue = vi.fn();

      const handler = createTextareaHandler(setFieldValue, 'notes');
      const event = {
        target: { value: '  Some notes  ' }
      } as unknown as Event;

      handler(event);

      expect(setFieldValue).toHaveBeenCalledWith('notes', 'Some notes');
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

      // Should trim leading/trailing spaces but preserve internal spaces
      expect(setFieldValue).toHaveBeenCalledWith('notes', 'This  has   multiple    spaces   between   words');
    });

    it('should preserve internal spaces in typical note text', () => {
      const { createTextareaHandler } = useTextareaInput();
      const setFieldValue = vi.fn();

      const handler = createTextareaHandler(setFieldValue, 'notes');
      const event = {
        target: { value: '  Tenant is responsible for lawn care and utilities.  ' }
      } as unknown as Event;

      handler(event);

      expect(setFieldValue).toHaveBeenCalledWith('notes', 'Tenant is responsible for lawn care and utilities.');
    });
  });
});
