import { useRef } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { Tooltip } from 'antd';
import { PauseCircleFilled, PlayCircleFilled } from '@ant-design/icons';
import { AD_TYPE_LABEL } from '../../../../constants/ad.constants';
import { formatDuration } from '../../../../lib/formatDuration';
import type { PlaybackAd } from '../../../../types/playback.types';
import './PlayerControls.css';

type PlayerControlsProps = {
  ads: PlaybackAd[];
  durationSeconds: number;
  currentTime: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSeek: (seconds: number) => void;
};

/**
 * @description Replaces the native <video> control bar for main-content playback - shown only
 * while no ad is active, since ads use their own AdControls/BannerOverlay instead and are never
 * seekable. A play/pause toggle, elapsed/total time, and a click-and-drag scrubber with a thin
 * chapter-marker notch per ad placement, YouTube-style - the native scrubber has no way to draw on
 * top of it, so this is the only way to show ad positions directly on a seekable timeline. One
 * uniform marker style regardless of ad type, deliberately - the type is in the tooltip already.
 */
export const PlayerControls = ({
  ads,
  durationSeconds,
  currentTime,
  isPlaying,
  onTogglePlay,
  onSeek,
}: PlayerControlsProps) => {
  const trackRef = useRef<HTMLDivElement>(null);

  const seekFromPointer = (clientX: number) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const fraction = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    onSeek(fraction * durationSeconds);
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    seekFromPointer(event.clientX);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.buttons !== 1) return;
    seekFromPointer(event.clientX);
  };

  return (
    <div className="player-controls">
      <button
        type="button"
        className="player-controls__play"
        onClick={onTogglePlay}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? <PauseCircleFilled /> : <PlayCircleFilled />}
      </button>

      <div
        className="player-controls__hit-area"
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
      >
        <div className="player-controls__track">
          {/* Percentage positions come from live playback data, not static presentation, so
              they're set inline rather than duplicated as a fixed set of CSS classes. */}
          <div
            className="player-controls__progress"
            style={{ width: `${Math.min(100, (currentTime / durationSeconds) * 100)}%` }}
          />
          {ads.map((ad) => (
            <Tooltip
              key={ad.id}
              title={`${AD_TYPE_LABEL[ad.type]} at ${formatDuration(ad.startOffsetSeconds)}`}
            >
              <span
                className="player-controls__marker"
                style={{
                  left: `${Math.min(100, (ad.startOffsetSeconds / durationSeconds) * 100)}%`,
                }}
              />
            </Tooltip>
          ))}
        </div>
      </div>

      <span className="player-controls__time mono">
        {formatDuration(Math.floor(currentTime))} / {formatDuration(Math.floor(durationSeconds))}
      </span>
    </div>
  );
};
