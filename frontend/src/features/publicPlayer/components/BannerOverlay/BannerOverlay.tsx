import { Button } from 'antd';
import { ExportOutlined } from '@ant-design/icons';
import { formatDuration } from '../../../../lib/formatDuration';
import type { PlaybackAd } from '../../../../types/playback.types';
import './BannerOverlay.css';

type BannerOverlayProps = {
  banner: PlaybackAd;
  secondsRemaining: number | null;
  canSkip: boolean;
  skipInSeconds: number | null;
  onVisitSite: () => void;
  onSkip: () => void;
};

/**
 * @description A banner-overlay ad, shown full-frame while the main video pauses for its configured
 * duration - the creative centred on a dark backdrop, with the same "AD · title · remaining time"
 * badge and "Visit site" / "Skip ad in Ns" / "Skip ad" controls as a video ad (no skip control at
 * all for a non-skippable banner). The click-through is an explicit "Visit site" button rather than
 * the whole image, so it's obviously clickable.
 */
export const BannerOverlay = ({
  banner,
  secondsRemaining,
  canSkip,
  skipInSeconds,
  onVisitSite,
  onSkip,
}: BannerOverlayProps) => {
  const isSkippable = banner.skipAfterSeconds != null;

  return (
    <div className="banner-overlay">
      <div className="player-page__ad-badge">
        <span className="player-page__ad-badge-label">Ad</span>
        <span className="player-page__ad-badge-title">{banner.title}</span>
        {secondsRemaining !== null && (
          <span className="mono">{formatDuration(secondsRemaining)}</span>
        )}
      </div>

      <img src={banner.assetUrl} alt={banner.title} className="banner-overlay__image" />

      {(banner.clickThroughUrl || isSkippable) && (
        <div className="player-page__ad-controls">
          {banner.clickThroughUrl && (
            <Button
              icon={<ExportOutlined />}
              iconPlacement="end"
              onClick={onVisitSite}
              className="player-page__ad-button player-page__ad-button--visit"
            >
              Visit site
            </Button>
          )}
          {isSkippable &&
            (canSkip ? (
              <Button type="primary" onClick={onSkip} className="player-page__ad-button">
                Skip ad
              </Button>
            ) : (
              <Button disabled className="player-page__ad-button player-page__ad-button--waiting">
                Skip ad in {skipInSeconds ?? banner.skipAfterSeconds}s
              </Button>
            ))}
        </div>
      )}
    </div>
  );
};
