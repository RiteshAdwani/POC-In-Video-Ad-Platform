import { Button, Flex, Tooltip, Typography, type TableColumnsType } from 'antd';
import { DeleteOutlined, EditOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { AssetType } from '../../../../constants/ad.constants';
import { PLACEMENT_STATS_WINDOW_DAYS } from '../../../../constants/dashboard.constants';
import { formatDuration } from '../../../../lib/formatDuration';
import { formatDurationOrSkip } from '../../../../lib/formatDurationOrSkip';
import { VideoThumbnail } from '../../../../components/VideoThumbnail/VideoThumbnail';
import type { AdPlacement } from '../../../../types/adPlacement.types';
import { AdTypeTag } from '../../../../components/AdTypeTag/AdTypeTag';
import { AdPlacementRowStat } from '../../../../components/AdPlacementRowStat/AdPlacementRowStat';

const { Text } = Typography;

type AdPlacementColumnsParams = {
  videoId: string;
  startDate: string;
  endDate: string;
  onEdit: (adPlacement: AdPlacement) => void;
  onDelete: (adPlacement: AdPlacement) => void;
  readOnly: boolean;
};

/**
 * @description AdPlacementsList's columns - a fixed layout, but built per render since cells use
 * the list's stats window, video, and edit/remove callbacks. readOnly drops the actions column.
 */
export const getAdPlacementColumns = ({
  videoId,
  startDate,
  endDate,
  onEdit,
  onDelete,
  readOnly,
}: AdPlacementColumnsParams): TableColumnsType<AdPlacement> => {
  const columns: TableColumnsType<AdPlacement> = [
    {
      title: 'Ad',
      key: 'ad',
      render: (_, adPlacement) => {
        const { assetType, assetUrl, title } = adPlacement.advertisement;
        return (
          <Flex align="center" gap={12} className="ad-placements-list__ad">
            <div className="ad-placements-list__thumb" data-ad-type={adPlacement.adType}>
              {assetType === AssetType.IMAGE ? (
                <img src={assetUrl} alt="" className="ad-placements-list__thumb-image" />
              ) : (
                <>
                  <VideoThumbnail src={assetUrl} className="ad-placements-list__thumb-image" />
                  <PlayCircleOutlined className="ad-placements-list__play" />
                </>
              )}
            </div>
            <Flex vertical align="flex-start" gap={4} className="ad-placements-list__info">
              <Text strong ellipsis className="ad-placements-list__title">
                {title}
              </Text>
              <AdTypeTag adType={adPlacement.adType} />
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
        <Text className="ad-placements-list__time">
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
      render: (_, adPlacement) => (
        <AdPlacementRowStat
          videoId={videoId}
          adPlacementId={adPlacement.id}
          startDate={startDate}
          endDate={endDate}
        />
      ),
    },
  ];

  if (!readOnly) {
    columns.push({
      key: 'actions',
      width: 96,
      align: 'right',
      render: (_, adPlacement) => (
        <>
          <Tooltip title="Edit placement">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => onEdit(adPlacement)}
              aria-label="Edit placement"
            />
          </Tooltip>
          <Tooltip title="Remove placement">
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onDelete(adPlacement)}
              aria-label="Remove placement"
            />
          </Tooltip>
        </>
      ),
    });
  }

  return columns;
};
