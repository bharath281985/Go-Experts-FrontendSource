import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '@/app/components/ThemeProvider';
import {
  Package,
  MessageSquare,
  Clock,
  ExternalLink,
  ChevronRight,
  Filter,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  DollarSign
} from 'lucide-react';
import api from '@/app/utils/api';
import CountUp from '@/app/components/dashboard/CountUp';
import { format } from 'date-fns';

interface GigOrder {
  _id: string;
  orderID: string;
  gig_id: {
    _id: string;
    title: string;
    thumbnail: string;
  };
  buyer_id: {
    _id: string;
    full_name: string;
    profile_image: string;
  };
  seller_id: {
    _id: string;
    full_name: string;
    profile_image: string;
  };
  price: number;
  status: 'pending' | 'in_progress' | 'delivered' | 'completed' | 'cancelled' | 'refunded';
  createdAt: string;
}

export default function GigOrders() {
  const { isDarkMode } = useTheme();
  const [orders, setOrders] = useState<GigOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Get current user from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUserId = user?._id;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/gig-orders/my');
        if (res.data.success) {
          setOrders(res.data.data);
        }
      } catch (error) {
        console.error('Error fetching gig orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { label: 'Pending', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' },
      in_progress: { label: 'In Progress', color: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
      delivered: { label: 'Delivered', color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/30' },
      completed: { label: 'Completed', color: 'bg-green-500/10 text-green-500 border-green-500/30' },
      cancelled: { label: 'Cancelled', color: 'bg-red-500/10 text-red-500 border-red-500/30' },
      refunded: { label: 'Refunded', color: 'bg-neutral-500/10 text-neutral-500 border-neutral-500/30' },
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesFilter = filter === 'all' || order.status === filter;
      const matchesSearch = order.orderID.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.gig_id.title.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [orders, filter, searchTerm]);

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
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
            Gig Orders
          </h1>
          <p className={`mt-2 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
            Track and manage your gig orders and milestones
          </p>
        </div>
      </motion.div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Orders', value: orders.length, icon: Package, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Active', value: orders.filter(o => ['pending', 'in_progress'].includes(o.status)).length, icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
          { label: 'Completed', value: orders.filter(o => o.status === 'completed').length, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' }
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white/50 border-neutral-200'}`}
          >
            <div className={`p-3 w-fit rounded-xl ${stat.bg} mb-4`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div className={`text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>{stat.label}</div>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>{stat.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
          {['all', 'pending', 'in_progress', 'delivered', 'completed', 'cancelled'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${filter === f
                ? 'bg-[#F24C20] text-white shadow-lg'
                : isDarkMode
                  ? 'bg-neutral-800 text-neutral-400 hover:text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1).replace('_', ' ')}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search Order ID or Title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-xl border outline-none ${isDarkMode
              ? 'bg-neutral-900 border-neutral-800 text-white'
              : 'bg-white border-neutral-200 text-neutral-900'
              } focus:border-[#F24C20]`}
          />
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order, i) => {
              const role = order.buyer_id._id === currentUserId ? 'buyer' : 'seller';
              const otherParty = role === 'buyer' ? order.seller_id : order.buyer_id;
              const status = getStatusBadge(order.status);

              return (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  className={`p-5 rounded-2xl border backdrop-blur-sm transition-all hover:shadow-xl ${isDarkMode
                    ? 'bg-neutral-900/50 border-neutral-800 hover:border-neutral-700'
                    : 'bg-white/50 border-neutral-200 hover:border-neutral-300'
                    }`}
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Thumbnail */}
                    <div className="w-full lg:w-48 h-32 rounded-xl overflow-hidden shadow-inner">
                      <img
                        src={order.gig_id.thumbnail || 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&q=80'}
                        alt={order.gig_id.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Basic Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-mono font-medium ${isDarkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                          #{order.orderID}
                        </span>
                        <div className="flex gap-2">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider ${role === 'buyer' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'
                            }`}>
                            {role === 'buyer' ? 'Buying' : 'Selling'}
                          </span>
                          <span className={`px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                      </div>

                      <h3 className={`text-lg font-bold line-clamp-1 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                        {order.gig_id.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-2">
                          <img src={otherParty.profile_image || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80'} className="w-6 h-6 rounded-full" />
                          <span className={`text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                            {otherParty.full_name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-neutral-500">
                          <Clock className="w-4 h-4" />
                          {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                        </div>
                        <div className={`text-lg font-bold ${isDarkMode ? 'text-[#F24C20]' : 'text-[#F24C20]'}`}>
                          <CountUp end={order.price} prefix="₹" />
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex lg:flex-col items-center justify-end gap-2 lg:min-w-[120px]">
                      <button className="flex-1 lg:w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#044071] text-white rounded-lg text-sm font-medium hover:bg-[#044071]/90 transition-all">
                        <MessageSquare className="w-4 h-4" />
                        Chat
                      </button>
                      <button className={`flex-1 lg:w-full px-4 py-2 rounded-lg border text-sm font-medium transition-all ${isDarkMode
                        ? 'border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                        : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                        }`}>
                        View Details
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`p-16 rounded-2xl border text-center ${isDarkMode ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white/50 border-neutral-200'}`}
            >
              <Package className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-neutral-800' : 'text-neutral-200'}`} />
              <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>No orders found</h3>
              <p className={`${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                {searchTerm || filter !== 'all' ? "Try adjusting your filters or search term." : "Your gig orders will appear here once you start buying or selling services."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
