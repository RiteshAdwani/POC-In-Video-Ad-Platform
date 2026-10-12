import { generatePath, Link } from 'react-router-dom';
import { Typography } from 'antd';
import { CaretRightFilled } from '@ant-design/icons';
import { Routes } from '../../../../constants/routes.constants';
import { formatDate } from '../../../../lib/formatDate';
import { VideoThumbnail } from '../../../../components/VideoThumbnail/VideoThumbnail';
import type { PublicVideoSummary } from '../../../../types/playback.types';

const { Text } = Typography;

/**
 * @description One video in the public catalog - its frame, title and upload date. Hovering rings
 * the frame in violet and shows a play button.
 */
export const PublicVideoCard = ({ video }: { video: PublicVideoSummary }) => (
  <Link to={generatePath(Routes.PLAY, { videoId: video.id })} className="public-video-card">
    <div className="public-video-card__thumb">
      <VideoThumbnail src={video.playbackUrl} />
      <span className="public-video-card__play">
        <CaretRightFilled />
      </span>
    </div>
    <Text strong ellipsis className="public-video-card__title">
      {video.title}
    </Text>
    <Text type="secondary" className="public-video-card__date">
      {formatDate(video.createdAt)}
    </Text>
  </Link>
);
