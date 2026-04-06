import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Rocket, ShieldCheck, Lock, Coins, AlertTriangle, X, CheckCircle,
  Filter, ChevronRight, Info, TrendingUp, Target, DollarSign
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '@/app/utils/api';
import { useTheme } from '@/app/components/ThemeProvider';
import { toast } from 'sonner';

export default function ExploreStartupIdeas() {
  const [ideas, setIdeas] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [budgetRange, setBudgetRange] = useState<string>('All');
  const [unlockingIdea, setUnlockingIdea] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchApprovedIdeas();
    fetchCategories();
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        // Fetch active subscription details
        const subRes = await api.get('/subscription/my-plan'); // Assuming this endpoint exists or similar
        if (subRes.data.success) {
          setSubscription(subRes.data.data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch subscription:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/startup-categories');
      if (res.data.success) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchApprovedIdeas = async () => {
    try {
      setLoading(true);
      const res = await api.get('/startup-ideas');
      if (res.data.success) {
        const approved = res.data.data.filter((i: any) => i.status === 'approved');
        setIdeas(approved);
      }
    } catch (err) {
      console.error('Failed to fetch ideas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeepDiveClick = (idea: any) => {
    if (idea.contacts?.includes(user._id)) {
      navigate(`/dashboard/startup-ideas/${idea._id}`);
      return;
    }
    setUnlockingIdea(idea);
  };

  const handleUnlockConfirm = async () => {
    if (!unlockingIdea) return;
    try {
      setIsProcessing(true);
      const res = await api.post(`/startup-ideas/${unlockingIdea._id}/unlock`);
      if (res.data.success) {
        toast.success(res.data.message);
        // Refresh concepts to show unlocked state
        fetchApprovedIdeas();
        fetchSubscription(); // Update limits
        navigate(`/dashboard/startup-ideas/${unlockingIdea._id}`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to unlock concept');
    } finally {
      setIsProcessing(false);
      setUnlockingIdea(null);
    }
  };

  const filteredIdeas = ideas.filter(idea => {
    const matchesSearch = idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         idea.shortDescription.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || 
                           idea.category?.trim().toLowerCase() === selectedCategory?.trim().toLowerCase();
    
    const matchesBudget = budgetRange === 'All' || idea.fundingAmount === budgetRange;
                           
    return matchesSearch && matchesCategory && matchesBudget;
  });

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-screen">
      {/* Filters Sidebar */}
      <aside className="w-full lg:w-80 space-y-6">
        <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white border-neutral-200'}`}>
          <div className="flex items-center gap-2 mb-6">
            <Filter className="w-5 h-5 text-[#F24C20]" />
            <h2 className="font-bold">Advanced Filters</h2>
          </div>

          <div className="space-y-6">
            {/* Search */}
            <div>
              <label className="text-xs font-bold text-neutral-500 uppercase mb-2 block tracking-wider">Search Ideas</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input 
                  type="text"
                  placeholder="Keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 text-sm rounded-xl border outline-none focus:border-[#F24C20]/50 ${
                    isDarkMode ? 'bg-neutral-800/50 border-neutral-700 text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-900'
                  }`}
                />
              </div>
            </div>

            {/* Categories */}
            <div>
              <label className="text-xs font-bold text-neutral-500 uppercase mb-3 block tracking-wider">Concept Categories</label>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory('All')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                    selectedCategory === 'All' 
                    ? 'bg-[#F24C20]/10 text-[#F24C20] font-bold' 
                    : isDarkMode ? 'text-neutral-400 hover:bg-white/5' : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  All Categories
                  {selectedCategory === 'All' && <CheckCircle className="w-4 h-4" />}
                </button>
                {categories.map(cat => (
                  <button
                    key={cat._id}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                      selectedCategory === cat.name 
                      ? 'bg-[#F24C20]/10 text-[#F24C20] font-bold' 
                      : isDarkMode ? 'text-neutral-400 hover:bg-white/5' : 'text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    {cat.name}
                    {selectedCategory === cat.name && <CheckCircle className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Funding Ranges */}
            <div>
              <label className="text-xs font-bold text-neutral-500 uppercase mb-3 block tracking-wider">Funding Goal</label>
              <div className="grid grid-cols-1 gap-2">
                {['All', '₹0 - ₹10L', '₹10L - ₹50L', '₹50L - ₹1Cr', '₹1Cr+'].map(range => (
                  <button
                    key={range}
                    onClick={() => setBudgetRange(range)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                      budgetRange === range 
                      ? 'bg-[#F24C20]/10 text-[#F24C20] font-bold border border-[#F24C20]/20' 
                      : isDarkMode ? 'text-neutral-400 border border-transparent hover:bg-white/5' : 'text-neutral-600 border border-transparent hover:bg-neutral-100'
                    }`}
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    {range}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Subscription Info Card */}
        <div className={`p-6 rounded-2xl border overflow-hidden relative ${isDarkMode ? 'bg-[#F24C20]/10 border-[#F24C20]/20' : 'bg-orange-50 border-orange-100'}`}>
           <div className="relative z-10">
              <h3 className="font-bold mb-1 text-neutral-900 border-b border-orange-200 pb-2 flex items-center justify-between">
                 <span>Plan Limits</span>
                 <Coins className="w-4 h-4 text-[#F24C20]" />
              </h3>
              <p className="text-xs text-neutral-500 mt-2">Deduction occurs only upon detailed unlocking.</p>
              
              <div className="mt-4 flex items-center justify-between">
                 <span className="text-sm font-medium">Remaining Unlocks:</span>
                 <span className="text-lg font-black text-[#F24C20]">
                    {subscription ? (subscription.unlock_limit - (subscription.unlock_count || 0)) : '-'}
                 </span>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 space-y-6">
        <header className="flex items-center justify-between mb-8">
           <div>
              <h1 className="text-3xl font-black tracking-tight">Venture Marketplace</h1>
              <p className={`mt-1 ${isDarkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>Discover disruptive startups curated by Go Experts</p>
           </div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`h-80 rounded-2xl animate-pulse ${isDarkMode ? 'bg-neutral-900' : 'bg-neutral-200'}`} />
            ))}
          </div>
        ) : filteredIdeas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredIdeas.map((idea, idx) => {
              const isUnlocked = idea.contacts?.includes(user._id);
              return (
                <motion.div
                  key={idea._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`group relative flex flex-col p-6 rounded-2xl border transition-all duration-300 ${
                    isDarkMode 
                    ? 'bg-neutral-900/40 border-neutral-800 hover:border-[#F24C20]/50' 
                    : 'bg-white border-neutral-200 hover:border-[#F24C20]/30 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2 py-0.5 bg-[#F24C20]/10 text-[#F24C20] text-[10px] font-black uppercase tracking-widest rounded">
                      {idea.category}
                    </span>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified Concept
                    </div>
                  </div>

                  <h3 className="text-xl font-bold mb-3 leading-tight group-hover:text-[#F24C20] transition-colors">
                    {idea.title}
                  </h3>
                  
                  <p className={`text-sm leading-relaxed line-clamp-2 mb-6 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                    {idea.shortDescription}
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-neutral-800/50 border-neutral-700' : 'bg-neutral-50 border-neutral-100'}`}>
                      <div className="text-[10px] font-bold text-neutral-500 uppercase mb-1 flex items-center gap-1">
                         <Target className="w-3 h-3" /> Target
                      </div>
                      <div className="text-xs font-bold line-clamp-1">{idea.targetAudience || 'B2B SMBs'}</div>
                    </div>
                    <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-neutral-800/50 border-neutral-700' : 'bg-neutral-50 border-neutral-100'}`}>
                      <div className="text-[10px] font-bold text-neutral-500 uppercase mb-1 flex items-center gap-1">
                         <TrendingUp className="w-3 h-3" /> Funding
                      </div>
                      <div className="text-xs font-bold text-[#F24C20]">{idea.fundingAmount || 'Seed Round'}</div>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleDeepDiveClick(idea)}
                    className={`mt-auto flex items-center justify-center gap-3 w-full py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 ${
                        isUnlocked 
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/10' 
                        : 'bg-[#F24C20] hover:bg-orange-600 text-white shadow-[#F24C20]/10'
                    }`}
                  >
                    {isUnlocked ? 'Concept Unlocked' : 'Access Analytics'}
                    {isUnlocked ? <CheckCircle className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  </button>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className={`text-center py-32 rounded-3xl border border-dashed ${isDarkMode ? 'border-neutral-800 bg-neutral-900/20' : 'border-neutral-200 bg-neutral-50/50'}`}>
              <div className="w-16 h-16 bg-[#F24C20]/5 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-8 h-8 text-neutral-500" />
              </div>
              <h2 className="text-xl font-bold mb-1">No concepts matching criteria</h2>
              <p className="text-neutral-500 text-sm">Update your left-side filters or try a different keyword.</p>
          </div>
        )}
      </main>

      {/* Unlock Confirmation Modal */}
      <AnimatePresence>
        {unlockingIdea && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setUnlockingIdea(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`relative w-full max-w-md overflow-hidden rounded-[32px] border shadow-2xl p-8 ${
                isDarkMode ? 'bg-[#0b0d14] border-neutral-800 shadow-black' : 'bg-white border-neutral-100'
              }`}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="p-3 bg-orange-500/10 rounded-xl">
                    <Coins className="w-6 h-6 text-orange-500" />
                </div>
                <button 
                    onClick={() => setUnlockingIdea(null)}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                    <X className="w-5 h-5 text-neutral-500" />
                </button>
              </div>

              <h2 className="text-2xl font-black mb-4 leading-tight">Venture Access Required</h2>
              <p className={`text-sm leading-relaxed mb-8 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                To access the full concept deep dive for <span className="font-bold text-[#F24C20]">"{unlockingIdea.title}"</span>, 1 credit will be deducted from your subscription balance.
              </p>

              <div className="space-y-4">
                <button
                  onClick={handleUnlockConfirm}
                  disabled={isProcessing}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-[#F24C20] text-white rounded-xl font-bold shadow-xl shadow-orange-500/20 hover:bg-orange-600 transition-all disabled:opacity-50"
                >
                  {isProcessing ? 'Verifying Plan...' : 'Unlock Concept (1 Credit)'}
                  {!isProcessing && <ArrowRight className="w-4 h-4 pointer-events-none" />}
                </button>
                
                <button
                  onClick={() => setUnlockingIdea(null)}
                  className={`w-full py-4 rounded-xl font-bold transition-all border ${
                    isDarkMode ? 'border-neutral-800 text-neutral-400 hover:bg-white/5' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  Maybe Later
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const ArrowRight = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14m-7-7 7 7-7 7" />
  </svg>
);
