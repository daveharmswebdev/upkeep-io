/**
 * Composable for handling textarea inputs
 * Converts empty strings to undefined for optional fields
 */
export function useTextareaInput() {
  /**
   * Create textarea input handler for VeeValidate
   * Updates field value as user types (no trimming during input)
   * @param setFieldValue - VeeValidate's setFieldValue function
   * @param fieldName - The name of the field to update
   * @returns Event handler function for input events
   */
  const createTextareaHandler = (
    setFieldValue: (field: string, value: any) => void,
    fieldName: string
  ) => {
    return (event: Event) => {
      const target = event.target as HTMLTextAreaElement;
      const value = target.value;
      // Don't trim during input - let users type spaces freely
      setFieldValue(fieldName, value || undefined);
    };
  };

  /**
   * Create blur handler for textarea that trims whitespace
   * Call this on blur event to clean up leading/trailing spaces
   * @param setFieldValue - VeeValidate's setFieldValue function
   * @param fieldName - The name of the field to update
   * @returns Event handler function for blur events
   */
  const createTextareaBlurHandler = (
    setFieldValue: (field: string, value: any) => void,
    fieldName: string
  ) => {
    return (event: Event) => {
      const target = event.target as HTMLTextAreaElement;
      const value = target.value.trim();
      setFieldValue(fieldName, value || undefined);
    };
  };

  return {
    createTextareaHandler,
    createTextareaBlurHandler
  };
}
