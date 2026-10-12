import { generatePath, Link } from 'react-router-dom';
import { CaretRightFilled } from '@ant-design/icons';
import { Routes } from '../../../../constants/routes.constants';
import { formatDate } from '../../../../lib/formatDate';
import { VideoThumbnail } from '../../../../components/VideoThumbnail/VideoThumbnail';
import type { PublicVideoSummary } from '../../../../types/playback.types';

/**
 * @description The catalog's lead tile - the newest video, twice the size of the others, with its
 * title, description and a "Watch now" call over the frame.
 */
export const PublicVideoHero = ({ video }: { video: PublicVideoSummary }) => (
  <Link to={generatePath(Routes.PLAY, { videoId: video.id })} className="public-video-hero">
    <VideoThumbnail src={video.playbackUrl} />
    <span className="public-video-hero__shade" />
    <div className="public-video-hero__text">
      <span className="public-video-hero__eyebrow">Newest</span>
      <h2 className="public-video-hero__title">{video.title}</h2>
      {video.description && <p className="public-video-hero__description">{video.description}</p>}
      <div className="public-video-hero__actions">
        {/* Styled like a button, but a span - the whole tile is already the link. */}
        <span className="public-video-hero__watch">
          <CaretRightFilled />
          Watch now
        </span>
        <span className="public-video-hero__date">{formatDate(video.createdAt)}</span>
      </div>
    </div>
  </Link>
);
