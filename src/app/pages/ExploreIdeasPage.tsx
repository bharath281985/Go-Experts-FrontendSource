import React, { useState, useEffect } from 'react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Rocket, Target, Users, ArrowRight, TrendingUp, Filter, 
  ShieldCheck, Mail, Lock, Coins, AlertTriangle, X, CheckCircle 
} from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '@/app/utils/api';
import { useTheme } from '@/app/components/ThemeProvider';
import { toast } from 'sonner';

export default function ExploreIdeasPage() {
  const [ideas, setIdeas] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || 'All');
  const [unlockingIdea, setUnlockingIdea] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  const isLoggedIn = !!localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchApprovedIdeas();
    fetchCategories();
  }, []);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

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
    if (!isLoggedIn) {
      toast.error('Please sign in to unlock deep dive analytics');
      navigate('/signin');
      return;
    }

    if (idea.contacts?.includes(user._id)) {
      navigate(`/explore-ideas/${idea._id}`);
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
        
        const updatedUser = { ...user, total_points: res.data.remainingPoints };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        navigate(`/explore-ideas/${unlockingIdea._id}`);
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
                         idea.category?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || 
                           idea.category?.trim().toLowerCase() === selectedCategory?.trim().toLowerCase();
                           
    return matchesSearch && matchesCategory;
  });

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-[#05060a] text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Header />
      
      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F24C20]/10 border border-[#F24C20]/20 text-[#F24C20] text-sm font-bold uppercase tracking-widest mb-6"
            >
              <Rocket className="w-4 h-4" />
              Innovation Hub
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-6xl font-black mb-6 tracking-tight"
            >
              Explore <span className="text-[#F24C20]">Startup Ideas</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed"
            >
              Discover groundbreaking concepts, disruptive technologies, and investment-ready ventures approved by the Go Experts network.
            </motion.p>
          </div>

          {/* Search & Filter */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="relative group mb-8">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-500 group-focus-within:text-[#F24C20] transition-colors" />
              <input 
                type="text" 
                placeholder="Search innovative concepts, tech stacks, or market gaps..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-16 pr-8 py-5 rounded-[2rem] border transition-all outline-none text-lg ${
                    isDarkMode 
                    ? 'bg-white/5 border-white/10 focus:border-[#F24C20]/50 text-white shadow-2xl' 
                    : 'bg-white border-gray-200 focus:border-[#F24C20] text-gray-900 shadow-xl'
                }`}
              />
            </div>
            
            {/* Category Tabs */}
            <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide no-scrollbar">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`px-6 py-3 rounded-full font-bold whitespace-nowrap border transition-all ${
                  selectedCategory === 'All'
                    ? 'bg-[#F24C20] text-white border-[#F24C20] shadow-lg shadow-[#F24C20]/20'
                    : isDarkMode ? 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10' : 'bg-white text-slate-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                All Concepts
              </button>
              {categories.map((cat: any) => (
                <button
                  key={cat._id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-6 py-3 rounded-full font-bold whitespace-nowrap border transition-all ${
                    selectedCategory === cat.name
                      ? 'bg-[#F24C20] text-white border-[#F24C20] shadow-lg shadow-[#F24C20]/20'
                      : isDarkMode ? 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10' : 'bg-white text-slate-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Ideas Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className={`h-[450px] rounded-[32px] animate-pulse ${isDarkMode ? 'bg-white/5' : 'bg-gray-200'}`} />
              ))}
            </div>
          ) : filteredIdeas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredIdeas.map((idea, idx) => {
                const isOwner = idea.creator?._id === user._id || idea.creator === user._id;
                const isUnlocked = isOwner || idea.contacts?.includes(user._id);
                return (
                  <motion.div
                    key={idea._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`group relative flex flex-col rounded-[32px] border transition-all duration-500 overflow-hidden h-[500px] ${
                      isDarkMode 
                      ? 'bg-[#0b0d14] border-white/10 hover:border-[#F24C20]/50' 
                      : 'bg-white border-gray-200 hover:border-[#F24C20]/30 shadow-sm'
                    }`}
                  >
                    <div className="p-8 pb-0">
                      <div className="flex items-center justify-between mb-4">
                        <span className="px-3 py-1 bg-[#F24C20]/10 text-[#F24C20] text-[10px] font-black uppercase tracking-widest rounded-lg">
                          {idea.category}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 uppercase">
                          <ShieldCheck className="w-3.5 h-3.5" /> Approved
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold mb-4 line-clamp-2 leading-tight group-hover:text-[#F24C20] transition-colors">
                        {idea.title}
                      </h3>
                      <p className="text-slate-400 text-sm leading-relaxed line-clamp-3 mb-6">
                        {idea.shortDescription}
                      </p>
                    </div>

                    <div className="mt-auto p-8 pt-0">
                      <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                          <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Target</div>
                          <div className="text-xs font-bold line-clamp-1">{idea.targetAudience || 'General'}</div>
                        </div>
                        <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                          <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Funding</div>
                          <div className="text-xs font-bold text-[#F24C20]">{idea.fundingAmount || 'Seed'}</div>
                        </div>
                      </div>

                      <button 
                        onClick={() => handleDeepDiveClick(idea)}
                        className={`flex items-center justify-center gap-3 w-full py-4 rounded-2xl font-bold transition-all shadow-lg active:scale-95 ${
                            isUnlocked 
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20' 
                            : 'bg-[#F24C20] hover:bg-orange-600 text-white shadow-[#F24C20]/20'
                        }`}
                      >
                        {isUnlocked ? (isOwner ? 'View Analytics' : 'Concept Unlocked') : 'View Deep Dive'}
                        {isUnlocked ? <CheckCircle className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-40">
                <div className="w-20 h-20 bg-slate-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="w-8 h-8 text-slate-500" />
                </div>
                <h2 className="text-2xl font-bold mb-2">No concepts found</h2>
                <p className="text-slate-500">Try adjusting your search terms or filters.</p>
            </div>
          )}
        </div>
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
              className={`relative w-full max-w-md overflow-hidden rounded-[40px] border shadow-2xl p-8 lg:p-10 ${
                isDarkMode ? 'bg-[#0b0d14] border-white/10 shadow-black' : 'bg-white border-gray-100'
              }`}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="p-3 bg-orange-500/10 rounded-2xl">
                    <Coins className="w-6 h-6 text-orange-500" />
                </div>
                <button 
                    onClick={() => setUnlockingIdea(null)}
                    className="p-2 hover:bg-white/5 rounded-xl transition-colors"
                >
                    <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <h2 className="text-2xl font-black mb-4 leading-tight">Unlock Exclusive Analytics</h2>
              <p className="text-slate-400 text-sm leading-7 mb-8">
                To access the full concept deep dive, market strategy, and founder roadmap for <span className="text-white font-bold">"{unlockingIdea.title}"</span>, a one-time fee of <span className="text-orange-500 font-black">20 Credit Points</span> will be debited from your account.
              </p>

              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-[#F24C20]/5 border border-[#F24C20]/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="w-4 h-4 text-[#F24C20]" />
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Your Balance:</span>
                    </div>
                    <span className="text-lg font-black text-white">{user.total_points || 0} PTS</span>
                </div>

                <button
                  onClick={handleUnlockConfirm}
                  disabled={isProcessing}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-[#F24C20] text-white rounded-2xl font-bold shadow-xl shadow-orange-500/20 hover:bg-orange-600 transition-all disabled:opacity-50"
                >
                  {isProcessing ? 'Processing Transaction...' : 'Confirm Unlock (20 PTS)'}
                  {!isProcessing && <ArrowRight className="w-4 h-4" />}
                </button>
                
                <button
                  onClick={() => setUnlockingIdea(null)}
                  className="w-full py-4 rounded-2xl border border-white/10 bg-white/5 text-white font-bold hover:bg-white/10 transition-all"
                >
                  Maybe Later
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
