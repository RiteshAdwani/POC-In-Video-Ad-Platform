import { VIDEO_FRAME_FRAGMENT } from '../../constants/video.constants';
import { getVideoThumbnailUrl } from '../../lib/videoThumbnail';
import './VideoThumbnail.css';

type VideoThumbnailProps = {
  src: string;
  className?: string;
};

/**
 * @description A still frame from any video URL - a Cloudinary-rendered JPG where the host
 * supports it, otherwise a muted <video> the browser preloads just far enough to draw that frame.
 */
export const VideoThumbnail = ({ src, className }: VideoThumbnailProps) => {
  const frameUrl = getVideoThumbnailUrl(src);
  const classes = `video-thumbnail ${className ?? ''}`;

  return frameUrl ? (
    <img src={frameUrl} alt="" className={classes} />
  ) : (
    <video
      src={`${src}${VIDEO_FRAME_FRAGMENT}`}
      muted
      playsInline
      preload="metadata"
      aria-hidden
      tabIndex={-1}
      className={classes}
    />
  );
};
