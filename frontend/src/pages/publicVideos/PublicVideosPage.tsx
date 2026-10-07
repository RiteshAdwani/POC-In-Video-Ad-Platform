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
import './PublicVideosPage.css';

const { Title, Text } = Typography;

/**
 * @description The public catalog every visitor lands on - every READY video, open to anyone,
 * with a clearly visible way for the platform's own admins to reach the login page from the same
 * screen (mirroring the login page's own "Continue as a guest" link back the other way). Loads
 * further videos as the grid is scrolled near its bottom, rather than numbered pages - this is a
 * browse/discovery feed, not a "find this specific item" management task.
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
        <PublicVideosGrid videos={videos} />
        <div ref={scrollTriggerRef} className="public-videos-page__load-more">
          {isFetchingNextPage && <Spin />}
          {!hasNextPage && <Text type="secondary">You've reached the end</Text>}
        </div>
      </>
    );
  }

  return (
    <div className="public-videos-page">
      <div className="public-videos-page__topbar">
        <Flex justify="space-between" align="center" className="public-videos-page__topbar-inner">
          <span className="public-videos-page__brand">FrameCue</span>
          <Link to={Routes.LOGIN}>
            <Button icon={<LoginOutlined />}>Admin login</Button>
          </Link>
        </Flex>
      </div>

      <div className="public-videos-page__content">
        <Flex vertical gap={4} className="public-videos-page__header">
          <Title level={1} className="public-videos-page__title">
            Watch videos
          </Title>
          <Text type="secondary">{totalItems} videos to watch</Text>
        </Flex>

        <SearchInput
          placeholder="Search videos by title"
          onSearch={setSearch}
          className="public-videos-page__search"
        />

        {content}
      </div>
    </div>
  );
};
