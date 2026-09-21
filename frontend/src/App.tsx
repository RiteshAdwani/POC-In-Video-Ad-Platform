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
          <Toaster position="top-center" />
        </QueryClientProvider>
      </AntApp>
    </ConfigProvider>
  );
};
