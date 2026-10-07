import { Button, Empty, Flex, Pagination, Result } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { PageSpinner } from '../../../../components/PageSpinner/PageSpinner';
import type { VideosResponseDto } from '../../../../dtos/video.dto';
import type { Video } from '../../../../types/video.types';
import { VideosGrid } from '../VideosGrid/VideosGrid';
import './VideosListContent.css';

type VideosListContentProps = {
  data: VideosResponseDto | undefined;
  isLoading: boolean;
  isError: boolean;
  search: string;
  isDeletedView: boolean;
  onUpload: () => void;
  onEdit: (video: Video) => void;
  onDelete: (video: Video) => void;
  onPageChange: (page: number) => void;
};

/**
 * @description The videos page's list area - loading, error, empty, or the grid with pagination,
 * whichever the current query state calls for.
 */
export const VideosListContent = ({
  data,
  isLoading,
  isError,
  search,
  isDeletedView,
  onUpload,
  onEdit,
  onDelete,
  onPageChange,
}: VideosListContentProps) => {
  if (isLoading) return <PageSpinner />;

  if (isError) {
    return (
      <Result status="error" title="Couldn't load videos" subTitle="Please try again shortly." />
    );
  }

  if (!data || data.pagination.totalItems === 0) {
    const listNoun = isDeletedView ? 'deleted videos' : 'videos';
    return (
      <Empty description={search ? `No ${listNoun} match "${search}"` : `No ${listNoun} yet`}>
        {!search && !isDeletedView && (
          <Button type="primary" icon={<UploadOutlined />} onClick={onUpload}>
            Upload your first video
          </Button>
        )}
      </Empty>
    );
  }

  return (
    <>
      <VideosGrid videos={data.videos} onEdit={onEdit} onDelete={onDelete} />
      <Flex justify="flex-end" className="videos-list-content__pagination">
        <Pagination
          current={data.pagination.page}
          pageSize={data.pagination.pageSize}
          total={data.pagination.totalItems}
          onChange={onPageChange}
          showSizeChanger={false}
        />
      </Flex>
    </>
  );
};
