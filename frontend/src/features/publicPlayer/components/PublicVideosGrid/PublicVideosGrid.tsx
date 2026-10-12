import type { PublicVideoSummary } from '../../../../types/playback.types';
import { PublicVideoCard } from './PublicVideoCard';
import { PublicVideoHero } from './PublicVideoHero';
import './PublicVideosGrid.css';

type PublicVideosGridProps = {
  videos: PublicVideoSummary[];
  // Lead with the first (newest) video as a large hero tile - off while searching, where every
  // result should weigh the same.
  featureFirst: boolean;
};

/**
 * @description The public catalog as a mosaic - optionally the newest video as a 2x2 hero tile,
 * with every other video as a card flowing around and below it. Each tile opens that video's
 * player.
 */
export const PublicVideosGrid = ({ videos, featureFirst }: PublicVideosGridProps) => {
  const [first, ...rest] = videos;

  return (
    <div className="public-videos-grid">
      {featureFirst ? (
        <>
          <PublicVideoHero video={first} />
          {rest.map((video) => (
            <PublicVideoCard key={video.id} video={video} />
          ))}
        </>
      ) : (
        videos.map((video) => <PublicVideoCard key={video.id} video={video} />)
      )}
    </div>
  );
};
