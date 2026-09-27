import { generatePath, Link } from 'react-router-dom';
import { Flex, Typography } from 'antd';
import { VideoCameraOutlined } from '@ant-design/icons';
import { VideoStatusTag } from '../../../../components/VideoStatusTag/VideoStatusTag';
import { Routes } from '../../../../constants/routes.constants';
import { formatDuration } from '../../../../lib/formatDuration';
import { formatDurationOrSkip } from '../../../../lib/formatDurationOrSkip';
import type { AdPlacementWithVideo } from '../../../../types/adPlacement.types';
import { AdPlacementRowStat } from '../../../../components/AdPlacementRowStat/AdPlacementRowStat';
import './AdPlacementVideosList.css';

const { Text } = Typography;

type AdPlacementVideosListProps = {
  items: AdPlacementWithVideo[];
  startDate: string;
  endDate: string;
};

/**
 * @description Row-per-video list of everywhere an ad is placed - the mirror image of
 * `AdPlacementsList` (which lists a video's ads), linking each row through to that video's own
 * details page. Each row also carries its own performance line for the given window, via the same
 * AdPlacementRowStat used on the video side.
 */
export const AdPlacementVideosList = ({
  items,
  startDate,
  endDate,
}: AdPlacementVideosListProps) => (
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
          <AdPlacementRowStat
            videoId={adPlacement.video.id}
            adPlacementId={adPlacement.id}
            startDate={startDate}
            endDate={endDate}
          />
        </div>
      </Link>
    ))}
  </div>
);
