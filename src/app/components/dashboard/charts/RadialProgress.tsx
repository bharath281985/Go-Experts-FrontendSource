import { motion } from 'motion/react';
import { useTheme } from '@/app/components/ThemeProvider';

interface RadialProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  showPercentage?: boolean;
}

export default function RadialProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  color = '#F24C20',
  label,
  showPercentage = true
}: RadialProgressProps) {
  const { isDarkMode } = useTheme();
  const percentage = (value / max) * 100;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={isDarkMode ? '#262626' : '#e5e5e5'}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress Circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          strokeDasharray={circumference}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showPercentage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}
          >
            {Math.round(percentage)}%
          </motion.div>
        )}
        {label && (
          <div className={`text-xs mt-1 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
            {label}
          </div>
        )}
      </div>
    </div>
  );
}
