import type { MenuProps } from 'antd';
import { NavLink } from 'react-router-dom';
import { LineChartOutlined, NotificationOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { Routes } from '../../constants/routes.constants';

// Item keys are route paths - Layout highlights whichever one the current path starts with.
export const NAV_ROUTES = [Routes.VIDEOS, Routes.ADS, Routes.DASHBOARD];

export const NAV_ITEMS: MenuProps['items'] = [
  {
    type: 'group',
    label: 'Library',
    children: [
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
    ],
  },
  {
    type: 'group',
    label: 'Insights',
    children: [
      {
        key: Routes.DASHBOARD,
        icon: <LineChartOutlined />,
        label: <NavLink to={Routes.DASHBOARD}>Dashboard</NavLink>,
      },
    ],
  },
];
