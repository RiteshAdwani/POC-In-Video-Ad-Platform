import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { App as AntApp, ConfigProvider } from 'antd';
import { Toaster } from 'react-hot-toast';
import { router } from './routes';
import { queryClient } from './api/queryClient';
import { antdTheme } from './theme/antdTheme';
import { AuthProvider } from './features/auth/context/AuthProvider';
import './index.css';

export const App = () => {
  return (
    <ConfigProvider theme={antdTheme}>
      {/* antd's own App context - lets Modal.confirm/message/notification (via App.useApp())
          consume the theme above, which the static antd functions can't do on their own. */}
      <AntApp>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                borderRadius: 12,
                fontFamily: "'Source Sans 3', sans-serif",
                border: '1px solid #e2e8f0',
                boxShadow: '0 8px 20px rgba(15, 23, 42, 0.1)',
                color: '#0f172a',
              },
              success: { style: { borderLeft: '4px solid #16a34a' } },
              error: { style: { borderLeft: '4px solid #dc2626' } },
            }}
          />
        </QueryClientProvider>
      </AntApp>
    </ConfigProvider>
  );
};
