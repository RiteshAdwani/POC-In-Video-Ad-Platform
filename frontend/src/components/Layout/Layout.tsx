import { Button, ConfigProvider, Layout as AntLayout, Menu } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { Routes } from '../../constants/routes.constants';
import { NAV_ITEMS } from './layout.constants';
import './Layout.css';

const { Sider, Content } = AntLayout;

/**
 * @description Admin shell - dark sidebar with the primary nav, wrapping every private route's
 * outlet. The selected item is derived from the current path rather than tracked in state.
 */
export const Layout = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate(Routes.LOGIN, { replace: true });
  };

  return (
    <AntLayout className="admin-layout">
      <Sider theme="dark" width={220} className="admin-layout__sider">
        <div className="admin-layout__brand">FrameCue</div>
        <Menu theme="dark" mode="inline" selectedKeys={[pathname]} items={NAV_ITEMS} />
        {/* A plain text Button's color/hover tokens default to the light theme's colorText
            (dark) - it has no idea it's sitting on a dark sider - so override just those tokens
            for this one button instead of fighting antd's own CSS specificity. */}
        <ConfigProvider
          theme={{
            components: {
              Button: {
                textTextColor: 'rgba(255, 255, 255, 0.75)',
                textTextHoverColor: '#ffffff',
                textHoverBg: 'rgba(255, 255, 255, 0.08)',
              },
            },
          }}
        >
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            className="admin-layout__logout"
          >
            Log out
          </Button>
        </ConfigProvider>
      </Sider>
      <AntLayout>
        <Content className="admin-layout__content">
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
};
