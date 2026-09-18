export const SignInFormFields = {
  Email: 'email',
  Password: 'password',
} as const;

export type SignInFormFields = (typeof SignInFormFields)[keyof typeof SignInFormFields];
