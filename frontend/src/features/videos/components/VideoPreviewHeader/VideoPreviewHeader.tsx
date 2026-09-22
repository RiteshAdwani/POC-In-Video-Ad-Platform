import { Button, Flex, Typography } from 'antd';
import { DeleteOutlined, EditOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { VIDEO_STATUS_LABEL } from '../../../../constants/video.constants';
import { VideoStatusTag } from '../../../../components/VideoStatusTag/VideoStatusTag';
import { formatDate } from '../../../../lib/formatDate';
import type { Video } from '../../../../types/video.types';
import './VideoPreviewHeader.css';

const { Title, Text } = Typography;

type VideoPreviewHeaderProps = {
  video: Video;
  onEdit: () => void;
  onDelete: () => void;
};

/**
 * @description Video details page's top section - the plain preview player (no ad injection,
 * unlike the public playback page) beside the video's title/status/description and its
 * edit/delete actions.
 */
export const VideoPreviewHeader = ({ video, onEdit, onDelete }: VideoPreviewHeaderProps) => (
  <Flex gap={24} align="flex-start" className="video-preview-header">
    <div className="video-preview-header__player">
      {video.playbackUrl ? (
        <video src={video.playbackUrl} controls />
      ) : (
        <div className="video-preview-header__player-placeholder">
          <VideoCameraOutlined />
          <Text type="secondary">{VIDEO_STATUS_LABEL[video.status]}</Text>
        </div>
      )}
    </div>

    <Flex vertical gap={8} className="video-preview-header__meta">
      <Flex justify="space-between" align="flex-start" gap={16}>
        <Flex vertical gap={8}>
          <Flex align="flex-start" gap={12}>
            <Title level={2} className="video-preview-header__title">
              {video.title}
            </Title>
            <VideoStatusTag status={video.status} />
          </Flex>
          <Text type="secondary">Uploaded {formatDate(video.createdAt)}</Text>
        </Flex>

        <Flex gap={8}>
          <Button icon={<EditOutlined />} onClick={onEdit}>
            Edit video
          </Button>
          <Button danger icon={<DeleteOutlined />} onClick={onDelete}>
            Delete
          </Button>
        </Flex>
      </Flex>

      <Text>{video.description ?? 'No description'}</Text>
    </Flex>
  </Flex>
);
