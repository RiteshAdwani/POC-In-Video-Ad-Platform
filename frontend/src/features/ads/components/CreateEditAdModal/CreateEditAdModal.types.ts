import type { UploadFile } from 'antd';
import type { AdType } from '../../../../constants/ad.constants';
import { AdFormFields } from './CreateEditAdModal.constants';

export type AdFormType = {
  [AdFormFields.Title]: string;
  [AdFormFields.Description]?: string;
  [AdFormFields.AdType]: AdType;
  [AdFormFields.AssetFile]?: UploadFile[];
  [AdFormFields.ClickThroughUrl]?: string;
};
