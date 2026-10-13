import { Result, Spin } from 'antd';
import { VideoStatus } from '../../../../constants/video.constants';
import { PlaybackScreenStatus } from '../../../../constants/playback.constants';

type PlaybackStatusContentProps = {
  status: PlaybackScreenStatus | VideoStatus;
  errorMessage?: string | null;
};

/**
 * @description The message for one non-playable state - a spinner while loading, otherwise a
 * Result explaining why the video can't play. Anything unlisted is still processing.
 */
export const PlaybackStatusContent = ({ status, errorMessage }: PlaybackStatusContentProps) => {
  switch (status) {
    case PlaybackScreenStatus.LOADING:
      return <Spin size="large" />;
    case PlaybackScreenStatus.MISSING_ID:
      return <Result status="error" title="Missing video id" />;
    case PlaybackScreenStatus.ERROR:
      return <Result status="error" title="Something went wrong" subTitle={errorMessage} />;
    case VideoStatus.FAILED:
      return <Result status="error" title="This video failed to process" />;
    default:
      return (
        <Result
          status="info"
          title="Still processing"
          subTitle="This video isn't ready to play yet - checking again shortly."
        />
      );
  }
};
