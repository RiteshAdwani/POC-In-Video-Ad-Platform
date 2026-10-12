import { NotificationOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { DashboardSection } from '../../../../constants/dashboard.constants';

// The icon, name and one-line summary shown above each dashboard section.
export const SECTION_CONTENT = {
  [DashboardSection.ADS]: {
    icon: <NotificationOutlined />,
    title: 'Ads',
    description: 'Impressions, completions, skips and clicks across your placements',
  },
  [DashboardSection.VIDEOS]: {
    icon: <VideoCameraOutlined />,
    title: 'Videos',
    description: 'How many people played your videos and watched them through',
  },
};
