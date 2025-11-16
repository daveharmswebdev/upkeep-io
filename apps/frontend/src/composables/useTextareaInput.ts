/**
 * Composable for handling textarea inputs
 * Converts empty strings to undefined for optional fields
 */
export function useTextareaInput() {
  /**
   * Create textarea input handler for VeeValidate
   * Trims whitespace and converts empty strings to undefined
   * @param setFieldValue - VeeValidate's setFieldValue function
   * @param fieldName - The name of the field to update
   * @returns Event handler function
   */
  const createTextareaHandler = (
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
    createTextareaHandler
  };
}
