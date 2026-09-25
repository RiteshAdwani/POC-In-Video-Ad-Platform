export const ValidationMessages = {
  required: (field: string) => `Please enter ${field}`,
  invalidEmail: 'Enter a valid email address',
  minLength: (field: string, min: number) => `${field} must be at least ${min} characters`,
  maxLength: (field: string, max: number) => `${field} must be at most ${max} characters`,
  min: (field: string, min: number) => `${field} must be at least ${min}`,
  max: (field: string, max: number) => `${field} must be at most ${max}`,
  invalidFileType: (accepted: string) => `Only ${accepted} files are allowed`,
  invalidUrl: 'Enter a valid URL',
} as const;
