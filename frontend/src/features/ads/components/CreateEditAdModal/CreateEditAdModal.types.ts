import type { UploadFile } from 'antd';
import { AdFormFields } from './CreateEditAdModal.constants';

export type AdFormType = {
  [AdFormFields.Title]: string;
  [AdFormFields.Description]?: string;
  [AdFormFields.AssetFile]?: UploadFile[];
  [AdFormFields.ClickThroughUrl]?: string;
};
