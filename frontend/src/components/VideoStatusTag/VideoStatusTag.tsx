import { VideoStatus, VIDEO_STATUS_LABEL } from '../../constants/video.constants';
import './VideoStatusTag.css';

/**
 * @description Solid status pill sized for overlaying on a video's thumbnail
 */
export const VideoStatusTag = ({ status }: { status: VideoStatus }) => (
  <span className="video-status-tag" data-status={status}>
    {VIDEO_STATUS_LABEL[status]}
  </span>
);
