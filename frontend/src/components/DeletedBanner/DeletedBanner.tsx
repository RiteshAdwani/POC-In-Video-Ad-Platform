import { Alert } from 'antd';
import { DELETED_READ_ONLY_NOTE } from '../../constants/listView.constants';
import { formatDate } from '../../lib/formatDate';
import './DeletedBanner.css';

type DeletedBannerProps = {
  itemLabel: string;
  deletedAt: string;
};

/**
 * @description Top-of-page notice on a retired video's or ad's details page - says when it was
 * deleted and that the page is read-only.
 */
export const DeletedBanner = ({ itemLabel, deletedAt }: DeletedBannerProps) => (
  <Alert
    type="warning"
    showIcon
    className="deleted-banner"
    title={`This ${itemLabel} was deleted on ${formatDate(deletedAt)}.`}
    description={DELETED_READ_ONLY_NOTE}
  />
);
