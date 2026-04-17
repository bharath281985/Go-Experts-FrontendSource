import { motion } from 'motion/react';
import { useTheme } from '@/app/components/ThemeProvider';
import {
  Crown,
  Check,
  Zap,
  Calendar,
  TrendingDown,
  AlertCircle,
  ArrowRight,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '@/app/utils/api';
import RadialProgress from '@/app/components/dashboard/charts/RadialProgress';

const formatBillingCycle = (cycle?: string) => {
  if (cycle === 'monthly') return 'month';
  if (cycle === 'yearly') return 'year';
  return 'one-time';
};

const DAY_IN_MS = 1000 * 60 * 60 * 24;

const getStartOfDayTime = (value: string | number | Date) => {
  const date = new Date(value);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
};

const getPlanTimeline = (subscription: any, fallbackDurationDays?: number, nowTime = Date.now()) => {
  if (!subscription) {
    return {
      totalDays: Number(fallbackDurationDays || 0),
      daysRemaining: 0,
      daysUsed: 0,
      progressPercent: 0
    };
  }

  const startTime = getStartOfDayTime(subscription.start_date || subscription.createdAt || nowTime);
  const todayTime = getStartOfDayTime(nowTime);
  const endTime = getStartOfDayTime(subscription.end_date || nowTime);
  const derivedTotalDays = endTime > startTime ? Math.round((endTime - startTime) / DAY_IN_MS) : 0;
  const totalDays = Number(fallbackDurationDays || derivedTotalDays || 0);
  const daysUsed = Math.max(Math.floor((todayTime - startTime) / DAY_IN_MS), 0);
  const boundedDaysUsed = totalDays > 0 ? Math.min(daysUsed, totalDays) : daysUsed;
  const daysRemaining = totalDays > 0 ? Math.max(totalDays - boundedDaysUsed, 0) : 0;
  const progressPercent = totalDays > 0 ? Math.min((daysRemaining / totalDays) * 100, 100) : 0;

  return {
    totalDays,
    daysRemaining,
    daysUsed: boundedDaysUsed,
    progressPercent
  };
};

const formatCurrency = (amount: number) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;

const getPlanTargetRoles = (plan: any) => Array.isArray(plan?.target_role) ? plan.target_role : [plan?.target_role].filter(Boolean);

const makeUsageMetric = (label: string, remaining: number, total: number) => {
  const safeRemaining = Math.max(Number(remaining || 0), 0);
  // Prioritize the explicit total provided by the backend record
  const safeTotal = Number(total) > 0 ? Number(total) : safeRemaining;
  const used = Math.max(safeTotal - safeRemaining, 0);

  return {
    label,
    remaining: safeRemaining,
    total: safeTotal.toString() === '0' && safeRemaining > 0 ? safeRemaining : safeTotal,
    used,
    percentage: safeTotal > 0 ? Math.min(Math.round((used / safeTotal) * 100), 100) : 0
  };
};

const buildPlanFeatures = (plan: any, targetRole: string) => {
  const features = new Set<string>();

  if (targetRole === 'freelancer') {
    if (plan.interest_click_limit > 0) features.add(`Apply to ${plan.interest_click_limit} projects`);
    if (plan.project_visit_limit > 0) features.add(`View ${plan.project_visit_limit} detailed project briefs`);
    if (plan.startup_idea_post_limit > 0) features.add(`Submit ${plan.startup_idea_post_limit} startup pitches`);
    if (plan.startup_idea_explore_limit > 0) features.add(`Unlock ${plan.startup_idea_explore_limit} startup concepts`);
    if (plan.chat_limit > 0) features.add(`Chat with ${plan.chat_limit} potential clients`);
  } else if (targetRole === 'client') {
    if (plan.project_post_limit > 0) features.add(`Post up to ${plan.project_post_limit} active projects`);
    if (plan.portfolio_visit_limit > 0) features.add(`Unlock ${plan.portfolio_visit_limit} premium talent profiles`);
    if (plan.chat_limit > 0) features.add(`Directly message ${plan.chat_limit} freelancers`);
  } else if (targetRole === 'startup_creator') {
    if (plan.startup_idea_post_limit > 0) features.add(`Publish ${plan.startup_idea_post_limit} investment pitches`);
    if (plan.startup_idea_explore_limit > 0) features.add(`Deep-dive into ${plan.startup_idea_explore_limit} idea analytics`);
    if (plan.chat_limit > 0) features.add(`Connect with ${plan.chat_limit} verified investors`);
  } else if (targetRole === 'investor') {
    if (plan.startup_idea_explore_limit > 0) features.add(`Unlock ${plan.startup_idea_explore_limit} curated startup ideas`);
    if (plan.database_access_limit > 0) features.add(`Access ${plan.database_access_limit} premium founder lookups`);
    if (plan.chat_limit > 0) features.add(`Initiate chats with ${plan.chat_limit} venture founders`);
  }

  (plan.features || []).forEach((feature: string) => feature?.trim() && features.add(feature.trim()));

  return Array.from(features);
};

export default function SubscriptionCredits() {
  const { isDarkMode } = useTheme();
  const location = useLocation();
  const [stats, setStats] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const queryParams = new URLSearchParams(location.search);
  const roleParam = queryParams.get('role');

  const getTargetRole = () => {
    if (location.pathname.includes('freelancer') || roleParam === 'freelancer') return 'freelancer';
    if (location.pathname.includes('investor') || roleParam === 'investor') return 'investor';
    if (location.pathname.includes('startup') || roleParam === 'startup_creator') return 'startup_creator';
    if (roleParam === 'client') return 'client';

    const storedType = localStorage.getItem('userType');
    if (storedType === 'freelancer') return 'freelancer';
    if (storedType === 'investor') return 'investor';
    if (storedType === 'startup_creator') return 'startup_creator';
    return 'client';
  };

  const targetRole = getTargetRole();
  const isFreelancer = targetRole === 'freelancer';
  const isInvestor = targetRole === 'investor';
  const isStartupCreator = targetRole === 'startup_creator';

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, subscriptionRes, plansRes] = await Promise.all([
        api.get('/users/dashboard-stats'),
        api.get('/subscription/my-status', { skipToast: true } as any).catch(() => null),
        api.get(`/subscription-plans?role=${targetRole}`)
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }

      const activeSub = subscriptionRes?.data?.success ? subscriptionRes.data.subscription : statsRes.data.data?.subscription;
      setSubscription(activeSub || null);

      if (plansRes.data.success) {
        const currentPlanId = activeSub?.plan_id?._id || activeSub?.plan_id;
        const dbPlans = plansRes.data.data.map((p: any) => ({
          ...p,
          name: p.name,
          price: p.price,
          duration: `${p.duration_days} Days`,
          features: buildPlanFeatures(p, targetRole),
          current: String(currentPlanId || activeSub?.plan_name) === String(p._id) || activeSub?.plan_name === p.name,
          recommended: p.price > 0 && !p.featured ? false : Boolean(p.featured),
          id: p._id
        })).sort((a: any, b: any) => {
          if (a.current) return -1;
          if (b.current) return 1;
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return a.price - b.price;
        });
        setPlans(dbPlans);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    const handleFocus = () => {
      fetchData();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [targetRole]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 60000);

    return () => window.clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 text-[#F24C20] animate-spin" />
      </div>
    );
  }

  const sub = subscription || stats?.subscription;
  const planDetails = sub?.plan_id || {};
  const planTimeline = getPlanTimeline(sub, planDetails.duration_days, now);

  const usageMetrics = isFreelancer ? [
    makeUsageMetric('Project Applications', sub?.remaining_interest_clicks, sub?.total_interest_clicks ?? planDetails.interest_click_limit),
    makeUsageMetric('Project Detail Visits', sub?.remaining_project_visits, sub?.total_project_visits ?? planDetails.project_visit_limit),
    makeUsageMetric('Startup Submissions', sub?.remaining_startup_posts, sub?.total_startup_posts ?? planDetails.startup_idea_post_limit),
    makeUsageMetric('Startup Unlocks', sub?.remaining_idea_unlocks, sub?.total_idea_unlocks ?? planDetails.startup_idea_explore_limit),
    makeUsageMetric('Direct Chats', sub?.remaining_chats, sub?.total_chats ?? planDetails.chat_limit)
  ] : isInvestor ? [
    makeUsageMetric('Startup Unlocks', sub?.remaining_idea_unlocks ?? 0, sub?.total_idea_unlocks ?? planDetails.startup_idea_explore_limit),
    makeUsageMetric('Database Access', sub?.remaining_db_access ?? 0, sub?.total_db_access ?? planDetails.database_access_limit),
    makeUsageMetric('Direct Chats', sub?.remaining_chats ?? 0, sub?.total_chats ?? planDetails.chat_limit)
  ] : isStartupCreator ? [
    makeUsageMetric('Startup Pitches', sub?.remaining_startup_posts, sub?.total_startup_posts ?? planDetails.startup_idea_post_limit),
    makeUsageMetric('Idea Unlocks', sub?.remaining_idea_unlocks, sub?.total_idea_unlocks ?? planDetails.startup_idea_explore_limit),
    makeUsageMetric('Direct Chats', sub?.remaining_chats, sub?.total_chats ?? planDetails.chat_limit)
  ] : [
    makeUsageMetric('Project Posts', sub?.remaining_project_posts, sub?.total_project_posts ?? planDetails.project_post_limit),
    makeUsageMetric('Talent Unlocks', sub?.remaining_portfolio_visits, sub?.total_portfolio_visits ?? planDetails.portfolio_visit_limit),
    makeUsageMetric('Direct Chats', sub?.remaining_chats, sub?.total_chats ?? planDetails.chat_limit)
  ];

  const visibleUsageMetrics = usageMetrics.filter(metric => metric.total > 0 || metric.remaining > 0);
  const primaryMetric = visibleUsageMetrics[0] || makeUsageMetric('Credits', 0, 0);
  const planFeatures = buildPlanFeatures(planDetails, targetRole);

  // Credit System Data object for the UI
  const currentPlanData = {
    planName: sub?.plan_name || 'No Active Plan',
    daysRemaining: planTimeline.daysRemaining,
    totalDays: planTimeline.totalDays,
    daysUsed: planTimeline.daysUsed,
    progressPercent: planTimeline.progressPercent,
    creditsUsed: primaryMetric.used,
    creditsLimit: primaryMetric.total
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
    <div className="space-y-4">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
              Subscription & Credits
            </h1>
            <p className={`mt-1 text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
              Manage your subscription plan and credit balance
            </p>
          </div>
          <button 
            onClick={() => fetchData()}
            className={`p-2 rounded-xl border transition-all ${isDarkMode ? 'bg-neutral-900/50 border-neutral-800 text-neutral-400 hover:text-white' : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'}`}
            title="Refresh Credits"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </motion.div>

      {/* Current Plan Status */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.9fr)_minmax(300px,0.9fr)] gap-4">
        {/* Plan Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`p-4 rounded-2xl border backdrop-blur-sm ${isDarkMode
            ? 'bg-neutral-900/50 border-neutral-800'
            : 'bg-white/50 border-neutral-200'
            }`}
        >
          <div className="flex flex-col gap-3.5 mb-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className={`text-lg sm:text-xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                  {currentPlanData.planName}
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-wider ${sub ? (isDarkMode
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                ) : (isDarkMode 
                  ? 'bg-neutral-800 text-neutral-500 border border-neutral-700'
                  : 'bg-neutral-100 text-neutral-500 border border-neutral-200'
                )}`}>
                  {sub ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className={`mt-1.5 text-[11px] sm:text-xs font-medium ${isDarkMode ? 'text-neutral-500' : 'text-neutral-500'}`}>
                {sub?.start_date || sub?.createdAt
                  ? `Authenticated on ${new Date(sub.start_date || sub.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}`
                  : (planDetails.description || `${currentPlanData.totalDays} day plan`)}
              </p>
            </div>
            <div className="flex items-center justify-start gap-4 lg:justify-end lg:ml-4">
              {sub && (
                <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${isDarkMode
                  ? 'bg-neutral-800/80 border-neutral-700 shadow-lg shadow-black/20'
                  : 'bg-neutral-50/50 border-neutral-200'
                }`}>
                  <div className="flex-shrink-0">
                    <RadialProgress
                      value={currentPlanData.progressPercent}
                      color="#F24C20"
                      size={44}
                    />
                  </div>
                  <div className="min-w-0">
                     <p className={`text-[13px] font-black leading-none ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                        {currentPlanData.daysRemaining} Days
                     </p>
                     <p className="text-[10px] font-bold text-[#F24C20] uppercase tracking-widest mt-1">Remaining</p>
                  </div>
                </div>
              )}
              {(currentPlanData.planName === 'No Active Plan' || currentPlanData.planName === 'Free Trial') && (
                <button 
                  onClick={() => document.getElementById('plans-selection')?.scrollIntoView({ behavior: 'smooth' })}
                  className="flex-1 lg:flex-none px-6 py-3.5 bg-[#F24C20] text-white rounded-2xl text-sm font-black shadow-lg shadow-[#F24C20]/20 active:scale-95 transition-all text-center"
                >
                  UPGRADE
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className={`p-4 sm:p-6 rounded-2xl border ${isDarkMode ? 'bg-neutral-800/50 border-neutral-700' : 'bg-neutral-50/50 border-neutral-200 shadow-inner'}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {visibleUsageMetrics.length > 0 ? visibleUsageMetrics.map((metric) => (
                  <div key={metric.label} className="rounded-xl bg-black/5 dark:bg-black/20 p-3">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <span className={`text-xs font-medium ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                        {metric.label}
                      </span>
                      <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                        {metric.used}/{metric.total}
                      </span>
                    </div>
                    <div className={`h-1.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-neutral-700' : 'bg-neutral-200'}`}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${metric.percentage}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="h-full bg-gradient-to-r from-[#F24C20] to-orange-600"
                      />
                    </div>
                    <p className={`text-[11px] mt-1.5 ${isDarkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                      {metric.remaining} remaining
                    </p>
                  </div>
                )) : (
                  <div className={`text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                    No usage limits configured for this plan.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={`mt-3 p-3 rounded-xl flex items-start gap-3 ${isDarkMode
            ? 'bg-orange-500/10 border border-orange-500/30'
            : 'bg-orange-50 border border-orange-200'
            }`}>
            <AlertCircle className={`w-5 h-5 flex-shrink-0 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-orange-300' : 'text-orange-900'}`}>
                You have {primaryMetric.remaining} {primaryMetric.label.toLowerCase()} remaining
              </p>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-orange-400' : 'text-orange-800'}`}>
                {currentPlanData.planName === 'No Active Plan' && 'Upgrade to Premium for unlimited access and bonus points'}
                {currentPlanData.planName !== 'No Active Plan' && 'Manage your benefits below'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Credit System Info - Simplified */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`p-4 rounded-2xl border backdrop-blur-sm ${sub
            ? isDarkMode
              ? 'bg-emerald-500/5 border-emerald-500/40'
              : 'bg-emerald-50/70 border-emerald-300'
            : isDarkMode
              ? 'bg-neutral-900/50 border-neutral-800'
              : 'bg-white/50 border-neutral-200'
            }`}
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <Zap className={`w-5 h-5 ${sub ? 'text-emerald-500' : 'text-[#F24C20]'}`} />
              <div>
                <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                  Current Plan Live
                </h3>
                <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-neutral-500' : 'text-neutral-500'}`}>
                  Real-time subscription status
                </p>
              </div>
            </div>
            {sub && (
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${isDarkMode
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                : 'bg-emerald-100 text-emerald-700 border-emerald-200'
              }`}>
                LIVE
              </span>
            )}
          </div>

          <div className="space-y-3">
            <div className={`p-3.5 rounded-xl border ${sub
              ? isDarkMode
                ? 'bg-emerald-500/5 border-emerald-500/20'
                : 'bg-white border-emerald-200'
              : isDarkMode
                ? 'bg-neutral-800/50 border-neutral-700'
                : 'bg-neutral-100 border-neutral-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                  Active Plan
                </span>
                <TrendingDown className="w-5 h-5 text-emerald-500" />
              </div>
              <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                {currentPlanData.planName}
              </p>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>
                {currentPlanData.daysRemaining} days left live
              </p>
            </div>

            <div className={`p-3.5 rounded-xl border ${isDarkMode ? 'bg-neutral-800/40 border-neutral-700' : 'bg-neutral-50 border-neutral-200'}`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                    Primary Limit
                  </p>
                  <p className={`text-lg font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                    {primaryMetric.remaining} available
                  </p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${isDarkMode ? 'bg-neutral-700 text-neutral-200' : 'bg-neutral-200 text-neutral-700'}`}>
                  {primaryMetric.label}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                Plan Features
              </h4>
              <ul className={`space-y-1.5 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                {(planFeatures.length > 0 ? planFeatures.slice(0, 4) : ['No features configured']).map((feature: string) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
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
          className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}
        >
          Choose Your Plan
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className={`p-5 rounded-2xl border backdrop-blur-sm relative overflow-hidden ${plan.current
                ? isDarkMode
                  ? 'bg-emerald-500/5 border-emerald-500/45 shadow-[0_0_0_1px_rgba(16,185,129,0.15)]'
                  : 'bg-emerald-50/70 border-emerald-300'
                : plan.recommended
                ? isDarkMode
                  ? 'bg-gradient-to-br from-[#F24C20]/10 to-orange-900/10 border-[#F24C20]'
                  : 'bg-gradient-to-br from-[#F24C20]/10 to-orange-100 border-[#F24C20]'
                : isDarkMode
                  ? 'bg-neutral-900/50 border-neutral-800'
                  : 'bg-white/50 border-neutral-200'
                }`}
            >
              {plan.recommended && !plan.current && (
                <div className="absolute top-3 right-3">
                  <span className="px-3 py-1 bg-[#F24C20] text-white text-xs font-bold rounded-full">
                    RECOMMENDED
                  </span>
                </div>
              )}

              {plan.current && (
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1 text-xs font-bold rounded-full border ${isDarkMode
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                    : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                  }`}>
                    CURRENT
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3 mb-3 pr-24">
                <div className={`p-2.5 rounded-xl ${plan.current ? 'bg-emerald-500/10' : 'bg-[#F24C20]/10'}`}>
                  <Crown className={`w-5 h-5 ${plan.current ? 'text-emerald-500' : 'text-[#F24C20]'}`} />
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                    {plan.current && sub
                      ? `${currentPlanData.daysRemaining} days left live - ${getPlanTargetRoles(plan).join(', ') || targetRole}`
                      : `${plan.duration} - ${getPlanTargetRoles(plan).join(', ') || targetRole}`}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline gap-2">
                  <span className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                    {formatCurrency(plan.price)}
                  </span>
                  {plan.price > 0 && (
                    <span className={`text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                      per {formatBillingCycle(plan.billing_cycle)}
                    </span>
                  )}
                </div>
                {plan.description && (
                  <p className={`text-sm mt-2 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                    {plan.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mb-4">
                {plan.features.slice(0, 8).map((feature: string) => (
                  <div key={feature} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className={`text-sm ${isDarkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                      {feature}
                    </span>
                  </div>
                ))}
                {plan.features.length === 0 && (
                  <p className={`text-sm ${isDarkMode ? 'text-neutral-500' : 'text-neutral-500'}`}>
                    No features configured.
                  </p>
                )}
              </div>

              {plan.current ? (
                <button
                  disabled
                  className={`w-full py-3 rounded-xl font-medium ${isDarkMode
                    ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                    : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                  }`}
                >
                  Current Plan Live
                </button>
              ) : (
                <button 
                  disabled={buying !== null}
                  onClick={() => handleChoosePlan(plan.id)}
                  className="w-full py-4 bg-[#F24C20] text-white rounded-2xl font-black shadow-xl shadow-[#F24C20]/20 hover:bg-orange-600 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                  {buying === plan.id ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      Upgrade Now
                      <ArrowRight className="w-4 h-4" />
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
