import type { ReactNode } from 'react';
import { Button, Tooltip } from 'antd';
import { DeleteOutlined, EditOutlined, ExportOutlined } from '@ant-design/icons';
import { AssetType, DELETE_AD_BLOCKED_TOOLTIP } from '../../../../constants/ad.constants';
import { DetailsHeader } from '../../../../components/DetailsHeader/DetailsHeader';
import { formatDate } from '../../../../lib/formatDate';
import { formatUrlHost } from '../../../../lib/formatUrlHost';
import type { Advertisement } from '../../../../types/advertisement.types';
import { AssetTypeTag } from '../AssetTypeTag/AssetTypeTag';
import './AdPreviewHeader.css';

type AdPreviewHeaderProps = {
  ad: Advertisement;
  onEdit: () => void;
  onDelete: () => void;
  // The ad's stats panel, shown beside the creative.
  children?: ReactNode;
};

/**
 * @description Ad details page's top section - the creative itself (image, or a playable video)
 * beside the ad's title, type, creation date, click-through link, description and stats panel.
 * Deleting is blocked while the ad is still placed on any video, since the backend rejects it.
 */
export const AdPreviewHeader = ({ ad, onEdit, onDelete, children }: AdPreviewHeaderProps) => {
  const isDeleted = Boolean(ad.deletedAt);
  const isPlaced = ad.adPlacementCount > 0;

  return (
    <DetailsHeader
      media={
        ad.assetType === AssetType.IMAGE ? (
          <img src={ad.assetUrl} alt={ad.title} />
        ) : (
          <video src={ad.assetUrl} controls />
        )
      }
      title={ad.title}
      meta={[
        <AssetTypeTag assetType={ad.assetType} />,
        `Created ${formatDate(ad.createdAt)}`,
        ad.clickThroughUrl && (
          <a
            href={ad.clickThroughUrl}
            target="_blank"
            rel="noreferrer"
            className="ad-preview-header__click-through"
          >
            {formatUrlHost(ad.clickThroughUrl)} <ExportOutlined />
          </a>
        ),
      ]}
      description={ad.description}
      actions={
        !isDeleted && (
          <>
            <Button icon={<EditOutlined />} onClick={onEdit}>
              Edit ad
            </Button>
            <Tooltip title={isPlaced ? DELETE_AD_BLOCKED_TOOLTIP : undefined}>
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                disabled={isPlaced}
                onClick={onDelete}
              >
                Delete
              </Button>
            </Tooltip>
          </>
        )
      }
    >
      {children}
    </DetailsHeader>
  );
};
