import { generatePath, Link } from 'react-router-dom';
import { Button, Tooltip, Typography } from 'antd';
import { DeleteOutlined, EditOutlined, PlayCircleFilled, TagsOutlined } from '@ant-design/icons';
import { Routes } from '../../../../constants/routes.constants';
import { VideoStatus } from '../../../../constants/video.constants';
import { formatDate } from '../../../../lib/formatDate';
import type { Video } from '../../../../types/video.types';
import { VideoStatusTag } from '../VideoStatusTag/VideoStatusTag';
import './VideosGrid.css';

const { Text } = Typography;

type VideosGridProps = {
  videos: Video[];
  onEdit: (video: Video) => void;
};

/**
 * @description Card-grid listing of videos - thumbnail placeholder with status and ad-placement
 * count overlaid, since a real thumbnail isn't part of the video model yet. The thumbnail and
 * title/description link to that video's details page; the action buttons stay outside that link
 * so a <button> is never nested inside an <a>.
 */
export const VideosGrid = ({ videos, onEdit }: VideosGridProps) => (
  <div className="videos-grid">
    {videos.map((video) => (
      <div className="videos-grid__card" key={video.id}>
        <Link
          to={generatePath(Routes.VIDEO_DETAILS, { videoId: video.id })}
          className="videos-grid__link"
        >
          <div className="videos-grid__thumb">
            <VideoStatusTag status={video.status} />
            <span className="videos-grid__ad-count">
              {video.adPlacementCount} {video.adPlacementCount === 1 ? 'ad' : 'ads'}
            </span>
            <PlayCircleFilled className="videos-grid__play" />
          </div>

          <div className="videos-grid__body">
            <Text strong ellipsis className="videos-grid__title">
              {video.title}
            </Text>
            <Text type="secondary" ellipsis className="videos-grid__description">
              {video.description ?? 'No description'}
            </Text>
          </div>
        </Link>

        <div className="videos-grid__footer">
          <span className="mono">{formatDate(video.createdAt)}</span>
          <span className="videos-grid__actions">
            <Tooltip title="Edit video">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => onEdit(video)}
                aria-label="Edit video"
              />
            </Tooltip>
            <Tooltip title="Manage ad placements">
              <Button
                type="text"
                size="small"
                icon={<TagsOutlined />}
                disabled={video.status !== VideoStatus.READY}
                aria-label="Manage ad placements"
              />
            </Tooltip>
            <Tooltip title="Delete video">
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                aria-label="Delete video"
              />
            </Tooltip>
          </span>
        </div>
      </div>
    ))}
  </div>
);
