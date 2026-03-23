import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useTheme } from '@/app/components/ThemeProvider';

interface LineChartComponentProps {
  data: any[];
  dataKey: string;
  xAxisKey: string;
  color?: string;
  height?: number;
  showArea?: boolean;
}

export default function LineChartComponent({
  data,
  dataKey,
  xAxisKey,
  color = '#F24C20',
  height = 300,
  showArea = false
}: LineChartComponentProps) {
  const { isDarkMode } = useTheme();

  const ChartComponent = showArea ? AreaChart : LineChart;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ChartComponent data={data}>
        <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={isDarkMode ? '#404040' : '#e5e5e5'}
          vertical={false}
        />
        <XAxis
          dataKey={xAxisKey}
          stroke={isDarkMode ? '#737373' : '#a3a3a3'}
          style={{ fontSize: '12px' }}
        />
        <YAxis
          stroke={isDarkMode ? '#737373' : '#a3a3a3'}
          style={{ fontSize: '12px' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: isDarkMode ? '#171717' : '#ffffff',
            border: isDarkMode ? '1px solid #404040' : '1px solid #e5e5e5',
            borderRadius: '8px',
            color: isDarkMode ? '#ffffff' : '#000000'
          }}
        />
        {showArea ? (
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            fill="url(#colorValue)"
          />
        ) : (
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            dot={{ fill: color, r: 4 }}
            activeDot={{ r: 6 }}
          />
        )}
      </ChartComponent>
    </ResponsiveContainer>
  );
}
