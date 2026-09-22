import { Link } from 'react-router-dom';
import { Divider, Flex, Typography } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import { Routes } from '../../constants/routes.constants';
import { SignInForm } from '../../features/auth/components/SignInForm/SignInForm';
import './LoginPage.css';

const { Title, Text } = Typography;

/**
 * @description Admin sign-in page - also the door a guest can bounce right back out of, since
 * anyone can land here (it's linked from the public catalog's "Admin login").
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

        <Text strong className="login-page__section-label">
          Admin sign in
        </Text>
        <SignInForm />

        <Divider className="login-page__divider">or</Divider>

        <Link to={Routes.HOME} className="login-page__guest-link">
          Continue as a guest <ArrowRightOutlined />
        </Link>
      </div>
    </div>
  );
};
