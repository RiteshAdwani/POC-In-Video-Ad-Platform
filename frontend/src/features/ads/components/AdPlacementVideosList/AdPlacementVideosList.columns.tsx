import { Flex, Typography, type TableColumnsType } from 'antd';
import { VideoCameraOutlined } from '@ant-design/icons';
import { VideoStatusTag } from '../../../../components/VideoStatusTag/VideoStatusTag';
import { PLACEMENT_STATS_WINDOW_DAYS } from '../../../../constants/dashboard.constants';
import { formatDuration } from '../../../../lib/formatDuration';
import { formatDurationOrSkip } from '../../../../lib/formatDurationOrSkip';
import { VideoThumbnail } from '../../../../components/VideoThumbnail/VideoThumbnail';
import type { AdPlacementWithVideo } from '../../../../types/adPlacement.types';
import { AdPlacementRowStat } from '../../../../components/AdPlacementRowStat/AdPlacementRowStat';

const { Text } = Typography;

/**
 * @description AdPlacementVideosList's columns - a fixed layout, but built per render since the
 * stats cell uses the list's stats window.
 */
export const getAdPlacementVideoColumns = (
  startDate: string,
  endDate: string,
): TableColumnsType<AdPlacementWithVideo> => [
  {
    title: 'Video',
    key: 'video',
    render: (_, { video }) => {
      const hasFrame = Boolean(video.playbackUrl) && !video.deletedAt;
      return (
        <Flex align="center" gap={12} className="ad-placement-videos-list__video">
          <div className="ad-placement-videos-list__thumb">
            {hasFrame ? (
              <VideoThumbnail
                src={video.playbackUrl!}
                className="ad-placement-videos-list__thumb-image"
              />
            ) : (
              <VideoCameraOutlined />
            )}
          </div>
          <Flex vertical align="flex-start" gap={4} className="ad-placement-videos-list__info">
            <Text strong ellipsis className="ad-placement-videos-list__title">
              {video.title}
            </Text>
            {!video.deletedAt && <VideoStatusTag status={video.status} />}
          </Flex>
        </Flex>
      );
    },
  },
  {
    title: 'Starts at',
    key: 'startsAt',
    width: 110,
    render: (_, adPlacement) => (
      <Text className="ad-placement-videos-list__time">
        {formatDuration(adPlacement.startOffsetSeconds)}
      </Text>
    ),
  },
  {
    title: 'Length',
    key: 'length',
    width: 180,
    render: (_, adPlacement) => <Text type="secondary">{formatDurationOrSkip(adPlacement)}</Text>,
  },
  {
    title: `Last ${PLACEMENT_STATS_WINDOW_DAYS} days`,
    key: 'stats',
    width: 280,
    render: (_, { id, video }) => (
      <AdPlacementRowStat
        videoId={video.id}
        adPlacementId={id}
        startDate={startDate}
        endDate={endDate}
      />
    ),
  },
];
