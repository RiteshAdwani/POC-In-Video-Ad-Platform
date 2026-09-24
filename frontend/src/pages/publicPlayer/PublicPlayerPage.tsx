import { Link, useParams } from 'react-router-dom';
import { Flex, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { usePlaybackConfigQuery } from '../../features/publicPlayer/hooks/usePlaybackConfigQuery';
import { useVideoPlaybackController } from '../../features/publicPlayer/hooks/useVideoPlaybackController';
import { AdControls } from '../../features/publicPlayer/components/AdControls/AdControls';
import { BannerOverlay } from '../../features/publicPlayer/components/BannerOverlay/BannerOverlay';
import { PlaybackStatusScreen } from '../../features/publicPlayer/components/PlaybackStatusScreen';
import { VideoStatus } from '../../constants/video.constants';
import { PlaybackScreenStatus } from '../../constants/playback.constants';
import { Routes } from '../../constants/routes.constants';
import './PublicPlayerPage.css';

const { Title, Text } = Typography;

/**
 * @description The public, unauthenticated video player - fetches playback config for the
 * `:videoId` route param and, once READY, renders the ad-aware player. Composed from
 * usePlaybackConfigQuery (data) and useVideoPlaybackController (all the ad/event logic).
 */
export const PublicPlayerPage = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const { data: playbackConfig, isLoading, error } = usePlaybackConfigQuery(videoId);
  // Destructured here, not inside the hook's return statement - the linter treats a whole object
  // as ref-tainted once any one of its fields is a ref, flagging every access on it as unsafe.
  // Pulling videoRef out leaves `player` genuinely ref-free.
  const { videoRef, ...player } = useVideoPlaybackController(videoId, playbackConfig);

  if (!videoId) {
    return <PlaybackStatusScreen status={PlaybackScreenStatus.MISSING_ID} />;
  }
  if (isLoading) {
    return <PlaybackStatusScreen status={PlaybackScreenStatus.LOADING} />;
  }
  if (error || !playbackConfig) {
    return (
      <PlaybackStatusScreen
        status={PlaybackScreenStatus.ERROR}
        errorMessage="Could not load this video."
      />
    );
  }
  if (playbackConfig.status !== VideoStatus.READY) {
    return <PlaybackStatusScreen status={playbackConfig.status} />;
  }

  return (
    <div className="player-page">
      <Flex justify="space-between" align="center" className="player-page__topbar">
        <span className="player-page__brand">FrameCue</span>
        <Link to={Routes.HOME} className="player-page__back">
          <ArrowLeftOutlined /> All videos
        </Link>
      </Flex>

      <div className="player-page__video-wrap">
        <video
          ref={videoRef}
          className="player-page__video"
          controls={!player.activeAd || !player.hasEngaged}
          onPlay={player.handleMediaPlay}
          onEnded={player.handleMediaEnded}
          onTimeUpdate={player.handleMediaTimeUpdate}
          onError={player.handleMediaError}
        />

        {player.activeAd && (
          <AdControls
            ad={player.activeAd}
            canSkip={player.canSkip}
            secondsRemaining={player.adSecondsRemaining}
            skipInSeconds={player.skipInSeconds}
            onVisitSite={player.handleAdClick}
            onSkip={player.handleSkipClick}
          />
        )}

        {player.activeBanner && (
          <BannerOverlay
            banner={player.activeBanner}
            secondsRemaining={player.bannerSecondsRemaining}
            onClick={player.handleBannerClick}
          />
        )}
      </div>

      <Flex vertical gap={4} className="player-page__meta">
        <Title level={3} className="player-page__title">
          {playbackConfig.title}
        </Title>
        <Text type="secondary">{playbackConfig.description ?? 'No description'}</Text>
      </Flex>
    </div>
  );
};
