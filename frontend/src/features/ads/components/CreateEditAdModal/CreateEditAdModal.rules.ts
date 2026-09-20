import type { FormRule } from 'antd';
import { ValidationMessages } from '../../../../constants/validationMessages.constants';
import {
  AD_DESCRIPTION_MAX_LENGTH,
  AD_TITLE_MAX_LENGTH,
  AdFormFields,
} from './CreateEditAdModal.constants';

/**
 * @description Field-level validation for the create/edit ad form. `AssetFile` is only ever
 * rendered (and validated) in create mode, once an ad type is chosen - the Form.Item simply
 * doesn't mount before that.
 */
export const adFormRules: Record<AdFormFields, FormRule[]> = {
  [AdFormFields.Title]: [
    { required: true, message: ValidationMessages.required('a title') },
    {
      max: AD_TITLE_MAX_LENGTH,
      message: ValidationMessages.maxLength('Title', AD_TITLE_MAX_LENGTH),
    },
  ],
  [AdFormFields.Description]: [
    {
      max: AD_DESCRIPTION_MAX_LENGTH,
      message: ValidationMessages.maxLength('Description', AD_DESCRIPTION_MAX_LENGTH),
    },
  ],
  [AdFormFields.AdType]: [{ required: true, message: ValidationMessages.required('an ad type') }],
  [AdFormFields.AssetFile]: [
    { required: true, message: ValidationMessages.required('an asset file') },
  ],
  [AdFormFields.ClickThroughUrl]: [{ type: 'url', message: ValidationMessages.invalidUrl }],
};
