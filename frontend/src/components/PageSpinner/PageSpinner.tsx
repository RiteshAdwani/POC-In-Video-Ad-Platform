import { Flex, Spin } from 'antd';
import './PageSpinner.css';

/**
 * @description Centered, padded spinner shown while a page's primary query is loading -
 * shared across pages instead of each repeating the same Flex/Spin markup.
 */
export const PageSpinner = () => (
  <Flex justify="center" className="page-spinner">
    <Spin size="large" />
  </Flex>
);
