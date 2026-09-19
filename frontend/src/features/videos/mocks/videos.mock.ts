import { VideoStatus } from '../../../constants/video.constants';
import type { Video } from '../../../types/video.types';

/**
 * @description Placeholder rows for the visual-only Videos page - swapped for
 * `useVideosQuery`'s real data once the list endpoint is wired up.
 */
// A real cc0-licensed sample - stands in for whatever Cloudinary would actually return.
const MOCK_PLAYBACK_URL =
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

export const MOCK_VIDEOS: Video[] = [
  {
    id: '1',
    title: 'Diwali campaign — hero cut',
    description: 'Festive hero video for the Diwali sale push.',
    status: VideoStatus.READY,
    playbackUrl: MOCK_PLAYBACK_URL,
    adPlacementCount: 3,
    createdAt: '2026-09-10T09:12:00Z',
  },
  {
    id: '2',
    title: 'Product launch teaser',
    description: null,
    status: VideoStatus.READY,
    playbackUrl: MOCK_PLAYBACK_URL,
    adPlacementCount: 1,
    createdAt: '2026-09-08T14:30:00Z',
  },
  {
    id: '3',
    title: 'Founder interview — full length',
    description: 'Long-form interview, currently being transcoded.',
    status: VideoStatus.PROCESSING,
    playbackUrl: null,
    adPlacementCount: 0,
    createdAt: '2026-09-17T11:05:00Z',
  },
  {
    id: '4',
    title: 'Customer testimonial — Priya S.',
    description: null,
    status: VideoStatus.UPLOADING,
    playbackUrl: null,
    adPlacementCount: 0,
    createdAt: '2026-09-18T08:47:00Z',
  },
  {
    id: '5',
    title: 'Behind the scenes — office tour',
    description: 'Rejected by the hosting service, needs a re-upload.',
    status: VideoStatus.FAILED,
    playbackUrl: null,
    adPlacementCount: 0,
    createdAt: '2026-09-05T16:20:00Z',
  },
  {
    id: '6',
    title: 'Weekly recap — episode 12',
    description: 'Recurring recap series, mid-roll and banner ads placed.',
    status: VideoStatus.READY,
    playbackUrl: MOCK_PLAYBACK_URL,
    adPlacementCount: 2,
    createdAt: '2026-08-29T10:00:00Z',
  },
];
