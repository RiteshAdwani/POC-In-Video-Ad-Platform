import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Button, Empty, Flex, Result, Tooltip, Typography } from 'antd';
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { Routes } from '../../constants/routes.constants';
import { VideoStatus, VIDEO_STATUS_LABEL } from '../../constants/video.constants';
import { AdPlacementsList } from '../../features/videos/components/AdPlacementsList/AdPlacementsList';
import { CreateEditPlacementModal } from '../../features/videos/components/CreateEditPlacementModal/CreateEditPlacementModal';
import { PlacementFormFields } from '../../features/videos/components/CreateEditPlacementModal/CreateEditPlacementModal.constants';
import type { PlacementFormType } from '../../features/videos/components/CreateEditPlacementModal/CreateEditPlacementModal.types';
import { CreateEditVideoModal } from '../../features/videos/components/CreateEditVideoModal/CreateEditVideoModal';
import { ModalMode } from '../../constants/modalMode.constants';
import type { VideoFormType } from '../../features/videos/components/CreateEditVideoModal/CreateEditVideoModal.types';
import { VideoFormFields } from '../../features/videos/components/CreateEditVideoModal/CreateEditVideoModal.constants';
import { VideoStatusTag } from '../../components/VideoStatusTag/VideoStatusTag';
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
import { formatDate } from '../../lib/formatDate';
import type { UpdateVideoRequestDto } from '../../dtos/video.dto';
import type {
  CreateAdPlacementRequestDto,
  UpdateAdPlacementRequestDto,
} from '../../dtos/adPlacement.dto';
import type { AdPlacement } from '../../types/adPlacement.types';
import './VideoDetailsPage.css';

const { Title, Text } = Typography;

/**
 * @description One video's full detail view - a plain preview player (no ad injection, unlike
 * the public playback page), metadata, edit/delete actions, and its ad placements.
 */
export const VideoDetailsPage = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const { open, handleOpen, handleClose } = useModalState();
  const {
    open: placementModalOpen,
    handleOpen: openPlacementModal,
    handleClose: closePlacementModal,
  } = useModalState();
  const [placementModalMode, setPlacementModalMode] = useState<ModalMode>(ModalMode.CREATE);
  const [editingPlacement, setEditingPlacement] = useState<AdPlacement | undefined>(undefined);

  const { data: video, isLoading, isError, error } = useVideoQuery(videoId);
  const { mutate: updateVideoMutation, isPending: isUpdateVideoMutationPending } =
    useUpdateVideoMutation();
  const confirmDeleteVideo = useDeleteVideoModal();

  const { data: ads } = useAdsQuery();
  const { data: placements } = useAdPlacementsQuery(videoId);
  const { mutate: createPlacementMutation, isPending: isCreatePlacementMutationPending } =
    useCreateAdPlacementMutation(videoId!);
  const { mutate: updatePlacementMutation, isPending: isUpdatePlacementMutationPending } =
    useUpdateAdPlacementMutation(videoId!);
  const confirmDeletePlacement = useDeleteAdPlacementModal(videoId!);

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
  const handleAddPlacement = () => {
    setPlacementModalMode(ModalMode.CREATE);
    setEditingPlacement(undefined);
    openPlacementModal();
  };

  /**
   * @description Opens the placement modal in edit mode, pre-filled with the clicked placement.
   */
  const handleEditPlacement = (placement: AdPlacement) => {
    setPlacementModalMode(ModalMode.EDIT);
    setEditingPlacement(placement);
    openPlacementModal();
  };

  /**
   * @description Hides the placement modal and clears the placement being edited, so a stale
   * placement isn't carried into the next create-mode open.
   */
  const handleClosePlacementModal = () => {
    closePlacementModal();
    setEditingPlacement(undefined);
  };

  /**
   * @description Creating attaches a new ad to this video; editing only ever touches an existing
   * placement's type/position/timing - which ad is placed can't change (the Form.Item for it is
   * disabled in edit mode).
   */
  const handlePlacementSubmit = (values: PlacementFormType) => {
    const durationSeconds = values[PlacementFormFields.DurationSeconds] ?? undefined;
    const skipAfterSeconds = values[PlacementFormFields.SkipAfterSeconds] ?? undefined;

    if (placementModalMode === ModalMode.CREATE) {
      const reqBody: CreateAdPlacementRequestDto = {
        advertisementId: values[PlacementFormFields.AdvertisementId],
        adType: values[PlacementFormFields.AdType],
        startOffsetSeconds: values[PlacementFormFields.StartOffsetSeconds],
        durationSeconds,
        skipAfterSeconds,
      };
      createPlacementMutation(reqBody, { onSuccess: handleClosePlacementModal });
    } else {
      const reqBody: UpdateAdPlacementRequestDto = {
        adType: values[PlacementFormFields.AdType],
        startOffsetSeconds: values[PlacementFormFields.StartOffsetSeconds],
        durationSeconds,
        skipAfterSeconds,
      };
      updatePlacementMutation(
        { id: editingPlacement!.id, data: reqBody },
        { onSuccess: handleClosePlacementModal },
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
    <div className="video-details-page">
      <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(Routes.VIDEOS)}>
        Back to videos
      </Button>

      <Flex gap={24} align="flex-start" className="video-details-page__header">
        <div className="video-details-page__player">
          {video.playbackUrl ? (
            <video src={video.playbackUrl} controls />
          ) : (
            <div className="video-details-page__player-placeholder">
              <VideoCameraOutlined />
              <Text type="secondary">{VIDEO_STATUS_LABEL[video.status]}</Text>
            </div>
          )}
        </div>

        <Flex vertical gap={8} className="video-details-page__meta">
          <Flex justify="space-between" align="flex-start" gap={16}>
            <Flex vertical gap={8}>
              <Flex align="flex-start" gap={12}>
                <Title level={2} className="video-details-page__title">
                  {video.title}
                </Title>
                <VideoStatusTag status={video.status} />
              </Flex>
              <Text type="secondary">Uploaded {formatDate(video.createdAt)}</Text>
            </Flex>

            <Flex gap={8}>
              <Button icon={<EditOutlined />} onClick={handleOpen}>
                Edit video
              </Button>
              <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
                Delete
              </Button>
            </Flex>
          </Flex>

          <Text>{video.description ?? 'No description'}</Text>
        </Flex>
      </Flex>

      <div className="video-details-page__placements">
        <Flex justify="space-between" align="center">
          <Title level={4}>Ad placements ({placements?.length ?? 0})</Title>
          <Tooltip title="Manage ad placements">
            <Button disabled={video.status !== VideoStatus.READY} onClick={handleAddPlacement}>
              Manage ad placements
            </Button>
          </Tooltip>
        </Flex>

        {!placements || placements.length === 0 ? (
          <Empty description="No ad placements yet" />
        ) : (
          <AdPlacementsList
            placements={placements}
            onEdit={handleEditPlacement}
            onDelete={confirmDeletePlacement}
          />
        )}
      </div>

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

      {placementModalOpen && (
        <CreateEditPlacementModal
          open
          mode={placementModalMode}
          ads={ads ?? []}
          placement={editingPlacement}
          submitting={isCreatePlacementMutationPending || isUpdatePlacementMutationPending}
          onCancel={handleClosePlacementModal}
          onSubmit={handlePlacementSubmit}
        />
      )}
    </div>
  );
};
