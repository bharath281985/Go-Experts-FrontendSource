import { motion } from 'motion/react';
import { Users, Briefcase, Lock } from 'lucide-react';

interface RoleSwitcherProps {
  currentRole: 'client' | 'freelancer';
  onSwitch: (role: 'client' | 'freelancer') => void;
  allowedRoles?: string[];
}

 export default function RoleSwitcher({ currentRole, onSwitch, allowedRoles = [] }: RoleSwitcherProps) {
  const isClientAllowed = allowedRoles.includes('client');
  const isFreelancerAllowed = allowedRoles.includes('freelancer');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed bottom-6 right-6 z-50 p-1.5 bg-neutral-900/95 backdrop-blur-2xl rounded-full border border-neutral-800 shadow-2xl"
    >
      <div className="flex gap-1">
        <button
          onClick={() => onSwitch('client')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold transition-all ${
            currentRole === 'client'
              ? 'bg-[#F24C20] text-white shadow-lg shadow-[#F24C20]/40 rotate-1'
              : !isClientAllowed 
                ? 'text-neutral-600 bg-neutral-900/50 cursor-not-allowed opacity-60' 
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          {isClientAllowed ? <Users className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
          <span className="text-xs uppercase tracking-widest">Client</span>
        </button>
        <button
          onClick={() => onSwitch('freelancer')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold transition-all ${
            currentRole === 'freelancer'
              ? 'bg-[#F24C20] text-white shadow-lg shadow-[#F24C20]/40 -rotate-1'
              : !isFreelancerAllowed 
                ? 'text-neutral-600 bg-neutral-900/50 cursor-not-allowed opacity-60'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          {isFreelancerAllowed ? <Briefcase className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
          <span className="text-xs uppercase tracking-widest">Freelancer</span>
        </button>
      </div>
    </motion.div>
  );
}
