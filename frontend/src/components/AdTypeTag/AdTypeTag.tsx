import { AD_TYPE_LABEL, type AdType } from '../../constants/ad.constants';
import './AdTypeTag.css';

/**
 * @description A placement's role (pre-roll, mid-roll, banner overlay) as a soft orchid tag - the
 * ads accent colour.
 */
export const AdTypeTag = ({ adType }: { adType: AdType }) => (
  <span className="ad-type-tag">{AD_TYPE_LABEL[adType]}</span>
);
