import { ASSET_TYPE_LABEL, type AssetType } from '../../../../constants/ad.constants';
import { ASSET_TYPE_ICON } from './AssetTypeTag.constants';
import './AssetTypeTag.css';

/**
 * @description What an ad's creative is (image or video), as an icon and label.
 */
export const AssetTypeTag = ({ assetType }: { assetType: AssetType }) => (
  <span className="asset-type-tag">
    {ASSET_TYPE_ICON[assetType]}
    {ASSET_TYPE_LABEL[assetType]}
  </span>
);
