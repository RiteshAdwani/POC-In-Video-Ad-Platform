import { useState } from 'react';
import { Flex, Segmented } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { CreateEditVideoModal } from '../../features/videos/components/CreateEditVideoModal/CreateEditVideoModal';
import { ModalMode } from '../../constants/modalMode.constants';
import { VideoFormFields } from '../../features/videos/components/CreateEditVideoModal/CreateEditVideoModal.constants';
import type { VideoFormType } from '../../features/videos/components/CreateEditVideoModal/CreateEditVideoModal.types';
import { VideosListContent } from '../../features/videos/components/VideosListContent/VideosListContent';
import { useVideosQuery } from '../../features/videos/hooks/useVideosQuery';
import { useUploadVideoMutation } from '../../features/videos/hooks/useUploadVideoMutation';
import { useUpdateVideoMutation } from '../../features/videos/hooks/useUpdateVideoMutation';
import { useDeleteVideoModal } from '../../features/videos/hooks/useDeleteVideoModal';
import { useModalState } from '../../hooks/useModalState';
import { usePaginationParam } from '../../hooks/usePaginationParam';
import { useListViewParam } from '../../hooks/useListViewParam';
import { useListSearchParam } from '../../hooks/useListSearchParam';
import { LIST_VIEW_OPTIONS, ListView } from '../../constants/listView.constants';
import { ListPageHeader } from '../../components/ListPageHeader/ListPageHeader';
import { SearchInput } from '../../components/SearchInput/SearchInput';
import type { Video } from '../../types/video.types';
import type { UpdateVideoRequestDto } from '../../dtos/video.dto';
import './VideosPage.css';

/**
 * @description Admin video library - lists every uploaded video with its processing status and
 * ad-placement count.
 */
export const VideosPage = () => {
  const { open, handleOpen, handleClose } = useModalState();
  const [modalMode, setModalMode] = useState<ModalMode>(ModalMode.CREATE);
  const [editingVideo, setEditingVideo] = useState<Video | undefined>(undefined);

  const { page, onPageChange } = usePaginationParam();
  const { view, onViewChange } = useListViewParam();
  const isDeletedView = view === ListView.DELETED;
  const { search, onSearch } = useListSearchParam();
  const { data, isLoading, isError } = useVideosQuery(page, search, view);

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
      uploadVideoMutation({ formData }, { onSuccess: closeModal });
    } else {
      const reqBody: UpdateVideoRequestDto = {
        title: values[VideoFormFields.Title],
        description: values[VideoFormFields.Description],
      };
      updateVideoMutation({ id: editingVideo!.id, data: reqBody }, { onSuccess: closeModal });
    }
  };

  return (
    <div className="videos-page">
      <ListPageHeader
        title="Videos"
        subtitle={`${data?.pagination.totalItems ?? 0} ${isDeletedView ? 'deleted videos' : 'videos in your library'}`}
        actionLabel="Upload video"
        actionIcon={<UploadOutlined />}
        onAction={openCreateModal}
      />

      <Flex justify="space-between" align="center" gap={16} wrap className="videos-page__toolbar">
        <SearchInput
          placeholder="Search videos by title"
          onSearch={onSearch}
          initialValue={search}
          className="videos-page__search"
        />
        <Segmented
          options={LIST_VIEW_OPTIONS}
          value={view}
          onChange={(value) => onViewChange(value as ListView)}
        />
      </Flex>

      <div className="videos-page__body">
        <VideosListContent
          data={data}
          isLoading={isLoading}
          isError={isError}
          search={search}
          isDeletedView={isDeletedView}
          onUpload={openCreateModal}
          onEdit={openEditModal}
          onDelete={confirmDeleteVideo}
          onPageChange={onPageChange}
        />
      </div>

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
