import { Link } from 'react-router-dom';
import { Divider, Typography } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import { Routes } from '../../constants/routes.constants';
import { LoginShowcase } from '../../features/auth/components/LoginShowcase/LoginShowcase';
import { SignInForm } from '../../features/auth/components/SignInForm/SignInForm';
import { ThemeToggle } from '../../components/ThemeToggle/ThemeToggle';
import './LoginPage.css';

const { Title, Text } = Typography;

/**
 * @description Admin sign-in page - the brand showcase on one side, the form on the other. Also
 * the door a guest can bounce right back out of, since anyone can land here (it's linked from the
 * public catalog's "Admin login").
 */
export const LoginPage = () => (
  <div className="login-page">
    <LoginShowcase />

    <section className="login-page__form-side">
      <div className="login-page__toggle">
        <ThemeToggle />
      </div>

      <div className="login-page__form">
        <Title level={1} className="login-page__title">
          Sign in
        </Title>
        <Text type="secondary" className="login-page__subtitle">
          Admin access to your videos and ads
        </Text>

        <SignInForm />

        <Divider className="login-page__divider">or</Divider>

        <Link to={Routes.HOME} className="login-page__guest-link">
          Browse videos as a guest <ArrowRightOutlined />
        </Link>
      </div>
    </section>
  </div>
);
