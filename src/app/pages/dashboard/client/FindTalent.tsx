import { motion } from 'motion/react';
import { useTheme } from '@/app/components/ThemeProvider';
import { Users } from 'lucide-react';

export default function FindTalent() {
  const { isDarkMode } = useTheme();

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
          Find Talent
        </h1>
        <p className={`mt-2 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
          Discover and hire top freelancers for your projects
        </p>
      </motion.div>
    </div>
  );
}
