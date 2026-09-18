import { Layout as AntLayout, Menu } from 'antd';
import { Outlet, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from './layout.constants';
import './Layout.css';

const { Sider, Content } = AntLayout;

/**
 * @description Admin shell - dark sidebar with the primary nav, wrapping every private route's
 * outlet. The selected item is derived from the current path rather than tracked in state.
 */
export const Layout = () => {
  const { pathname } = useLocation();

  return (
    <AntLayout className="admin-layout">
      <Sider theme="dark" width={220}>
        <div className="admin-layout__brand">FrameCue</div>
        <Menu theme="dark" mode="inline" selectedKeys={[pathname]} items={NAV_ITEMS} />
      </Sider>
      <AntLayout>
        <Content className="admin-layout__content">
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
};
