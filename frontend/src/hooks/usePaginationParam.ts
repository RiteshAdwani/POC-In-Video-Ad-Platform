import { useSearchParams } from 'react-router-dom';

/**
 * @description Reads the current page from the ?page= URL param (so it survives a refresh and is
 * shareable), defaulting to 1 when absent or invalid. Writes back via history replace, not push -
 * paging through a list shouldn't pile up back-button history entries.
 */
export const usePaginationParam = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const rawPage = Number(searchParams.get('page'));
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;

  const onPageChange = (nextPage: number) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('page', String(nextPage));
        return next;
      },
      { replace: true },
    );
  };

  return { page, onPageChange };
};
