import { generatePath } from 'react-router-dom';
import { Tooltip, type MenuProps } from 'antd';
import { DeleteOutlined, EditOutlined, LinkOutlined } from '@ant-design/icons';
import { AssetType, DELETE_AD_BLOCKED_TOOLTIP } from '../../../../constants/ad.constants';
import { Routes } from '../../../../constants/routes.constants';
import { formatDate } from '../../../../lib/formatDate';
import { formatUrlHost } from '../../../../lib/formatUrlHost';
import { MediaCard } from '../../../../components/MediaCard/MediaCard';
import { VideoThumbnail } from '../../../../components/VideoThumbnail/VideoThumbnail';
import type { Advertisement } from '../../../../types/advertisement.types';
import { AssetTypeTag } from '../AssetTypeTag/AssetTypeTag';
import { AdCardAction } from './AdCard.constants';
import './AdCard.css';

type AdCardProps = {
  ad: Advertisement;
  onEdit: (ad: Advertisement) => void;
  onDelete: (ad: Advertisement) => void;
};

/**
 * @description One ad in the library grid - its creative (the image, or a frame from the video),
 * its type, how many videos it runs on, and where a click takes the viewer. A deleted ad (shown
 * only under the Deleted tab) is read-only, with no placement count or actions.
 */
export const AdCard = ({ ad, onEdit, onDelete }: AdCardProps) => {
  const isDeleted = Boolean(ad.deletedAt);
  // Backend rejects deleting an ad that's still live on any video - block it here up front.
  const isPlaced = ad.adPlacementCount > 0;

  const menu: MenuProps = {
    items: [
      { key: AdCardAction.EDIT, icon: <EditOutlined />, label: 'Edit ad' },
      { type: 'divider' },
      {
        key: AdCardAction.DELETE,
        icon: <DeleteOutlined />,
        label: (
          <Tooltip title={isPlaced ? DELETE_AD_BLOCKED_TOOLTIP : undefined} placement="left">
            Delete ad
          </Tooltip>
        ),
        danger: true,
        disabled: isPlaced,
      },
    ],
    onClick: ({ key }) => {
      if (key === AdCardAction.EDIT) onEdit(ad);
      if (key === AdCardAction.DELETE) onDelete(ad);
    },
  };

  const overlays = (
    <>
      <span className="media-card__chip media-card__chip--top-left">
        <AssetTypeTag assetType={ad.assetType} />
      </span>
      {!isDeleted && isPlaced && (
        <span className="media-card__chip media-card__chip--bottom-left ad-card__video-count">
          On {ad.adPlacementCount} {ad.adPlacementCount === 1 ? 'video' : 'videos'}
        </span>
      )}
    </>
  );

  return (
    <MediaCard
      to={generatePath(Routes.AD_DETAILS, { adId: ad.id })}
      media={
        ad.assetType === AssetType.IMAGE ? (
          <img src={ad.assetUrl} alt="" />
        ) : (
          <VideoThumbnail src={ad.assetUrl} />
        )
      }
      overlays={overlays}
      title={ad.title}
      meta={[
        isDeleted ? `Deleted ${formatDate(ad.deletedAt!)}` : `Created ${formatDate(ad.createdAt)}`,
        ad.clickThroughUrl && (
          <span className="ad-card__click-through">
            <LinkOutlined />
            {formatUrlHost(ad.clickThroughUrl)}
          </span>
        ),
      ]}
      menu={isDeleted ? undefined : menu}
    />
  );
};
