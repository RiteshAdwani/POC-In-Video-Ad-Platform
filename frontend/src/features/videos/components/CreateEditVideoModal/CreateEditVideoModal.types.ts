import type { UploadFile } from 'antd';
import { VideoFormFields } from './CreateEditVideoModal.constants';

export type VideoFormType = {
  [VideoFormFields.Title]: string;
  [VideoFormFields.Description]?: string;
  [VideoFormFields.VideoFile]?: UploadFile[];
};
