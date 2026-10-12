import { generatePath, useNavigate } from 'react-router-dom';
import type { MenuProps } from 'antd';
import { DeleteOutlined, EditOutlined, TagsOutlined } from '@ant-design/icons';
import { Routes } from '../../../../constants/routes.constants';
import { VideoStatus } from '../../../../constants/video.constants';
import { formatDate } from '../../../../lib/formatDate';
import { formatDuration } from '../../../../lib/formatDuration';
import { MediaCard } from '../../../../components/MediaCard/MediaCard';
import { VideoStatusTag } from '../../../../components/VideoStatusTag/VideoStatusTag';
import type { Video } from '../../../../types/video.types';
import { VideoCardAction } from './VideoCard.constants';
import { VideoCardMedia } from './VideoCardMedia';
import './VideoCard.css';

type VideoCardProps = {
  video: Video;
  onEdit: (video: Video) => void;
  onDelete: (video: Video) => void;
};

/**
 * @description One video in the library grid. A ready video shows its status, ad count and length
 * over its frame; a processing or failed one says so in its meta line instead. A deleted video
 * (shown only under the Deleted tab) is read-only, with no chips or actions.
 */
export const VideoCard = ({ video, onEdit, onDelete }: VideoCardProps) => {
  const navigate = useNavigate();
  const detailsPath = generatePath(Routes.VIDEO_DETAILS, { videoId: video.id });
  const isDeleted = Boolean(video.deletedAt);
  const isReady = video.status === VideoStatus.READY;

  const menu: MenuProps = {
    items: [
      { key: VideoCardAction.EDIT, icon: <EditOutlined />, label: 'Edit details' },
      {
        key: VideoCardAction.MANAGE_AD_PLACEMENTS,
        icon: <TagsOutlined />,
        label: 'Manage ad placements',
        disabled: !isReady,
      },
      { type: 'divider' },
      {
        key: VideoCardAction.DELETE,
        icon: <DeleteOutlined />,
        label: 'Delete video',
        danger: true,
      },
    ],
    onClick: ({ key }) => {
      if (key === VideoCardAction.EDIT) onEdit(video);
      if (key === VideoCardAction.MANAGE_AD_PLACEMENTS) void navigate(detailsPath);
      if (key === VideoCardAction.DELETE) onDelete(video);
    },
  };

  const overlays = !isDeleted && isReady && (
    <>
      <span className="media-card__chip media-card__chip--top-left">
        <VideoStatusTag status={video.status} />
      </span>
      {video.adPlacementCount > 0 && (
        <span className="media-card__chip media-card__chip--bottom-left video-card__ad-count">
          {video.adPlacementCount} {video.adPlacementCount === 1 ? 'ad' : 'ads'}
        </span>
      )}
      {video.durationSeconds !== null && (
        <span className="media-card__chip media-card__chip--bottom-right">
          {formatDuration(video.durationSeconds)}
        </span>
      )}
    </>
  );

  return (
    <MediaCard
      to={detailsPath}
      media={<VideoCardMedia video={video} />}
      overlays={overlays}
      title={video.title}
      meta={
        isDeleted
          ? [`Deleted ${formatDate(video.deletedAt!)}`]
          : [
              !isReady && <VideoStatusTag status={video.status} />,
              `Uploaded ${formatDate(video.createdAt)}`,
            ]
      }
      menu={isDeleted ? undefined : menu}
    />
  );
};
