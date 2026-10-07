import { useEffect, useRef, useState } from 'react';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { SEARCH_DEBOUNCE_MS } from '../../constants/search.constants';

type SearchInputProps = {
  placeholder: string;
  onSearch: (value: string) => void;
  // Seeds the box, e.g. from a ?search= URL param on page load.
  initialValue?: string;
  className?: string;
};

/**
 * @description Clearable search box that keeps what's typed to itself and reports only the
 * settled (debounced) term via onSearch - so callers never handle per-keystroke updates.
 */
export const SearchInput = ({
  placeholder,
  onSearch,
  initialValue = '',
  className,
}: SearchInputProps) => {
  const [value, setValue] = useState(initialValue);
  const debouncedValue = useDebouncedValue(value, SEARCH_DEBOUNCE_MS);
  const lastReportedRef = useRef(initialValue);

  /**
   * @description Reports each newly settled term exactly once - the ref guard keeps a re-render
   * (or a new onSearch identity) from re-firing it, e.g. resetting a list back to page 1.
   */
  useEffect(() => {
    if (debouncedValue === lastReportedRef.current) return;
    lastReportedRef.current = debouncedValue;
    onSearch(debouncedValue);
  }, [debouncedValue, onSearch]);

  return (
    <Input
      placeholder={placeholder}
      prefix={<SearchOutlined />}
      allowClear
      value={value}
      onChange={(event) => setValue(event.target.value)}
      className={className}
    />
  );
};
