import { generatePath, Link } from 'react-router-dom';
import { Flex, Typography } from 'antd';
import { VideoCameraOutlined } from '@ant-design/icons';
import { VideoStatusTag } from '../../../../components/VideoStatusTag/VideoStatusTag';
import { Routes } from '../../../../constants/routes.constants';
import { formatDuration } from '../../../../lib/formatDuration';
import { formatDurationOrSkip } from '../../../../lib/formatDurationOrSkip';
import type { AdPlacementWithVideo } from '../../../../types/adPlacement.types';
import './AdPlacementVideosList.css';

const { Text } = Typography;

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
    {items.map((adPlacement) => (
      <Link
        to={generatePath(Routes.VIDEO_DETAILS, { videoId: adPlacement.video.id })}
        className="ad-placement-videos-list__row"
        key={adPlacement.id}
      >
        <div className="ad-placement-videos-list__thumb">
          <VideoCameraOutlined />
          <span className="ad-placement-videos-list__offset">
            {formatDuration(adPlacement.startOffsetSeconds)}
          </span>
        </div>

        <div className="ad-placement-videos-list__info">
          <Flex align="center" gap={8}>
            <Text strong ellipsis className="ad-placement-videos-list__title">
              {adPlacement.video.title}
            </Text>
            <VideoStatusTag status={adPlacement.video.status} />
          </Flex>
          <Text type="secondary" className="ad-placement-videos-list__meta">
            {formatDurationOrSkip(adPlacement)}
          </Text>
        </div>
      </Link>
    ))}
  </div>
);
