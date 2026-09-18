import { Button, Form, Input } from 'antd';
import { SignInFormFields } from './SignInForm.constants';
import type { SignInFormType } from './SignInForm.types';
import { signInFormRules } from './SignInForm.rules';

/**
 * @description The admin sign-in form.
 */
export const SignInForm = () => {
  const [form] = Form.useForm<SignInFormType>();

  const handleFinish = (values: SignInFormType) => {
    console.log(values);
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
        <Button type="primary" htmlType="submit" size="large" block>
          Sign in
        </Button>
      </Form.Item>
    </Form>
  );
};
