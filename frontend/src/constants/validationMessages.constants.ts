export const ValidationMessages = {
  required: (field: string) => `Please enter ${field}`,
  invalidEmail: 'Enter a valid email address',
  minLength: (field: string, min: number) => `${field} must be at least ${min} characters`,
} as const;
