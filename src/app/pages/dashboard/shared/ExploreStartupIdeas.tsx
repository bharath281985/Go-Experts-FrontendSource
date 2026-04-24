import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Rocket, ShieldCheck, Lock, Coins, AlertTriangle, X, CheckCircle,
  Filter, ChevronRight, Info, TrendingUp, Target, DollarSign
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api, { getImgUrl } from '@/app/utils/api';
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
  const [viewingIdea, setViewingIdea] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    // Role guard: Only investors can browse other ideas
    const role = user.role || (user.roles && user.roles[0]);
    if (role !== 'investor') {
       toast.error("Access Restricted: Only Investors can browse the Startup Marketplace.");
       navigate(getDashboardPath());
       return;
    }

    fetchApprovedIdeas();
    fetchCategories();
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        // Fetch active subscription details
        const subRes = await api.get('/subscription/my-status'); 
        if (subRes.data.success) {
          setSubscription(subRes.data.subscription);
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
        const sortedCategories = [...res.data.data].sort((a: any, b: any) =>
          (a.name || '').localeCompare(b.name || '')
        );
        setCategories(sortedCategories);
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

  const getDashboardPath = () => {
    const role = user.role || (user.roles && user.roles[0]);
    if (role === 'investor') return '/dashboard-investor';
    if (role === 'startup_creator') return '/dashboard-startup';
    return '/dashboard';
  };

  const handleDeepDiveClick = (idea: any) => {
    // Robust check for ownership or existing unlock
    const creatorId = idea.creator?._id || idea.creator;
    const isOwner = creatorId === user?._id;
    const isUnlocked = idea.contacts?.some((c: any) => (c._id || c) === user._id) || idea.isUnlocked;

    if (isOwner || isUnlocked) {
      setViewingIdea(idea);
      window.scrollTo(0, 0);
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
        // Update local ideas state immediately
        const unlockedIdea = { 
          ...unlockingIdea, 
          contacts: [...(unlockingIdea.contacts || []), user._id] 
        };
        
        setIdeas(prev => prev.map(i => i._id === unlockingIdea._id ? unlockedIdea : i));
        setViewingIdea(unlockedIdea);
        window.scrollTo(0, 0);
        
        // Background refresh to stay in sync with server
        fetchApprovedIdeas();
        fetchSubscription(); 
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

  if (viewingIdea) {
    return (
       <StartupIdeaProfileView 
          idea={viewingIdea} 
          onBack={() => setViewingIdea(null)} 
          isDarkMode={isDarkMode}
          similarIdeas={ideas.filter(i => i.category === viewingIdea.category && i._id !== viewingIdea._id).slice(0, 3)}
       />
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-screen">
      {/* Mobile Header with Filter Toggle */}
      <div className="lg:hidden flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Venture Marketplace</h1>
          <p className="text-xs text-neutral-500">Discover disruptive startups</p>
        </div>
        <button 
          onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
          className={`p-3 rounded-2xl border flex items-center gap-2 ${isDarkMode ? 'bg-neutral-900 border-neutral-800 text-neutral-400' : 'bg-white border-neutral-200 text-neutral-600'}`}
        >
          <Filter className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Filters</span>
        </button>
      </div>

      {/* Filters Sidebar */}
      <aside className={`w-full lg:w-80 space-y-6 ${isMobileFiltersOpen ? 'block' : 'hidden lg:block'}`}>
        <div className={`p-6 rounded-[2rem] border ${isDarkMode ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-[#F24C20]" />
              <h2 className="font-bold">Advanced Filters</h2>
            </div>
            <button className="lg:hidden" onClick={() => setIsMobileFiltersOpen(false)}>
              <X className="w-5 h-5 text-neutral-500" />
            </button>
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
                    {subscription ? (subscription.remaining_idea_unlocks || 0) : '-'}
                 </span>
              </div>
           </div>
        </div>
        <div className={`xl:hidden flex items-center h-10 overflow-hidden relative border-y ${isDarkMode ? 'bg-neutral-900/50 border-neutral-800' : 'bg-neutral-50 border-neutral-100'}`}>
           <div className="absolute left-0 top-0 bottom-0 px-3 bg-[#F24C20] text-white flex items-center z-10 text-[8px] font-black uppercase tracking-tighter">
              PULSE
           </div>
           <div className="flex w-full overflow-hidden ml-14">
              <motion.div 
                animate={{ x: ["100%", "-200%"] }}
                transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
                className="flex items-center gap-8 whitespace-nowrap"
              >
                 {ideas.slice(0, 5).map((idea, i) => (
                   <div key={`mob-${idea._id || i}`} className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-[#F24C20]" />
                      <span className={`text-[10px] font-bold uppercase tracking-tight ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>{idea.title}</span>
                   </div>
                 ))}
              </motion.div>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 space-y-6">
        <header className="hidden lg:flex items-center justify-between mb-8 gap-6">
           <div className="flex-shrink-0">
              <h1 className="text-3xl font-black tracking-tight italic uppercase">Venture <span className="text-[#F24C20]">Marketplace</span></h1>
              <p className={`mt-1 text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>Discover disruptive disruptive startups</p>
           </div>
           
           {/* Dynamic Sliding Marquee */}
           <div className={`flex-1 overflow-hidden relative rounded-2xl border h-14 flex items-center ${isDarkMode ? 'bg-neutral-900/30 border-neutral-800' : 'bg-neutral-50 border-neutral-100'}`}>
              <div className="absolute left-0 top-0 bottom-0 px-3 bg-[#F24C20] text-white flex items-center z-10 skew-x-[-12deg] -ml-2">
                 <div className="skew-x-[12deg] flex items-center gap-2">
                    <Rocket className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-tighter">PULSE</span>
                 </div>
              </div>
              <div className="flex w-full overflow-hidden ml-16">
                 <motion.div 
                   animate={{ x: ["100%", "-200%"] }}
                   transition={{ 
                     repeat: Infinity, 
                     duration: 30, 
                     ease: "linear" 
                   }}
                   className="flex items-center gap-12 whitespace-nowrap"
                 >
                    {ideas.length > 0 ? ideas.slice(0, 5).map((idea, i) => (
                      <div key={idea._id || i} className="flex items-center gap-3">
                         <span className="w-1.5 h-1.5 rounded-full bg-[#F24C20]" />
                         <span className={`text-[11px] font-black uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>{idea.title}</span>
                         <span className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[8px] font-bold text-[#F24C20] uppercase">{idea.category}</span>
                      </div>
                    )) : (
                      <span className="text-xs text-neutral-500 font-bold uppercase tracking-widest">Awaiting new venture submissions...</span>
                    )}
                    {/* Duplicate for seamless loop if enough items */}
                    {ideas.length > 2 && ideas.slice(0, 5).map((idea, i) => (
                      <div key={`dup-${idea._id || i}`} className="flex items-center gap-3">
                         <span className="w-1.5 h-1.5 rounded-full bg-[#F24C20]" />
                         <span className={`text-[11px] font-black uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>{idea.title}</span>
                         <span className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[8px] font-bold text-[#F24C20] uppercase">{idea.category}</span>
                      </div>
                    ))}
                 </motion.div>
              </div>
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
              const creatorId = idea.creator?._id || idea.creator;
              const isOwner = creatorId === user?._id;
              const isUnlocked = idea.contacts?.some((c: any) => (c._id || c) === user._id) || idea.isUnlocked;
              
              const stats = [
                { label: 'Views', value: idea.views || '0', color: 'text-white' },
                { label: 'Saves', value: idea.saves || '0', color: 'text-rose-500' },
                { label: 'Contacts', value: idea.contacts?.length || '0', color: 'text-[#F24C20]' }
              ];

              return (
                <motion.div
                  key={idea._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`group relative flex flex-col rounded-[2.5rem] border transition-all duration-500 hover:shadow-2xl hover:shadow-[#F24C20]/10 ${
                    isDarkMode 
                    ? 'bg-[#0b0d14] border-white/10 hover:border-[#F24C20]/50 shadow-black' 
                    : 'bg-white border-gray-100 hover:bg-gray-50'
                  }`}
                >
                  {/* Card Aura Background */}
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#F24C20]/5 to-transparent rounded-b-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="p-8">
                      {/* Badge Row */}
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1.5 bg-[#F24C20] text-white text-[9px] font-black uppercase tracking-widest rounded-xl">
                            {idea.category}
                          </span>
                          {(isOwner || isUnlocked) && (
                            <span className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-500 text-[9px] font-black uppercase tracking-widest rounded-xl flex items-center gap-1.5 animate-in fade-in zoom-in duration-500">
                               <ShieldCheck className="w-3 h-3" />
                               {isOwner ? 'Your Venture' : 'Unlocked'}
                            </span>
                          )}
                          {!isOwner && !isUnlocked && (
                             <span className="px-3 py-1.5 bg-white/5 border border-white/10 text-slate-400 text-[9px] font-black uppercase tracking-widest rounded-xl">
                                {idea.stage || 'Market MVP'}
                             </span>
                          )}
                        </div>
                      <button className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors group/heart">
                        <Heart className="w-4 h-4 text-slate-500 group-hover/heart:text-rose-500 transition-colors" />
                      </button>
                    </div>

                    <h3 className="text-2xl font-black text-white mb-4 leading-tight tracking-tight group-hover:text-[#F24C20] transition-colors leading-relaxed line-clamp-2">
                      “{idea.title}”
                    </h3>
                    
                    <p className="text-sm text-slate-400 leading-relaxed line-clamp-2 mb-8 font-medium">
                      {idea.shortDescription}
                    </p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3 mb-8">
                       {stats.map((stat, i) => (
                         <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-4 text-center">
                            <div className={`text-lg font-black ${stat.color}`}>{stat.value}</div>
                            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{stat.label}</div>
                         </div>
                       ))}
                    </div>

                    {/* Specialist Badges */}
                    <div className="flex flex-wrap gap-2 mb-8">
                       {(idea.neededRoles || ['Product Designer', 'Growth Marketer', 'Industry Advisor']).slice(0, 3).map((role: string, i: number) => (
                         <span key={i} className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-xl text-[9px] font-black text-slate-300 uppercase tracking-tighter">
                            {role}
                         </span>
                       ))}
                    </div>
                  </div>

                  <div className="mt-auto p-8 pt-0 border-t border-white/5 bg-white/5">
                    <div className="flex items-center justify-between mt-6">
                       <div className="flex flex-col">
                          <span className="text-sm font-black text-white leading-none mb-1">{idea.creator?.full_name || 'Anonymous Founder'}</span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase">{idea.creator?.location || 'Bengaluru, India'} • <span className="text-emerald-500 italic lowercase tracking-tight">online now</span></span>
                       </div>
                       <button 
                          onClick={() => handleDeepDiveClick(idea)}
                          className="text-[11px] font-black text-[#F24C20] uppercase tracking-widest hover:translate-x-1 transition-transform flex items-center gap-2 group/btn"
                       >
                          Open Profile
                          <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                       </button>
                    </div>
                  </div>
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

function StartupIdeaProfileView({ idea, onBack, isDarkMode, similarIdeas }: any) {
  const [activeImage, setActiveImage] = useState(0);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState("overview");

  const images = React.useMemo(() => {
     if (idea.attachments?.length > 0) {
        return idea.attachments.map((a: string) => getImgUrl(a));
     }
     return [
       "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80",
       "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1400&q=80",
       "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=80",
       "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1400&q=80",
     ];
  }, [idea]);

  const milestones = [
    { title: "Context Validated", text: idea.problem || "Market problem has been identified and validated with target user segments." },
    { title: "Strategic Roadmap", text: idea.milestones || "Comprehensive development and scaling strategy is ready for implementation phase." },
    { title: "Resource Alignment", text: idea.useOfFunds || "Resource allocation and budget mapping completed for the next 18 months." },
  ];

  const stats = [
    { label: "Profile Views", value: idea.views || "1.2K" },
    { label: "Market Saves", value: idea.saves || "42" },
    { label: "Direct Leads", value: idea.contacts?.length || "8" },
    { label: "Ask", value: idea.fundingAmount || "Series A" },
  ];

  const tabContent = React.useMemo(() => {
    if (tab === "overview") {
      return (
        <div className="grid gap-6 lg:grid-cols-[1.3fr_.9fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <h3 className="text-lg font-semibold text-white">Venture Core & Opportunity</h3>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              {idea.detailedDescription || idea.shortDescription}
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-rose-500/20 bg-gradient-to-br from-rose-500/12 to-transparent p-4">
                <p className="text-sm font-semibold text-white">Target Ecosystem</p>
                <p className="mt-2 text-sm text-slate-300">{idea.targetAudience || "Broad Market Reach"}</p>
              </div>
              <div className="rounded-2xl border border-[#F24C20]/20 bg-gradient-to-br from-[#F24C20]/10 to-transparent p-4">
                <p className="text-sm font-semibold text-white">Business Intelligence</p>
                <p className="mt-2 text-sm text-slate-300">{idea.uniqueness || "Proprietary solution model with clear competitive advantages."}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#0b0d14] p-6 shadow-2xl shadow-black/20">
            <h3 className="text-lg font-semibold text-white">Venture Dossier</h3>
            <div className="mt-5 space-y-4 text-sm text-slate-300">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span>Stage</span>
                <span className="font-semibold text-white">{idea.stage || 'Market MVP'}</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span>Domain</span>
                <span className="font-semibold text-white">{idea.category}</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span>Location</span>
                <span className="font-semibold text-white">{idea.creator?.location || 'Bengaluru, India'}</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span>Legal Framework</span>
                <span className="font-semibold text-white">{idea.ndaRequired === 'Yes' ? 'NDA Enforced' : 'Public Domain'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Engagement</span>
                <span className="font-semibold text-white">Open for Inquiries</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (tab === "traction") {
      return (
        <div className="grid gap-5 md:grid-cols-3">
          {milestones.map((item) => (
            <div key={item.title} className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-[#F24C20]/40 hover:bg-white/8">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F24C20] to-orange-400 text-lg font-bold text-white">
                ✓
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{item.text}</p>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {(idea.neededRoles || ["Frontend Developer", "AI Engineer", "Angel Investor", "Marketing Partner"]).map((role: string) => (
          <div key={role} className="group rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition duration-300 hover:border-[#F24C20]/40 hover:bg-gradient-to-br hover:from-[#F24C20]/10 hover:to-transparent">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white transition duration-300 group-hover:bg-[#F24C20]/20 text-xs font-black uppercase tracking-widest">Team</div>
            <h3 className="mt-4 text-base font-semibold text-white">{role}</h3>
            <p className="mt-2 text-sm leading-7 text-slate-400 line-clamp-3">Actively seeking strategic collaboration to scale core concept pillars and launch first market pilot.</p>
          </div>
        ))}
      </div>
    );
  }, [tab, idea]);

  return (
    <div className={`pt-4 pb-20 overflow-hidden relative ${isDarkMode ? 'bg-[#030712]' : 'bg-gray-50'}`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-0 top-0 h-[40rem] w-[40rem] rounded-full bg-[#F24C20]/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[30rem] w-[30rem] rounded-full bg-orange-500/5 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-5 rounded-[2.5rem] border border-white/10 bg-white/5 px-8 py-6 backdrop-blur-3xl md:flex-row md:items-center md:justify-between shadow-2xl">
          <div className="flex items-center gap-6">
            <button 
              onClick={onBack}
              className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-[#F24C20] hover:text-white transition-all group"
            >
               <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#F24C20] mb-0.5">Venture Intelligence</p>
              <h1 className="text-2xl font-black text-white">{idea.title}</h1>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSaved((v) => !v)}
              className={`rounded-2xl px-6 py-3.5 text-xs font-black uppercase tracking-widest transition duration-300 flex items-center gap-2 ${
                saved
                  ? "bg-white text-slate-900 shadow-xl"
                  : "border border-white/10 bg-white/5 text-white hover:border-[#F24C20]/50 hover:bg-white/10"
              }`}
            >
              <Heart className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
              {saved ? "Concept Saved" : "Save Concept"}
            </button>
            <button className="group relative overflow-hidden rounded-2xl bg-[#F24C20] px-8 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-[#F24C20]/30 transition hover:scale-[1.02] active:scale-95">
              <span className="relative">Contact Founder</span>
            </button>
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
          <div className="overflow-hidden rounded-[3rem] border border-white/10 bg-black/40 backdrop-blur-3xl shadow-2xl">
            <div className="relative h-[25rem] md:h-[35rem]">
              <motion.img
                key={activeImage}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                src={images[activeImage]}
                alt="Startup idea visual"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                <div className="mb-6 flex flex-wrap gap-2 text-white">
                  <div className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[9px] font-black uppercase tracking-widest backdrop-blur-md">Verified Pitch</div>
                  <div className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest text-emerald-400 backdrop-blur-md">Open for Team</div>
                  <div className="px-3 py-1 rounded-full bg-[#F24C20]/20 border border-[#F24C20]/20 text-[9px] font-black uppercase tracking-widest text-[#F24C20] backdrop-blur-md">Investor Access</div>
                </div>
                <h2 className="text-3xl font-black leading-tight text-white md:text-5xl lg:text-6xl tracking-tighter uppercase line-clamp-3">
                  {idea.title} — {idea.shortDescription}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 p-6 bg-white/5 border-t border-white/10">
              {images.map((img: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(index)}
                  className={`overflow-hidden rounded-2xl border-2 transition-all ${
                    activeImage === index ? "border-[#F24C20]" : "border-transparent opacity-50 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${index + 1}`} className="h-20 w-full object-cover md:h-28" />
                </button>
              ))}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[3rem] border border-white/10 bg-[#0b0d14] p-8 backdrop-blur-3xl shadow-2xl">
              <div className="flex items-center gap-5">
                <div className="relative">
                   {idea.creator?.profile_image ? (
                        <img src={getImgUrl(idea.creator.profile_image)} className="w-16 h-16 rounded-3xl object-cover border border-[#F24C20]/30 shadow-xl shadow-[#F24C20]/10" />
                   ) : (
                        <div className="w-16 h-16 rounded-3xl bg-neutral-900 border border-white/10 flex items-center justify-center text-2xl font-black text-[#F24C20]">
                             {idea.creator?.full_name?.charAt(0)}
                        </div>
                   )}
                   <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-neutral-900 shadow-lg" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white uppercase">{idea.creator?.full_name || 'Anonymous Founder'}</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Market Opportunity Creator</p>
                  <div className="flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                     <span className="text-[9px] font-black text-emerald-400 uppercase">Trusted Founder</span>
                  </div>
                </div>
              </div>
              <p className="mt-8 text-sm leading-7 text-slate-400">
                Building a validated venture targeting high-growth {idea.category} sectors. Dedicated to engineering a scalable solution model for the modern digital economy.
              </p>
              <div className="mt-8 flex flex-wrap gap-2">
                {(idea.tags || ["AI", "Innovation", "Global Scale"]).map((tag: string) => (
                  <span key={tag} className="px-3 py-1.5 rounded-xl border border-white/5 bg-white/5 text-[9px] font-black uppercase tracking-widest text-[#F24C20]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {stats.map((item) => (
                <div key={item.label} className="rounded-[2rem] border border-white/10 bg-black/40 p-6 backdrop-blur-3xl transition-all hover:bg-white/5 group">
                  <p className="text-2xl font-black text-white group-hover:text-[#F24C20] transition-colors">{item.value}</p>
                  <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="mt-10 rounded-[3rem] border border-white/10 bg-black/40 p-8 md:p-12 backdrop-blur-3xl shadow-2xl">
          <SectionTitle
            eyebrow="Market Deep Dive"
            title="Strategic Architecture & Roadmap"
            desc="Explore the internal mechanics, traction metrics, and collaboration requirements for this verified venture concept."
          />

          <div className="flex flex-wrap gap-3 mt-8">
            {[
              ["overview", "Intelligence Overview"],
              ["traction", "Traction & Scale"],
              ["collaboration", "Talent Required"],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`rounded-2xl px-8 py-3.5 text-[10px] font-black uppercase tracking-widest transition-all ${
                  tab === key
                    ? "bg-[#F24C20] text-white shadow-xl shadow-[#F24C20]/20"
                    : "border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mt-10">{tabContent}</div>
        </section>

        <section className="mt-20">
          <SectionTitle
            eyebrow="Related Opportunities"
            title={`More From ${idea.category}`}
            desc="Discover other high-potential ventures in the same ecosystem currently seeking investment and talent."
          />

          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3 mt-10">
            {similarIdeas.map((item: any, idx: number) => (
              <div key={idx} className="group overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0b0d14] backdrop-blur-3xl transition-all duration-500 hover:-translate-y-2 hover:border-[#F24C20]/40 shadow-xl shadow-black/40">
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={item.attachments?.[0] ? (item.attachments[0].startsWith('http') ? item.attachments[0] : `${import.meta.env.VITE_API_URL}${item.attachments[0]}`) : "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80"} 
                    alt={item.title} 
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-transparent" />
                  <span className="absolute left-6 top-6 rounded-xl bg-black/60 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-[#F24C20] backdrop-blur-xl border border-white/10">
                    {item.category}
                  </span>
                </div>
                <div className="p-8">
                  <h3 className="text-xl font-black text-white group-hover:text-[#F24C20] transition-colors mb-4 truncate">{item.title}</h3>
                  <p className="text-xs leading-6 text-slate-400 line-clamp-2 font-medium mb-8">{item.shortDescription}</p>
                  <div className="flex gap-4">
                    <button className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-4 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-[#F24C20] hover:border-[#F24C20]">Review</button>
                    <button className="flex items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-neutral-800"><Heart className="w-4 h-4 text-slate-400" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function SectionTitle({ eyebrow, title, desc }: any) {
  return (
    <div className="mb-6 px-2">
      <p className="mb-3 text-[10px] font-black uppercase tracking-[0.3em] text-[#F24C20]">{eyebrow}</p>
      <h2 className="text-3xl font-black text-white md:text-5xl tracking-tighter uppercase">{title}</h2>
      {desc ? <p className="mt-6 max-w-3xl text-sm lg:text-base font-medium leading-relaxed text-slate-400">{desc}</p> : null}
    </div>
  );
}

const Heart = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

const ArrowLeft = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19-7-7 7-7M19 12H5" />
  </svg>
);


const ArrowRight = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14m-7-7 7 7-7 7" />
  </svg>
);
