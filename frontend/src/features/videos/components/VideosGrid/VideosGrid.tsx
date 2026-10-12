import type { Video } from '../../../../types/video.types';
import { VideoCard } from '../VideoCard/VideoCard';
import './VideosGrid.css';

type VideosGridProps = {
  videos: Video[];
  onEdit: (video: Video) => void;
  onDelete: (video: Video) => void;
};

/**
 * @description Card-grid listing of videos, one VideoCard each.
 */
export const VideosGrid = ({ videos, onEdit, onDelete }: VideosGridProps) => (
  <div className="videos-grid">
    {videos.map((video) => (
      <VideoCard key={video.id} video={video} onEdit={onEdit} onDelete={onDelete} />
    ))}
  </div>
);
