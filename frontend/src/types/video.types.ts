import type { VideoStatus } from '../constants/video.constants';

export type Video = {
  id: string;
  title: string;
  description: string | null;
  status: VideoStatus;
  playbackUrl: string | null;
  adPlacementCount: number;
  createdAt: string;
};
