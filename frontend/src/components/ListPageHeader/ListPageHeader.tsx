import type { ReactNode } from 'react';
import { Button, Flex, Typography } from 'antd';
import './ListPageHeader.css';

const { Title, Text } = Typography;

type ListPageHeaderProps = {
  title: string;
  subtitle: string;
  actionLabel: string;
  actionIcon: ReactNode;
  onAction: () => void;
};

/**
 * @description Top row of an admin list page - title and a count subtitle on the left, the page's
 * primary create action on the right.
 */
export const ListPageHeader = ({
  title,
  subtitle,
  actionLabel,
  actionIcon,
  onAction,
}: ListPageHeaderProps) => (
  <Flex justify="space-between" align="center" className="list-page-header">
    <Flex vertical gap={4}>
      <Title level={2}>{title}</Title>
      <Text type="secondary">{subtitle}</Text>
    </Flex>
    <Button type="primary" size="large" icon={actionIcon} onClick={onAction}>
      {actionLabel}
    </Button>
  </Flex>
);
