import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { App as AntApp } from 'antd';
import { Toaster } from 'react-hot-toast';
import { router } from './routes';
import { queryClient } from './api/queryClient';
import { AuthProvider } from './features/auth/context/AuthProvider';
import { ThemeModeProvider } from './features/theme/context/ThemeModeProvider';
import './index.css';

export const App = () => {
  return (
    <ThemeModeProvider>
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
                fontFamily: 'var(--fc-font-sans)',
                border: '1px solid var(--fc-border)',
                boxShadow: 'var(--fc-shadow-tooltip)',
                background: 'var(--fc-surface)',
                color: 'var(--fc-text)',
              },
              success: { style: { borderLeft: '4px solid #1f9d55' } },
              error: { style: { borderLeft: '4px solid #d64545' } },
            }}
          />
        </QueryClientProvider>
      </AntApp>
    </ThemeModeProvider>
  );
};
