import { useSearchParams } from 'react-router-dom';
import { LIST_VIEW_PARAM, ListView } from '../constants/listView.constants';

/**
 * @description Reads the active/deleted list view from the ?view= URL param (survives a refresh,
 * shareable). Switching views drops the page param, so the new list starts from page 1.
 */
export const useListViewParam = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const view =
    searchParams.get(LIST_VIEW_PARAM) === ListView.DELETED ? ListView.DELETED : ListView.ACTIVE;

  const onViewChange = (nextView: ListView) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set(LIST_VIEW_PARAM, nextView);
        next.delete('page');
        return next;
      },
      { replace: true },
    );
  };

  return { view, onViewChange };
};
