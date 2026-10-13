import type { VideoStatus } from '../../../../constants/video.constants';
import type { PlaybackScreenStatus } from '../../../../constants/playback.constants';
import { AllVideosLink } from '../PublicTopBar/AllVideosLink';
import { PublicTopBar } from '../PublicTopBar/PublicTopBar';
import { PlaybackStatusContent } from './PlaybackStatusContent';
import './PlaybackStatusScreen.css';

type PlaybackStatusScreenProps = {
  status: PlaybackScreenStatus | VideoStatus;
  errorMessage?: string | null;
};

/**
 * @description Renders whichever non-playable state the player is in (loading, failed, still
 * processing, etc), under the same top bar as the player so there's always a way back to the
 * catalog. READY is handled by the caller instead - this component never renders it.
 */
export const PlaybackStatusScreen = ({ status, errorMessage }: PlaybackStatusScreenProps) => (
  <div className="playback-status-screen">
    <PublicTopBar>
      <AllVideosLink />
    </PublicTopBar>
    <div className="playback-status-screen__body">
      <PlaybackStatusContent status={status} errorMessage={errorMessage} />
    </div>
  </div>
);
