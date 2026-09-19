import { Upload } from 'antd';
import { toastNotify } from './toastNotify';

/**
 * @description Builds an antd Upload `beforeUpload` that rejects any file whose mimetype doesn't
 * start with one of `acceptedTypePrefixes` - e.g. `['video/']` for videos-only, or
 * `['video/', 'image/']` for a creative that accepts either. `accept="video/*"` on the Upload
 * component itself is only a file-picker hint and does nothing for drag-and-drop, so this is the
 * actual guard.
 */
export const createFileTypeValidator =
  (acceptedTypePrefixes: string[], errorMessage: string) => (file: File) => {
    const isAccepted = acceptedTypePrefixes.some((prefix) => file.type.startsWith(prefix));
    if (!isAccepted) {
      toastNotify('error', errorMessage);
      return Upload.LIST_IGNORE;
    }
    return false;
  };
