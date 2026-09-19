import { Form, Input, Modal, Upload, type UploadFile } from 'antd';
import { InboxOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { ValidationMessages } from '../../../../constants/validationMessages.constants';
import { useFilePreview } from '../../../../hooks/useFilePreview';
import { createFileTypeValidator } from '../../../../lib/createFileTypeValidator';
import type { Video } from '../../../../types/video.types';
import {
  ModalMode,
  VIDEO_DESCRIPTION_MAX_LENGTH,
  VIDEO_TITLE_MAX_LENGTH,
  VideoFormFields,
} from './CreateEditVideoModal.constants';
import type { VideoFormType } from './CreateEditVideoModal.types';
import { videoFormRules } from './CreateEditVideoModal.rules';
import './CreateEditVideoModal.css';

/**
 * @description Antd Upload's `getValueFromEvent` - pulls the fileList out of its change event so
 * the Form.Item stores just that, not the whole event object.
 */
const normalizeUploadEvent = (event: { fileList: UploadFile[] }) => event.fileList;

const beforeUpload = createFileTypeValidator(
  ['video/'],
  ValidationMessages.invalidFileType('video'),
);

type CreateEditVideoModalProps = {
  open: boolean;
  mode: ModalMode;
  video?: Video;
  submitting?: boolean;
  onCancel: () => void;
  onSubmit: (values: VideoFormType) => void;
};

/**
 * @description Shared create/edit form for a video - visual only for now, since editing has no
 * backend endpoint yet and creating needs auth wiring the app doesn't have. `onSubmit` is a stub
 * the caller controls; this component owns only the form itself.
 */
export const CreateEditVideoModal = ({
  open,
  mode,
  video,
  submitting,
  onCancel,
  onSubmit,
}: CreateEditVideoModalProps) => {
  const [form] = Form.useForm<VideoFormType>();

  const selectedFile = Form.useWatch(VideoFormFields.VideoFile, form)?.[0]?.originFileObj;
  const thumbnailUrl = useFilePreview(selectedFile);

  return (
    <Modal
      title={mode === ModalMode.CREATE ? 'Upload video' : 'Edit video'}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText={mode === ModalMode.CREATE ? 'Upload' : 'Save changes'}
      confirmLoading={submitting}
      destroyOnHidden
    >
      <Form<VideoFormType>
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        initialValues={{
          [VideoFormFields.Title]: video?.title,
          [VideoFormFields.Description]: video?.description ?? undefined,
        }}
      >
        <Form.Item<VideoFormType>
          label="Title"
          name={VideoFormFields.Title}
          rules={videoFormRules[VideoFormFields.Title]}
        >
          <Input
            placeholder="e.g. Diwali campaign — hero cut"
            maxLength={VIDEO_TITLE_MAX_LENGTH}
            showCount
          />
        </Form.Item>

        <Form.Item<VideoFormType>
          label="Description"
          name={VideoFormFields.Description}
          rules={videoFormRules[VideoFormFields.Description]}
        >
          <Input.TextArea
            placeholder="Optional"
            maxLength={VIDEO_DESCRIPTION_MAX_LENGTH}
            showCount
            autoSize={{ minRows: 3, maxRows: 6 }}
          />
        </Form.Item>

        {mode === ModalMode.CREATE && (
          <>
            <Form.Item<VideoFormType>
              label="Video file"
              name={VideoFormFields.VideoFile}
              valuePropName="fileList"
              getValueFromEvent={normalizeUploadEvent}
              rules={videoFormRules[VideoFormFields.VideoFile]}
            >
              <Upload.Dragger
                accept="video/*"
                maxCount={1}
                multiple={false}
                beforeUpload={beforeUpload}
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">Click or drag a video file to upload</p>
              </Upload.Dragger>
            </Form.Item>

            {selectedFile && (
              <div className="create-edit-video-modal__thumbnail">
                {thumbnailUrl ? (
                  <img src={thumbnailUrl} alt="Video cover preview" />
                ) : (
                  <PlayCircleOutlined className="create-edit-video-modal__thumbnail-placeholder" />
                )}
              </div>
            )}
          </>
        )}
      </Form>
    </Modal>
  );
};
