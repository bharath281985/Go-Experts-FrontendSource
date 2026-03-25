import { motion } from 'motion/react';
import { useTheme } from '@/app/components/ThemeProvider';
import {
  Crown,
  Check,
  X,
  Zap,
  Calendar,
  TrendingDown,
  AlertCircle,
  CreditCard,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '@/app/utils/api';
import CountUp from '@/app/components/dashboard/CountUp';
import RadialProgress from '@/app/components/dashboard/charts/RadialProgress';

export default function SubscriptionCredits() {
  const { isDarkMode } = useTheme();
  const location = useLocation();
  const [stats, setStats] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<string | null>(null);

  // Determine user type from URL or localStorage
  const isFreelancer = location.pathname.includes('freelancer');
  const isInvestor = location.pathname.includes('investor');
  const isStartupCreator = location.pathname.includes('startup');

  const getTargetRole = () => {
    if (isFreelancer) return 'freelancer';
    if (isInvestor) return 'investor';
    if (isStartupCreator) return 'startup_creator';
    return 'client';
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, plansRes] = await Promise.all([
          api.get('/users/dashboard-stats'),
          api.get(`/subscription-plans?role=${getTargetRole()}`)
        ]);
        if (statsRes.data.success) {
          setStats(statsRes.data.data);
        }
        if (plansRes.data.success) {
          // Map DB plans to frontend structure
          const dbPlans = plansRes.data.data.map((p: any) => ({
            name: p.name,
            price: p.price,
            duration: `${p.duration_days} Days`,
            features: isFreelancer ? [
              p.interest_click_limit > 1000 ? 'Unlimited project applications' : `Apply to ${p.interest_click_limit} projects`,
              `${p.points_granted.toLocaleString()} wallet credits`,
               p.price > 0 ? 'Premium profile badge' : 'Basic profile visibility',
               p.price > 0 ? 'Priority in search results' : 'Standard support'
            ] : isInvestor ? [
              p.interest_click_limit > 1000 ? 'Infinite Deal Access' : `Express Interest in ${p.interest_click_limit} Startups`,
              `${p.points_granted.toLocaleString()} data-access credits`,
               p.price > 0 ? 'Verified Investor Badge' : 'Standard Access',
               p.price > 0 ? 'Direct Founder Contact' : 'Limited Analytics'
            ] : isStartupCreator ? [
              p.project_post_limit > 1000 ? 'Unlimited Venture Launches' : `Post up to ${p.project_post_limit} Startup Ideas`,
              `${p.points_granted.toLocaleString()} visibility points`,
               p.price > 0 ? 'Featured Pitch Placement' : 'Basic Listing',
               p.price > 0 ? 'Advanced Investor Tracking' : 'Standard Metrics'
            ] : [
              p.project_post_limit > 1000 ? 'Unlimited hiring' : `Hire up to ${p.project_post_limit} freelancers`,
              `${p.points_granted.toLocaleString()} wallet credits`,
              p.price > 0 ? 'Priority project listing' : 'Basic project posting',
              p.price > 0 ? 'Access to all talent profiles' : 'Standard support'
            ],
            limitations: p.price === 0 ? ['No roll-over credits', 'No analytics dashboard'] : [],
            current: statsRes.data.data?.subscription?.plan_name === p.name,
            recommended: p.price > 0,
            id: p._id
          }));
          setPlans(dbPlans);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isFreelancer, isInvestor, isStartupCreator]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 text-[#F24C20] animate-spin" />
      </div>
    );
  }

  const sub = stats?.subscription;
  const daysRemaining = sub ? Math.ceil((new Date(sub.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const planTotalDays = sub ? Math.ceil((new Date(sub.end_date).getTime() - new Date(sub.start_date || sub.createdAt).getTime()) / (1000 * 60 * 60 * 24)) || 30 : 30;

  // Primary usage metric based on role
  const creditsLimit = (isFreelancer || isInvestor)
    ? (sub?.total_interest_clicks || 0) 
    : (sub?.total_project_posts || 0);

  const creditsRemaining = (isFreelancer || isInvestor)
    ? (sub?.remaining_interest_clicks || 0) 
    : (sub?.remaining_project_posts || 0);

  // Credit System Data object for the UI
  const currentPlanData = {
    planName: sub?.plan_name || 'No Active Plan',
    daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
    totalDays: planTotalDays,
    creditsUsed: Math.max(0, creditsLimit - creditsRemaining),
    creditsLimit: creditsLimit,
    dailyExpiry: sub?.plan_name === 'Free Trial' ? 1 : 0, // Mocked logic: only free trial has expiry
    walletCredits: stats?.total_points || 0
  };

  // Plans are now fetched dynamically and stored in `plans` state
  const handleChoosePlan = async (planId: string) => {
    try {
      setBuying(planId);
      const res = await api.post('/payment/initiate', { planId });
      
      if (res.data.success && res.data.checkout_url) {
        window.open(res.data.checkout_url, '_blank');
      } else {
        toast.error('Failed to get payment link');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to initiate payment');
    } finally {
      setBuying(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
          Subscription & Credits
        </h1>
        <p className={`mt-2 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
          Manage your subscription plan and credit balance
        </p>
      </motion.div>

      {/* Current Plan Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plan Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`lg:col-span-2 p-6 rounded-2xl border backdrop-blur-sm ${isDarkMode
            ? 'bg-neutral-900/50 border-neutral-800'
            : 'bg-white/50 border-neutral-200'
            }`}
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                  {currentPlanData.planName}
                </h2>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${sub ? (isDarkMode
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                  : 'bg-blue-50 text-blue-600 border border-blue-200'
                ) : (isDarkMode 
                  ? 'bg-neutral-800 text-neutral-500 border border-neutral-700'
                  : 'bg-neutral-100 text-neutral-500 border border-neutral-200'
                )}`}>
                  {sub ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                {currentPlanData.daysRemaining} days remaining
              </p>
            </div>
            {(currentPlanData.planName === 'No Active Plan' || currentPlanData.planName === 'Free Trial') && (
              <button 
                onClick={() => document.getElementById('plans-selection')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-6 py-3 bg-[#044071] text-white rounded-xl font-medium hover:bg-[#044071]/90 transition-colors"
              >
                Upgrade to Premium
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-neutral-800/50 border-neutral-700' : 'bg-neutral-50 border-neutral-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <span className={`text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                  {isFreelancer ? 'Project Applications' : isInvestor ? 'Interests Expressed' : isStartupCreator ? 'Pitches Launched' : 'Hires Used'}
                </span>
                <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                  {currentPlanData.creditsUsed}/{currentPlanData.creditsLimit}
                </span>
              </div>
              <div className={`h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-neutral-700' : 'bg-neutral-200'}`}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentPlanData.creditsUsed / currentPlanData.creditsLimit) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="h-full bg-gradient-to-r from-[#F24C20] to-orange-600"
                />
              </div>
              <p className={`text-xs mt-2 ${isDarkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                {isFreelancer ? `${currentPlanData.creditsLimit - currentPlanData.creditsUsed} applications remaining`
                  : isInvestor ? `${currentPlanData.creditsLimit - currentPlanData.creditsUsed} startup interests remaining`
                  : isStartupCreator ? `${currentPlanData.creditsLimit - currentPlanData.creditsUsed} ideas remaining to launch`
                  : `${currentPlanData.creditsLimit - currentPlanData.creditsUsed} hires remaining`
                }
              </p>
            </div>

            <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-neutral-800/50 border-neutral-700' : 'bg-neutral-50 border-neutral-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <span className={`text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                  Plan Duration
                </span>
                <Calendar className={`w-6 h-6 ${isDarkMode ? 'text-[#F24C20]' : 'text-[#F24C20]'}`} />
              </div>
              <div className="flex items-center justify-center mb-2">
                <RadialProgress
                  value={(currentPlanData.daysRemaining / currentPlanData.totalDays) * 100}
                  color="#F24C20"
                  size={80}
                />
              </div>
              <p className={`text-center text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                {currentPlanData.daysRemaining} days left
              </p>
            </div>
          </div>

          <div className={`mt-6 p-4 rounded-xl flex items-start gap-3 ${isDarkMode
            ? 'bg-orange-500/10 border border-orange-500/30'
            : 'bg-orange-50 border border-orange-200'
            }`}>
            <AlertCircle className={`w-5 h-5 flex-shrink-0 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-orange-300' : 'text-orange-900'}`}>
                {isFreelancer ? `You have ${creditsRemaining} project applications remaining`
                  : isInvestor ? `You have ${creditsRemaining} startup interests remaining`
                  : isStartupCreator ? `You have ${creditsRemaining} pitches remaining`
                  : `You have ${creditsRemaining} hires remaining`
                }
              </p>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-orange-400' : 'text-orange-800'}`}>
                {currentPlanData.planName === 'No Active Plan' && 'Upgrade to Premium for unlimited access and bonus points'}
                {currentPlanData.planName !== 'No Active Plan' && 'Manage your benefits below'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Credit System Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`p-6 rounded-2xl border backdrop-blur-sm ${isDarkMode
            ? 'bg-neutral-900/50 border-neutral-800'
            : 'bg-white/50 border-neutral-200'
            }`}
        >
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-6 h-6 text-[#F24C20]" />
            <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
              Credit System
            </h3>
          </div>

          <div className="space-y-4">
            <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-neutral-800/50' : 'bg-neutral-100'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                  Daily Credit Expiry
                </span>
                <TrendingDown className="w-5 h-5 text-red-500" />
              </div>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                {currentPlanData.dailyExpiry} credit/day
              </p>
            </div>

            <div className="space-y-2 text-sm">
              <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                How Credits Work:
              </h4>
              <ul className={`space-y-1 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  {isFreelancer
                    ? 'View client profiles: 365 credits'
                    : 'View talent profiles: 365 credits'
                  }
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  Credits expire daily (1/day)
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  Premium: No daily expiry
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  Use credits for unlocking features
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Plan Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 
          id="plans-selection"
          className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}
        >
          Choose Your Plan
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className={`p-8 rounded-2xl border backdrop-blur-sm relative overflow-hidden ${plan.recommended
                ? isDarkMode
                  ? 'bg-gradient-to-br from-[#F24C20]/10 to-orange-900/10 border-[#F24C20]'
                  : 'bg-gradient-to-br from-[#F24C20]/10 to-orange-100 border-[#F24C20]'
                : isDarkMode
                  ? 'bg-neutral-900/50 border-neutral-800'
                  : 'bg-white/50 border-neutral-200'
                }`}
            >
              {plan.recommended && (
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-[#F24C20] text-white text-xs font-bold rounded-full">
                    RECOMMENDED
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-xl ${plan.current ? 'bg-blue-500/10' : 'bg-[#F24C20]/10'}`}>
                  <Crown className={`w-6 h-6 ${plan.current ? 'text-blue-500' : 'text-[#F24C20]'}`} />
                </div>
                <div>
                  <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                    {plan.duration}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className={`text-5xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                    ₹{plan.price.toLocaleString()}
                  </span>
                  {plan.price > 0 && (
                    <span className={`text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                      per year
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {plan.features.map((feature: string) => (
                  <div key={feature} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className={`text-sm ${isDarkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                      {feature}
                    </span>
                  </div>
                ))}
                {plan.limitations.map((limitation: string) => (
                  <div key={limitation} className="flex items-start gap-3">
                    <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span className={`text-sm ${isDarkMode ? 'text-neutral-500' : 'text-neutral-500'}`}>
                      {limitation}
                    </span>
                  </div>
                ))}
              </div>

              {plan.current ? (
                <button
                  disabled
                  className={`w-full py-3 rounded-xl font-medium ${isDarkMode
                    ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                    : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                    }`}
                >
                  Current Plan
                </button>
              ) : (
                <button 
                  disabled={buying !== null}
                  onClick={() => handleChoosePlan(plan.id)}
                  className="w-full py-3 bg-[#044071] text-white rounded-xl font-medium hover:bg-[#044071]/90 transition-colors flex items-center justify-center gap-2"
                >
                  {buying === plan.id ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      Upgrade Now
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
