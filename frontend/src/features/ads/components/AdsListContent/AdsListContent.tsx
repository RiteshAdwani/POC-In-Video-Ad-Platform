import { Button, Empty, Flex, Pagination, Result } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { PageSpinner } from '../../../../components/PageSpinner/PageSpinner';
import type { AdvertisementsResponseDto } from '../../../../dtos/advertisement.dto';
import type { Advertisement } from '../../../../types/advertisement.types';
import { AdsGrid } from '../AdsGrid/AdsGrid';
import './AdsListContent.css';

type AdsListContentProps = {
  data: AdvertisementsResponseDto | undefined;
  isLoading: boolean;
  isError: boolean;
  search: string;
  isDeletedView: boolean;
  onCreate: () => void;
  onEdit: (ad: Advertisement) => void;
  onDelete: (ad: Advertisement) => void;
  onPageChange: (page: number) => void;
};

/**
 * @description The ads page's list area - loading, error, empty, or the grid with pagination,
 * whichever the current query state calls for.
 */
export const AdsListContent = ({
  data,
  isLoading,
  isError,
  search,
  isDeletedView,
  onCreate,
  onEdit,
  onDelete,
  onPageChange,
}: AdsListContentProps) => {
  if (isLoading) return <PageSpinner />;

  if (isError) {
    return <Result status="error" title="Couldn't load ads" subTitle="Please try again shortly." />;
  }

  if (!data || data.pagination.totalItems === 0) {
    const listNoun = isDeletedView ? 'deleted ads' : 'ads';
    return (
      <Empty description={search ? `No ${listNoun} match "${search}"` : `No ${listNoun} yet`}>
        {!search && !isDeletedView && (
          <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
            Create your first ad
          </Button>
        )}
      </Empty>
    );
  }

  return (
    <>
      <AdsGrid ads={data.advertisements} onEdit={onEdit} onDelete={onDelete} />
      <Flex justify="flex-end" className="ads-list-content__pagination">
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
