import { Tiny } from '@ant-design/plots';
import { Progress, Typography } from 'antd';
import {
  STAT_TILE_SPARKLINE_HEIGHT,
  STAT_TILE_SPARKLINE_LINE_WIDTH,
  type StatMarker,
  type StatMetric,
} from './StatTile.constants';
import './StatTile.css';

const { Text } = Typography;

type StatTileProps = {
  label: string;
  metric: StatMetric;
  marker: StatMarker;
  value: string;
  caption: string;
  // 0-1 share drawn as a bar under the caption; omitted for a plain count.
  ratio?: number;
  // Per-day values drawn as a sparkline beside the value, in the metric's own colour.
  trend?: { values: number[]; color: string };
};

/**
 * @description One metric in a details page's stats panel - a marker in the metric's own colour,
 * its value, a caption, and optionally its share as a bar or its daily trend as a sparkline, in
 * that same colour.
 */
export const StatTile = ({
  label,
  metric,
  marker,
  value,
  caption,
  ratio,
  trend,
}: StatTileProps) => (
  <div className="stat-tile">
    <span className="stat-tile__label">
      <span className={`stat-tile__marker stat-tile__marker--${marker}`} data-metric={metric} />
      {label}
    </span>
    <div className="stat-tile__value-row">
      <Text className="stat-tile__value">{value}</Text>
      {trend && (
        <div className="stat-tile__sparkline">
          <Tiny.Line
            data={trend.values.map((y, x) => ({ x, y }))}
            xField="x"
            yField="y"
            height={STAT_TILE_SPARKLINE_HEIGHT}
            shapeField="smooth"
            // G2's mark style (the line's stroke), not a DOM inline style.
            style={{ stroke: trend.color, lineWidth: STAT_TILE_SPARKLINE_LINE_WIDTH }}
          />
        </div>
      )}
    </div>
    <Text type="secondary" className="stat-tile__caption">
      {caption}
    </Text>
    {ratio !== undefined && (
      <Progress
        percent={ratio * 100}
        strokeColor={`var(--fc-metric-${metric})`}
        railColor="var(--fc-track)"
        showInfo={false}
        size={['100%', 6]}
        className="stat-tile__bar"
      />
    )}
  </div>
);
