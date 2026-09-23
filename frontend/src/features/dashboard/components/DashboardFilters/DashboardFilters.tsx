import { DatePicker, Flex, Typography } from 'antd';
import type { Dayjs } from 'dayjs';

const { Text } = Typography;

type DashboardFiltersProps = {
  range: [Dayjs, Dayjs];
  onRangeChange: (range: [Dayjs, Dayjs]) => void;
};

/**
 * @description Date-range control - two independent single-panel DatePickers, not RangePicker
 * (which always opens a two-month calendar). Each picker's disabledDate keeps the range valid:
 * start can't move past the current end, end can't move before the current start.
 */
export const DashboardFilters = ({ range, onRangeChange }: DashboardFiltersProps) => {
  const [startDate, endDate] = range;

  return (
    <Flex align="center" gap={8}>
      <DatePicker
        value={startDate}
        allowClear={false}
        disabledDate={(date) => date.isAfter(endDate, 'day')}
        onChange={(date) => {
          if (date) onRangeChange([date, endDate]);
        }}
      />
      <Text type="secondary">to</Text>
      <DatePicker
        value={endDate}
        allowClear={false}
        disabledDate={(date) => date.isBefore(startDate, 'day')}
        onChange={(date) => {
          if (date) onRangeChange([startDate, date]);
        }}
      />
    </Flex>
  );
};
