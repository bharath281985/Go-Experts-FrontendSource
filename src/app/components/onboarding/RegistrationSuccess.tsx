import { motion } from 'motion/react';
import { CheckCircle, Sparkles, ArrowRight, Target, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RegistrationSuccessProps {
  accountType: 'client' | 'freelancer' | 'both';
  userName: string;
}

export default function RegistrationSuccess({ accountType, userName }: RegistrationSuccessProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl">
      <div className="w-full max-w-2xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 mb-8 relative"
          >
            <CheckCircle className="w-12 h-12 text-white" />
            <div className="absolute inset-0 rounded-full bg-green-500 blur-2xl opacity-50" />
          </motion.div>

          {/* Welcome Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-5xl font-bold text-white mb-4">
              Welcome to Go Experts! 🎉
            </h1>
            <p className="text-2xl text-neutral-400 mb-3">
              Hey {userName}, you're all set!
            </p>
            <p className="text-lg text-neutral-500 mb-8">
              Your account has been created successfully
            </p>
          </motion.div>

          {/* Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-900/50 border border-neutral-800 mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-5 h-5 text-[#F24C20]" />
              <h3 className="font-bold text-white">Quick Summary</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-left">
                <div className="text-neutral-500 mb-1">Account Type</div>
                <div className="text-white font-medium capitalize">{accountType}</div>
              </div>
              <div className="text-left">
                <div className="text-neutral-500 mb-1">Status</div>
                <div className="text-green-400 font-medium">Active</div>
              </div>
            </div>
          </motion.div>

          {/* Next Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <h3 className="text-xl font-bold text-white mb-4">What would you like to do next?</h3>
            <div className="grid grid-cols-2 gap-4">
              {(accountType === 'client' || accountType === 'both') && (
                <Link
                  to="/projects"
                  className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 hover:border-[#F24C20]/50 transition-all text-left group"
                >
                  <Target className="w-8 h-8 text-[#F24C20] mb-3" />
                  <div className="font-semibold text-white mb-1">Browse Projects</div>
                  <div className="text-sm text-neutral-400">Find the perfect project</div>
                </Link>
              )}
              
              {(accountType === 'freelancer' || accountType === 'both') && (
                <Link
                  to="/talent"
                  className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 hover:border-[#F24C20]/50 transition-all text-left group"
                >
                  <Briefcase className="w-8 h-8 text-[#F24C20] mb-3" />
                  <div className="font-semibold text-white mb-1">Explore Talent</div>
                  <div className="text-sm text-neutral-400">Build your profile</div>
                </Link>
              )}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex gap-4 justify-center"
          >
            {accountType === 'freelancer' || accountType === 'both' ? (
              <Link
                to="/onboarding/freelancer"
                className="flex items-center gap-2 px-8 py-3 rounded-lg bg-[#044071] hover:bg-[#055a99] text-white font-semibold transition-all shadow-lg shadow-[#044071]/30"
              >
                Complete Profile
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                to="/onboarding/client"
                className="flex items-center gap-2 px-8 py-3 rounded-lg bg-[#044071] hover:bg-[#055a99] text-white font-semibold transition-all shadow-lg shadow-[#044071]/30"
              >
                Post Your First Project
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
            
            <Link
              to="/dashboard"
              className="px-8 py-3 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-[#F24C20] text-white font-medium transition-all"
            >
              Go to Dashboard
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}