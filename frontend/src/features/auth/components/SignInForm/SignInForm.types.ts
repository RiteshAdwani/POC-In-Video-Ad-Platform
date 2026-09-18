import { SignInFormFields } from './SignInForm.constants';

export type SignInFormType = {
  [SignInFormFields.Email]: string;
  [SignInFormFields.Password]: string;
};
