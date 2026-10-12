import type { ReactNode } from 'react';
import { PictureOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { AssetType } from '../../../../constants/ad.constants';

export const ASSET_TYPE_ICON: Record<AssetType, ReactNode> = {
  [AssetType.IMAGE]: <PictureOutlined />,
  [AssetType.VIDEO]: <VideoCameraOutlined />,
};
