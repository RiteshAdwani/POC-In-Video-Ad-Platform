import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import { Toaster } from 'react-hot-toast';
import { router } from './routes';
import { queryClient } from './api/queryClient';
import { antdTheme } from './theme/antdTheme';
import { AuthProvider } from './features/auth/context/AuthProvider';
import './index.css';

export const App = () => {
  return (
    <ConfigProvider theme={antdTheme}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
        <Toaster position="top-center" />
      </QueryClientProvider>
    </ConfigProvider>
  );
};
