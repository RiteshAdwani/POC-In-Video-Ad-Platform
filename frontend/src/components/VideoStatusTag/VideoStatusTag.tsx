import { VideoStatus, VIDEO_STATUS_LABEL } from '../../constants/video.constants';
import './VideoStatusTag.css';

/**
 * @description A video's processing status as a coloured dot and label.
 */
export const VideoStatusTag = ({ status }: { status: VideoStatus }) => (
  <span className="video-status-tag" data-status={status}>
    {VIDEO_STATUS_LABEL[status]}
  </span>
);
