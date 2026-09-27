import { AD_TYPE_LABEL, type AdType } from '../../constants/ad.constants';
import './AdTypeTag.css';

/**
 * @description Solid type pill for a placement's role (pre-roll/mid-roll/banner overlay) -
 * colored per `AdType` through a `data-ad-type` CSS selector, mirroring `AssetTypeTag`/
 * `VideoStatusTag`. Reuses the same hues already used for each ad type's thumbnail gradient.
 */
export const AdTypeTag = ({ adType }: { adType: AdType }) => (
  <span className="ad-type-tag" data-ad-type={adType}>
    {AD_TYPE_LABEL[adType]}
  </span>
);
