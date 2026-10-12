import { Spin } from 'antd';
import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { VideoStatus } from '../../../../constants/video.constants';
import { VideoThumbnail } from '../../../../components/VideoThumbnail/VideoThumbnail';
import type { Video } from '../../../../types/video.types';

/**
 * @description What fills a video card's thumbnail - a frame from the video once it's ready, or a
 * placeholder saying why there isn't one (still processing, failed, or deleted with its file).
 */
export const VideoCardMedia = ({ video }: { video: Video }) => {
  if (video.deletedAt) {
    return (
      <div className="media-card__fill media-card__fill--striped">
        <DeleteOutlined />
        Video file deleted
      </div>
    );
  }

  if (video.status === VideoStatus.PROCESSING) {
    return (
      <div className="media-card__fill">
        <Spin size="small" />
        Processing upload
      </div>
    );
  }

  if (video.status === VideoStatus.FAILED || !video.playbackUrl) {
    return (
      <div className="media-card__fill media-card__fill--striped">
        <ExclamationCircleOutlined />
        Upload failed
      </div>
    );
  }

  return <VideoThumbnail src={video.playbackUrl} />;
};
