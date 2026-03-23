import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '@/app/components/ThemeProvider';

interface BarChartComponentProps {
  data: any[];
  dataKey: string;
  xAxisKey: string;
  color?: string;
  height?: number;
}

export default function BarChartComponent({
  data,
  dataKey,
  xAxisKey,
  color = '#F24C20',
  height = 300
}: BarChartComponentProps) {
  const { isDarkMode } = useTheme();

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
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
        <Bar dataKey={dataKey} fill={color} radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
