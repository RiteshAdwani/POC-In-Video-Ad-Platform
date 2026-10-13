import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import { Routes } from '../../../../constants/routes.constants';

/**
 * @description The player's way back to the catalog - an outlined top-bar button, the same as the
 * catalog's own "Admin login", so the bar reads the same on every public page.
 */
export const AllVideosLink = () => {
  const navigate = useNavigate();

  return (
    <Button icon={<LeftOutlined />} onClick={() => void navigate(Routes.HOME)}>
      All videos
    </Button>
  );
};
