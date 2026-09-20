import { useState } from 'react';
import { Button, Flex, Typography } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { CreateEditVideoModal } from '../../features/videos/components/CreateEditVideoModal/CreateEditVideoModal';
import { ModalMode } from '../../constants/modalMode.constants';
import type { VideoFormType } from '../../features/videos/components/CreateEditVideoModal/CreateEditVideoModal.types';
import { VideosGrid } from '../../features/videos/components/VideosGrid/VideosGrid';
import { MOCK_VIDEOS } from '../../features/videos/mocks/videos.mock';
import { useModalState } from '../../hooks/useModalState';
import type { Video } from '../../types/video.types';
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
   * @description Visual only for now - editing has no backend endpoint yet, and creating needs
   * auth wiring this app doesn't have yet.
   */
  const handleSubmit = (values: VideoFormType) => {
    console.log(values);
    closeModal();
  };

  return (
    <div className="videos-page">
      <Flex justify="space-between" align="flex-start" className="videos-page__header">
        <Flex vertical gap={4}>
          <Title level={2}>Videos</Title>
          <Text type="secondary">{MOCK_VIDEOS.length} videos in your library</Text>
        </Flex>
        <Button type="primary" size="large" icon={<UploadOutlined />} onClick={openCreateModal}>
          Upload video
        </Button>
      </Flex>

      <VideosGrid videos={MOCK_VIDEOS} onEdit={openEditModal} />

      {open && (
        <CreateEditVideoModal
          open
          mode={modalMode}
          video={editingVideo}
          onCancel={closeModal}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};
