import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, Loader2, MessageSquare, X } from 'lucide-react';
import api from '@/app/utils/api';
import { format } from 'date-fns';

interface Dispute {
  _id: string;
  title: string;
  description: string;
  status: 'open' | 'under_review' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  buyer: { _id: string; full_name: string };
  seller: { _id: string; full_name: string };
}

export default function Disputes() {
  const navigate = useNavigate();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUserId = currentUser?._id || currentUser?.id;

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

  const getOtherParty = (dispute: Dispute) => {
    const buyerId = dispute.buyer?._id;
    const sellerId = dispute.seller?._id;
    if (buyerId && buyerId === currentUserId) return dispute.seller;
    if (sellerId && sellerId === currentUserId) return dispute.buyer;
    return dispute.seller || dispute.buyer;
  };

  const handleMessage = (dispute: Dispute) => {
    const otherParty = getOtherParty(dispute);
    if (!otherParty?._id) return;
    navigate(`/dashboard/messages?user=${otherParty._id}`);
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
        <h1 className="text-3xl font-bold text-[#111111]">
          Disputes
        </h1>
        <p className="mt-2 text-[#4a4a4a]">
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
                className="p-6 rounded-2xl border border-neutral-200 bg-white/50 backdrop-blur-sm"
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
                    <h3 className="text-xl font-bold text-[#111111]">{dispute.title}</h3>
                    <p className="text-sm line-clamp-2 text-[#4a4a4a]">{dispute.description}</p>
                    <div className="flex flex-wrap items-center gap-4 py-2 border-t border-neutral-200 mt-4">
                      <div className="text-xs">
                        <span className="text-neutral-500 mr-2">Created:</span>
                        <span className="font-medium text-[#111111]">{format(new Date(dispute.created_at), 'MMM dd, yyyy')}</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-neutral-500 mr-2">Parties:</span>
                        <span className="font-medium text-[#111111]">{dispute.buyer?.full_name} vs {dispute.seller?.full_name}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 h-fit">
                    <button
                      onClick={() => handleMessage(dispute)}
                      className="p-2 rounded-lg bg-[#044071] text-white hover:bg-[#033050] transition-all"
                      aria-label={`Message ${getOtherParty(dispute)?.full_name || 'participant'}`}
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setSelectedDispute(dispute)}
                      className="px-4 py-2 rounded-lg border border-neutral-300 text-sm font-medium text-[#111111] hover:bg-[#F24C20] hover:text-white transition-all"
                    >
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
          className="p-12 rounded-2xl border border-neutral-200 bg-white/50 backdrop-blur-sm text-center"
        >
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-neutral-300" />
          <h3 className="text-xl font-bold mb-2 text-[#111111]">
            No disputes
          </h3>
          <p className="text-[#4a4a4a]">
            You don't have any active disputes. All your interactions have been smooth sailing!
          </p>
        </motion.div>
      )}
      <AnimatePresence>
        {selectedDispute && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className="w-full max-w-xl rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl"
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(selectedDispute.status).color}`}>
                      {selectedDispute.status.replace('_', ' ')}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${selectedDispute.priority === 'high' ? 'text-red-500' : 'text-yellow-500'}`}>
                      {selectedDispute.priority} Priority
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-[#111111]">{selectedDispute.title}</h2>
                </div>
                <button
                  onClick={() => setSelectedDispute(null)}
                  className="rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-[#111111]"
                  aria-label="Close dispute details"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="mb-5 text-sm leading-6 text-[#4a4a4a]">{selectedDispute.description}</p>

              <div className="grid gap-3 rounded-xl border border-neutral-200 bg-[#fff3e7] p-4 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-neutral-500">Created</span>
                  <span className="font-semibold text-[#111111]">{format(new Date(selectedDispute.created_at), 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-neutral-500">Buyer</span>
                  <span className="font-semibold text-[#111111]">{selectedDispute.buyer?.full_name || 'Unknown'}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-neutral-500">Seller</span>
                  <span className="font-semibold text-[#111111]">{selectedDispute.seller?.full_name || 'Unknown'}</span>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  onClick={() => handleMessage(selectedDispute)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#044071] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#033050]"
                >
                  <MessageSquare className="h-4 w-4" />
                  Message Participant
                </button>
                <button
                  onClick={() => setSelectedDispute(null)}
                  className="rounded-xl border border-neutral-300 px-5 py-2.5 text-sm font-semibold text-[#111111] transition-colors hover:bg-neutral-100"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
