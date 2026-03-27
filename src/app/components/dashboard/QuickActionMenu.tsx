import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Briefcase,
  Package,
  MessageSquare,
  Bell,
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
      label: 'Create Project',
      icon: Briefcase,
      path: '/dashboard/projects/explore',
      color: 'bg-[#F24C20]'
    },
    /* {
      label: 'Buy Gig',
      icon: Package,
      path: '/dashboard/gigs/find',
      color: 'bg-purple-500'
    }, */
    {
      label: 'Messages',
      icon: MessageSquare,
      path: '/dashboard/messages',
      color: 'bg-blue-500',
      badge: 5
    },
    {
      label: 'Notifications',
      icon: Bell,
      path: '/dashboard',
      color: 'bg-green-500',
      badge: 3
    },
    {
      label: 'Wallet',
      icon: Wallet,
      path: '/dashboard/balance',
      color: 'bg-amber-500'
    },
    {
      label: 'Help',
      icon: HelpCircle,
      path: '/help',
      color: 'bg-neutral-600'
    }
  ];

  const freelancerActions = [
    /* {
      label: 'Create Gig',
      icon: Package,
      path: '/dashboard/gigs/create',
      color: 'bg-[#F24C20]'
    }, */
    {
      label: 'Find Projects',
      icon: Briefcase,
      path: '/dashboard/projects/explore',
      color: 'bg-purple-500'
    },
    {
      label: 'Messages',
      icon: MessageSquare,
      path: '/dashboard/messages',
      color: 'bg-blue-500',
      badge: 3
    },
    {
      label: 'Notifications',
      icon: Bell,
      path: '/dashboard',
      color: 'bg-green-500',
      badge: 2
    },
    {
      label: 'Wallet',
      icon: Wallet,
      path: '/dashboard/balance',
      color: 'bg-amber-500'
    },
    {
      label: 'Help',
      icon: HelpCircle,
      path: '/help',
      color: 'bg-neutral-600'
    }
  ];

  const actions = userType === 'client' ? clientActions : freelancerActions;

  return (
    <div className="fixed bottom-6 left-6 z-50">
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
                    className={`flex items-center gap-3 pl-4 pr-6 py-3 rounded-full shadow-xl backdrop-blur-xl border transition-all hover:scale-105 ${
                      isDarkMode
                        ? 'bg-neutral-900/95 border-neutral-800 hover:border-neutral-700'
                        : 'bg-white/95 border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className={`relative p-2 rounded-full ${action.color}`}>
                      <Icon className="w-5 h-5 text-white" />
                      {action.badge && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {action.badge}
                        </span>
                      )}
                    </div>
                    <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
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
        className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all ${
          isOpen
            ? 'bg-red-500 hover:bg-red-600'
            : 'bg-gradient-to-br from-[#F24C20] to-orange-600 hover:from-orange-600 hover:to-[#F24C20]'
        }`}
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? (
            <X className="w-7 h-7 text-white" />
          ) : (
            <Plus className="w-7 h-7 text-white" />
          )}
        </motion.div>
      </motion.button>
    </div>
  );
}
