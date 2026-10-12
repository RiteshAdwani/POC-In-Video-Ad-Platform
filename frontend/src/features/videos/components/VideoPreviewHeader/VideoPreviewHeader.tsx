import type { ReactNode } from 'react';
import { Button, Spin } from 'antd';
import { DeleteOutlined, EditOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { VideoStatus } from '../../../../constants/video.constants';
import { DetailsHeader } from '../../../../components/DetailsHeader/DetailsHeader';
import { VideoStatusTag } from '../../../../components/VideoStatusTag/VideoStatusTag';
import { formatDate } from '../../../../lib/formatDate';
import { formatDuration } from '../../../../lib/formatDuration';
import type { Video } from '../../../../types/video.types';

type VideoPreviewHeaderProps = {
  video: Video;
  onEdit: () => void;
  onDelete: () => void;
  // The video's stats panel, shown beside the preview.
  children?: ReactNode;
};

/**
 * @description Video details page's top section - a plain preview player (no ad injection, unlike
 * the public playback page) beside the video's title, status, upload date, length, description and
 * stats panel.
 * Until the video is playable, or once it's deleted with its file, a placeholder says why.
 */
export const VideoPreviewHeader = ({
  video,
  onEdit,
  onDelete,
  children,
}: VideoPreviewHeaderProps) => {
  const isDeleted = Boolean(video.deletedAt);

  const placeholder = isDeleted ? (
    <>
      <DeleteOutlined />
      Video file deleted
    </>
  ) : video.status === VideoStatus.PROCESSING ? (
    <>
      <Spin />
      Processing upload
    </>
  ) : (
    <>
      <ExclamationCircleOutlined />
      Upload failed
    </>
  );

  return (
    <DetailsHeader
      media={
        video.playbackUrl && !isDeleted ? (
          <video src={video.playbackUrl} controls />
        ) : (
          <div className="details-header__placeholder">{placeholder}</div>
        )
      }
      title={video.title}
      meta={[
        !isDeleted && <VideoStatusTag status={video.status} />,
        `Uploaded ${formatDate(video.createdAt)}`,
        video.durationSeconds !== null && (
          <span>
            <span className="mono">{formatDuration(video.durationSeconds)}</span> long
          </span>
        ),
      ]}
      description={video.description}
      actions={
        !isDeleted && (
          <>
            <Button icon={<EditOutlined />} onClick={onEdit}>
              Edit details
            </Button>
            <Button type="text" danger icon={<DeleteOutlined />} onClick={onDelete}>
              Delete
            </Button>
          </>
        )
      }
    >
      {children}
    </DetailsHeader>
  );
};
