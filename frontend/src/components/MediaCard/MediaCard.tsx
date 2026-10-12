import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Button, Dropdown, Typography, type MenuProps } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import { DotSeparated } from '../DotSeparated/DotSeparated';
import './MediaCard.css';

const { Text } = Typography;

type MediaCardProps = {
  to: string;
  // The thumbnail itself - an image, a video frame, or a placeholder.
  media: ReactNode;
  // Chips placed over the thumbnail with the media-card__chip classes.
  overlays?: ReactNode;
  title: string;
  // Short facts shown on one line, separated by dots; falsy entries are skipped.
  meta: ReactNode[];
  // Omitted for a read-only (deleted) item, which drops the actions menu.
  menu?: MenuProps;
};

/**
 * @description A library grid card - thumbnail with overlaid chips, title and one meta line, and
 * a ⋯ actions menu. The thumbnail and text link to the item's details page; the menu sits outside
 * that link so a <button> is never nested inside an <a>.
 */
export const MediaCard = ({ to, media, overlays, title, meta, menu }: MediaCardProps) => (
  <div className="media-card">
    <Link to={to} className="media-card__link">
      <div className="media-card__thumb">
        {media}
        {overlays}
      </div>
      <div className="media-card__body">
        <Text strong ellipsis className="media-card__title">
          {title}
        </Text>
        <DotSeparated parts={meta} className="media-card__meta" />
      </div>
    </Link>

    {menu && (
      <Dropdown menu={menu} trigger={['click']} placement="bottomRight">
        <Button
          type="text"
          icon={<MoreOutlined rotate={90} />}
          aria-label={`Actions for ${title}`}
          className="media-card__menu-button"
        />
      </Dropdown>
    )}
  </div>
);
