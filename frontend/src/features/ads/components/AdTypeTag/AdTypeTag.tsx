import { AdType, AD_TYPE_LABEL } from '../../../../constants/ad.constants';
import './AdTypeTag.css';

/**
 * @description Solid type pill sized for overlaying on an ad's thumbnail - colored per `AdType`
 * through a `data-ad-type` CSS selector rather than an inline style, mirroring `VideoStatusTag`.
 */
export const AdTypeTag = ({ adType }: { adType: AdType }) => (
  <span className="ad-type-tag" data-ad-type={adType}>
    {AD_TYPE_LABEL[adType]}
  </span>
);
