import { generatePath, Link } from 'react-router-dom';
import { Flex, Typography } from 'antd';
import { VideoCameraOutlined } from '@ant-design/icons';
import { VideoStatusTag } from '../../../../components/VideoStatusTag/VideoStatusTag';
import { Routes } from '../../../../constants/routes.constants';
import { formatDuration } from '../../../../lib/formatDuration';
import type { AdPlacementWithVideo } from '../../../../types/adPlacement.types';
import './AdPlacementVideosList.css';

const { Text } = Typography;

/**
 * @description One placement has either a duration (banners) or a skip-after point (skippable
 * video ads) or neither (non-skippable video ads) - never both, per the backend's own model.
 */
const formatDurationOrSkip = (placement: AdPlacementWithVideo) => {
  if (placement.durationSeconds !== null) {
    return `${formatDuration(placement.durationSeconds)} long`;
  }
  if (placement.skipAfterSeconds !== null) {
    return `Skippable after ${placement.skipAfterSeconds}s`;
  }
  return 'Not skippable';
};

type AdPlacementVideosListProps = {
  items: AdPlacementWithVideo[];
};

/**
 * @description Row-per-video list of everywhere an ad is placed - the mirror image of
 * `AdPlacementsList` (which lists a video's ads), linking each row through to that video's own
 * details page.
 */
export const AdPlacementVideosList = ({ items }: AdPlacementVideosListProps) => (
  <div className="ad-placement-videos-list">
    {items.map((placement) => (
      <Link
        to={generatePath(Routes.VIDEO_DETAILS, { videoId: placement.video.id })}
        className="ad-placement-videos-list__row"
        key={placement.id}
      >
        <div className="ad-placement-videos-list__thumb">
          <VideoCameraOutlined />
          <span className="ad-placement-videos-list__offset">
            {formatDuration(placement.startOffsetSeconds)}
          </span>
        </div>

        <div className="ad-placement-videos-list__info">
          <Flex align="center" gap={8}>
            <Text strong ellipsis className="ad-placement-videos-list__title">
              {placement.video.title}
            </Text>
            <VideoStatusTag status={placement.video.status} />
          </Flex>
          <Text type="secondary" className="ad-placement-videos-list__meta">
            {formatDurationOrSkip(placement)}
          </Text>
        </div>
      </Link>
    ))}
  </div>
);
