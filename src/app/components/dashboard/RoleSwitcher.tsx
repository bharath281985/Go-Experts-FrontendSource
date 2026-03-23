import { motion } from 'motion/react';
import { Users, Briefcase } from 'lucide-react';

interface RoleSwitcherProps {
  currentRole: 'client' | 'freelancer';
  onSwitch: (role: 'client' | 'freelancer') => void;
}

export default function RoleSwitcher({ currentRole, onSwitch }: RoleSwitcherProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed bottom-6 right-6 z-50 p-1 bg-neutral-900/95 backdrop-blur-xl rounded-full border border-neutral-800 shadow-xl"
    >
      <div className="flex gap-1">
        <button
          onClick={() => onSwitch('client')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
            currentRole === 'client'
              ? 'bg-[#F24C20] text-white shadow-lg shadow-[#F24C20]/30'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span className="text-sm">Client</span>
        </button>
        <button
          onClick={() => onSwitch('freelancer')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
            currentRole === 'freelancer'
              ? 'bg-[#F24C20] text-white shadow-lg shadow-[#F24C20]/30'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span className="text-sm">Freelancer</span>
        </button>
      </div>
    </motion.div>
  );
}
