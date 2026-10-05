import { Button, ConfigProvider } from 'antd';
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
 * @description The banner-overlay ad image, shown over the still-playing main video for its
 * configured duration - the same "Ad · title · remaining time" badge as a video ad, plus the same
 * "Skip ad in Ns" countdown / "Skip ad" button once skipAfterSeconds has elapsed (no skip control
 * at all for a non-skippable banner, same as a non-skippable video ad). The click-through is an
 * explicit "Visit site" button, not the whole image - a click target that large silently eats every
 * click without looking interactive is easy to miss entirely.
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
    <div className="player-page__banner">
      <div className="player-page__ad-badge">
        <span className="player-page__ad-badge-label">Ad</span>
        <span className="player-page__ad-badge-title">{banner.title}</span>
        {secondsRemaining !== null && (
          <span className="mono">{formatDuration(secondsRemaining)}</span>
        )}
      </div>

      <img src={banner.assetUrl} alt={banner.title} />

      {(banner.clickThroughUrl || isSkippable) && (
        <div className="player-page__ad-controls">
          {banner.clickThroughUrl && <Button onClick={onVisitSite}>Visit site ↗</Button>}
          {isSkippable &&
            (canSkip ? (
              <Button type="primary" onClick={onSkip}>
                Skip ad
              </Button>
            ) : (
              <ConfigProvider
                theme={{
                  token: {
                    colorBgContainerDisabled: 'rgba(0, 0, 0, 0.65)',
                    colorTextDisabled: 'rgba(255, 255, 255, 0.85)',
                    colorBorder: 'transparent',
                  },
                }}
              >
                <Button disabled>Skip ad in {skipInSeconds ?? banner.skipAfterSeconds}s</Button>
              </ConfigProvider>
            ))}
        </div>
      )}
    </div>
  );
};
