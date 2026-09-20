import { Form, Input, Modal, Upload, type UploadFile } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { ModalMode } from '../../../../constants/modalMode.constants';
import { ValidationMessages } from '../../../../constants/validationMessages.constants';
import { useFilePreview } from '../../../../hooks/useFilePreview';
import { createFileTypeValidator } from '../../../../lib/createFileTypeValidator';
import type { Advertisement } from '../../../../types/advertisement.types';
import {
  AD_DESCRIPTION_MAX_LENGTH,
  AD_TITLE_MAX_LENGTH,
  AdFormFields,
} from './CreateEditAdModal.constants';
import type { AdFormType } from './CreateEditAdModal.types';
import { adFormRules } from './CreateEditAdModal.rules';
import './CreateEditAdModal.css';

/**
 * @description Antd Upload's `getValueFromEvent` - pulls the fileList out of its change event so
 * the Form.Item stores just that, not the whole event object.
 */
const normalizeUploadEvent = (event: { fileList: UploadFile[] }) => event.fileList;

const beforeUploadAsset = createFileTypeValidator(
  ['image/', 'video/'],
  ValidationMessages.invalidFileType('image or video'),
);

type CreateEditAdModalProps = {
  open: boolean;
  mode: ModalMode;
  ad?: Advertisement;
  submitting?: boolean;
  onCancel: () => void;
  onSubmit: (values: AdFormType) => void;
};

/**
 * @description Shared create/edit form for an advertisement - visual only for now, since wiring
 * needs auth this app doesn't have yet, and the backend still takes a plain asset URL rather than
 * a file upload (a follow-up change). `onSubmit` is a stub the caller controls; this component
 * owns only the form itself. There's no "ad type" to pick here - whether the upload is an image or
 * a video is read straight from the file itself, and how it's *used* (pre-roll/mid-roll/banner) is
 * decided per-placement, not on the ad.
 */
export const CreateEditAdModal = ({
  open,
  mode,
  ad,
  submitting,
  onCancel,
  onSubmit,
}: CreateEditAdModalProps) => {
  const [form] = Form.useForm<AdFormType>();

  const selectedFile = Form.useWatch(AdFormFields.AssetFile, form)?.[0]?.originFileObj;
  const previewUrl = useFilePreview(selectedFile);

  return (
    <Modal
      title={mode === ModalMode.CREATE ? 'Create ad' : 'Edit ad'}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText={mode === ModalMode.CREATE ? 'Create' : 'Save changes'}
      confirmLoading={submitting}
      destroyOnHidden
    >
      <Form<AdFormType>
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        initialValues={{
          [AdFormFields.Title]: ad?.title,
          [AdFormFields.Description]: ad?.description ?? undefined,
          [AdFormFields.ClickThroughUrl]: ad?.clickThroughUrl ?? undefined,
        }}
      >
        <Form.Item<AdFormType>
          label="Title"
          name={AdFormFields.Title}
          rules={adFormRules[AdFormFields.Title]}
        >
          <Input
            placeholder="e.g. Diwali sale — 20% off"
            maxLength={AD_TITLE_MAX_LENGTH}
            showCount
          />
        </Form.Item>

        <Form.Item<AdFormType>
          label="Description"
          name={AdFormFields.Description}
          rules={adFormRules[AdFormFields.Description]}
        >
          <Input.TextArea
            placeholder="Optional"
            maxLength={AD_DESCRIPTION_MAX_LENGTH}
            showCount
            autoSize={{ minRows: 3, maxRows: 6 }}
          />
        </Form.Item>

        {mode === ModalMode.CREATE && (
          <>
            <Form.Item<AdFormType>
              label="Asset file"
              name={AdFormFields.AssetFile}
              valuePropName="fileList"
              getValueFromEvent={normalizeUploadEvent}
              rules={adFormRules[AdFormFields.AssetFile]}
            >
              <Upload.Dragger
                accept="image/*,video/*"
                maxCount={1}
                multiple={false}
                beforeUpload={beforeUploadAsset}
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">Click or drag an image or video file to upload</p>
              </Upload.Dragger>
            </Form.Item>

            {previewUrl && (
              <div className="create-edit-ad-modal__preview">
                <img src={previewUrl} alt="Ad creative preview" />
              </div>
            )}
          </>
        )}

        <Form.Item<AdFormType>
          label="Click-through URL"
          name={AdFormFields.ClickThroughUrl}
          rules={adFormRules[AdFormFields.ClickThroughUrl]}
        >
          <Input placeholder="Optional" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
