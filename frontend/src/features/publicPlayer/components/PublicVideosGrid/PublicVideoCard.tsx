import { generatePath, Link } from 'react-router-dom';
import { CaretRightFilled } from '@ant-design/icons';
import { Routes } from '../../../../constants/routes.constants';
import { formatDate } from '../../../../lib/formatDate';
import { VideoThumbnail } from '../../../../components/VideoThumbnail/VideoThumbnail';
import type { PublicVideoSummary } from '../../../../types/playback.types';

/**
 * @description One video in the public catalog - an image-led tile in the same language as the
 * hero: the frame fills it, a frosted play button sits at its centre, and the title and upload
 * date sit on a fade along the bottom. Hovering lifts the tile and fills the play button.
 */
export const PublicVideoCard = ({ video }: { video: PublicVideoSummary }) => (
  <Link to={generatePath(Routes.PLAY, { videoId: video.id })} className="public-video-card">
    <VideoThumbnail src={video.playbackUrl} />
    <span className="public-video-card__shade" />
    <span className="public-video-card__play">
      <CaretRightFilled />
    </span>
    <div className="public-video-card__text">
      <span className="public-video-card__title">{video.title}</span>
      <span className="public-video-card__date">{formatDate(video.createdAt)}</span>
    </div>
  </Link>
);
