import { generatePath, useNavigate } from 'react-router-dom';
import { Table } from 'antd';
import { Routes } from '../../../../constants/routes.constants';
import type { AdPlacementWithVideo } from '../../../../types/adPlacement.types';
import { getAdPlacementVideoColumns } from './AdPlacementVideosList.columns';
import './AdPlacementVideosList.css';

type AdPlacementVideosListProps = {
  items: AdPlacementWithVideo[];
  startDate: string;
  endDate: string;
};

/**
 * @description Table of everywhere an ad is placed - the mirror image of `AdPlacementsList`
 * (which lists a video's ads), with the same columns: the video, when the ad starts in it, how
 * long it runs or when it can be skipped, and that placement's own performance for the given
 * window (AdPlacementRowStat). Clicking a row opens the video's details page. The tile shows a
 * frame from the video where one can be derived; a deleted video's row drops its status tag and
 * frame (its file is gone).
 */
export const AdPlacementVideosList = ({
  items,
  startDate,
  endDate,
}: AdPlacementVideosListProps) => {
  const navigate = useNavigate();

  const columns = getAdPlacementVideoColumns(startDate, endDate);

  /**
   * @description Opens a placement's video - the whole row acts as its link.
   */
  const openVideo = (videoId: string) => navigate(generatePath(Routes.VIDEO_DETAILS, { videoId }));

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={items}
      pagination={false}
      className="ad-placement-videos-list"
      rowClassName="ad-placement-videos-list__row"
      onRow={({ video }) => ({ onClick: () => openVideo(video.id) })}
    />
  );
};
