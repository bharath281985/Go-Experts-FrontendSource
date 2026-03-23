import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useTheme } from '@/app/components/ThemeProvider';

interface DonutChartProps {
  data: { name: string; value: number; color: string }[];
  centerText?: string;
  centerValue?: string;
  size?: number;
}

export default function DonutChart({ data, centerText, centerValue, size = 200 }: DonutChartProps) {
  const { isDarkMode } = useTheme();

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={size}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={size * 0.25}
            outerRadius={size * 0.35}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: isDarkMode ? '#171717' : '#ffffff',
              border: isDarkMode ? '1px solid #404040' : '1px solid #e5e5e5',
              borderRadius: '8px',
              color: isDarkMode ? '#ffffff' : '#000000'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      {centerText && centerValue && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
            {centerValue}
          </div>
          <div className={`text-xs ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
            {centerText}
          </div>
        </div>
      )}
    </div>
  );
}
