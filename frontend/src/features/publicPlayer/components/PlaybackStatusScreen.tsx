import { Result, Spin } from 'antd';
import { VideoStatus } from '../../../constants/video.constants';
import { PlaybackScreenStatus } from '../../../constants/playback.constants';

type PlaybackStatusScreenProps = {
  status: PlaybackScreenStatus | VideoStatus;
  errorMessage?: string | null;
};

/**
 * @description Renders whichever non-playable state the player is in (loading, failed, still
 * processing, etc). READY is handled by the caller instead - this component never renders it.
 */
export const PlaybackStatusScreen = ({ status, errorMessage }: PlaybackStatusScreenProps) => {
  if (status === PlaybackScreenStatus.MISSING_ID) {
    return <Result status="error" title="Missing video id" />;
  }
  if (status === PlaybackScreenStatus.LOADING) {
    return <Spin size="large" fullscreen />;
  }
  if (status === PlaybackScreenStatus.ERROR) {
    return <Result status="error" title="Something went wrong" subTitle={errorMessage} />;
  }
  if (status === VideoStatus.FAILED) {
    return <Result status="error" title="This video failed to process" />;
  }
  return (
    <Result
      status="info"
      title="Still processing"
      subTitle="This video isn't ready to play yet - checking again shortly."
    />
  );
};
