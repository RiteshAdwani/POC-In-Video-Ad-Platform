import { Table } from 'antd';
import type { AdPlacement } from '../../../../types/adPlacement.types';
import { getAdPlacementColumns } from './AdPlacementsList.columns';
import './AdPlacementsList.css';

type AdPlacementsListProps = {
  adPlacements: AdPlacement[];
  videoId: string;
  startDate: string;
  endDate: string;
  onEdit: (adPlacement: AdPlacement) => void;
  onDelete: (adPlacement: AdPlacement) => void;
  readOnly?: boolean;
};

/**
 * @description Table of a video's placements - the ad (its real creative, or a colored tile
 * standing in), when it starts, how long it runs or when it can be skipped, and its own
 * performance for the given window via AdPlacementRowStat. readOnly drops the edit/remove column.
 */
export const AdPlacementsList = ({
  adPlacements,
  videoId,
  startDate,
  endDate,
  onEdit,
  onDelete,
  readOnly = false,
}: AdPlacementsListProps) => {
  const columns = getAdPlacementColumns({
    videoId,
    startDate,
    endDate,
    onEdit,
    onDelete,
    readOnly,
  });

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={adPlacements}
      pagination={false}
      className="ad-placements-list"
    />
  );
};
