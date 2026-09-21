import { Button, Form, Input } from 'antd';
import { useLocation, useNavigate, type Location } from 'react-router-dom';
import { Routes } from '../../../../constants/routes.constants';
import { useAuth } from '../../hooks/useAuth';
import { useLoginMutation } from '../../hooks/useLoginMutation';
import { SignInFormFields } from './SignInForm.constants';
import type { SignInFormType } from './SignInForm.types';
import { signInFormRules } from './SignInForm.rules';

/**
 * @description The admin sign-in form. On success, sends the admin back to whichever private
 * route they were originally headed to (RequireAuth stashes it in location.state), or the video
 * library if they landed on /login directly.
 */
export const SignInForm = () => {
  const [form] = Form.useForm<SignInFormType>();
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { mutate, isPending } = useLoginMutation();

  const handleFinish = (values: SignInFormType) => {
    mutate(values, {
      onSuccess: (response) => {
        login(response.data.data.accessToken);
        const from = (location.state as { from?: Location })?.from?.pathname ?? Routes.VIDEOS;
        navigate(from, { replace: true });
      },
    });
  };

  return (
    <Form form={form} layout="vertical" requiredMark={false} onFinish={handleFinish}>
      <Form.Item<SignInFormType>
        label="Email"
        name={SignInFormFields.Email}
        rules={signInFormRules[SignInFormFields.Email]}
      >
        <Input size="large" placeholder="you@company.com" autoComplete="email" />
      </Form.Item>

      <Form.Item<SignInFormType>
        label="Password"
        name={SignInFormFields.Password}
        rules={signInFormRules[SignInFormFields.Password]}
      >
        <Input.Password
          size="large"
          placeholder="Enter your password"
          autoComplete="current-password"
        />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" size="large" block loading={isPending}>
          Sign in
        </Button>
      </Form.Item>
    </Form>
  );
};
