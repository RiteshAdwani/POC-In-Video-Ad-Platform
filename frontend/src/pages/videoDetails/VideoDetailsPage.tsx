import { useNavigate, useParams } from 'react-router-dom';
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
import { CreateEditVideoModal } from '../../features/videos/components/CreateEditVideoModal/CreateEditVideoModal';
import { ModalMode } from '../../features/videos/components/CreateEditVideoModal/CreateEditVideoModal.constants';
import type { VideoFormType } from '../../features/videos/components/CreateEditVideoModal/CreateEditVideoModal.types';
import { VideoStatusTag } from '../../features/videos/components/VideoStatusTag/VideoStatusTag';
import { MOCK_AD_PLACEMENTS } from '../../features/videos/mocks/adPlacements.mock';
import { MOCK_VIDEOS } from '../../features/videos/mocks/videos.mock';
import { useModalState } from '../../hooks/useModalState';
import { formatDate } from '../../lib/formatDate';
import './VideoDetailsPage.css';

const { Title, Text } = Typography;

/**
 * @description One video's full detail view - a plain preview player (no ad injection, unlike
 * the public playback page), metadata, edit/delete actions, and its ad placements. Backed by mock
 * data for now, since there's no get-single-video endpoint yet.
 */
export const VideoDetailsPage = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const { open, handleOpen, handleClose } = useModalState();

  const video = MOCK_VIDEOS.find((mockVideo) => mockVideo.id === videoId);
  const placements = MOCK_AD_PLACEMENTS.filter((placement) => placement.videoId === videoId).sort(
    (a, b) => a.startOffsetSeconds - b.startOffsetSeconds,
  );

  /**
   * @description Visual only for now - editing has no backend endpoint yet.
   */
  const handleSubmit = (values: VideoFormType) => {
    console.log(values);
    handleClose();
  };

  if (!video) {
    return (
      <Result
        status="404"
        title="Video not found"
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
              <Flex align="center" gap={12}>
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
              <Button danger icon={<DeleteOutlined />}>
                Delete
              </Button>
            </Flex>
          </Flex>

          <Text>{video.description ?? 'No description'}</Text>
        </Flex>
      </Flex>

      <div className="video-details-page__placements">
        <Flex justify="space-between" align="center">
          <Title level={4}>Ad placements ({placements.length})</Title>
          <Tooltip title="Manage ad placements">
            <Button disabled={video.status !== VideoStatus.READY}>Manage ad placements</Button>
          </Tooltip>
        </Flex>

        {placements.length === 0 ? (
          <Empty description="No ad placements yet" />
        ) : (
          <AdPlacementsList placements={placements} />
        )}
      </div>

      {open && (
        <CreateEditVideoModal
          open
          mode={ModalMode.EDIT}
          video={video}
          onCancel={handleClose}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};
