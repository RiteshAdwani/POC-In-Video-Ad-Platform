import { generatePath, Link } from 'react-router-dom';
import { Typography } from 'antd';
import { PlayCircleFilled, VideoCameraOutlined } from '@ant-design/icons';
import { Routes } from '../../../../constants/routes.constants';
import { formatRelativeTime } from '../../../../lib/formatRelativeTime';
import { getVideoThumbnailUrl } from '../../../../lib/videoThumbnail';
import type { PublicVideoSummary } from '../../../../types/playback.types';
import './PublicVideosGrid.css';

const { Text } = Typography;

type PublicVideosGridProps = {
  videos: PublicVideoSummary[];
};

/**
 * @description Card-grid of every video open to the public - the audience-facing mirror of the
 * admin VideosGrid, minus the owner-only actions (edit/delete/status/ad count). Each card links
 * straight into that video's player.
 */
export const PublicVideosGrid = ({ videos }: PublicVideosGridProps) => (
  <div className="public-videos-grid">
    {videos.map((video) => {
      const thumbnailUrl = getVideoThumbnailUrl(video.playbackUrl);

      return (
        <Link
          to={generatePath(Routes.PLAY, { videoId: video.id })}
          className="public-videos-grid__card"
          key={video.id}
        >
          <div className="public-videos-grid__thumb">
            {thumbnailUrl ? (
              <img src={thumbnailUrl} alt="" className="public-videos-grid__thumb-image" />
            ) : (
              <VideoCameraOutlined />
            )}
            <PlayCircleFilled className="public-videos-grid__play" />
          </div>

          <div className="public-videos-grid__body">
            <Text strong ellipsis className="public-videos-grid__title">
              {video.title}
            </Text>
            <Text type="secondary" ellipsis className="public-videos-grid__description">
              {video.description ?? 'No description'}
            </Text>
            <Text type="secondary" className="public-videos-grid__date">
              {formatRelativeTime(video.createdAt)}
            </Text>
          </div>
        </Link>
      );
    })}
  </div>
);
