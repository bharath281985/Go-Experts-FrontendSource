import { motion } from 'motion/react';
import { useTheme } from '@/app/components/ThemeProvider';
import {
  TrendingUp,
  IndianRupee,
  Briefcase,
  Plus,
  Users,
  Clock,
  CheckCircle,
  Loader2,
  ArrowRight
} from 'lucide-react';
import CountUp from '@/app/components/dashboard/CountUp';
import DonutChart from '@/app/components/dashboard/charts/DonutChart';
import LineChartComponent from '@/app/components/dashboard/charts/LineChartComponent';
import SparklineChart from '@/app/components/dashboard/charts/SparklineChart';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api, { getImgUrl } from '@/app/utils/api';

export default function ClientDashboardHome() {
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
  const totalSpent = stats?.client?.total_spent || 0;
  const activeProjects = stats?.client?.live_projects || 0;
  const totalProjects = stats?.client?.total_projects || 0;
  const completedProjects = stats?.client?.completed_projects || 0;

  // Subscription Details
  const sub = stats?.subscription || {};
  const projectCredits = sub?.remaining_project_posts || 0;
  const unlockCredits = sub?.remaining_portfolio_visits || 0;

  // Hiring Funnel Data
  const hiringFunnel = [
    { stage: 'Projects Posted', count: totalProjects, percentage: 100, color: '#F24C20' },
    { stage: 'Live & Hiring', count: activeProjects, percentage: totalProjects > 0 ? (activeProjects / totalProjects) * 100 : 0, color: '#3b82f6' },
    { stage: 'Completed', count: completedProjects, percentage: totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0, color: '#10b981' }
  ];

  // Map icon strings to components
  const iconMap: any = {
    Users: Users,
    IndianRupee: IndianRupee,
    CheckCircle: CheckCircle,
    Briefcase: Briefcase
  };

  // Spending Trend Data
  const chartData = stats?.client?.spending_trend || [
    { month: 'Jan', amount: 0 },
    { month: 'Feb', amount: 0 },
    { month: 'Mar', amount: 0 },
    { month: 'Apr', amount: 0 },
    { month: 'May', amount: 0 },
    { month: 'Jun', amount: 0 }
  ];

  // Talent Expertise Mix (Category Distribution)
  const categoryBreakdown = stats?.client?.category_breakdown && stats.client.category_breakdown.length > 0 
    ? stats.client.category_breakdown 
    : [
        { name: 'No Projects', value: 100, color: '#64748b' }
      ];

  // Activity Timeline
  const rawActivity = stats?.client?.recent_activity || [];
  const recentActivity = rawActivity.map((act: any) => ({
    ...act,
    icon: iconMap[act.icon] || Users
  }));

  const sparklineData = Array.from({ length: 7 }, () => ({ value: Math.floor(Math.random() * 50) + 20 }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 text-[#F24C20] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={getImgUrl(profile.profile_image) || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || 'Client')}&background=044071&color=fff`}
              alt={profile.full_name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-[#F24C20]/20"
            />
            <div className="absolute -bottom-1 -right-1 p-1 bg-green-500 rounded-lg border-2 border-neutral-900">
              <CheckCircle className="w-2.5 h-2.5 text-white" />
            </div>
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
              Hello, {(() => {
                const name = profile.full_name || 'Client';
                if (name.includes('@')) {
                  const part = name.split('@')[0];
                  return part.charAt(0).toUpperCase() + part.slice(1);
                }
                return name.split(' ')[0];
              })()}!
            </h1>
            <p className={`text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
              {profile.roles?.includes('startup_creator') ? 'Startup Visionary' : 'Project Strategist'} • {profile.location || 'Global Presence'}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
          <Link
            to="/dashboard/projects/create"
            className="w-full sm:w-auto px-5 py-3 bg-[#F24C20] text-white rounded-xl text-sm font-bold hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-lg shadow-[#F24C20]/20"
          >
            <Plus className="w-4 h-4" />
            Post New Project
          </Link>
          <Link
            to="/dashboard/subscription"
            className={`w-full sm:w-auto px-5 py-3 rounded-xl text-sm font-bold border transition-all flex items-center justify-center ${
              isDarkMode ? 'bg-neutral-900 border-neutral-800 text-white hover:bg-neutral-800' : 'bg-white border-neutral-200 text-neutral-900 hover:bg-neutral-50'
            }`}
          >
            View Plans
          </Link>
        </div>
      </motion.div>

      {/* Subscription & KPI Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Subscription Status Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-5 rounded-[1.5rem] md:rounded-[2rem] border overflow-hidden relative ${
            isDarkMode ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white border-neutral-200'
          }`}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#F24C20] opacity-[0.03] blur-3xl" />
          <div className="flex items-center justify-between mb-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#F24C20] px-3 py-1 bg-[#F24C20]/10 rounded-full">
              {sub.plan_name || 'Trial Active'}
            </span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-500">
              <Clock className="w-3.5 h-3.5" />
              {stats?.subscription ? `${Math.ceil((new Date(sub.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} Days Left` : 'Refill Needed'}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-neutral-500 uppercase tracking-wider">Project Posts</span>
                <span className={isDarkMode ? 'text-white' : 'text-neutral-900'}>{projectCredits} / 36</span>
              </div>
              <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(projectCredits / 36) * 100}%` }}
                  className="h-full bg-gradient-to-r from-[#F24C20] to-orange-600"
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-neutral-500 uppercase tracking-wider">Expert Unlocks</span>
                <span className={isDarkMode ? 'text-white' : 'text-neutral-900'}>{unlockCredits} / 36</span>
              </div>
              <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(unlockCredits / 36) * 100}%` }}
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Financial KPI */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`p-5 rounded-[1.5rem] md:rounded-[2rem] border ${
            isDarkMode ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white border-neutral-200'
          }`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-2xl bg-[#F24C20]/10">
              <IndianRupee className="w-6 h-6 text-[#F24C20]" />
            </div>
            <div className="flex items-center gap-1 text-green-500 text-xs font-bold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18%</span>
            </div>
          </div>
          <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1">Total Project Volume</div>
          <div className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-neutral-900'} mb-2`}>
            <CountUp end={totalSpent} prefix="₹" />
          </div>
          <SparklineChart data={sparklineData} dataKey="value" color="#F24C20" height={30} />
        </motion.div>

        {/* Project Velocity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`p-5 rounded-[1.5rem] md:rounded-[2rem] border ${
            isDarkMode ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white border-neutral-200'
          }`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-2xl bg-blue-500/10">
              <Briefcase className="w-6 h-6 text-blue-500" />
            </div>
            <div className="flex items-center gap-1 text-blue-400 text-xs font-bold uppercase">
              Current Cycle
            </div>
          </div>
          <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1">Active Projects</div>
          <div className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-neutral-900'} mb-2`}>
            <CountUp end={activeProjects} />
          </div>
          <div className="flex gap-1.5 overflow-hidden rounded-full h-1 mt-6">
            <div className="flex-1 bg-blue-500/30" />
            <div className="flex-1 bg-blue-500" />
            <div className="flex-1 bg-blue-500/30" />
            <div className="flex-1 bg-blue-500" />
          </div>
        </motion.div>
      </div>

      {/* Hiring Funnel & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`p-6 rounded-[1.5rem] md:rounded-[2rem] border ${
            isDarkMode ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white border-neutral-200'
          }`}
        >
          <h2 className={`text-lg font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>Hiring Funnel</h2>
          <div className="space-y-6">
            {hiringFunnel.map((stage, idx) => (
              <div key={stage.stage}>
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <span className="text-xs font-black uppercase tracking-widest text-neutral-500">{stage.stage}</span>
                    <div className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>{stage.count}</div>
                  </div>
                  <span className="text-[10px] font-bold text-neutral-500">{(stage.percentage).toFixed(0)}% Conv.</span>
                </div>
                <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stage.percentage}%` }}
                    style={{ backgroundColor: stage.color }}
                    className="h-full rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`p-6 rounded-[1.5rem] md:rounded-[2rem] border ${
            isDarkMode ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white border-neutral-200'
          }`}
        >
          <h2 className={`text-lg font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>Talent Expertise Mix</h2>
          <DonutChart data={categoryBreakdown} centerText="Total" centerValue={activeProjects.toString()} size={window.innerWidth < 768 ? 140 : 180} />
          <div className="mt-6 grid grid-cols-2 gap-3">
            {categoryBreakdown.map((cat) => (
              <div key={cat.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="text-[11px] font-bold text-neutral-500 uppercase truncate">{cat.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Spending Trend & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Spending Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`lg:col-span-2 p-6 rounded-[1.5rem] md:rounded-[2rem] border ${
            isDarkMode ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white border-neutral-200'
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>Spending Trend</h2>
            <div className="flex bg-neutral-800 p-0.5 rounded-lg">
               <button className="px-3 py-1 text-[10px] font-bold bg-neutral-700 text-white rounded-md">6 Months</button>
               <button className="px-3 py-1 text-[10px] font-bold text-neutral-500">12 Months</button>
            </div>
          </div>
          <LineChartComponent
            data={chartData}
            dataKey="amount"
            xAxisKey="month"
            color="#F24C20"
            height={220}
            showArea
          />
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`p-6 rounded-[1.5rem] md:rounded-[2rem] border ${
            isDarkMode ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white border-neutral-200'
          }`}
        >
          <h2 className={`text-lg font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>Live Updates</h2>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div key={index} className="flex items-start gap-4">
                  <div className={`mt-1 p-2 rounded-xl ${isDarkMode ? 'bg-neutral-800' : 'bg-neutral-50'}`}>
                    <Icon className={`w-4 h-4 ${activity.color}`} />
                  </div>
                  <div>
                    <div className={`text-xs font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                      {activity.title}
                    </div>
                    <div className="text-[10px] text-neutral-500 font-medium mt-1 uppercase tracking-wider">
                      {activity.time}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <Link
            to="/dashboard/messages"
            className={`mt-8 w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest border flex items-center justify-center gap-2 transition-all ${
              isDarkMode ? 'border-neutral-800 hover:bg-white hover:text-black' : 'border-neutral-200 hover:bg-black hover:text-white'
            }`}
          >
            Open Inbox
            <ArrowRight className="w-3 h-3" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}