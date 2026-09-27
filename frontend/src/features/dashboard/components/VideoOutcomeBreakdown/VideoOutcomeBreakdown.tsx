import { Pie } from '@ant-design/plots';
import { Card, Empty, Flex, Typography } from 'antd';
import type { DashboardStats } from '../../../../types/dashboard.types';
import {
  VideoOutcome,
  VIDEO_OUTCOME_COLORS,
  VIDEO_OUTCOME_DOT_CLASS,
} from '../../../../constants/dashboard.constants';
import './VideoOutcomeBreakdown.css';

const { Text } = Typography;

type VideoOutcomeBreakdownProps = {
  stats: DashboardStats;
};

/**
 * @description Donut breakdown of whether a play finished the video or left early - the video-side
 * mirror of DashboardOutcomeBreakdown's ad-outcome donut, using the same videoCompletionRate the
 * "Video completions" tile already derives.
 */
export const VideoOutcomeBreakdown = ({ stats }: VideoOutcomeBreakdownProps) => {
  if (stats.videoViews === 0) {
    return (
      <Card title="Video outcomes">
        <Empty description="No plays in this range yet" />
      </Card>
    );
  }

  const leftEarly = stats.videoViews - stats.videoCompletions;
  const slices: { outcome: VideoOutcome; count: number }[] = [
    { outcome: VideoOutcome.FINISHED, count: stats.videoCompletions },
    { outcome: VideoOutcome.LEFT_EARLY, count: leftEarly },
  ];

  return (
    <Card title="Video outcomes">
      <Flex vertical align="center" gap={12}>
        <div className="video-outcome-breakdown__chart">
          <Pie
            data={slices}
            angleField="count"
            colorField="outcome"
            innerRadius={0.6}
            scale={{
              color: {
                domain: slices.map((slice) => slice.outcome),
                range: slices.map((slice) => VIDEO_OUTCOME_COLORS[slice.outcome]),
              },
            }}
            legend={false}
            height={200}
            tooltip={{
              items: [
                (datum: { outcome: VideoOutcome; count: number }) => ({
                  name: datum.outcome,
                  value: datum.count.toLocaleString(),
                }),
              ],
            }}
          />
        </div>
        <Flex wrap justify="center" gap={16}>
          {slices.map((slice) => (
            <Flex align="center" gap={6} key={slice.outcome}>
              <span
                className={`video-outcome-breakdown__dot ${VIDEO_OUTCOME_DOT_CLASS[slice.outcome]}`}
              />
              <Text>
                {slice.outcome} ({slice.count.toLocaleString()})
              </Text>
            </Flex>
          ))}
        </Flex>
        <Text type="secondary" className="video-outcome-breakdown__caption">
          {stats.videoCompletions.toLocaleString()} of {stats.videoViews.toLocaleString()} plays
          finished the video.
        </Text>
      </Flex>
    </Card>
  );
};
