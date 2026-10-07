import { useSearchParams } from 'react-router-dom';
import { SEARCH_PARAM } from '../constants/search.constants';

/**
 * @description Reads an admin list's search term from the ?search= URL param. Setting a new term
 * drops the page param in the same URL update, so the list refetches once, from page 1.
 */
export const useListSearchParam = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get(SEARCH_PARAM) ?? '';

  const onSearch = (nextSearch: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (nextSearch) {
          next.set(SEARCH_PARAM, nextSearch);
        } else {
          next.delete(SEARCH_PARAM);
        }
        next.delete('page');
        return next;
      },
      { replace: true },
    );
  };

  return { search, onSearch };
};
