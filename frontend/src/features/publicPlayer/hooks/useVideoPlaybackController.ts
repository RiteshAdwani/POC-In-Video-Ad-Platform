import { useEffect, useMemo, useRef, useState } from 'react';
import { getOrCreateSessionId } from '../../../lib/getOrCreateSessionId';
import { PlaybackEventType } from '../../../constants/playback.constants';
import { AdType } from '../../../constants/ad.constants';
import type { PlaybackAd, PlaybackConfig } from '../../../types/playback.types';
import { useRecordPlaybackEventMutation } from './useRecordPlaybackEventMutation';

/**
 * @description Drives the single reused <video> element through pre-roll/mid-roll/banner ads,
 * swapping its src and firing playback events at the right moments. Everything the player page
 * needs to render lives in the returned object; all the state/refs stay inside this hook.
 */
export const useVideoPlaybackController = (
  videoId: string | undefined,
  playbackConfig: PlaybackConfig | undefined,
) => {
  const sessionId = useMemo(() => (videoId ? getOrCreateSessionId(videoId) : ''), [videoId]);
  const { mutate: recordEvent } = useRecordPlaybackEventMutation();

  // States for Video Ads and Banners
  const [activeAd, setActiveAd] = useState<PlaybackAd | null>(null);
  const [activeBanner, setActiveBanner] = useState<PlaybackAd | null>(null);

  // Countdown display state, YouTube-style - null whenever there's nothing active to count down.
  const [adSecondsRemaining, setAdSecondsRemaining] = useState<number | null>(null);
  const [skipInSeconds, setSkipInSeconds] = useState<number | null>(null);
  const [bannerSecondsRemaining, setBannerSecondsRemaining] = useState<number | null>(null);
  const [preRollAppliedFor, setPreRollAppliedFor] = useState<PlaybackConfig | undefined>(undefined);

  // Controls stay visible until the viewer's first real play, even with a pre-roll already
  // loaded - autoplay is blocked without a genuine click, so hiding controls before then would
  // strand them with no way to start anything.
  const [hasEngaged, setHasEngaged] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const shownAdPlacementIdsRef = useRef<Set<string>>(new Set());
  const resumeTimeRef = useRef(0);

  // Same fact as hasEngaged, kept as its own ref so the effect below can read it without
  // depending on it - depending on the state would re-run the effect (and restart playback) on
  // every engagement change instead of only on real activeAd/config changes.
  const hasEngagedRef = useRef(false);
  const videoStartedFiredRef = useRef(false);

  /**
   * @description Records one playback event, tagged with this video/session. No-ops if videoId
   * hasn't resolved yet.
   */
  const logEvent = (eventType: PlaybackEventType, adId?: string) => {
    if (!videoId) return;
    recordEvent({ videoId, sessionId, eventType, occurredAt: new Date().toISOString(), adId });
  };

  // Once ready, start on the pre-roll if there is one (its offset is always 0), else the video.
  // Done during render, not an effect, since it only needs to run once per config, not on every
  // later activeAd change this same state also goes through.
  if (playbackConfig && playbackConfig !== preRollAppliedFor) {
    setPreRollAppliedFor(playbackConfig);
    const preRoll = playbackConfig.ads.find((ad) => ad.type === AdType.PRE_ROLL);
    setActiveAd(preRoll ?? null);
  }

  /**
   * @description The single <video> element swap: loads whatever's "active" into it, resuming
   * the main content wherever the last ad interrupted it.
   */
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !playbackConfig?.playbackUrl) return;

    setAdSecondsRemaining(null);
    setSkipInSeconds(activeAd?.skipAfterSeconds ?? null);

    if (activeAd) {
      video.src = activeAd.assetUrl;
      video.load();
      void video.play().catch(() => {});
      return;
    }

    video.src = playbackConfig.playbackUrl;
    video.load();
    const resumeAt = resumeTimeRef.current;
    resumeTimeRef.current = 0;
    if (resumeAt > 0) {
      video.currentTime = resumeAt;
    }
    if (hasEngagedRef.current) {
      void video.play().catch(() => {});
    }
  }, [activeAd, playbackConfig]);

  /**
   * @description Marks the viewer as engaged and fires the one-time AD_SHOWN or VIDEO_STARTED
   * event for whatever just started playing.
   */
  const handlePlay = () => {
    hasEngagedRef.current = true;
    setHasEngaged(true);

    if (activeAd) {
      if (!shownAdPlacementIdsRef.current.has(activeAd.id)) {
        shownAdPlacementIdsRef.current.add(activeAd.id);
        logEvent(PlaybackEventType.AD_SHOWN, activeAd.id);
      }
      return;
    }

    if (!videoStartedFiredRef.current) {
      videoStartedFiredRef.current = true;
      logEvent(PlaybackEventType.VIDEO_STARTED);
    }
  };

  /**
   * @description Ends the current ad (logs AD_COMPLETED, clears activeAd) or, if none is active,
   * the main video (logs VIDEO_FINISHED).
   */
  const handleEnded = () => {
    if (activeAd) {
      logEvent(PlaybackEventType.AD_COMPLETED, activeAd.id);
      setActiveAd(null);
      return;
    }
    logEvent(PlaybackEventType.VIDEO_FINISHED);
  };

  /**
   * @description Skips a broken ad silently so the viewer isn't stranded on a black screen - it
   * never actually played, so no event is logged for it.
   */
  const handleError = () => {
    if (activeAd) {
      setActiveAd(null);
    }
  };

  /**
   * @description Updates the YouTube-style ad-remaining and skip-in countdowns for the current
   * tick, while an ad is playing.
   */
  const updateAdProgress = (video: HTMLVideoElement, currentTime: number) => {
    if (Number.isFinite(video.duration)) {
      setAdSecondsRemaining(Math.max(0, Math.ceil(video.duration - currentTime)));
    }
    if (activeAd?.skipAfterSeconds != null) {
      setSkipInSeconds(Math.max(0, Math.ceil(activeAd.skipAfterSeconds - currentTime)));
    }
  };

  /**
   * @description Switches to the next not-yet-shown mid-roll once its offset is reached. Returns
   * whether it fired, so the caller can skip the banner check for this tick.
   */
  const checkForMidRoll = (currentTime: number) => {
    const nextMidRoll = playbackConfig?.ads.find(
      (ad) =>
        ad.type === AdType.MID_ROLL &&
        !shownAdPlacementIdsRef.current.has(ad.id) &&
        currentTime >= ad.startOffsetSeconds,
    );
    if (!nextMidRoll) return false;

    resumeTimeRef.current = currentTime;
    setActiveAd(nextMidRoll);
    return true;
  };

  /**
   * @description Switches to the next not-yet-shown banner once its offset is reached: pauses the
   * main video and drives the banner's own show/hide timer, since an <img> has no
   * timeupdate/ended events of its own.
   */
  const checkForBanner = (video: HTMLVideoElement, currentTime: number) => {
    const nextBanner = playbackConfig?.ads.find(
      (ad) =>
        ad.type === AdType.BANNER_OVERLAY &&
        !shownAdPlacementIdsRef.current.has(ad.id) &&
        currentTime >= ad.startOffsetSeconds,
    );
    if (!nextBanner) return;

    shownAdPlacementIdsRef.current.add(nextBanner.id);
    setActiveBanner(nextBanner);
    logEvent(PlaybackEventType.AD_SHOWN, nextBanner.id);

    // Same pause-for-the-ad treatment as a pre/mid-roll, not a true overlay-while-playing -
    // stops here for the banner's duration and picks back up right where it left off.
    video.pause();

    const bannerDurationSeconds = nextBanner.durationSeconds ?? 5;
    setBannerSecondsRemaining(bannerDurationSeconds);

    // No `timeupdate` fires while the video is paused, so the countdown needs its own clock -
    // unlike the ad countdown above, which rides the main video's own timeupdate events.
    const countdownIntervalId = setInterval(() => {
      setBannerSecondsRemaining((prev) => (prev !== null ? Math.max(0, prev - 1) : null));
    }, 1000);

    // No `ended` event for an <img> - a banner completes itself on a timer instead.
    setTimeout(() => {
      clearInterval(countdownIntervalId);
      setActiveBanner(null);
      setBannerSecondsRemaining(null);
      logEvent(PlaybackEventType.AD_COMPLETED, nextBanner.id);
      void videoRef.current?.play().catch(() => {});
    }, bannerDurationSeconds * 1000);
  };

  /**
   * @description Per-tick dispatcher: updates the current ad's progress if one's playing, else
   * checks whether the next mid-roll or banner is due.
   */
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !playbackConfig) return;
    const currentTime = video.currentTime;

    if (activeAd) {
      updateAdProgress(video, currentTime);
      return;
    }
    if (checkForMidRoll(currentTime)) return;
    if (!activeBanner) checkForBanner(video, currentTime);
  };

  /**
   * @description Logs AD_SKIPPED and clears the current ad.
   */
  const handleSkipClick = () => {
    if (!activeAd) return;
    logEvent(PlaybackEventType.AD_SKIPPED, activeAd.id);
    setActiveAd(null);
  };

  /**
   * @description Opens the current ad's click-through link and logs AD_CLICKED.
   */
  const handleAdClick = () => {
    if (!activeAd?.clickThroughUrl) return;
    window.open(activeAd.clickThroughUrl, '_blank', 'noopener,noreferrer');
    logEvent(PlaybackEventType.AD_CLICKED, activeAd.id);
  };

  /**
   * @description Opens the current banner's click-through link and logs AD_CLICKED.
   */
  const handleBannerClick = () => {
    if (!activeBanner?.clickThroughUrl) return;
    window.open(activeBanner.clickThroughUrl, '_blank', 'noopener,noreferrer');
    logEvent(PlaybackEventType.AD_CLICKED, activeBanner.id);
  };

  // Skippable the instant the countdown hits 0 - derived rather than tracked separately.
  const canSkip = skipInSeconds === 0;

  return {
    videoRef,
    activeAd,
    activeBanner,
    canSkip,
    adSecondsRemaining,
    skipInSeconds,
    bannerSecondsRemaining,
    hasEngaged,
    handlePlay,
    handleEnded,
    handleError,
    handleTimeUpdate,
    handleSkipClick,
    handleAdClick,
    handleBannerClick,
  };
};
