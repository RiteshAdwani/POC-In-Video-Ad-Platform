import type { FormRule } from 'antd';
import { ValidationMessages } from '../../../../constants/validationMessages.constants';
import { SignInFormFields } from './SignInForm.constants';

/**
 * @description Field-level validation for the sign-in form, keyed by `SignInFormFields` so each
 * `Form.Item` can pull its `rules` straight from here instead of inlining them.
 */
export const signInFormRules: Record<SignInFormFields, FormRule[]> = {
  [SignInFormFields.Email]: [
    { required: true, message: ValidationMessages.required('your email') },
    { type: 'email', message: ValidationMessages.invalidEmail },
  ],
  [SignInFormFields.Password]: [
    { required: true, message: ValidationMessages.required('your password') },
    { min: 6, message: ValidationMessages.minLength('Password', 6) },
  ],
};
