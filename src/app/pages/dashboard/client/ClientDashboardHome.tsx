import { motion } from 'motion/react';
import { useTheme } from '@/app/components/ThemeProvider';
import {
  TrendingUp,
  TrendingDown,
  IndianRupee,
  Briefcase,
  Package,
  Wallet,
  ArrowRight,
  Plus,
  Users,
  FileText,
  ShoppingBag,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import CountUp from '@/app/components/dashboard/CountUp';
import DonutChart from '@/app/components/dashboard/charts/DonutChart';
import LineChartComponent from '@/app/components/dashboard/charts/LineChartComponent';
import BarChartComponent from '@/app/components/dashboard/charts/BarChartComponent';
import SparklineChart from '@/app/components/dashboard/charts/SparklineChart';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '@/app/utils/api';

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

  // Project Stats (Mapping real data or using defaults)
  const totalSpent = stats?.client?.total_spent || 0;
  // const ongoingOrders = stats?.client?.ongoing_gig_orders || 0;
  const walletBalance = stats?.wallet_balance || 0;

  // Hiring Funnel Data (Using real project counts)
  const hiringFunnel = [
    { stage: 'Posted Projects', count: stats?.client?.total_projects || 0, percentage: 100 },
    { stage: 'Live Projects', count: stats?.client?.live_projects || 0, percentage: 85 },
    { stage: 'Completed', count: stats?.client?.completed_projects || 0, percentage: 30 }
  ];

  // Spending Data Trend (Mock for now, to be implemented in backend later)
  const monthlySpending = [
    { month: 'Jan', amount: 3200 },
    { month: 'Feb', amount: 4100 },
    { month: 'Mar', amount: 3800 },
    { month: 'Apr', amount: 5200 },
    { month: 'May', amount: 4800 },
    { month: 'Jun', amount: 6500 }
  ];

  const categoryBreakdown = [
    { name: 'Web Development', value: 35, color: '#F24C20' },
    { name: 'UI/UX Design', value: 25, color: '#044071' },
    { name: 'Mobile Apps', value: 20, color: '#10b981' },
    { name: 'Marketing', value: 15, color: '#8b5cf6' },
    { name: 'Other', value: 5, color: '#64748b' }
  ];

  const topServices = [
    { service: 'Web Development', amount: 15800 },
    { service: 'UI/UX Design', amount: 11300 },
    { service: 'Mobile Apps', amount: 9000 },
    { service: 'Marketing', amount: 6800 },
    { service: 'Writing', amount: 3500 }
  ];

  // Activity Timeline
  const recentActivity = [
    {
      type: 'payment',
      title: 'Payment sent to Sarah Chen',
      amount: 4500,
      time: '2 hours ago',
      icon: IndianRupee,
      color: 'text-green-500'
    },
    {
      type: 'hire',
      title: 'Hired John Doe for Mobile App',
      time: '5 hours ago',
      icon: Users,
      color: 'text-blue-500'
    },
    /* {
      type: 'gig',
      title: 'Purchased Logo Design Gig',
      amount: 2500,
      time: '1 day ago',
      icon: Package,
      color: 'text-purple-500'
    }, */
    {
      type: 'dispute',
      title: 'Dispute resolved in your favor',
      time: '2 days ago',
      icon: AlertCircle,
      color: 'text-[#F24C20]'
    }
  ];

  // Sparkline data for KPI cards
  const sparklineData = [
    { value: 20 },
    { value: 35 },
    { value: 28 },
    { value: 45 },
    { value: 38 },
    { value: 52 },
    { value: 45 }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 text-[#F24C20] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
          Dashboard
        </h1>
        <p className={`mt-2 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
          Welcome back! Here's an overview of your activity.
        </p>
      </motion.div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Spent on Projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`p-6 rounded-2xl border backdrop-blur-sm ${isDarkMode
            ? 'bg-neutral-900/50 border-neutral-800'
            : 'bg-white/50 border-neutral-200'
            }`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-[#F24C20]/10">
              <Briefcase className="w-6 h-6 text-[#F24C20]" />
            </div>
            <div className="flex items-center gap-1 text-green-500 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>12%</span>
            </div>
          </div>
          <div className={`text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'} mb-1`}>
            Total Spent
          </div>
          <div className={`text-2xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
            <CountUp end={totalSpent} prefix="₹" />
          </div>
          <SparklineChart data={sparklineData} dataKey="value" color="#F24C20" height={30} />
        </motion.div>

        {/* { stats?.client?.ongoing_gig_orders > 0 && (
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           className={`p-6 rounded-2xl border backdrop-blur-sm ${isDarkMode
             ? 'bg-neutral-900/50 border-neutral-800'
             : 'bg-white/50 border-neutral-200'
             }`}
         >
           <div className="flex items-start justify-between mb-4">
             <div className="p-3 rounded-xl bg-blue-500/10">
               <Clock className="w-6 h-6 text-blue-500" />
             </div>
             <div className="flex items-center gap-1 text-green-500 text-sm">
               <TrendingUp className="w-4 h-4" />
               <span>8%</span>
             </div>
           </div>
           <div className={`text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'} mb-1`}>
             Ongoing Orders
           </div>
           <div className={`text-2xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
             <CountUp end={ongoingOrders} />
           </div>
           <SparklineChart
             data={sparklineData.map((d) => ({ value: d.value - 10 }))}
             dataKey="value"
             color="#3b82f6"
             height={30}
           />
         </motion.div>
        )} */}

        {/* Purchased Gigs / Extra Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`p-6 rounded-2xl border backdrop-blur-sm ${isDarkMode
            ? 'bg-neutral-900/50 border-neutral-800'
            : 'bg-white/50 border-neutral-200'
            }`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-purple-500/10">
              <Package className="w-6 h-6 text-purple-500" />
            </div>
            <div className="flex items-center gap-1 text-red-500 text-sm">
              <TrendingDown className="w-4 h-4" />
              <span>3%</span>
            </div>
          </div>
          <div className={`text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'} mb-1`}>
            Reward Points
          </div>
          <div className={`text-2xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
            <CountUp end={stats?.total_points || 0} />
          </div>
          <SparklineChart
            data={sparklineData.map((d) => ({ value: d.value - 5 }))}
            dataKey="value"
            color="#a855f7"
            height={30}
          />
        </motion.div>

        {/* Wallet Balance (Hidden as platform is a bridge)
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`p-6 rounded-2xl border backdrop-blur-sm ${isDarkMode
            ? 'bg-neutral-900/50 border-neutral-800'
            : 'bg-white/50 border-neutral-200'
            }`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-green-500/10">
              <Wallet className="w-6 h-6 text-green-500" />
            </div>
            <button className="text-[#F24C20] text-sm font-medium hover:underline">
              Add Money
            </button>
          </div>
          <div className={`text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'} mb-1`}>
            Wallet Balance
          </div>
          <div className={`text-2xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
            <CountUp end={walletBalance} prefix="₹" />
          </div>
          <Link
            to="/dashboard/balance"
            className="text-sm text-[#F24C20] hover:underline flex items-center gap-1"
          >
            View Details
            <ArrowRight className="w-3 h-3" />
          </Link>
        </motion.div>
        */}
      </div>

      {/* Hiring Funnel Infographic */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className={`p-6 rounded-2xl border backdrop-blur-sm ${isDarkMode
          ? 'bg-neutral-900/50 border-neutral-800'
          : 'bg-white/50 border-neutral-200'
          }`}
      >
        <h2 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
          Hiring Funnel
        </h2>
        <div className="space-y-4">
          {hiringFunnel.map((stage, index) => (
            <motion.div
              key={stage.stage}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                  {stage.stage}
                </span>
                <span className={`text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                  {stage.count}
                </span>
              </div>
              <div className={`h-3 rounded-full overflow-hidden ${isDarkMode ? 'bg-neutral-800' : 'bg-neutral-200'
                }`}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stage.percentage}%` }}
                  transition={{ delay: 0.8 + index * 0.1, duration: 0.8 }}
                  className="h-full bg-gradient-to-r from-[#F24C20] to-orange-600 rounded-full"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Amount Spent Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Spending Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className={`lg:col-span-2 p-6 rounded-2xl border backdrop-blur-sm ${isDarkMode
            ? 'bg-neutral-900/50 border-neutral-800'
            : 'bg-white/50 border-neutral-200'
            }`}
        >
          <h2 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
            Monthly Spending Trend
          </h2>
          <LineChartComponent
            data={monthlySpending}
            dataKey="amount"
            xAxisKey="month"
            color="#F24C20"
            height={250}
            showArea
          />
        </motion.div>

        {/* Category Breakdown Donut */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className={`p-6 rounded-2xl border backdrop-blur-sm ${isDarkMode
            ? 'bg-neutral-900/50 border-neutral-800'
            : 'bg-white/50 border-neutral-200'
            }`}
        >
          <h2 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
            Category Split
          </h2>
          <DonutChart data={categoryBreakdown} centerText="Total" centerValue="₹66.4K" size={200} />
          <div className="mt-4 space-y-2">
            {categoryBreakdown.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className={isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}>
                    {cat.name}
                  </span>
                </div>
                <span className={isDarkMode ? 'text-white' : 'text-neutral-900'}>
                  {cat.value}%
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Top Spend Services Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className={`p-6 rounded-2xl border backdrop-blur-sm ${isDarkMode
          ? 'bg-neutral-900/50 border-neutral-800'
          : 'bg-white/50 border-neutral-200'
          }`}
      >
        <h2 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
          Top Services by Spending
        </h2>
        <BarChartComponent
          data={topServices}
          dataKey="amount"
          xAxisKey="service"
          color="#F24C20"
          height={250}
        />
      </motion.div>

      {/* Recent Activity Timeline & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className={`lg:col-span-2 p-6 rounded-2xl border backdrop-blur-sm ${isDarkMode
            ? 'bg-neutral-900/50 border-neutral-800'
            : 'bg-white/50 border-neutral-200'
            }`}
        >
          <h2 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
            Recent Activity
          </h2>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 + index * 0.1 }}
                  className={`flex items-start gap-4 p-4 rounded-xl ${isDarkMode ? 'bg-neutral-800/50' : 'bg-neutral-50'
                    }`}
                >
                  <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-neutral-700' : 'bg-white'
                    }`}>
                    <Icon className={`w-5 h-5 ${activity.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                      {activity.title}
                    </div>
                    <div className={`text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                      {activity.time}
                    </div>
                  </div>
                  {activity.amount && (
                    <div className={`font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                      ₹{activity.amount.toLocaleString()}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className={`p-6 rounded-2xl border backdrop-blur-sm ${isDarkMode
            ? 'bg-neutral-900/50 border-neutral-800'
            : 'bg-white/50 border-neutral-200'
            }`}
        >
          <h2 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
            Quick Actions
          </h2>
          <div className="space-y-3">
            <Link
              to="/dashboard/projects/create"
              className={`flex items-center gap-3 p-4 rounded-xl border transition-all hover:scale-105 ${isDarkMode
                ? 'bg-[#F24C20]/10 border-[#F24C20]/30 hover:border-[#F24C20]'
                : 'bg-[#F24C20]/10 border-[#F24C20]/30 hover:border-[#F24C20]'
                }`}
            >
              <div className="p-2 rounded-lg bg-[#F24C20]">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <span className={`flex-1 font-medium ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                Create Project
              </span>
              <ArrowRight className="w-5 h-5 text-[#F24C20]" />
            </Link>

            <Link
              to="/dashboard/talent"
              className={`flex items-center gap-3 p-4 rounded-xl border transition-all hover:scale-105 ${isDarkMode
                ? 'bg-neutral-800/50 border-neutral-700 hover:border-neutral-600'
                : 'bg-neutral-50 border-neutral-200 hover:border-neutral-300'
                }`}
            >
              <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-neutral-700' : 'bg-white'}`}>
                <Users className="w-5 h-5 text-[#F24C20]" />
              </div>
              <span className={`flex-1 font-medium ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                Find Talent
              </span>
              <ArrowRight className={`w-5 h-5 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`} />
            </Link>

            {/* <Link
              to="/dashboard/gigs/find"
              className={`flex items-center gap-3 p-4 rounded-xl border transition-all hover:scale-105 ${isDarkMode
                ? 'bg-neutral-800/50 border-neutral-700 hover:border-neutral-600'
                : 'bg-neutral-50 border-neutral-200 hover:border-neutral-300'
                }`}
            >
              <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-neutral-700' : 'bg-white'}`}>
                <ShoppingBag className="w-5 h-5 text-[#F24C20]" />
              </div>
              <span className={`flex-1 font-medium ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                Browse Gigs
              </span>
              <ArrowRight className={`w-5 h-5 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`} />
            </Link> */}

            <Link
              to="/dashboard/invoices"
              className={`flex items-center gap-3 p-4 rounded-xl border transition-all hover:scale-105 ${isDarkMode
                ? 'bg-neutral-800/50 border-neutral-700 hover:border-neutral-600'
                : 'bg-neutral-50 border-neutral-200 hover:border-neutral-300'
                }`}
            >
              <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-neutral-700' : 'bg-white'}`}>
                <FileText className="w-5 h-5 text-[#F24C20]" />
              </div>
              <span className={`flex-1 font-medium ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                View Invoices
              </span>
              <ArrowRight className={`w-5 h-5 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`} />
            </Link>
          </div>
        </motion.div>
      </div>
    </div >
  );
}