import { Flex, Typography } from 'antd';
import { SignInForm } from '../../features/auth/components/SignInForm/SignInForm';
import './LoginPage.css';

const { Title, Text } = Typography;

/**
 * @description Admin sign-in page.
 */
export const LoginPage = () => {
  return (
    <div className="login-page">
      <div className="login-page__card">
        <Flex vertical align="center" gap={4} className="login-page__brand">
          <Title level={1} className="login-page__title">
            FrameCue
          </Title>
          <Text type="secondary">In-Video Ad Platform</Text>
        </Flex>
        <SignInForm />
      </div>
    </div>
  );
};
