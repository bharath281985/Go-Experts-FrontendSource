import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface SparklineChartProps {
  data: any[];
  dataKey: string;
  color?: string;
  height?: number;
}

export default function SparklineChart({
  data,
  dataKey,
  color = '#F24C20',
  height = 40
}: SparklineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
