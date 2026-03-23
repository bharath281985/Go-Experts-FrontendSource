import { motion } from 'motion/react';
import { useTheme } from '@/app/components/ThemeProvider';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Eye,
  MoreVertical,
  PauseCircle,
  PlayCircle,
  Star,
  TrendingUp,
  ShoppingCart,
  DollarSign,
  Loader2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api, { getImgUrl } from '@/app/utils/api';

interface Gig {
  _id: string;
  title: string;
  category: string;
  investment_required: number;
  thumbnail: string;
  status: 'live' | 'paused' | 'draft';
  orders_count?: number;
  revenue?: number;
  rating?: number;
  views?: number;
}

export default function MyGigs() {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGigs = async () => {
      try {
        const res = await api.get('/gigs/my');
        if (res.data.success) {
          setGigs(res.data.data);
        }
      } catch (error) {
        console.error('Error fetching my gigs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGigs();
  }, []);

  const totalRevenue = gigs.reduce((sum, g) => sum + (g.revenue || 0), 0);

  const stats = [
    {
      label: 'Active Gigs',
      value: gigs.filter(g => g.status === 'live').length,
      icon: Package,
      color: 'text-[#F24C20]',
      bgColor: 'bg-[#F24C20]/10'
    },
    {
      label: 'Total Orders',
      value: gigs.reduce((sum, g) => sum + (g.orders_count || 0), 0),
      icon: ShoppingCart,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      label: 'Total Revenue',
      value: totalRevenue >= 1000 ? `₹${(totalRevenue / 1000).toFixed(1)}K` : `₹${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      label: 'Avg. Rating',
      value: (gigs.filter(g => (g.rating || 0) > 0).reduce((sum, g) => sum + (g.rating || 0), 0) / (gigs.filter(g => (g.rating || 0) > 0).length || 1)).toFixed(1),
      icon: Star,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10'
    }
  ];

  const getStatusBadge = (status: string) => {
    const badges = {
      live: { label: 'Live', color: 'bg-green-500/10 text-green-500 border-green-500/30' },
      paused: { label: 'Paused', color: 'bg-orange-500/10 text-orange-500 border-orange-500/30' },
      draft: { label: 'Draft', color: 'bg-neutral-500/10 text-neutral-500 border-neutral-500/30' }
    };
    // Backend uses 'live', frontend used 'active'
    return badges[status as keyof typeof badges] || badges.draft;
  };

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
        className="flex items-center justify-between"
      >
        <div>
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
            My Gigs
          </h1>
          <p className={`mt-2 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
            Manage and track your service offerings
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard/gigs/create')}
          className="flex items-center gap-2 px-6 py-3 bg-[#044071] text-white rounded-xl font-medium hover:bg-[#044071]/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create New Gig
        </button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-6 rounded-2xl border backdrop-blur-sm ${isDarkMode
                ? 'bg-neutral-900/50 border-neutral-800'
                : 'bg-white/50 border-neutral-200'
                }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'} mb-1`}>
                {stat.label}
              </div>
              <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                {stat.value}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Gigs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gigs.map((gig, index) => {
          const statusBadge = getStatusBadge(gig.status);

          return (
            <motion.div
              key={gig._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              whileHover={{ y: -4 }}
              className={`rounded-2xl border backdrop-blur-sm overflow-hidden transition-all ${isDarkMode
                ? 'bg-neutral-900/50 border-neutral-800 hover:border-neutral-700'
                : 'bg-white/50 border-neutral-200 hover:border-neutral-300'
                }`}
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={getImgUrl(gig.thumbnail) || 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&q=80'}
                  alt={gig.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full border text-xs font-medium backdrop-blur-sm ${statusBadge.color}`}>
                    {statusBadge.label}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                      {gig.category}
                    </div>
                    <h3 className={`font-semibold line-clamp-2 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                      {gig.title}
                    </h3>
                  </div>
                </div>

                <div className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-[#F24C20]' : 'text-[#F24C20]'}`}>
                  ₹{gig.investment_required?.toLocaleString() || 0}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div>
                    <div className={`text-xs ${isDarkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                      Orders
                    </div>
                    <div className={`font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                      {gig.orders_count || 0}
                    </div>
                  </div>
                  <div>
                    <div className={`text-xs ${isDarkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                      Revenue
                    </div>
                    <div className={`font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                      ₹{(gig.revenue || 0) >= 1000 ? `${((gig.revenue || 0) / 1000).toFixed(1)}K` : (gig.revenue || 0).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className={`text-xs ${isDarkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                      Rating
                    </div>
                    <div className={`font-bold flex items-center gap-1 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                      {(gig.rating || 0) > 0 ? (
                        <>
                          <Star className="w-3 h-3 text-yellow-500" fill="currentColor" />
                          {gig.rating}
                        </>
                      ) : (
                        <span className="text-neutral-500">-</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/dashboard/gigs/edit/${gig._id}`)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-colors ${isDarkMode
                      ? 'border-neutral-700 hover:bg-neutral-800 text-neutral-300'
                      : 'border-neutral-300 hover:bg-neutral-50 text-neutral-700'
                      }`}
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <Link
                    to={`/gigs/${gig._id}`}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-colors ${isDarkMode
                      ? 'border-neutral-700 hover:bg-neutral-800 text-neutral-300'
                      : 'border-neutral-300 hover:bg-neutral-50 text-neutral-700'
                      }`}
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </Link>
                  {gig.status === 'live' ? (
                    <button
                      className={`p-2 rounded-lg border transition-colors ${isDarkMode
                        ? 'border-neutral-700 hover:bg-neutral-800 text-neutral-300'
                        : 'border-neutral-300 hover:bg-neutral-50 text-neutral-700'
                        }`}
                    >
                      <PauseCircle className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      className={`p-2 rounded-lg border transition-colors ${isDarkMode
                        ? 'border-neutral-700 hover:bg-neutral-800 text-neutral-300'
                        : 'border-neutral-300 hover:bg-neutral-50 text-neutral-700'
                        }`}
                    >
                      <PlayCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State for new users */}
      {gigs.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-12 rounded-2xl border backdrop-blur-sm text-center ${isDarkMode
            ? 'bg-neutral-900/50 border-neutral-800'
            : 'bg-white/50 border-neutral-200'
            }`}
        >
          <div className={`inline-flex p-4 rounded-full mb-4 ${isDarkMode ? 'bg-neutral-800' : 'bg-neutral-100'}`}>
            <Package className={`w-12 h-12 ${isDarkMode ? 'text-neutral-600' : 'text-neutral-400'}`} />
          </div>
          <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
            No Gigs Yet
          </h3>
          <p className={`mb-6 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
            Create your first gig to start receiving orders
          </p>
          <button onClick={() => navigate('/dashboard/gigs/create')} className="px-8 py-3 bg-[#044071] text-white rounded-xl font-medium hover:bg-[#044071]/90 transition-colors">
            Create Your First Gig
          </button>
        </motion.div>
      )}
    </div>
  );
}
