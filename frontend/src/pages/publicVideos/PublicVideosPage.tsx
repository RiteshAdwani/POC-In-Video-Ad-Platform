import { Link } from 'react-router-dom';
import { Button, Empty, Flex, Result, Typography } from 'antd';
import { LoginOutlined } from '@ant-design/icons';
import { Routes } from '../../constants/routes.constants';
import { PublicVideosGrid } from '../../features/publicPlayer/components/PublicVideosGrid/PublicVideosGrid';
import { PageSpinner } from '../../components/PageSpinner/PageSpinner';
import { usePublicVideosQuery } from '../../features/publicPlayer/hooks/usePublicVideosQuery';
import './PublicVideosPage.css';

const { Title, Text } = Typography;

/**
 * @description The public catalog every visitor lands on - every READY video, open to anyone,
 * with a clearly visible way for the platform's own admins to reach the login page from the same
 * screen (mirroring the login page's own "Continue as a guest" link back the other way).
 */
export const PublicVideosPage = () => {
  const { data: videos, isLoading, isError } = usePublicVideosQuery();

  let content;
  if (isLoading) {
    content = <PageSpinner />;
  } else if (isError) {
    content = (
      <Result status="error" title="Couldn't load videos" subTitle="Please try again shortly." />
    );
  } else if (!videos || videos.length === 0) {
    content = <Empty description="No videos published yet" />;
  } else {
    content = <PublicVideosGrid videos={videos} />;
  }

  return (
    <div className="public-videos-page">
      <Flex justify="space-between" align="center" className="public-videos-page__topbar">
        <span className="public-videos-page__brand">FrameCue</span>
        <Link to={Routes.LOGIN}>
          <Button icon={<LoginOutlined />}>Admin login</Button>
        </Link>
      </Flex>

      <Flex vertical gap={4} className="public-videos-page__header">
        <Title level={2}>Watch videos</Title>
        <Text type="secondary">{videos?.length ?? 0} videos to watch</Text>
      </Flex>

      {content}
    </div>
  );
};
