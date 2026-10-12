import { Button, Layout as AntLayout, Menu } from 'antd';
import { GlobalOutlined, LogoutOutlined } from '@ant-design/icons';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { Routes } from '../../constants/routes.constants';
import { BrandMark } from './BrandMark';
import { ThemeToggle } from '../ThemeToggle/ThemeToggle';
import { NAV_ITEMS, NAV_ROUTES } from './layout.constants';
import './Layout.css';

const { Sider, Content } = AntLayout;

/**
 * @description Admin shell - a neutral sidebar with the grouped nav, the light/dark toggle, and the
 * outlet for every private route. A detail page keeps its section highlighted (/videos/:id → Videos).
 */
export const Layout = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const selectedKeys = NAV_ROUTES.filter((route) => pathname.startsWith(route));

  const handleLogout = () => {
    logout();
    void navigate(Routes.LOGIN, { replace: true });
  };

  return (
    <AntLayout className="admin-layout">
      <Sider width={264} className="admin-layout__sider">
        <div className="admin-layout__brand">
          <BrandMark />
          FrameCue
          <span className="admin-layout__theme-toggle">
            <ThemeToggle />
          </span>
        </div>
        <Menu
          mode="inline"
          selectedKeys={selectedKeys}
          items={NAV_ITEMS}
          className="admin-layout__menu"
        />
        <div className="admin-layout__footer">
          <Button
            type="text"
            icon={<GlobalOutlined />}
            href={Routes.HOME}
            target="_blank"
            rel="noreferrer"
          >
            View public site
          </Button>
          <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout}>
            Log out
          </Button>
        </div>
      </Sider>
      <AntLayout>
        <Content className="admin-layout__content">
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
};
