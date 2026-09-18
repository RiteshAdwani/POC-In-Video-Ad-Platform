import type { MenuProps } from 'antd';
import { NavLink } from 'react-router-dom';
import { DashboardOutlined, NotificationOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { Routes } from '../../constants/routes.constants';

export const NAV_ITEMS: MenuProps['items'] = [
  {
    key: Routes.VIDEOS,
    icon: <VideoCameraOutlined />,
    label: <NavLink to={Routes.VIDEOS}>Videos</NavLink>,
  },
  {
    key: Routes.ADS,
    icon: <NotificationOutlined />,
    label: <NavLink to={Routes.ADS}>Ads</NavLink>,
  },
  {
    key: Routes.DASHBOARD,
    icon: <DashboardOutlined />,
    label: <NavLink to={Routes.DASHBOARD}>Dashboard</NavLink>,
  },
];
