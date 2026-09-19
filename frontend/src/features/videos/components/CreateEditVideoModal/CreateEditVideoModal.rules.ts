import type { FormRule } from 'antd';
import { ValidationMessages } from '../../../../constants/validationMessages.constants';
import {
  VIDEO_DESCRIPTION_MAX_LENGTH,
  VIDEO_TITLE_MAX_LENGTH,
  VideoFormFields,
} from './CreateEditVideoModal.constants';

/**
 * @description Field-level validation for the create/edit video form. `VideoFile` is only ever
 * rendered (and validated) in create mode - the Form.Item simply doesn't mount in edit mode.
 */
export const videoFormRules: Record<VideoFormFields, FormRule[]> = {
  [VideoFormFields.Title]: [
    { required: true, message: ValidationMessages.required('a title') },
    {
      max: VIDEO_TITLE_MAX_LENGTH,
      message: ValidationMessages.maxLength('Title', VIDEO_TITLE_MAX_LENGTH),
    },
  ],
  [VideoFormFields.Description]: [
    {
      max: VIDEO_DESCRIPTION_MAX_LENGTH,
      message: ValidationMessages.maxLength('Description', VIDEO_DESCRIPTION_MAX_LENGTH),
    },
  ],
  [VideoFormFields.VideoFile]: [
    { required: true, message: ValidationMessages.required('a video file') },
  ],
};
