import { PlayCircleFilled } from '@ant-design/icons';
import './PrePlayOverlay.css';

type PrePlayOverlayProps = {
  thumbnailUrl: string | null;
  title: string;
  onPlay: () => void;
};

/**
 * @description Covers the <video> element until the viewer's first real play. A pre-roll is
 * loaded but blocked from autoplaying without a user gesture, which would otherwise leave a blank
 * black box on first load - this shows the video's own still frame (or a brand gradient for a
 * non-Cloudinary source) and a large play button instead.
 */
export const PrePlayOverlay = ({ thumbnailUrl, title, onPlay }: PrePlayOverlayProps) => (
  <button type="button" className="pre-play-overlay" onClick={onPlay} aria-label={`Play ${title}`}>
    {thumbnailUrl && <img src={thumbnailUrl} alt="" className="pre-play-overlay__image" />}
    <span className="pre-play-overlay__scrim" />
    <PlayCircleFilled className="pre-play-overlay__icon" />
  </button>
);
