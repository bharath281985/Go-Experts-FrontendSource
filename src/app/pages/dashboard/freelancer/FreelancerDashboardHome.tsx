import { motion } from 'motion/react';
import { useTheme } from '@/app/components/ThemeProvider';
import {
  CheckCircle,
  Loader2,
  Share2,
  ExternalLink,
  Copy,
  MapPin,
  ShieldCheck,
  UserRound
} from 'lucide-react';
import { toast } from 'sonner';
import RadialProgress from '@/app/components/dashboard/charts/RadialProgress';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api, { getImgUrl } from '@/app/utils/api';

export default function FreelancerDashboardHome() {
  const { isDarkMode } = useTheme();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/users/dashboard-stats');
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const profile = stats?.profile || {};
  const publicProfileSlug = profile.username || stats?.username || profile._id || stats?._id;
  const publicProfileUrl = publicProfileSlug ? `${window.location.origin}/f/${publicProfileSlug}` : '';
  const completedProjects = stats?.freelancer?.completed_projects || 0;
  const totalOrders = stats?.freelancer?.total_orders || 0;

  const workPipeline = [
    { stage: 'Total Orders', count: totalOrders, color: '#3b82f6' },
    { stage: 'In Progress', count: stats?.freelancer?.pipeline?.in_progress || 0, color: '#10b981' },
    { stage: 'Delivered', count: stats?.freelancer?.pipeline?.delivered || 0, color: '#f59e0b' }
  ];

  const performance = stats?.freelancer?.performance || {};
  const completionRate = performance.completion_rate || 0;
  const onTimeDelivery = performance.on_time_delivery || 0;
  const clientSatisfaction = performance.satisfaction ? Math.round(performance.satisfaction * 20) : 0;
  const completedProjectsTrend = totalOrders > 0 ? Math.round((completedProjects / totalOrders) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 text-[#F24C20] animate-spin" />
      </div>
    );
  }

  const recentOrders = stats?.freelancer?.recent_orders?.map((o: any) => ({
    title: o.gig_title || `Order #${o._id.slice(-6)}`,
    client: o.client_name || 'Go Experts Client',
    amount: o.price,
    status: o.status.charAt(0).toUpperCase() + o.status.slice(1).replace('_', ' '),
    dueDate: new Date(o.createdAt).toLocaleDateString(),
    statusColor: o.status === 'completed' ? 'text-green-500' : 'text-blue-500'
  })) || [];

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col xl:flex-row xl:items-center justify-between gap-4"
      >
        <div>
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
            Dashboard
          </h1>
          <p className={`mt-1 text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
            Track your earnings, orders, and performance
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'}`}>
              <img
                src={getImgUrl(profile.profile_image) || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || 'Go Experts')}&background=F24C20&color=fff`}
                alt={profile.full_name || 'Freelancer'}
                className="w-9 h-9 rounded-full object-cover"
              />
              <div className="min-w-0">
                <div className={`text-sm font-semibold truncate ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                  {profile.full_name || 'Freelancer'}
                </div>
                <div className={`text-xs truncate ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                  {profile.role_title || 'Add your professional title in settings'}
                </div>
              </div>
            </div>
            {profile.location ? (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs ${isDarkMode ? 'bg-neutral-900 border-neutral-800 text-neutral-300' : 'bg-white border-neutral-200 text-neutral-700'}`}>
                <MapPin className="w-4 h-4 text-[#F24C20]" />
                <span>{profile.location}</span>
              </div>
            ) : null}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs ${isDarkMode ? 'bg-neutral-900 border-neutral-800 text-neutral-300' : 'bg-white border-neutral-200 text-neutral-700'}`}>
              {profile.is_verified ? <ShieldCheck className="w-4 h-4 text-green-500" /> : <UserRound className="w-4 h-4 text-[#F24C20]" />}
              <span>{profile.is_verified ? 'KYC Verified' : 'Profile Active'}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div
            className={`w-full sm:flex-1 flex items-center gap-2 px-3 py-2 md:py-1.5 rounded-xl border overflow-hidden ${
              isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'
            }`}
          >
            <div className="flex-1 min-w-0">
              <span className="text-[10px] text-neutral-500 block uppercase font-bold tracking-widest truncate">Landing Page</span>
              <span className="text-sm font-bold truncate block">
                {publicProfileSlug || '...'}
              </span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0 border-l border-neutral-800 pl-2 ml-1">
              <button
                onClick={() => {
                  if (!publicProfileUrl) return;
                  navigator.clipboard.writeText(publicProfileUrl);
                  toast.success('Link copied to clipboard!');
                }}
                className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-neutral-400 hover:text-[#F24C20]"
                title="Copy Link"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <Link
                to={publicProfileSlug ? `/f/${publicProfileSlug}` : '#'}
                target="_blank"
                className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-neutral-400 hover:text-[#F24C20]"
                title="View Page"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
          <button
            onClick={() => {
              if (navigator.share && publicProfileUrl) {
                navigator.share({
                  title: `${profile.full_name || 'My'} Freelancer Profile | Go Experts`,
                  text: profile.role_title || 'Check out my professional portfolio on Go Experts!',
                  url: publicProfileUrl
                }).catch(() => {});
              } else if (publicProfileUrl) {
                navigator.clipboard.writeText(publicProfileUrl);
                toast.success('Profile link copied to clipboard!');
              }
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 bg-[#F24C20] text-white rounded-xl text-sm font-bold hover:scale-105 transition-transform shadow-lg shadow-[#F24C20]/20"
          >
            <Share2 className="w-4 h-4" />
            Share Profile
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_360px] gap-4 items-stretch">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`p-4 rounded-[1.5rem] md:rounded-2xl border backdrop-blur-sm ${isDarkMode
            ? 'bg-neutral-900/50 border-neutral-800'
            : 'bg-white/50 border-neutral-200'
            }`}
        >
          <h2 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
            Work Pipeline
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className={`p-3 rounded-xl border ${isDarkMode
                ? 'bg-neutral-800/50 border-neutral-700'
                : 'bg-neutral-50 border-neutral-200'
                }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                  Completed Projects
                </span>
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                </div>
              </div>
              <div className="flex items-end justify-between gap-3">
                <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                  {completedProjects}
                </div>
                <div className="text-sm font-semibold text-green-500">
                  {completedProjectsTrend}%
                </div>
              </div>
            </motion.div>

            {workPipeline.map((stage, index) => (
              <motion.div
                key={stage.stage}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className={`p-3 rounded-xl border ${isDarkMode
                  ? 'bg-neutral-800/50 border-neutral-700'
                  : 'bg-neutral-50 border-neutral-200'
                  }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                    {stage.stage}
                  </span>
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: stage.color }}
                  />
                </div>
                <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                  {stage.count}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`p-4 rounded-[1.5rem] md:rounded-2xl border backdrop-blur-sm ${isDarkMode
            ? 'bg-neutral-900/50 border-neutral-800'
            : 'bg-white/50 border-neutral-200'
            }`}
        >
          <h2 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
            Performance
          </h2>
          <div className="space-y-4">
            <div className="flex flex-col items-center">
              <RadialProgress value={completionRate} color="#10b981" size={84} />
              <span className={`text-sm mt-2 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                Completion Rate
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                On-time Delivery
              </span>
              <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                {onTimeDelivery}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                Client Satisfaction
              </span>
              <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                {clientSatisfaction}%
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`p-6 rounded-[1.5rem] md:rounded-2xl border backdrop-blur-sm ${isDarkMode
          ? 'bg-neutral-900/50 border-neutral-800'
          : 'bg-white/50 border-neutral-200'
          }`}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
            Recent Orders
          </h2>
        </div>
        <div className="space-y-4">
          {recentOrders.map((order: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className={`p-4 rounded-xl border ${isDarkMode
                ? 'bg-neutral-800/50 border-neutral-700'
                : 'bg-neutral-50 border-neutral-200'
                }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                    {order.title}
                  </div>
                  <div className={`text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                    {order.client}
                  </div>
                </div>
                <div className={`font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                  Rs {order.amount.toLocaleString()}
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className={order.statusColor}>
                  {order.status}
                </span>
                <span className={isDarkMode ? 'text-neutral-500' : 'text-neutral-400'}>
                  Due in {order.dueDate}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
