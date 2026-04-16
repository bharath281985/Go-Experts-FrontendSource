import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Briefcase,
  Search,
  Users,
  MessageSquare,
  Wallet,
  HelpCircle,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '@/app/components/ThemeProvider';

interface QuickActionMenuProps {
  userType: 'client' | 'freelancer';
}

export default function QuickActionMenu({ userType }: QuickActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { isDarkMode } = useTheme();

  const clientActions = [
    {
      label: 'Post a Project',
      icon: Plus,
      path: '/dashboard/projects/create',
      color: 'bg-orange-600'
    },
    {
      label: 'Find Talent',
      icon: Users,
      path: '/talent',
      color: 'bg-[#044071]'
    },
    {
      label: 'My Projects',
      icon: Briefcase,
      path: '/dashboard/projects/my-projects',
      color: 'bg-[#F24C20]'
    },
    {
      label: 'Messages',
      icon: MessageSquare,
      path: '/dashboard/messages',
      color: 'bg-blue-500',
      badge: 5
    },
    {
      label: 'Help',
      icon: HelpCircle,
      path: '/faqs',
      color: 'bg-neutral-600'
    }
  ];

  const freelancerActions = [
    {
      label: 'Active Projects',
      icon: Briefcase,
      path: '/dashboard/projects/my-projects',
      color: 'bg-[#F24C20]'
    },
    {
      label: 'Find Work',
      icon: Search,
      path: '/projects',
      color: 'bg-[#044071]'
    },
    {
      label: 'Wallet',
      icon: Wallet,
      path: '/dashboard/wallet',
      color: 'bg-green-600'
    },
    {
      label: 'Messages',
      icon: MessageSquare,
      path: '/dashboard/messages',
      color: 'bg-blue-500',
      badge: 3
    },
    {
      label: 'Help',
      icon: HelpCircle,
      path: '/faqs',
      color: 'bg-neutral-600'
    }
  ];

  const actions = userType === 'client' ? clientActions : freelancerActions;

  return (
    <div className="fixed bottom-4 md:bottom-8 left-4 md:left-8 z-50">
      {/* Backdrop for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[-1] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Action Menu Items */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-4 space-y-3"
          >
            {actions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={action.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={action.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 pl-3 md:pl-4 pr-5 md:pr-6 py-2.5 md:py-3 rounded-full shadow-xl backdrop-blur-xl border transition-all active:scale-95 lg:hover:scale-105 ${isDarkMode
                      ? 'bg-neutral-900/95 border-neutral-800 hover:border-neutral-700'
                      : 'bg-white/95 border-neutral-200 hover:border-neutral-300'
                      }`}
                  >
                    <div className={`relative p-2 rounded-full ${action.color} shadow-lg shadow-black/20`}>
                      <Icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                      {action.badge && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-red-500 text-white text-[10px] md:text-xs font-bold rounded-full flex items-center justify-center border-2 border-neutral-900">
                          {action.badge}
                        </span>
                      )}
                    </div>
                    <span className={`text-sm md:text-base font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                      {action.label}
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`w-14 h-14 md:w-16 md:h-16 rounded-full shadow-2xl flex items-center justify-center transition-all ${isOpen
          ? 'bg-red-500 hover:bg-red-600'
          : 'bg-gradient-to-br from-[#F24C20] to-orange-600 hover:from-orange-600 hover:to-[#F24C20]'
          }`}
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? (
            <X className="w-6 h-6 md:w-7 md:h-7 text-white" />
          ) : (
            <Plus className="w-6 h-6 md:w-7 md:h-7 text-white" />
          )}
        </motion.div>
      </motion.button>
    </div>
  );
}
