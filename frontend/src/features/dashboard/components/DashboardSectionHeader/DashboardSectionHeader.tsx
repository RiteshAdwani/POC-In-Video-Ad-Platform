import { Typography } from 'antd';
import type { DashboardSection } from '../../../../constants/dashboard.constants';
import { SECTION_CONTENT } from './DashboardSectionHeader.constants';
import './DashboardSectionHeader.css';

const { Title, Text } = Typography;

type DashboardSectionHeaderProps = {
  section: DashboardSection;
};

/**
 * @description Heading for one half of the dashboard - a tinted icon chip, the section name and
 * what it covers, with a rule running to the edge to separate it from the section above.
 */
export const DashboardSectionHeader = ({ section }: DashboardSectionHeaderProps) => {
  const { icon, title, description } = SECTION_CONTENT[section];

  return (
    <div className="dashboard-section-header">
      <span className={`dashboard-section-header__icon dashboard-section-header__icon--${section}`}>
        {icon}
      </span>
      <div>
        <Title level={4} className="dashboard-section-header__title">
          {title}
        </Title>
        <Text type="secondary" className="dashboard-section-header__description">
          {description}
        </Text>
      </div>
      <span className="dashboard-section-header__rule" />
    </div>
  );
};
