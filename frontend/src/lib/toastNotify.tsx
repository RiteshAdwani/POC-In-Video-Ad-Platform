import type { ReactElement } from 'react';
import toast from 'react-hot-toast';
import CheckCircleTwoTone from '@ant-design/icons/CheckCircleTwoTone';
import CloseCircleTwoTone from '@ant-design/icons/CloseCircleTwoTone';
import ExclamationCircleTwoTone from '@ant-design/icons/ExclamationCircleTwoTone';
import InfoCircleTwoTone from '@ant-design/icons/InfoCircleTwoTone';

type ToastType = 'success' | 'error' | 'warning' | 'info';

// Colors match the tokens in theme/antdTheme.ts (colorSuccess/colorError/colorPrimary) - kept as
// literals here since react-hot-toast renders outside antd's ConfigProvider/theme context.
const TOAST_ICONS: Record<ToastType, ReactElement> = {
  success: <CheckCircleTwoTone twoToneColor={['#ffffff', '#16a34a']} />,
  error: <CloseCircleTwoTone twoToneColor={['#ffffff', '#dc2626']} />,
  info: <InfoCircleTwoTone twoToneColor={['#ffffff', '#0369a1']} />,
  warning: <ExclamationCircleTwoTone twoToneColor={['#ffffff', '#d97706']} />,
};

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/**
 * @description Shows a toast via react-hot-toast, with a semantic two-tone icon per type and the
 * message capitalized - one place so every call site gets the same look without repeating it.
 */
export const toastNotify = (type: ToastType, message: string) => {
  const content = capitalize(message);
  const icon = TOAST_ICONS[type];

  if (type === 'error') {
    toast.error(content, { icon });
    return;
  }
  toast(content, { icon });
};
