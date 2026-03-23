import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useTheme } from '@/app/components/ThemeProvider';
import {
  Wallet,
  ArrowDownToLine,
  Clock,
  CheckCircle,
  XCircle,
  CreditCard,
  Banknote,
  IndianRupee,
  Loader2,
  ArrowUpRight,
  ArrowDownLeft,
  Filter
} from 'lucide-react';
import CountUp from '@/app/components/dashboard/CountUp';
import SparklineChart from '@/app/components/dashboard/charts/SparklineChart';
import api from '@/app/utils/api';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Transaction {
  _id: string;
  type: string;
  description: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  created_at: string;
  method?: string;
}

export default function WalletWithdraw() {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalWithdrawn, setTotalWithdrawn] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userRes, transRes] = await Promise.all([
        api.get('/auth/me'),
        api.get('/users/transactions')
      ]);

      if (userRes.data.success) {
        setBalance(userRes.data.user.wallet_balance || 0);
      }
      if (transRes.data.success) {
        const transData = transRes.data.data;
        setTransactions(transData);

        // Calculate total withdrawn
        const total = transData
          .filter((t: Transaction) => t.type === 'withdrawal')
          .reduce((acc: number, curr: Transaction) => acc + Math.abs(curr.amount), 0);
        setTotalWithdrawn(total);
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || Number(withdrawAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (Number(withdrawAmount) > balance) {
      toast.error('Insufficient balance');
      return;
    }

    try {
      const res = await api.post('/users/withdraw', {
        amount: Number(withdrawAmount),
        method: 'Bank Transfer'
      });
      if (res.data.success) {
        toast.success('Withdrawal request submitted');
        setWithdrawAmount('');
        fetchData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Withdrawal failed');
    }
  };

  const sparklineData = [
    { value: 20 }, { value: 35 }, { value: 28 }, { value: 45 }, { value: 38 }, { value: 52 }, { value: 63 }
  ];

  const getStatusBadge = (status: string) => {
    const badges = {
      completed: { label: 'Completed', icon: CheckCircle, color: 'bg-green-500/10 text-green-500 border-green-500/30' },
      pending: { label: 'Pending', icon: Clock, color: 'bg-orange-500/10 text-orange-500 border-orange-500/30' },
      failed: { label: 'Failed', icon: XCircle, color: 'bg-red-500/10 text-red-500 border-red-500/30' }
    };
    return badges[status as keyof typeof badges] || badges.completed;
  };

  const getTransactionIcon = (type: string, amount: number) => {
    if (amount > 0) return <ArrowDownLeft className="w-5 h-5 text-green-500" />;
    return <ArrowUpRight className="w-5 h-5 text-red-500" />;
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
          Wallet & Withdraw
        </h1>
        <p className={`mt-2 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
          Manage your earnings and withdraw funds
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className={`p-6 rounded-2xl border backdrop-blur-sm ${isDarkMode ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white/50 border-neutral-200'}`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-[#F24C20]/10">
              <Wallet className="w-6 h-6 text-[#F24C20]" />
            </div>
          </div>
          <div className={`text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'} mb-1`}>Wallet Balance</div>
          <div className={`text-2xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}><CountUp end={balance} prefix="₹" /></div>
          <SparklineChart data={sparklineData} dataKey="value" color="#F24C20" height={30} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className={`p-6 rounded-2xl border backdrop-blur-sm ${isDarkMode ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white/50 border-neutral-200'}`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-green-500/10">
              <ArrowDownToLine className="w-6 h-6 text-green-500" />
            </div>
          </div>
          <div className={`text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'} mb-1`}>Available to Withdraw</div>
          <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>₹{balance.toLocaleString()}</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className={`p-6 rounded-2xl border backdrop-blur-sm ${isDarkMode ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white/50 border-neutral-200'}`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-orange-500/10">
              <Clock className="w-6 h-6 text-orange-500" />
            </div>
          </div>
          <div className={`text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'} mb-1`}>Pending Clearance</div>
          <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>₹0</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className={`p-6 rounded-2xl border backdrop-blur-sm ${isDarkMode ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white/50 border-neutral-200'}`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-blue-500/10">
              <IndianRupee className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <div className={`text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'} mb-1`}>Total Withdrawn</div>
          <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>₹{totalWithdrawn.toLocaleString()}</div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className={`p-6 rounded-2xl border backdrop-blur-sm ${isDarkMode ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white/50 border-neutral-200'}`}
      >
        <h2 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>Withdraw Funds</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>Withdrawal Amount</label>
              <div className="relative">
                <span className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>₹</span>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Enter amount"
                  className={`w-full pl-8 pr-4 py-3 rounded-xl border ${isDarkMode ? 'bg-neutral-800/50 border-neutral-700 text-white' : 'bg-white border-neutral-300 text-neutral-900'} outline-none focus:border-[#F24C20] transition-colors`}
                />
              </div>
              <div className={`text-sm mt-2 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>Available: ₹{balance.toLocaleString()}</div>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>Withdrawal Method</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button className="p-4 rounded-xl border-2 border-[#F24C20] bg-[#F24C20]/10">
                  <CreditCard className="w-6 h-6 text-[#F24C20] mx-auto mb-2" />
                  <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>Bank Transfer</div>
                </button>
                <button className={`p-4 rounded-xl border ${isDarkMode ? 'border-neutral-700' : 'border-neutral-300'}`}>
                  <Banknote className="w-6 h-6 mx-auto mb-2 text-neutral-500" />
                  <div className="text-sm font-medium text-neutral-500">UPI</div>
                </button>
                <button className={`p-4 rounded-xl border ${isDarkMode ? 'border-neutral-700' : 'border-neutral-300'}`}>
                  <Wallet className="w-6 h-6 mx-auto mb-2 text-neutral-500" />
                  <div className="text-sm font-medium text-neutral-500">PayPal</div>
                </button>
              </div>
            </div>
            <button
              onClick={handleWithdraw}
              disabled={!withdrawAmount || Number(withdrawAmount) <= 0}
              className="w-full py-3 bg-[#044071] text-white rounded-xl font-medium hover:bg-[#044071]/90 transition-colors disabled:opacity-50"
            >
              Withdraw Now
            </button>
          </div>
          <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-neutral-800/50 border-neutral-700' : 'bg-neutral-50 border-neutral-200'}`}>
            <h3 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>Withdrawal Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /><span className={isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}>Minimum withdrawal: ₹500</span></div>
              <div className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /><span className={isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}>Processing time: 2-3 business days</span></div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        className={`p-6 rounded-2xl border backdrop-blur-sm ${isDarkMode ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white/50 border-neutral-200'}`}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>Transaction History</h2>
          <button className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${isDarkMode ? 'border-neutral-700 text-neutral-300' : 'border-neutral-300 text-neutral-700'}`}>
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {transactions.length > 0 ? (
            transactions.map((txn, index) => {
              const statusBadge = getStatusBadge(txn.status);
              const StatusIcon = statusBadge.icon;
              return (
                <motion.div key={txn._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 + index * 0.05 }}
                  className={`p-4 rounded-xl border ${isDarkMode ? 'bg-neutral-800/50 border-neutral-700' : 'bg-neutral-50 border-neutral-200'}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${txn.amount > 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>{getTransactionIcon(txn.type, txn.amount)}</div>
                      <div className="flex-1">
                        <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>{txn.description || txn.type.replace('_', ' ')}</div>
                        <div className={`text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>{txn.method || txn.type} • {format(new Date(txn.created_at), 'MMM dd, yyyy • hh:mm a')}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${txn.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>{txn.amount > 0 ? '+' : ''}₹{Math.abs(txn.amount).toLocaleString()}</div>
                      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mt-1 ${statusBadge.color}`}>
                        <StatusIcon className="w-3 h-3" /> {statusBadge.label}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="py-20 text-center">
              <div className={`inline-flex p-4 rounded-full mb-4 ${isDarkMode ? 'bg-neutral-800' : 'bg-neutral-100'}`}><Clock className="w-8 h-8 text-neutral-500" /></div>
              <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>No transactions yet</h3>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
