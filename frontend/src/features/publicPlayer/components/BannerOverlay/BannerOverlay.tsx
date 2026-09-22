import { Button } from 'antd';
import { formatDuration } from '../../../../lib/formatDuration';
import type { PlaybackAd } from '../../../../types/playback.types';
import './BannerOverlay.css';

type BannerOverlayProps = {
  banner: PlaybackAd;
  secondsRemaining: number | null;
  onClick: () => void;
};

/**
 * @description The banner-overlay ad image, shown over the still-playing main video for its
 * configured duration. Not a <video> at all, so it has no play/pause/skip (banners are never
 * skippable) - just the same "Ad · title · remaining time" badge as a video ad. The click-through
 * is an explicit "Visit site" button, not the whole image - a click target that large silently
 * eats every click without looking interactive is easy to miss entirely.
 */
export const BannerOverlay = ({ banner, secondsRemaining, onClick }: BannerOverlayProps) => {
  return (
    <div className="player-page__banner">
      <div className="player-page__ad-badge">
        <span className="player-page__ad-badge-label">Ad</span>
        <span className="player-page__ad-badge-title">{banner.title}</span>
        {secondsRemaining !== null && (
          <span className="mono">{formatDuration(secondsRemaining)}</span>
        )}
      </div>

      <img src={banner.assetUrl} alt={banner.title} />

      {banner.clickThroughUrl && (
        <div className="player-page__ad-controls">
          <Button onClick={onClick}>Visit site ↗</Button>
        </div>
      )}
    </div>
  );
};
