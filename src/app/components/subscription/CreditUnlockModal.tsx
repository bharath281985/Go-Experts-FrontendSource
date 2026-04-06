import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Lock, CheckCircle, CreditCard, ChevronRight, X, Loader2, Zap, AlertCircle, IndianRupee } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/app/utils/api';
import { toast } from 'sonner';

interface CreditUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  targetType: 'project' | 'freelancer';
  onUnlocked: () => void;
}

export function CreditUnlockModal({ isOpen, onClose, targetId, targetType, onUnlocked }: CreditUnlockModalProps) {
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState(false);
  const [subStatus, setSubStatus] = useState<any>(null);
  const [isAlreadyUnlocked, setIsAlreadyUnlocked] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, targetId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statusRes, unlockRes] = await Promise.all([
        api.get('/subscription/my-status', { skipAuthRedirect: true } as any).catch(err => {
          if (err.response?.status === 401) setIsGuest(true);
          return { data: { success: false } };
        }),
        api.get(`/subscription/is-unlocked/${targetId}`, { skipAuthRedirect: true } as any).catch(() => ({ data: { success: false } }))
      ]);

      if (statusRes.data.success) {
        setSubStatus(statusRes.data.subscription);
      }
      
      if (unlockRes.data.success && unlockRes.data.isUnlocked) {
        setIsAlreadyUnlocked(true);
        onUnlocked(); // Auto-close or just tell the parent it's unlocked
      }
    } catch (err) {
      console.error('Error fetching subscription data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthRedirect = (type: 'signin' | 'signup') => {
    const currentPath = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `/${type}?redirect=${currentPath}`;
  };

  const handleUnlock = async () => {
    try {
      setUnlocking(true);
      const res = await api.post('/subscription/unlock', { targetId, targetType });
      if (res.data.success) {
        toast.success(res.data.message);
        
        // Update local user if returned
        if (res.data.user) {
          localStorage.setItem('user', JSON.stringify(res.data.user));
          window.dispatchEvent(new CustomEvent('userUpdate', { detail: res.data.user }));
        }

        onUnlocked();
        onClose();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to unlock';
      toast.error(msg);
    } finally {
      setUnlocking(false);
    }
  };

  if (isAlreadyUnlocked) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white dark:bg-neutral-900 rounded-[2.5rem] w-full max-w-md overflow-hidden border border-gray-200 dark:border-white/10 shadow-2xl relative"
          >
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#F24C20]/10 rounded-full blur-3xl -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -ml-12 -mb-12" />

            {/* Header */}
            <div className="p-8 text-center border-b border-gray-100 dark:border-white/5 relative">
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"
                title="Close"
              >
                <X className="w-5 h-5 text-neutral-400" />
              </button>
              
              <div className="w-20 h-20 rounded-[2rem] bg-[#F24C20]/10 flex items-center justify-center mx-auto mb-6">
                <Lock className="w-10 h-10 text-[#F24C20]" />
              </div>
              <h3 className="text-2xl font-bold text-[#044071] dark:text-white mb-2">
                {isGuest ? 'Sign in to Unlock' : 'Content Locked'}
              </h3>
              <p className="text-neutral-500 text-sm leading-relaxed px-4">
                {isGuest 
                  ? `Please sign in or create an account to view complete ${targetType} details and protected contact info.`
                  : `You are on the ${subStatus?.plan_name || 'Starter Plan'}. View complete ${targetType} details by using 1 credit.`
                }
              </p>
            </div>

            {/* Credit Info or Auth Buttons */}
            <div className="p-8 space-y-6 relative">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-4">
                  <Loader2 className="w-8 h-8 text-[#F24C20] animate-spin mb-2" />
                  <p className="text-xs text-neutral-400">Comparing your credits...</p>
                </div>
              ) : isGuest ? (
                <div className="space-y-4">
                  <button
                    onClick={() => handleAuthRedirect('signin')}
                    className="w-full py-4 bg-[#044071] hover:bg-[#055a99] text-white rounded-2xl font-bold transition-all shadow-xl shadow-[#044071]/25 transform hover:-translate-y-1 flex items-center justify-center gap-2"
                  >
                    Sign In
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleAuthRedirect('signup')}
                    className="w-full py-4 bg-transparent hover:bg-neutral-100 dark:hover:bg-white/5 text-[#F24C20] rounded-2xl font-bold transition-all border border-[#F24C20]/20 flex items-center justify-center gap-2"
                  >
                    Create Free Account
                  </button>
                  <p className="text-[10px] text-center text-neutral-500 px-8">
                    By signing up, you'll receive free credits to explore talent and projects.
                  </p>
                </div>
              ) : (
                <>
                  {/* Usage Gating Alert */}
                  {(targetType === 'project' ? subStatus?.remaining_project_visits : subStatus?.remaining_portfolio_visits) <= 10 && (
                     <div className="bg-[#F24C20]/10 border border-[#F24C20]/20 rounded-2xl p-4 flex items-center gap-3 mb-4 animate-pulse">
                        <AlertCircle className="w-5 h-5 text-[#F24C20]" />
                        <p className="text-xs font-bold text-[#F24C20]">WARNING: VIEWING LIMITS REACHED (80%). UPGRADE NOW!</p>
                     </div>
                  )}

                  <div className={`flex items-center justify-between p-4 rounded-2xl border mb-2 transition-colors ${
                    (targetType === 'project' ? subStatus?.remaining_project_visits : subStatus?.remaining_portfolio_visits) <= 5 
                    ? 'bg-red-500/5 border-red-500/20' 
                    : 'bg-neutral-100 dark:bg-white/5 border-gray-100 dark:border-white/10'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                         (targetType === 'project' ? subStatus?.remaining_project_visits : subStatus?.remaining_portfolio_visits) <= 5 
                         ? 'bg-red-500/10' : 'bg-blue-500/10'
                      }`}>
                        <Zap className={`w-5 h-5 ${(targetType === 'project' ? subStatus?.remaining_project_visits : subStatus?.remaining_portfolio_visits) <= 5 ? 'text-red-500' : 'text-blue-500'}`} />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider font-bold text-neutral-400">Available Credits</p>
                        <p className={`text-xl font-black ${(targetType === 'project' ? subStatus?.remaining_project_visits : subStatus?.remaining_portfolio_visits) <= 5 ? 'text-red-500' : 'text-[#044071] dark:text-white'}`}>
                          {targetType === 'project' ? subStatus?.remaining_project_visits : subStatus?.remaining_portfolio_visits} Left
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4">
                    <button
                      onClick={handleUnlock}
                      disabled={unlocking || (targetType === 'project' ? subStatus?.remaining_project_visits : subStatus?.remaining_portfolio_visits) <= 0}
                      className="w-full py-4 bg-[#F24C20] hover:bg-[#d9431b] text-white rounded-2xl font-bold transition-all shadow-xl shadow-[#F24C20]/25 transform hover:-translate-y-1 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:transform-none disabled:bg-neutral-500"
                    >
                      {unlocking ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Use 1 Credit
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => window.location.href = '/subscription'}
                      className="w-full py-4 bg-transparent hover:bg-neutral-100 dark:hover:bg-white/5 text-[#044071] dark:text-white rounded-2xl font-bold transition-all border border-gray-200 dark:border-white/10 flex items-center justify-center gap-2"
                    >
                      <CreditCard className="w-5 h-5" />
                      Upgrade Plan
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Expiry Warning */}
            {subStatus && (
              <div className="bg-gray-50/50 dark:bg-white/10 p-4 text-center">
                 <p className="text-[10px] text-neutral-400">
                    Your current plan ends on <span className="font-bold">{new Date(subStatus.end_date).toLocaleDateString()}</span>
                 </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
