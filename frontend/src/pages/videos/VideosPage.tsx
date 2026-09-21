import { useState } from 'react';
import { Button, Flex, Result, Typography } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { CreateEditVideoModal } from '../../features/videos/components/CreateEditVideoModal/CreateEditVideoModal';
import { ModalMode } from '../../constants/modalMode.constants';
import { VideoFormFields } from '../../features/videos/components/CreateEditVideoModal/CreateEditVideoModal.constants';
import type { VideoFormType } from '../../features/videos/components/CreateEditVideoModal/CreateEditVideoModal.types';
import { VideosGrid } from '../../features/videos/components/VideosGrid/VideosGrid';
import { PageSpinner } from '../../components/PageSpinner/PageSpinner';
import { useVideosQuery } from '../../features/videos/hooks/useVideosQuery';
import { useUploadVideoMutation } from '../../features/videos/hooks/useUploadVideoMutation';
import { useUpdateVideoMutation } from '../../features/videos/hooks/useUpdateVideoMutation';
import { useDeleteVideoModal } from '../../features/videos/hooks/useDeleteVideoModal';
import { useModalState } from '../../hooks/useModalState';
import type { Video } from '../../types/video.types';
import type { UpdateVideoRequestDto } from '../../dtos/video.dto';
import './VideosPage.css';

const { Title, Text } = Typography;

/**
 * @description Admin video library - lists every uploaded video with its processing status and
 * ad-placement count.
 */
export const VideosPage = () => {
  const { open, handleOpen, handleClose } = useModalState();
  const [modalMode, setModalMode] = useState<ModalMode>(ModalMode.CREATE);
  const [editingVideo, setEditingVideo] = useState<Video | undefined>(undefined);

  const { data: videos, isLoading, isError } = useVideosQuery();
  const { mutate: uploadVideoMutation, isPending: isUploadVideoMutationPending } =
    useUploadVideoMutation();
  const { mutate: updateVideoMutation, isPending: isUpdateVideoMutationPending } =
    useUpdateVideoMutation();
  const confirmDeleteVideo = useDeleteVideoModal();

  /**
   * @description Opens the shared modal in create mode, with a blank form.
   */
  const openCreateModal = () => {
    setModalMode(ModalMode.CREATE);
    setEditingVideo(undefined);
    handleOpen();
  };

  /**
   * @description Opens the shared modal in edit mode, pre-filled with the clicked video.
   */
  const openEditModal = (video: Video) => {
    setModalMode(ModalMode.EDIT);
    setEditingVideo(video);
    handleOpen();
  };

  /**
   * @description Hides the modal and clears the video being edited, so a stale video isn't
   * carried into the next create-mode open.
   */
  const closeModal = () => {
    handleClose();
    setEditingVideo(undefined);
  };

  /**
   * @description Creating uploads the file (multipart); editing only ever touches title/
   * description - the Form.Item for the file doesn't even render in edit mode.
   */
  const handleSubmit = (values: VideoFormType) => {
    if (modalMode === ModalMode.CREATE) {
      const file = values[VideoFormFields.VideoFile]?.[0]?.originFileObj;
      if (!file) {
        return;
      }
      const description = values[VideoFormFields.Description];
      const formData = new FormData();
      formData.append('title', values[VideoFormFields.Title]);
      if (description) {
        formData.append('description', description);
      }
      formData.append('video', file);
      uploadVideoMutation(formData, { onSuccess: closeModal });
    } else {
      const reqBody: UpdateVideoRequestDto = {
        title: values[VideoFormFields.Title],
        description: values[VideoFormFields.Description],
      };
      updateVideoMutation({ id: editingVideo!.id, data: reqBody }, { onSuccess: closeModal });
    }
  };

  let content;
  if (isLoading) {
    content = <PageSpinner />;
  } else if (isError) {
    content = (
      <Result status="error" title="Couldn't load videos" subTitle="Please try again shortly." />
    );
  } else {
    content = (
      <VideosGrid videos={videos ?? []} onEdit={openEditModal} onDelete={confirmDeleteVideo} />
    );
  }

  return (
    <div className="videos-page">
      <Flex justify="space-between" align="flex-start" className="videos-page__header">
        <Flex vertical gap={4}>
          <Title level={2}>Videos</Title>
          <Text type="secondary">{videos?.length ?? 0} videos in your library</Text>
        </Flex>
        <Button type="primary" size="large" icon={<UploadOutlined />} onClick={openCreateModal}>
          Upload video
        </Button>
      </Flex>

      {content}

      {open && (
        <CreateEditVideoModal
          open
          mode={modalMode}
          video={editingVideo}
          submitting={isUploadVideoMutationPending || isUpdateVideoMutationPending}
          onCancel={closeModal}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};
