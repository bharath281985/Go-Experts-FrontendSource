import { motion } from 'motion/react';
import { useTheme } from '@/app/components/ThemeProvider';
import { Wallet, Loader2, Clock, CheckCircle, XCircle, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import CountUp from '@/app/components/dashboard/CountUp';
import { useState, useEffect } from 'react';
import api from '@/app/utils/api';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Transaction {
  _id: string;
  amount: number;
  type: string;
  description: string;
  created_at: string;
  status: 'completed' | 'pending' | 'failed';
}

export default function AccountBalance() {
  const { isDarkMode } = useTheme();
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

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
        setTransactions(transRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMoney = async () => {
    const amount = window.prompt('Enter amount to add (₹):');
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error('Invalid amount');
      return;
    }

    try {
      const res = await api.post('/users/add-money', { amount: Number(amount) });
      if (res.data.success) {
        toast.success(`₹${amount} added successfully`);
        fetchData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add funds');
    }
  };

  const handleWithdraw = async () => {
    const amount = window.prompt('Enter amount to withdraw (₹):');
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error('Invalid amount');
      return;
    }
    if (Number(amount) > balance) {
      toast.error('Insufficient balance');
      return;
    }

    try {
      const res = await api.post('/users/withdraw', {
        amount: Number(amount),
        method: 'Bank Transfer'
      });
      if (res.data.success) {
        toast.success('Withdrawal request submitted');
        fetchData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Withdrawal failed');
    }
  };

  const getTransactionIcon = (amount: number) => {
    if (amount > 0) return <ArrowDownLeft className="w-5 h-5 text-green-500" />;
    return <ArrowUpRight className="w-5 h-5 text-red-500" />;
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      completed: { icon: CheckCircle, color: 'text-green-500 bg-green-500/10' },
      pending: { icon: Clock, color: 'text-yellow-500 bg-yellow-500/10' },
      failed: { icon: XCircle, color: 'text-red-500 bg-red-500/10' }
    };
    return badges[status as keyof typeof badges] || badges.completed;
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
          Account Balance
        </h1>
        <p className={`mt-2 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
          Manage your wallet and transactions
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className={`lg:col-span-1 p-8 rounded-2xl border backdrop-blur-sm h-fit ${isDarkMode ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white/50 border-neutral-200'}`}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 rounded-xl bg-[#F24C20]/10">
              <Wallet className="w-8 h-8 text-[#F24C20]" />
            </div>
            <div>
              <div className={`text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>Current Balance</div>
              <div className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                ₹{balance.toLocaleString()}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleAddMoney}
              className="w-full px-6 py-3 bg-[#F24C20] hover:bg-orange-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-orange-500/20"
            >
              Add Money
            </button>
            <button
              onClick={handleWithdraw}
              className={`w-full px-6 py-3 rounded-xl font-medium transition-all border ${isDarkMode ? 'border-neutral-700 hover:bg-neutral-800 text-white' : 'border-neutral-200 hover:bg-neutral-50 text-neutral-900'}`}
            >
              Withdraw Funds
            </button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className={`lg:col-span-2 p-6 rounded-2xl border backdrop-blur-sm ${isDarkMode ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white/50 border-neutral-200'}`}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>Recent Transactions</h2>
          </div>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {transactions.length > 0 ? (
              transactions.map((txn, i) => {
                const status = getStatusBadge(txn.status || 'completed');
                const StatusIcon = status.icon;
                return (
                  <motion.div key={txn._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all hover:scale-[1.01] ${isDarkMode ? 'bg-neutral-800/50 border-neutral-700' : 'bg-neutral-50 border-neutral-200'}`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-neutral-900' : 'bg-white'} shadow-sm`}>{getTransactionIcon(txn.amount)}</div>
                      <div>
                        <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>{txn.description || txn.type.replace('_', ' ')}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs ${isDarkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>{format(new Date(txn.created_at), 'MMM dd, yyyy • hh:mm a')}</span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${status.color}`}>
                            <StatusIcon className="w-3 h-3" /> {txn.status || 'completed'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className={`text-lg font-bold ${txn.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>{txn.amount > 0 ? '+' : ''}₹{Math.abs(txn.amount).toLocaleString()}</div>
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
    </div>
  );
}
