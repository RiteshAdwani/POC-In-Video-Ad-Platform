import { Button } from 'antd';
import { ExportOutlined } from '@ant-design/icons';
import { formatDuration } from '../../../../lib/formatDuration';
import type { PlaybackAd } from '../../../../types/playback.types';

type AdControlsProps = {
  ad: PlaybackAd;
  canSkip: boolean;
  secondsRemaining: number | null;
  skipInSeconds: number | null;
  onVisitSite: () => void;
  onSkip: () => void;
};

/**
 * @description Overlay shown while a pre-roll/mid-roll ad is playing - a YouTube-style "Ad ·
 * title · remaining time" badge, a click-through link (if the ad has one), and either a "Skip Ad
 * in Ns" countdown or an enabled "Skip Ad" button once skipAfterSeconds has elapsed. No skip
 * control at all for a non-skippable ad (skipAfterSeconds is null) - just the badge.
 */
export const AdControls = ({
  ad,
  canSkip,
  secondsRemaining,
  skipInSeconds,
  onVisitSite,
  onSkip,
}: AdControlsProps) => {
  const isSkippable = ad.skipAfterSeconds != null;

  return (
    <>
      <div className="player-page__ad-badge">
        <span className="player-page__ad-badge-label">Ad</span>
        <span className="player-page__ad-badge-title">{ad.title}</span>
        {secondsRemaining !== null && (
          <span className="mono">{formatDuration(secondsRemaining)}</span>
        )}
      </div>

      <div className="player-page__ad-controls">
        {ad.clickThroughUrl && (
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
              Skip ad in {skipInSeconds ?? ad.skipAfterSeconds}s
            </Button>
          ))}
      </div>
    </>
  );
};
