import type { ThemeConfig } from 'antd';

export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: '#0369A1',
    colorBgLayout: '#F8FAFC',
    colorBorder: '#E2E8F0',
    colorText: '#0F172A',
    colorSuccess: '#16A34A',
    colorError: '#DC2626',
    fontFamily: "'Source Sans 3', sans-serif",
    borderRadius: 12,
  },
  components: {
    Layout: {
      siderBg: '#0F172A',
      headerBg: '#0F172A',
    },
    Menu: {
      darkItemBg: '#0F172A',
      darkItemSelectedBg: 'rgba(255, 255, 255, 0.16)',
    },
  },
};
