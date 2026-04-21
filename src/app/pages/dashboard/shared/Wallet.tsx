import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '@/app/components/ThemeProvider';
import {
  Wallet as WalletIcon,
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
  Filter,
  Users,
  Copy,
  ChevronRight,
  Building2,
  Phone,
  QrCode,
  User,
  Mail,
  Crown,
  Check,
  Zap
} from 'lucide-react';
import CountUp from '@/app/components/dashboard/CountUp';
import api from '@/app/utils/api';
import { format } from 'date-fns';
import { toast } from 'sonner';

const formatSafeDate = (value?: string | number | Date | null, fallback = '-') => {
  if (!value) return fallback;

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;

  return format(date, 'MMM dd, yyyy');
};

interface Transaction {
  _id: string;
  type: string;
  description: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
  method?: string;
  balance_after?: number;
}

interface Withdrawal {
  _id: string;
  amount: number;
  payment_method: string;
  status: string;
  createdAt: string;
  payment_details: any;
}

export default function Wallet() {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [payingPlanId, setPayingPlanId] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [referralCode, setReferralCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [minWithdrawal, setMinWithdrawal] = useState(500);
  const [referralReward, setReferralReward] = useState(50);
  const [plans, setPlans] = useState<any[]>([]);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [activePlanName, setActivePlanName] = useState<string | null>(null);
  const [pendingPlanChange, setPendingPlanChange] = useState<{ planId: string; planName: string; planPrice: number } | null>(null);

  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'upi'>('bank_transfer');
  const [bankDetails, setBankDetails] = useState({
    account_holder_name: '',
    account_number: '',
    ifsc_code: '',
    bank_name: ''
  });
  const [upiId, setUpiId] = useState('');

  const userType = localStorage.getItem('userType') || 'client';
  const hasActivePlan = Boolean(activePlanId || activePlanName);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      const [walletRes, withdrawRes, plansRes, subRes] = await Promise.all([
        api.get('/wallet/my-wallet'),
        api.get('/wallet/my-withdrawals'),
        api.get(`/subscription-plans?role=${userType}`),
        api.get('/subscription/my-status', { skipToast: true } as any).catch(() => null)
      ]);

      if (walletRes.data.success) {
        setBalance(walletRes.data.balance);
        setReferralCode(walletRes.data.referral_code);
        setFullName(walletRes.data.full_name || '');
        setEmail(walletRes.data.email || '');
        setPhone(walletRes.data.phone_number || '');
        setTransactions(walletRes.data.transactions);
        setMinWithdrawal(walletRes.data.min_withdrawal);
        setReferralReward(walletRes.data.referral_reward);
      }
      if (withdrawRes.data.success) {
        setWithdrawals(withdrawRes.data.withdrawals);
      }
      if (plansRes.data.success) {
        setPlans(plansRes.data.data.filter((p: any) => p.price > 0));
      }
      if (subRes?.data?.success && subRes.data.subscription) {
        const sub = subRes.data.subscription;
        setActivePlanId(sub.plan_id?._id || sub.plan_id || null);
        setActivePlanName(sub.plan_name || sub.plan_id?.name || null);
      } else {
        setActivePlanId(null);
        setActivePlanName(null);
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = Number(withdrawAmount);
    if (!amount || amount < minWithdrawal) {
      toast.error(`Minimum withdrawal is â‚¹${minWithdrawal}`);
      return;
    }
    if (amount > balance) {
      toast.error('Insufficient balance');
      return;
    }

    if (paymentMethod === 'bank_transfer') {
      if (!bankDetails.account_number || !bankDetails.ifsc_code || !bankDetails.account_holder_name) {
        toast.error('Please fill all bank details');
        return;
      }
    } else {
      if (!upiId || !upiId.includes('@')) {
        toast.error('Please enter a valid UPI ID');
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await api.post('/wallet/withdraw', {
        amount,
        method: paymentMethod,
        payment_details: paymentMethod === 'bank_transfer' ? bankDetails : { upi_id: upiId }
      });

      if (res.data.success) {
        toast.success('Withdrawal request submitted successfully');
        setWithdrawAmount('');
        fetchWalletData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Withdrawal failed');
    } finally {
      setSubmitting(false);
    }
  };

  const proceedPayWithWallet = async (planId: string, planName: string, planPrice: number) => {
    if (balance < planPrice) {
      toast.error(`Insufficient balance. You need â‚¹${planPrice} but have â‚¹${balance}.`);
      return;
    }
    if (hasActivePlan) {
      setPendingPlanChange({ planId, planName, planPrice });
      return;
    }
    setPayingPlanId(planId);
    try {
      const res = await api.post('/payment/pay-with-wallet', { planId });
      if (res.data.success) {
        toast.success(res.data.message || `${planName} activated!`);
        setBalance(res.data.wallet_balance);
        fetchWalletData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Wallet payment failed');
    } finally {
      setPayingPlanId(null);
    }
  };

  const handlePayWithWallet = async (planId: string, planName: string, planPrice: number) => {
    if (balance < planPrice) {
      toast.error(`Insufficient balance. You need Ã¢â€šÂ¹${planPrice} but have Ã¢â€šÂ¹${balance}.`);
      return;
    }

    if (hasActivePlan) {
      setPendingPlanChange({ planId, planName, planPrice });
      return;
    }

    await proceedPayWithWallet(planId, planName, planPrice);
  };

  const shareReferral = async () => {
    const link = `${window.location.origin}/register?ref=${referralCode}`;
    const imageUrl = `${window.location.origin}/GoExperts-referals.png`;
    const textBase = `Hey! It's ${fullName ? fullName.split(' ')[0] : 'me'}. I'm inviting you to join Go Experts. Sign up using my referral link and let's earn Cashback together!`;
    
    const shareData: any = {
      title: 'Invite a Friend to Go Experts',
      text: `${textBase}\n\n${link}`,
      url: link
    };

    if (navigator.share && /mobile|android|iphone|ipad/i.test(navigator.userAgent)) {
      try {
        // Attach the public referral image when the platform supports sharing files.
        const response = await fetch(`/GoExperts-referals.png?v=${Date.now()}`);
        if (response.ok) {
          const blob = await response.blob();
          const file = new File([blob], 'GoExperts-referals.png', { type: blob.type || 'image/png' });

          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            shareData.files = [file];
            shareData.text = textBase;
          }
        }

        await navigator.share(shareData);
        toast.success('Thanks for sharing!');
      } catch (err) {
        console.error('Error sharing:', err);
        navigator.clipboard.writeText(`${textBase}\n\n${link}\n\n${imageUrl}`);
        toast.success('Referral link and image URL copied to clipboard!');
      }
    } else {
      navigator.clipboard.writeText(`${textBase}\n\n${link}\n\nImage: ${imageUrl}`);
      toast.success('Referral text, link, and image URL copied to clipboard!');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: any = {
      completed: { label: 'Completed', icon: CheckCircle, color: 'bg-green-500/10 text-green-500 border-green-500/30' },
      paid: { label: 'Paid', icon: CheckCircle, color: 'bg-green-500/10 text-green-500 border-green-500/30' },
      pending: { label: 'Pending', icon: Clock, color: 'bg-orange-500/10 text-orange-500 border-orange-500/30' },
      approved: { label: 'Approved', icon: Clock, color: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
      rejected: { label: 'Rejected', icon: XCircle, color: 'bg-red-500/10 text-red-500 border-red-500/30' },
      failed: { label: 'Failed', icon: XCircle, color: 'bg-red-500/10 text-red-500 border-red-500/30' }
    };
    return badges[status] || badges.completed;
  };

  const getTransactionIcon = (type: string, amount: number) => {
    if (type === 'referral_reward') return <Users className="w-5 h-5 text-blue-500" />;
    if (type === 'subscription_payment') return <Crown className="w-5 h-5 text-orange-500" />;
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
    <div className="space-y-6 pb-20">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
          Wallet & Earnings
        </h1>
        <p className={`mt-2 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
          Manage your balance, refer friends, and withdraw your earnings
        </p>
      </motion.div>

      {/* Profile + Balance Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'} shadow-xl`}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-14 h-14 rounded-2xl bg-[#F24C20]/10 flex items-center justify-center flex-shrink-0">
              <User className="w-7 h-7 text-[#F24C20]" />
            </div>
            <div className="min-w-0">
              <div className={`font-bold text-lg truncate ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>{fullName || 'Your Name'}</div>
              <div className="text-xs text-neutral-500 uppercase tracking-widest font-semibold">Account Profile</div>
            </div>
          </div>
          <div className="space-y-3">
            <div className={`flex items-center gap-3 p-3 rounded-xl ${isDarkMode ? 'bg-neutral-800/60' : 'bg-neutral-50'}`}>
              <Mail className="w-4 h-4 text-[#F24C20] flex-shrink-0" />
              <span className={`text-sm truncate ${isDarkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>{email || 'â€”'}</span>
            </div>
            <div className={`flex items-center gap-3 p-3 rounded-xl ${isDarkMode ? 'bg-neutral-800/60' : 'bg-neutral-50'}`}>
              <Phone className="w-4 h-4 text-[#F24C20] flex-shrink-0" />
              <span className={`text-sm ${isDarkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>{phone || 'Not provided'}</span>
            </div>
          </div>
        </motion.div>

        {/* Main Balance Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 }}
          className={`relative overflow-hidden p-8 rounded-3xl border ${isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'} shadow-xl`}
        >
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <WalletIcon className="w-32 h-32 text-[#F24C20]" />
          </div>
          <div className="relative z-10">
            <div className={`text-sm uppercase tracking-widest font-bold ${isDarkMode ? 'text-neutral-500' : 'text-neutral-400'} mb-2`}>Wallet Balance</div>
            <div className={`text-5xl font-black ${isDarkMode ? 'text-white' : 'text-neutral-900'} mb-8 flex items-baseline gap-2`}>
              <span className="text-2xl text-[#F24C20]">₹</span>
              <CountUp end={balance} />
            </div>
            <div className="flex items-center gap-6 pt-6 border-t border-neutral-800/10">
              <div>
                <div className="text-xs text-neutral-500 font-medium">Pending Payouts</div>
                <div className="font-bold text-orange-500">{withdrawals.filter(w => w.status === 'pending').reduce((acc, w) => acc + w.amount, 0).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-neutral-500 font-medium">Total Earned</div>
                <div className="font-bold text-green-500">{transactions.filter(t => t.type === 'referral_reward').reduce((acc, t) => acc + t.amount, 0).toLocaleString()}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Referral Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
          className={`p-6 rounded-3xl border bg-gradient-to-br ${isDarkMode ? 'from-orange-500/10 to-transparent border-orange-500/20' : 'from-orange-50/50 to-transparent border-orange-100'}`}
        >
          <h2 className={`text-lg font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>Refer & Earn ₹{referralReward}</h2>
          <p className={`text-xs mb-4 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'} leading-relaxed`}>
            Earn <b>₹{referralReward}</b> when your referral buys their first paid plan.
          </p>
          <div className="space-y-2">
            <div className={`flex items-center gap-2 p-2 rounded-2xl border ${isDarkMode ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-neutral-200'}`}>
              <div className={`flex-1 px-3 font-mono font-bold text-sm truncate ${isDarkMode ? 'text-orange-500' : 'text-orange-600'}`}>
                {referralCode}
              </div>
              <button
                onClick={shareReferral}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#F24C20] hover:bg-orange-600 text-white rounded-xl text-sm font-bold transition-all"
              >
                <QrCode className="w-3.5 h-3.5" /> Share Link
              </button>
            </div>
            <div className={`px-3 py-1.5 rounded-xl text-[10px] font-medium break-all ${isDarkMode ? 'bg-neutral-950 text-neutral-500' : 'bg-neutral-50 text-neutral-400'}`}>
              {window.location.origin}/register?ref={referralCode}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Pay with Wallet â€” Subscription Plans */}
      {plans.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className={`p-8 rounded-3xl border ${isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'}`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-[#F24C20]/10"><Crown className="w-6 h-6 text-[#F24C20]" /></div>
            <div>
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>Pay with Wallet</h2>
              <p className={`text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>Use your wallet balance to subscribe instantly no payment gateway</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {plans.map((plan) => {
              const canAfford = balance >= plan.price;
              const isCurrentPlan = String(activePlanId || '') === String(plan._id) || (activePlanName ? activePlanName === plan.name : false);
              return (
                <div
                  key={plan._id}
                  className={`p-5 rounded-2xl border transition-all ${isDarkMode
                    ? isCurrentPlan
                      ? 'bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_0_1px_rgba(16,185,129,0.12)]'
                      : canAfford ? 'bg-neutral-800/60 border-neutral-700 hover:border-[#F24C20]/50' : 'bg-neutral-800/30 border-neutral-800 opacity-60'
                    : isCurrentPlan
                      ? 'bg-emerald-50 border-emerald-300'
                      : canAfford ? 'bg-neutral-50 border-neutral-200 hover:border-[#F24C20]/40' : 'bg-neutral-50/50 border-neutral-100 opacity-60'
                    }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>{plan.name}</h3>
                        {isCurrentPlan && (
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${isDarkMode
                            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                            : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          }`}>
                            Current Plan
                          </span>
                        )}
                      </div>
                      <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>{plan.duration_days} days</p>
                    </div>
                    <span className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>{plan.price}</span>
                  </div>

                  {/* Affordability indicator */}
                  <div className={`flex items-center gap-2 text-xs font-semibold mb-4 ${isCurrentPlan ? 'text-emerald-500' : canAfford ? 'text-green-500' : 'text-red-400'}`}>
                    {isCurrentPlan
                      ? <><Crown className="w-3.5 h-3.5" /> This package is already active on your account</>
                      : canAfford
                      ? <><Check className="w-3.5 h-3.5" /> Sufficient balance (₹{(balance - plan.price).toLocaleString()} left)</>
                      : <><XCircle className="w-3.5 h-3.5" /> Need ₹{(plan.price - balance).toLocaleString()} more</>
                    }
                  </div>

                  <button
                    disabled={isCurrentPlan || !canAfford || payingPlanId !== null}
                    onClick={() => handlePayWithWallet(plan._id, plan.name, plan.price)}
                    className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:cursor-not-allowed active:scale-[0.98] ${
                      isCurrentPlan
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 disabled:opacity-100'
                        : 'bg-[#F24C20] text-white hover:bg-orange-600 disabled:opacity-40'
                    }`}
                  >
                    {isCurrentPlan
                      ? <><Crown className="w-4 h-4" /> Current Package</>
                      : payingPlanId === plan._id
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <><Zap className="w-4 h-4" /> Pay{plan.price} with Wallet</>
                    }
                  </button>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Withdrawal Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className={`lg:col-span-2 p-8 rounded-3xl border ${isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'}`}
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-lg bg-orange-500/10"><ArrowDownToLine className="w-6 h-6 text-orange-500" /></div>
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>Withdraw Funds</h2>
          </div>

          <div className="space-y-8">
            <div>
              <label className="block text-xs uppercase tracking-widest font-black text-neutral-500 mb-4">Choose Payout Method</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setPaymentMethod('bank_transfer')}
                  className={`p-6 rounded-2xl border-2 transition-all text-left ${paymentMethod === 'bank_transfer' ? 'border-[#F24C20] bg-orange-500/5' : 'border-neutral-800 hover:border-neutral-700'}`}
                >
                  <Building2 className={`w-8 h-8 mb-4 ${paymentMethod === 'bank_transfer' ? 'text-[#F24C20]' : 'text-neutral-600'}`} />
                  <div className={`font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>Bank Transfer</div>
                  <div className="text-xs text-neutral-500 mt-1">Direct to your bank account</div>
                </button>
                <button
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-6 rounded-2xl border-2 transition-all text-left ${paymentMethod === 'upi' ? 'border-[#F24C20] bg-orange-500/5' : 'border-neutral-800 hover:border-neutral-700'}`}
                >
                  <Phone className={`w-8 h-8 mb-4 ${paymentMethod === 'upi' ? 'text-[#F24C20]' : 'text-neutral-600'}`} />
                  <div className={`font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>UPI / VPA</div>
                  <div className="text-xs text-neutral-500 mt-1">Instant withdrawal via UPI</div>
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={paymentMethod}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl bg-neutral-800/20 border border-neutral-800/50"
              >
                {paymentMethod === 'bank_transfer' ? (
                  <>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-neutral-500 font-bold mb-2">Account Holder Name</label>
                      <input type="text" value={bankDetails.account_holder_name}
                        onChange={e => setBankDetails({ ...bankDetails, account_holder_name: e.target.value })}
                        className="w-full bg-transparent border-b border-neutral-800 py-2 outline-none text-white focus:border-[#F24C20] transition-colors"
                        placeholder={fullName || 'Bharath'} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-neutral-500 font-bold mb-2">Account Number</label>
                      <input type="text" value={bankDetails.account_number}
                        onChange={e => setBankDetails({ ...bankDetails, account_number: e.target.value })}
                        className="w-full bg-transparent border-b border-neutral-800 py-2 outline-none text-white focus:border-[#F24C20] transition-colors"
                        placeholder="0000 0000 0000 0000" />
                    </div>
                    <div>
                      <label className="block text-xs text-neutral-500 font-bold mb-2">IFSC Code</label>
                      <input type="text" value={bankDetails.ifsc_code}
                        onChange={e => setBankDetails({ ...bankDetails, ifsc_code: e.target.value })}
                        className="w-full bg-transparent border-b border-neutral-800 py-2 outline-none text-white focus:border-[#F24C20] transition-colors"
                        placeholder="SBIN0001234" />
                    </div>
                    <div>
                      <label className="block text-xs text-neutral-500 font-bold mb-2">Bank Name</label>
                      <input type="text" value={bankDetails.bank_name}
                        onChange={e => setBankDetails({ ...bankDetails, bank_name: e.target.value })}
                        className="w-full bg-transparent border-b border-neutral-800 py-2 outline-none text-white focus:border-[#F24C20] transition-colors"
                        placeholder="HDFC Bank" />
                    </div>
                  </>
                ) : (
                  <div className="md:col-span-2">
                    <label className="block text-xs text-neutral-500 font-bold mb-2">UPI ID</label>
                    <input type="text" value={upiId} onChange={e => setUpiId(e.target.value)}
                      className="w-full bg-transparent border-b border-neutral-800 py-2 outline-none text-white focus:border-[#F24C20] transition-colors text-2xl font-bold tracking-tight"
                      placeholder="username@upi" />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex flex-col md:flex-row items-end gap-6">
              <div className="flex-1 w-full">
                <label className="block text-xs text-neutral-500 font-bold mb-2">Enter Amount to Withdraw</label>
                <div className="relative">
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 text-2xl font-bold text-[#F24C20]">₹</span>
                  <input type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)}
                    className="w-full bg-transparent border-b border-neutral-800 pl-6 py-4 text-4xl font-black outline-none text-white focus:border-[#F24C20] transition-colors"
                    placeholder="00.00" />
                </div>
                <div className="text-[10px] text-neutral-500 mt-2 font-bold uppercase tracking-widest flex justify-between">
                  <span>Min:₹{minWithdrawal}</span>
                  <span>Max: ₹{balance}</span>
                </div>
              </div>
              <button
                onClick={handleWithdraw}
                disabled={submitting || !withdrawAmount || Number(withdrawAmount) < minWithdrawal}
                className="w-full md:w-auto px-12 py-5 bg-[#F24C20] hover:bg-orange-600 text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-orange-500/20 disabled:opacity-50 disabled:grayscale"
              >
                {submitting ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'Confirm Withdrawal'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Withdrawal History Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className={`p-8 rounded-3xl border ${isDarkMode ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white border-neutral-200'}`}
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>Recent Payouts</h2>
            <Clock className="w-5 h-5 text-neutral-600" />
          </div>

          <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {withdrawals.length > 0 ? withdrawals.map((w) => {
              const status = getStatusBadge(w.status);
              return (
                <div key={w._id} className="relative pl-6 pb-6 border-l border-neutral-800 last:pb-0">
                  <div className={`absolute left-0 top-0 -translate-x-1/2 w-3 h-3 rounded-full border-2 ${isDarkMode ? 'bg-neutral-900 border-neutral-700' : 'bg-white border-neutral-200'}`} />
                  <div className="flex justify-between items-start mb-1">
                    <div className={`font-bold ${isDarkMode ? 'text-neutral-200' : 'text-neutral-800'}`}>₹{w.amount.toLocaleString()}</div>
                    <div className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${status.color}`}>
                      {status.label}
                    </div>
                  </div>
                  <div className="text-[10px] text-neutral-500 font-medium">
                    {formatSafeDate(w.createdAt)} {w.payment_method}
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-10 opacity-50">
                <Clock className="w-8 h-8 mx-auto mb-2 text-neutral-600" />
                <div className="text-xs font-bold uppercase tracking-widest text-neutral-500">No payout history</div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Transaction Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className={`p-8 rounded-3xl border ${isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'}`}
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>All Transactions</h2>
          <button className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${isDarkMode ? 'border-neutral-800 text-neutral-400' : 'border-neutral-200 text-neutral-600'}`}>
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className={`border-b ${isDarkMode ? 'border-neutral-800' : 'border-neutral-100'}`}>
                <th className="pb-4 text-xs font-black uppercase tracking-widest text-neutral-500">Date</th>
                <th className="pb-4 text-xs font-black uppercase tracking-widest text-neutral-500">Type</th>
                <th className="pb-4 text-xs font-black uppercase tracking-widest text-neutral-500">Description</th>
                <th className="pb-4 text-xs font-black uppercase tracking-widest text-neutral-500">Amount</th>
                <th className="pb-4 text-xs font-black uppercase tracking-widest text-neutral-500">Balance After</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/10">
              {transactions.map((txn) => (
                <tr key={txn._id} className="group hover:bg-neutral-800/5 transition-colors">
                  <td className="py-5 text-sm font-medium text-neutral-500">{formatSafeDate(txn.createdAt)}</td>
                  <td className="py-5">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${txn.type === 'referral_reward' ? 'bg-blue-500/10 text-blue-500' : txn.type === 'subscription_payment' ? 'bg-orange-500/10 text-orange-500' : txn.amount > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {getTransactionIcon(txn.type, txn.amount)}
                      {txn.type.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className={`py-5 text-sm ${isDarkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>{txn.description}</td>
                  <td className={`py-5 font-black ${txn.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {txn.amount > 0 ? '+' : ''}₹{Math.abs(txn.amount).toLocaleString()}
                  </td>
                  <td className={`py-5 font-bold ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>₹{txn.balance_after?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {transactions.length === 0 && (
            <div className="text-center py-20 opacity-50">
              <div className="text-lg font-bold text-neutral-500">No transactions recorded yet</div>
            </div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {pendingPlanChange && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={() => setPendingPlanChange(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-lg rounded-3xl border p-6 shadow-2xl ${isDarkMode ? 'border-neutral-800 bg-[#121212]' : 'border-neutral-200 bg-white'}`}
            >
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-[#F24C20]/10 p-3">
                  <Crown className="h-6 w-6 text-[#F24C20]" />
                </div>
                <div className="flex-1">
                  <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                    Confirm Plan Change
                  </h3>
                  <p className={`mt-3 text-sm leading-6 ${isDarkMode ? 'text-neutral-300' : 'text-neutral-600'}`}>
                    You already have an active subscription. If you switch to <span className="font-bold">{pendingPlanChange.planName}</span>, your current package benefits and remaining points or limits will be removed, and only the new plan points or limits will be updated.
                  </p>
                </div>
              </div>

              <div className={`mt-5 rounded-2xl border p-4 text-sm ${isDarkMode ? 'border-neutral-800 bg-neutral-900/80 text-neutral-400' : 'border-neutral-200 bg-neutral-50 text-neutral-600'}`}>
                This action replaces the existing package instead of adding both plans together.
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  onClick={() => setPendingPlanChange(null)}
                  className={`rounded-2xl px-5 py-3 font-bold transition-all ${isDarkMode ? 'border border-neutral-700 text-neutral-300 hover:bg-neutral-800' : 'border border-neutral-200 text-neutral-700 hover:bg-neutral-50'}`}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    const nextPlan = pendingPlanChange;
                    setPendingPlanChange(null);
                    if (nextPlan) {
                      await proceedPayWithWallet(nextPlan.planId, nextPlan.planName, nextPlan.planPrice);
                    }
                  }}
                  className="rounded-2xl bg-[#F24C20] px-5 py-3 font-bold text-white transition-all hover:bg-[#d4431b]"
                >
                  Continue Upgrade
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
