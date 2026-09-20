import { ASSET_TYPE_LABEL, type AssetType } from '../../../../constants/ad.constants';
import './AssetTypeTag.css';

/**
 * @description Solid type pill sized for overlaying on an ad's thumbnail - colored per
 * `AssetType` through a `data-asset-type` CSS selector rather than an inline style, mirroring
 * `VideoStatusTag`.
 */
export const AssetTypeTag = ({ assetType }: { assetType: AssetType }) => (
  <span className="asset-type-tag" data-asset-type={assetType}>
    {ASSET_TYPE_LABEL[assetType]}
  </span>
);
