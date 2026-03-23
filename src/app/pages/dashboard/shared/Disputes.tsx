import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '@/app/components/ThemeProvider';
import { AlertCircle, Loader2, Clock, CheckCircle2, MessageSquare, ExternalLink } from 'lucide-react';
import api from '@/app/utils/api';
import { format } from 'date-fns';

interface Dispute {
  _id: string;
  title: string;
  description: string;
  status: 'open' | 'under_review' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  buyer: { full_name: string };
  seller: { full_name: string };
}

export default function Disputes() {
  const { isDarkMode } = useTheme();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      const res = await api.get('/users/my-disputes');
      if (res.data.success) {
        setDisputes(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching disputes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      open: { color: 'bg-red-500/10 text-red-500 border-red-500/30' },
      under_review: { color: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
      resolved: { color: 'bg-green-500/10 text-green-500 border-green-500/30' },
      closed: { color: 'bg-neutral-500/10 text-neutral-500 border-neutral-500/30' }
    };
    return badges[status as keyof typeof badges] || badges.open;
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
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
          Disputes
        </h1>
        <p className={`mt-2 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
          Manage and track your conflict resolution requests
        </p>
      </motion.div>

      {disputes.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence>
            {disputes.map((dispute, i) => (
              <motion.div
                key={dispute._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`p-6 rounded-2xl border backdrop-blur-sm ${isDarkMode ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white/50 border-neutral-200'
                  }`}
              >
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(dispute.status).color}`}>
                        {dispute.status.replace('_', ' ')}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${dispute.priority === 'high' ? 'text-red-500' : 'text-yellow-500'}`}>
                        {dispute.priority} Priority
                      </span>
                    </div>
                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>{dispute.title}</h3>
                    <p className={`text-sm line-clamp-2 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>{dispute.description}</p>
                    <div className="flex items-center gap-4 py-2 border-t border-neutral-200 dark:border-neutral-800 mt-4">
                      <div className="text-xs">
                        <span className="text-neutral-500 mr-2">Created:</span>
                        <span className={isDarkMode ? 'text-neutral-300' : 'text-neutral-700'}>{format(new Date(dispute.created_at), 'MMM dd, yyyy')}</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-neutral-500 mr-2">Parties:</span>
                        <span className={isDarkMode ? 'text-neutral-300' : 'text-neutral-700'}>{dispute.buyer?.full_name} vs {dispute.seller?.full_name}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 h-fit">
                    <button className="p-2 rounded-lg bg-[#044071] text-white hover:bg-[#033050] transition-all">
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button className={`px-4 py-2 rounded-lg border text-sm font-medium ${isDarkMode ? 'border-neutral-700 text-neutral-300 hover:bg-neutral-800' : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'}`}>
                      Details
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-12 rounded-2xl border backdrop-blur-sm text-center ${isDarkMode ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white/50 border-neutral-200'
            }`}
        >
          <AlertCircle className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-neutral-700' : 'text-neutral-300'}`} />
          <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
            No disputes
          </h3>
          <p className={`${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
            You don't have any active disputes. All your interactions have been smooth sailing!
          </p>
        </motion.div>
      )}
    </div>
  );
}
