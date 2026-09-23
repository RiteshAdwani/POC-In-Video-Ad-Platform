import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { DASHBOARD_DATE_FORMAT, DEFAULT_RANGE_DAYS } from '../../../constants/dashboard.constants';

type DashboardDateRange = {
  range: [Dayjs, Dayjs];
  onRangeChange: (range: [Dayjs, Dayjs]) => void;
  startDate: string;
  endDate: string;
};

/**
 * @description Reads the dashboard's date range from the ?startDate=/?endDate= URL params (so it
 * survives a refresh and is shareable), falling back to the last DEFAULT_RANGE_DAYS days when
 * absent or invalid. Writes back via history replace, not push.
 */
export const useDashboardDateRange = (): DashboardDateRange => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Computed once per mount, not on every render - otherwise a page left open across midnight
  // would silently shift what "today" means for the fallback range mid-session.
  const defaultRange = useMemo<[Dayjs, Dayjs]>(
    () => [dayjs().subtract(DEFAULT_RANGE_DAYS - 1, 'day'), dayjs()],
    [],
  );

  const range = useMemo<[Dayjs, Dayjs]>(() => {
    const start = dayjs(searchParams.get('startDate'));
    const end = dayjs(searchParams.get('endDate'));
    if (start.isValid() && end.isValid() && !start.isAfter(end)) {
      return [start, end];
    }
    return defaultRange;
  }, [searchParams, defaultRange]);

  const onRangeChange = ([start, end]: [Dayjs, Dayjs]) => {
    // replace, not push - picking a date shouldn't pile up back-button history entries.
    setSearchParams(
      {
        startDate: start.format(DASHBOARD_DATE_FORMAT),
        endDate: end.format(DASHBOARD_DATE_FORMAT),
      },
      { replace: true },
    );
  };

  return {
    range,
    onRangeChange,
    startDate: range[0].format(DASHBOARD_DATE_FORMAT),
    endDate: range[1].format(DASHBOARD_DATE_FORMAT),
  };
};
