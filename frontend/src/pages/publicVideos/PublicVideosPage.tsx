import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Empty, Flex, Result, Spin, Typography } from 'antd';
import { LoginOutlined } from '@ant-design/icons';
import { Routes } from '../../constants/routes.constants';
import { PublicVideosGrid } from '../../features/publicPlayer/components/PublicVideosGrid/PublicVideosGrid';
import { PageSpinner } from '../../components/PageSpinner/PageSpinner';
import { usePublicVideosQuery } from '../../features/publicPlayer/hooks/usePublicVideosQuery';
import { useInfiniteScrollTrigger } from '../../hooks/useInfiniteScrollTrigger';
import { SearchInput } from '../../components/SearchInput/SearchInput';
import { PublicTopBar } from '../../features/publicPlayer/components/PublicTopBar/PublicTopBar';
import './PublicVideosPage.css';

const { Title, Text } = Typography;

/**
 * @description The public catalog every visitor lands on - every READY video, open to anyone,
 * with a clearly visible way for the platform's own admins to reach the login page from the same
 * screen (mirroring the login page's own "Browse videos as a guest" link back the other way). The
 * newest video leads as a hero tile unless a search is active. Loads further videos as the grid is
 * scrolled near its bottom, rather than numbered pages - this is a browse/discovery feed, not a
 * "find this specific item" management task.
 */
export const PublicVideosPage = () => {
  const [search, setSearch] = useState('');
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    usePublicVideosQuery(search);

  const videos = useMemo(() => data?.pages.flatMap((page) => page.videos) ?? [], [data]);
  const totalItems = data?.pages[0]?.pagination.totalItems ?? 0;

  const scrollTriggerRef = useInfiniteScrollTrigger(
    fetchNextPage,
    Boolean(hasNextPage) && !isFetchingNextPage,
  );

  let content;
  if (isLoading) {
    content = <PageSpinner />;
  } else if (isError) {
    content = (
      <Result status="error" title="Couldn't load videos" subTitle="Please try again shortly." />
    );
  } else if (videos.length === 0) {
    content = (
      <Empty description={search ? `No videos match "${search}"` : 'No videos published yet'} />
    );
  } else {
    content = (
      <>
        <PublicVideosGrid videos={videos} featureFirst={!search} />
        <div ref={scrollTriggerRef} className="public-videos-page__load-more">
          {isFetchingNextPage && <Spin />}
          {!hasNextPage && <Text type="secondary">You've reached the end</Text>}
        </div>
      </>
    );
  }

  return (
    <div className="public-videos-page">
      <PublicTopBar>
        <Link to={Routes.LOGIN}>
          <Button icon={<LoginOutlined />}>Admin login</Button>
        </Link>
      </PublicTopBar>

      <div className="public-videos-page__content">
        <Flex
          justify="space-between"
          align="flex-end"
          gap={24}
          wrap
          className="public-videos-page__header"
        >
          <Flex vertical gap={4}>
            <Title level={1} className="public-videos-page__title">
              Watch
            </Title>
            <Text type="secondary">
              {totalItems} {totalItems === 1 ? 'video' : 'videos'}
            </Text>
          </Flex>
          <SearchInput
            placeholder="Search videos"
            onSearch={setSearch}
            className="public-videos-page__search"
          />
        </Flex>

        {content}
      </div>
    </div>
  );
};
