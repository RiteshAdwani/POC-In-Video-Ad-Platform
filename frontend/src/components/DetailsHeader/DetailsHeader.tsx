import type { ReactNode } from 'react';
import { Flex, Typography } from 'antd';
import { DotSeparated } from '../DotSeparated/DotSeparated';
import './DetailsHeader.css';

const { Title, Paragraph } = Typography;

type DetailsHeaderProps = {
  // The preview - a player, an image, or a placeholder.
  media: ReactNode;
  title: string;
  // Short facts shown on one line, separated by dots; falsy entries are skipped.
  meta: ReactNode[];
  description: string | null;
  // Omitted for a read-only (deleted) item.
  actions?: ReactNode;
  // Shown under the description, beside the preview - the item's stats panel.
  children?: ReactNode;
};

/**
 * @description Top of a video's or ad's details page - the preview beside its title and actions,
 * a meta line, the description, and the item's stats panel filling the rest of that column.
 */
export const DetailsHeader = ({
  media,
  title,
  meta,
  description,
  actions,
  children,
}: DetailsHeaderProps) => (
  <Flex gap={28} align="stretch" className="details-header">
    <div className="details-header__media">{media}</div>

    <Flex vertical className="details-header__info">
      <Flex justify="space-between" align="flex-start" gap={16}>
        <Title level={2} className="details-header__title">
          {title}
        </Title>
        {actions && (
          <Flex gap={8} className="details-header__actions">
            {actions}
          </Flex>
        )}
      </Flex>
      <DotSeparated parts={meta} className="details-header__meta" />
      <Paragraph
        type="secondary"
        ellipsis={{ rows: 2, expandable: 'collapsible' }}
        className="details-header__description"
      >
        {description ?? 'No description'}
      </Paragraph>
      {children && <div className="details-header__extra">{children}</div>}
    </Flex>
  </Flex>
);
