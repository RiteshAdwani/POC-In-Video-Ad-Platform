import type { Video } from '../types/video.types';

export type UpdateVideoRequestDto = {
  title?: string;
  description?: string;
};

export type VideoResponseDto = { video: Video };
export type VideosResponseDto = { videos: Video[] };
