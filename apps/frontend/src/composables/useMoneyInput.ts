/**
 * Composable for handling money input fields
 * Provides parsing, formatting, and validation for currency inputs
 */
export function useMoneyInput() {
  /**
   * Parse string input to number or undefined
   * @param value - The string value from the input field
   * @returns Parsed number or undefined if empty/invalid
   */
  const parseMoneyValue = (value: string): number | undefined => {
    if (!value || value.trim() === '') return undefined;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? undefined : parsed;
  };

  /**
   * Create an input handler for VeeValidate setFieldValue
   * @param setFieldValue - VeeValidate's setFieldValue function
   * @param fieldName - The name of the field to update
   * @returns Event handler function
   */
  const createMoneyInputHandler = (
    setFieldValue: (field: string, value: any) => void,
    fieldName: string
  ) => {
    return (event: Event) => {
      const target = event.target as HTMLInputElement;
      const value = parseMoneyValue(target.value);
      setFieldValue(fieldName, value);
    };
  };

  /**
   * Validate money value (must be positive)
   * @param value - The value to validate
   * @returns Validation error message or true if valid
   */
  const validateMoneyValue = (value: number | undefined): string | true => {
    if (value === undefined) return true;
    if (value < 0) return 'Amount must be positive';
    if (value === 0) return 'Amount must be greater than zero';
    return true;
  };

  return {
    parseMoneyValue,
    createMoneyInputHandler,
    validateMoneyValue
  };
}
