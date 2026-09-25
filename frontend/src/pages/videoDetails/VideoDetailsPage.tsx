import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Button, Result } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Routes } from '../../constants/routes.constants';
import { VideoPreviewHeader } from '../../features/videos/components/VideoPreviewHeader/VideoPreviewHeader';
import { AdPlacementsSection } from '../../features/videos/components/AdPlacementsSection/AdPlacementsSection';
import { CreateEditAdPlacementModal } from '../../features/videos/components/CreateEditAdPlacementModal/CreateEditAdPlacementModal';
import { AdPlacementFormFields } from '../../features/videos/components/CreateEditAdPlacementModal/CreateEditAdPlacementModal.constants';
import type { AdPlacementFormType } from '../../features/videos/components/CreateEditAdPlacementModal/CreateEditAdPlacementModal.types';
import { CreateEditVideoModal } from '../../features/videos/components/CreateEditVideoModal/CreateEditVideoModal';
import { ModalMode } from '../../constants/modalMode.constants';
import type { VideoFormType } from '../../features/videos/components/CreateEditVideoModal/CreateEditVideoModal.types';
import { VideoFormFields } from '../../features/videos/components/CreateEditVideoModal/CreateEditVideoModal.constants';
import { PageSpinner } from '../../components/PageSpinner/PageSpinner';
import { useAdsQuery } from '../../features/ads/hooks/useAdsQuery';
import { useVideoQuery } from '../../features/videos/hooks/useVideoQuery';
import { useUpdateVideoMutation } from '../../features/videos/hooks/useUpdateVideoMutation';
import { useDeleteVideoModal } from '../../features/videos/hooks/useDeleteVideoModal';
import { useAdPlacementsQuery } from '../../features/videos/hooks/useAdPlacementsQuery';
import { useCreateAdPlacementMutation } from '../../features/videos/hooks/useCreateAdPlacementMutation';
import { useUpdateAdPlacementMutation } from '../../features/videos/hooks/useUpdateAdPlacementMutation';
import { useDeleteAdPlacementModal } from '../../features/videos/hooks/useDeleteAdPlacementModal';
import { useModalState } from '../../hooks/useModalState';
import type { UpdateVideoRequestDto } from '../../dtos/video.dto';
import type {
  CreateAdPlacementRequestDto,
  UpdateAdPlacementRequestDto,
} from '../../dtos/adPlacement.dto';
import type { AdPlacement } from '../../types/adPlacement.types';

/**
 * @description One video's full detail view - a plain preview player (no ad injection, unlike
 * the public playback page), metadata, edit/delete actions, and its ad placements.
 */
export const VideoDetailsPage = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  // Edit-video modal states
  const { open, handleOpen, handleClose } = useModalState();
  // Create/edit-ad-placement modal states
  const {
    open: adPlacementModalOpen,
    handleOpen: openAdPlacementModal,
    handleClose: closeAdPlacementModal,
  } = useModalState();
  const [adPlacementModalMode, setAdPlacementModalMode] = useState<ModalMode>(ModalMode.CREATE);
  const [editingAdPlacement, setEditingAdPlacement] = useState<AdPlacement | undefined>(undefined);

  const { data: video, isLoading, isError, error } = useVideoQuery(videoId);
  const { mutate: updateVideoMutation, isPending: isUpdateVideoMutationPending } =
    useUpdateVideoMutation();
  const confirmDeleteVideo = useDeleteVideoModal();

  const { data: ads } = useAdsQuery();
  const { data: adPlacements } = useAdPlacementsQuery(videoId);
  const { mutate: createAdPlacementMutation, isPending: isCreateAdPlacementMutationPending } =
    useCreateAdPlacementMutation(videoId!);
  const { mutate: updateAdPlacementMutation, isPending: isUpdateAdPlacementMutationPending } =
    useUpdateAdPlacementMutation(videoId!);
  const confirmDeleteAdPlacement = useDeleteAdPlacementModal(videoId!);

  /**
   * @description Editing a video only ever touches title/description.
   */
  const handleSubmit = (values: VideoFormType) => {
    const reqBody: UpdateVideoRequestDto = {
      title: values[VideoFormFields.Title],
      description: values[VideoFormFields.Description],
    };
    updateVideoMutation({ id: video!.id, data: reqBody }, { onSuccess: handleClose });
  };

  /**
   * @description Confirms before permanently deleting this video and its Cloudinary asset -
   * rejected by the backend if it still has ad placements or recorded playback events.
   */
  const handleDelete = () => {
    confirmDeleteVideo(video!, { onSuccess: () => navigate(Routes.VIDEOS) });
  };

  /**
   * @description Opens the placement modal in create mode, with a blank form.
   */
  const handleAddAdPlacement = () => {
    setAdPlacementModalMode(ModalMode.CREATE);
    setEditingAdPlacement(undefined);
    openAdPlacementModal();
  };

  /**
   * @description Opens the placement modal in edit mode, pre-filled with the clicked placement.
   */
  const handleEditAdPlacement = (adPlacement: AdPlacement) => {
    setAdPlacementModalMode(ModalMode.EDIT);
    setEditingAdPlacement(adPlacement);
    openAdPlacementModal();
  };

  /**
   * @description Hides the placement modal and clears the placement being edited, so a stale
   * placement isn't carried into the next create-mode open.
   */
  const handleCloseAdPlacementModal = () => {
    closeAdPlacementModal();
    setEditingAdPlacement(undefined);
  };

  /**
   * @description Creating attaches a new ad to this video; editing only ever touches an existing
   * placement's type/position/timing - which ad is placed can't change (the Form.Item for it is
   * disabled in edit mode).
   */
  const handleAdPlacementSubmit = (values: AdPlacementFormType) => {
    const durationSeconds = values[AdPlacementFormFields.DurationSeconds] ?? undefined;
    const skipAfterSeconds = values[AdPlacementFormFields.SkipAfterSeconds] ?? undefined;

    if (adPlacementModalMode === ModalMode.CREATE) {
      const reqBody: CreateAdPlacementRequestDto = {
        advertisementId: values[AdPlacementFormFields.AdvertisementId],
        adType: values[AdPlacementFormFields.AdType],
        startOffsetSeconds: values[AdPlacementFormFields.StartOffsetSeconds],
        durationSeconds,
        skipAfterSeconds,
      };
      createAdPlacementMutation(reqBody, { onSuccess: handleCloseAdPlacementModal });
    } else {
      const reqBody: UpdateAdPlacementRequestDto = {
        adType: values[AdPlacementFormFields.AdType],
        startOffsetSeconds: values[AdPlacementFormFields.StartOffsetSeconds],
        durationSeconds,
        skipAfterSeconds,
      };
      updateAdPlacementMutation(
        { id: editingAdPlacement!.id, data: reqBody },
        { onSuccess: handleCloseAdPlacementModal },
      );
    }
  };

  if (isLoading) {
    return <PageSpinner />;
  }

  if (isError || !video) {
    const isNotFound = axios.isAxiosError(error) && error.response?.status === 404;
    return (
      <Result
        status={isNotFound ? '404' : 'error'}
        title={isNotFound ? 'Video not found' : "Couldn't load this video"}
        extra={
          <Button type="primary" onClick={() => navigate(Routes.VIDEOS)}>
            Back to videos
          </Button>
        }
      />
    );
  }

  return (
    <div>
      <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(Routes.VIDEOS)}>
        Back to videos
      </Button>

      <VideoPreviewHeader video={video} onEdit={handleOpen} onDelete={handleDelete} />

      <AdPlacementsSection
        adPlacements={adPlacements}
        videoStatus={video.status}
        onAdd={handleAddAdPlacement}
        onEdit={handleEditAdPlacement}
        onDelete={confirmDeleteAdPlacement}
      />

      {/* Edit-video modal */}
      {open && (
        <CreateEditVideoModal
          open
          mode={ModalMode.EDIT}
          video={video}
          submitting={isUpdateVideoMutationPending}
          onCancel={handleClose}
          onSubmit={handleSubmit}
        />
      )}

      {/* Create/edit placement modal */}
      {adPlacementModalOpen && (
        <CreateEditAdPlacementModal
          open
          mode={adPlacementModalMode}
          ads={ads ?? []}
          adPlacement={editingAdPlacement}
          videoDurationSeconds={video.durationSeconds}
          submitting={isCreateAdPlacementMutationPending || isUpdateAdPlacementMutationPending}
          onCancel={handleCloseAdPlacementModal}
          onSubmit={handleAdPlacementSubmit}
        />
      )}
    </div>
  );
};
