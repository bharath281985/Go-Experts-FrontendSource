import React, { useState, useEffect, useMemo } from 'react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Rocket, Target, Users, ArrowRight, TrendingUp, Filter, 
  ShieldCheck, Mail, Lock, Coins, AlertTriangle, X, CheckCircle, DollarSign, Heart, ChevronRight
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
  const [viewingIdea, setViewingIdea] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { isDarkMode } = false;
  const navigate = useNavigate();
  const getCategoryName = (idea: any) => {
    if (!idea?.category) return '';
    if (typeof idea.category === 'string') return idea.category;
    return idea.category.name || '';
  };

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
    // Allow anyone to view idea details freely — unlock is only required for contact/scheduling actions
    setViewingIdea(idea);
    window.scrollTo(0, 0);
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
        
        // Update local ideas state so it doesn't prompt for unlock again
        const unlockedIdea = { 
          ...unlockingIdea, 
          contacts: [...(unlockingIdea.contacts || []), user._id] 
        };
        
        setIdeas(prev => prev.map(i => i._id === unlockingIdea._id ? unlockedIdea : i));
        setViewingIdea(unlockedIdea);
        window.scrollTo(0, 0);
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
                         getCategoryName(idea).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' ||
                           getCategoryName(idea).trim().toLowerCase() === selectedCategory?.trim().toLowerCase();
                           
    const creatorId = idea.creator?._id || idea.creator;
    const isOwner = creatorId === user?._id;
                           
    return matchesSearch && matchesCategory && !isOwner;
  });

  if (viewingIdea) {
     return (
<div className="min-h-screen transition-colors duration-500 bg-gray-50 text-gray-900">
           <Header />
         <StartupIdeaProfileView 
            idea={viewingIdea} 
            onBack={() => setViewingIdea(null)} 
            // isDarkMode={isDarkMode}
            onRequestUnlock={setUnlockingIdea}
            similarIdeas={ideas.filter(i => getCategoryName(i) === getCategoryName(viewingIdea) && i._id !== viewingIdea._id).slice(0, 3)}
         />
         <Footer />
       </div>
     );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 'bg-background text-foreground`}>
      <Header />
      
      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Hero Section */}
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center mb-20 lg:mb-32">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-left"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F24C20]/10 border border-[#F24C20]/20 text-[#F24C20] text-[10px] font-black uppercase tracking-[0.2em] mb-8">
                <Rocket className="w-3.5 h-3.5" />
                Venture Ecosystem
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-7xl font-black mb-8 tracking-tighter leading-[1.05] uppercase">
                Explore <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F24C20] to-orange-400">Startup Ideas</span>
              </h1>
              <p className={`text-base lg:text-lg max-w-lg leading-relaxed mb-10 font-medium text-[#6f7f9a]`}>
                Sift through high-potential concepts and disruptive technologies curated and validated by the Go Experts network.
              </p>
              
              <div className="flex items-center gap-8">
                  <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDarkMode ? 'border border-white/10 bg-white/5' : 'border border-[#f2d7c2] bg-white'}`}>
                          <TrendingUp className="w-4 h-4 text-[#F24C20]" />
                      </div>
                      <div>
                          <div className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-[#7a5a49]'}`}>Active Pitches</div>
                          <div className={`text-sm font-bold text-[#1f120d]`}>{ideas.length}+ Verified</div>
                      </div>
                  </div>
                  <div className={`w-px h-8 ${isDarkMode ? 'bg-neutral-800' : 'bg-[#f2d7c2]'}`} />
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#F24C20]">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F24C20]"></span>
                      </span>
                      Live Market Pulse
                  </div>
              </div>
            </motion.div>

            {/* Premium Spotlight Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, x: 30 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="relative hidden lg:block"
            >
               {/* Ambient Sophisticated Glow */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-gradient-to-tr from-[#F24C20]/10 to-transparent blur-[120px] rounded-full opacity-60 pointer-events-none" />
               
               <div className="relative h-[550px] w-full max-w-[440px] mx-auto group">
                  {ideas.length > 0 ? (
                    <motion.div
                      className={`relative flex flex-col rounded-[3rem] border backdrop-blur-3xl transition-all duration-700 overflow-hidden h-full shadow-[0_32px_64px_-16px_rgba(0,0,0,0.25)] ${
                        isDarkMode ? 'bg-black/40 border-white/10' : 'bg-white border-[#f2d7c2]'
                      }`}
                    >
                       {/* Subtle Shine Overlay */}
                       <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                       
                       <div className="p-10 pb-0 relative z-10">
                          <div className="flex items-center justify-between mb-10">
                             <div className={`px-4 py-1.5 text-[#F24C20] text-[9px] font-black uppercase tracking-[0.2em] rounded-full ${isDarkMode ? 'bg-neutral-900 border border-white/10' : 'bg-[#fff7ef] border border-[#f2d7c2]'}`}>
                                Spotlight Submission
                             </div>
                             <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                <CheckCircle className="w-3 h-3 text-emerald-400" />
                                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Verified</span>
                             </div>
                          </div>
                          
                          <h3 className={`text-3xl lg:text-4xl font-black mb-8 leading-[1.1] tracking-tight group-hover:text-[#F24C20] transition-colors duration-500 line-clamp-2 ${isDarkMode ? 'text-white' : 'text-[#F24C20]'}`}>
                             {ideas[0]?.title}
                          </h3>
                          
                          <p className={`text-sm lg:text-base leading-relaxed line-clamp-5 font-medium opacity-90 ${isDarkMode ? 'text-slate-400' : 'text-[#91a4c5]'}`}>
                             {ideas[0]?.shortDescription}
                          </p>
                       </div>

                       <div className="mt-auto p-10 pt-0 relative z-10">
                          <div className="flex flex-wrap gap-2 mb-8">
                             <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'bg-white/5 border border-white/10 text-slate-400' : 'bg-[#fff7ef] border border-[#f2d7c2] text-[#6f7f9a]'}`}>{getCategoryName(ideas[0])}</span>
                             <span className={`px-3 py-1 rounded-lg text-[10px] font-bold text-[#F24C20] uppercase tracking-widest flex items-center gap-1.5 ${isDarkMode ? 'bg-white/5 border border-white/10' : 'bg-[#fff7ef] border border-[#f2d7c2]'}`}>
                                <DollarSign className="w-3 h-3" /> {ideas[0]?.fundingAmount || 'Series A'}
                             </span>
                          </div>

                          <button 
                            onClick={() => handleDeepDiveClick(ideas[0])}
                            className="group/btn relative flex items-center justify-center gap-4 w-full py-5 bg-[#F24C20] text-white rounded-[1.75rem] font-black shadow-2xl shadow-[#F24C20]/30 hover:bg-orange-600 transition-all text-xs uppercase tracking-[0.2em] overflow-hidden"
                          >
                             <span className="relative z-10">Secure Data Access</span>
                             <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform duration-500" />
                          </button>
                       </div>
                    </motion.div>
                  ) : (
                    <div className={`h-full rounded-[3rem] border-2 border-dashed flex flex-col items-center justify-center p-12 text-center ${isDarkMode ? 'border-neutral-800 bg-black/40' : 'border-[#f2d7c2] bg-white/70'}`}>
                       <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-6 animate-pulse ${isDarkMode ? 'bg-neutral-900 border border-white/5' : 'bg-white border border-[#f2d7c2]'}`}>
                          <Rocket className={`w-8 h-8 ${isDarkMode ? 'text-neutral-700' : 'text-[#f4c7ae]'}`} />
                       </div>
                       <p className={`text-sm font-bold uppercase tracking-widest ${isDarkMode ? 'text-neutral-500' : 'text-[#7a5a49]'}`}>Awaiting Live Feed...</p>
                    </div>
                  )}
               </div>
            </motion.div>
          </div>

          {/* Search & Filter */}
          <div className="max-w-4xl mx-auto mb-10 lg:mb-16">
            <div className="relative group mb-6 lg:mb-8">
              <Search className="absolute left-5 lg:left-6 top-1/2 -translate-y-1/2 w-5 h-5 lg:w-6 lg:h-6 text-slate-500 group-focus-within:text-[#F24C20] transition-colors" />
              <input 
                type="text" 
                placeholder="Search innovative concepts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-14 lg:pl-16 pr-6 lg:pr-8 py-4 lg:py-5 rounded-2xl lg:rounded-[2rem] border transition-all outline-none text-base lg:text-lg ${
                    isDarkMode 
                    ? 'bg-neutral-900 border-neutral-800 focus:border-[#F24C20]/50 text-white shadow-2xl' 
                    : 'bg-white border-[#f2d7c2] focus:border-[#F24C20] text-gray-900 shadow-xl placeholder:text-[#8b6b5a]'
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className={`h-[400px] lg:h-[450px] rounded-[32px] animate-pulse ${isDarkMode ? 'bg-white/5' : 'bg-gray-200'}`} />
              ))}
            </div>
          ) : filteredIdeas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {filteredIdeas.map((idea, idx) => {
                const creatorId = idea.creator?._id || idea.creator;
                const isOwner = creatorId === user?._id;
                const isUnlocked = idea.contacts?.some((c: any) => (c._id || c) === user._id) || idea.isUnlocked;
                return (
                  <motion.div
                    key={idea._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                   className="bg-white border-[#f2d7c2]"
                  >
                    {/* Subtle Red/Orange Aura Border (on hover) */}
                    <div className="absolute inset-0 border border-[#F24C20]/0 group-hover:border-[#F24C20]/20 rounded-[2.5rem] transition-all pointer-events-none" />

                    <div className="p-8 pb-0">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex flex-col gap-2">
                           <span className={`px-3 py-1 text-[#F24C20] text-[9px] font-black uppercase tracking-widest rounded-lg self-start ${isDarkMode ? 'bg-white/5 border border-white/10' : 'bg-[#fff7ef] border border-[#f2d7c2]'}`}>
                             {getCategoryName(idea)}
                           </span>
                           {(isOwner || isUnlocked) ? (
                              <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-black uppercase tracking-widest rounded-lg self-start flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2 duration-700">
                                 <ShieldCheck className="w-3 h-3" />
                                 {isOwner ? 'Your Concept' : 'Unlocked'}
                              </span>
                           ) : (
                              <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg self-start ${isDarkMode ? 'bg-white/5 border border-white/10 text-neutral-400' : 'bg-[#fff7ef] border border-[#f2d7c2] text-[#7a5a49]'}`}>
                                {idea.stage || 'Market MVP'}
                              </span>
                           )}
                        </div>
                        <button className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black transition-all ${isDarkMode ? 'bg-neutral-900 border border-white/10 text-white hover:bg-neutral-800' : 'bg-white border border-[#f2d7c2] text-[#2b160e] hover:bg-[#fff7ef]'}`}>
                           <Heart className="w-3.5 h-3.5" /> Save
                        </button>
                      </div>

                      <h3 className={`text-2xl font-black mb-3 leading-tight group-hover:text-[#F24C20] transition-colors line-clamp-2 text-[#1f120d]`}>
                        {idea.title}
                      </h3>
                      <p className={`text-sm leading-relaxed line-clamp-3 mb-8 font-medium text-[#6f7f9a]`}>
                        {idea.shortDescription}
                      </p>

                      {/* Performance Stats Row */}
                      <div className="grid grid-cols-3 gap-3 mb-8">
                         {[
                            { label: 'Views', value: idea.views || '1.2K', color: 'text-white' },
                            { label: 'Saves', value: idea.saves || '42', color: 'text-white' },
                            { label: 'Contacts', value: idea.contacts?.length || '8', color: 'text-[#F24C20]' }
                         ].map((stat, i) => (
                           <div key={i} className={`rounded-2xl p-4 text-center ${isDarkMode ? 'bg-white/5 border border-white/5' : 'bg-[#fff7ef] border border-[#f2d7c2]'}`}>
                              <div className={`text-lg font-black ${isDarkMode ? stat.color : stat.label === 'Contacts' ? 'text-[#F24C20]' : 'text-[#1f120d]'}`}>{stat.value}</div>
                              <div className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-[#7a5a49]'}`}>{stat.label}</div>
                           </div>
                         ))}
                      </div>

                      {/* Specialist Badges */}
                      <div className="flex flex-wrap gap-2 mb-8">
                         {(idea.neededRoles || ['Product Designer', 'Growth Marketer', 'Industry Advisor']).slice(0, 3).map((role: string, i: number) => (
                           <span key={i} className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-tighter ${isDarkMode ? 'bg-neutral-900 border border-neutral-800 text-slate-300' : 'bg-white border border-[#f2d7c2] text-[#5f4a3f]'}`}>
                              {role}
                           </span>
                         ))}
                      </div>
                    </div>

                    <div className={`mt-auto p-8 pt-0 ${isDarkMode ? 'border-t border-white/5 bg-white/5' : 'border-t border-[#f2d7c2] bg-white/60'}`}>
                      <div className="flex items-center justify-between mt-6">
                         <div className="flex flex-col">
                            <span className={`text-sm font-black leading-none mb-1 text-[#1f120d]`}>{idea.creator?.full_name || 'Anonymous Founder'}</span>
                            <span className={`text-[10px] font-bold uppercase ${isDarkMode ? 'text-slate-500' : 'text-[#7a5a49]'}`}>Bengaluru, India • <span className="text-emerald-500 italic lowercase tracking-tight">online now</span></span>
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
             <div className="text-center py-40">
                 <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isDarkMode ? 'bg-slate-500/10' : 'bg-slate-100'}`}>
                     <Search className={`w-8 h-8 ${isDarkMode ? 'text-slate-500' : 'text-[#6f7f9a]'}`} />
                 </div>
                 <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-[#1f2940]'}`}>No concepts found</h2>
                 <p className={isDarkMode ? 'text-slate-500' : 'text-[#6f7f9a]'}>Try adjusting your search terms or filters.</p>
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
                To access the full concept deep dive, market strategy, and founder roadmap for <span className="text-white font-bold">"{unlockingIdea.title}"</span>, a one-time fee of <span className="text-orange-500 font-black">1 Credit Point</span> will be debited from your account.
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
                  {isProcessing ? 'Processing Transaction...' : 'Confirm Unlock (1 PTS)'}
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

function StartupIdeaProfileView({ idea, onBack,  similarIdeas, onRequestUnlock }: any) {
  const [activeImage, setActiveImage] = useState(0);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState("overview");
  const navigate = useNavigate();
  const [contactingFounder, setContactingFounder] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isLoggedIn = !!localStorage.getItem('token');
  const creatorId = idea.creator?._id || idea.creator;
  const isOwner = creatorId === currentUser?._id;
  const isUnlocked = idea.contacts?.some((c: any) => (c._id || c) === currentUser?._id) || idea.isUnlocked || isOwner;

  const handleContactFounder = async () => {
    if (!isLoggedIn) {
      toast.error('Please login to contact the founder.');
      navigate('/signin');
      return;
    }

    if (!isUnlocked) {
      onRequestUnlock?.(idea);
      return;
    }

    if (!idea.creator?._id) {
      toast.error('Founder details are incomplete. Please try again later.');
      return;
    }

    setContactingFounder(true);
    try {
      const introMessage = `Hello ${idea.creator?.full_name || 'Founder'}, I'm interested in your startup idea "${idea.title}". I’d like to connect and discuss it further.`;
      await api.post('/messages', {
        receiverId: idea.creator._id,
        content: introMessage
      });
      toast.success(`Message sent to ${idea.creator?.full_name || 'the founder'}!`);
      navigate(`/dashboard/messages?user=${idea.creator._id}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to contact founder');
    } finally {
      setContactingFounder(false);
    }
  };

  const images = useMemo(() => {
     if (idea.attachments?.length > 0) {
        return idea.attachments.map((a: string) => 
           a.startsWith('http') ? a : `${import.meta.env.VITE_API_URL}${a}`
        );
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

  const tabContent = useMemo(() => {
    if (tab === "overview") {
      return (
        <div className="grid gap-6 lg:grid-cols-[1.3fr_.9fr]">
          <div className={`rounded-3xl p-6 shadow-2xl backdrop-blur-xl ${isDarkMode ? 'border border-white/10 bg-white/5 shadow-black/20' : 'border border-[#f2d7c2] bg-[#fffdfb] shadow-black/10'}`}>
            <h3 className={`text-lg font-semibold text-[#1f120d]`}>Venture Core & Opportunity</h3>
            <p className={`mt-4 text-sm leading-7 ${isDarkMode ? 'text-slate-300' : 'text-[#6f7f9a]'}`}>
              {idea.detailedDescription || idea.shortDescription}
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className={`rounded-2xl p-4 ${isDarkMode ? 'border border-rose-500/20 bg-gradient-to-br from-rose-500/12 to-transparent' : 'border border-rose-200 bg-gradient-to-br from-rose-50 to-white'}`}>
                <p className={`text-sm font-semibold text-[#1f120d]`}>Target Ecosystem</p>
                <p className={`mt-2 text-sm ${isDarkMode ? 'text-slate-300' : 'text-[#6f7f9a]'}`}>{idea.targetAudience || "Broad Market Reach"}</p>
              </div>
              <div className={`rounded-2xl p-4 ${isDarkMode ? 'border border-[#F24C20]/20 bg-gradient-to-br from-[#F24C20]/10 to-transparent' : 'border border-[#f2d7c2] bg-gradient-to-br from-[#fff1e7] to-white'}`}>
                <p className={`text-sm font-semibold text-[#1f120d]`}>Business Intelligence</p>
                <p className={`mt-2 text-sm ${isDarkMode ? 'text-slate-300' : 'text-[#6f7f9a]'}`}>{idea.uniqueness || "Proprietary solution model with clear competitive advantages."}</p>
              </div>
            </div>
          </div>

          <div className={`rounded-3xl p-6 shadow-2xl ${isDarkMode ? 'border border-white/10 bg-[#0b0d14] shadow-black/20' : 'border border-[#f2d7c2] bg-[#1f2230] shadow-black/10'}`}>
            <h3 className="text-lg font-semibold text-white">Venture Dossier</h3>

            <div className="mt-5 space-y-4 text-sm text-slate-300">
              <div className={`flex items-center justify-between pb-3 ${isDarkMode ? 'border-b border-white/10' : 'border-b border-white/10'}`}>
                <span>Stage</span>
                <span className="font-semibold text-white">{idea.stage || 'Market MVP'}</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span>Domain</span>
                <span className="font-semibold text-white">{typeof idea.category === 'string' ? idea.category : idea.category?.name}</span>
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
            <div key={item.title} className={`rounded-3xl p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-[#F24C20]/40 ${isDarkMode ? 'border border-white/10 bg-white/5 hover:bg-white/8' : 'border border-[#f2d7c2] bg-[#fffdfb]'}`}>
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F24C20] to-orange-400 text-lg font-bold text-white">
                ✓
              </div>
              <h3 className={`mt-5 text-lg font-semibold text-[#1f120d]`}>{item.title}</h3>
              <p className={`mt-3 text-sm leading-7 ${isDarkMode ? 'text-slate-300' : 'text-[#6f7f9a]'}`}>{item.text}</p>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {(idea.neededRoles || ["Frontend Developer", "AI Engineer", "Angel Investor", "Marketing Partner"]).map((role: string) => (
          <div key={role} className={`group rounded-3xl p-5 backdrop-blur-xl transition duration-300 hover:border-[#F24C20]/40 hover:bg-gradient-to-br hover:from-[#F24C20]/10 hover:to-transparent ${isDarkMode ? 'border border-white/10 bg-white/5' : 'border border-[#f2d7c2] bg-[#fffdfb]'}`}>
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl transition duration-300 group-hover:bg-[#F24C20]/20 text-xs font-black uppercase tracking-widest ${isDarkMode ? 'bg-white/10 text-white' : 'bg-[#fff1e7] text-[#F24C20]'}`}>Team</div>
            <h3 className={`mt-4 text-base font-semibold text-[#1f120d]`}>{role}</h3>
            <p className={`mt-2 text-sm leading-7 line-clamp-3 text-[#6f7f9a]`}>Actively seeking strategic collaboration to scale core concept pillars and launch first market pilot.</p>
          </div>
        ))}
      </div>
    );
  }, [tab, idea, isDarkMode]);

  return (
    <div className={`min-h-screen pt-32 pb-20 overflow-hidden relative ${isDarkMode ? 'bg-[#030712]' : 'bg-gray-50'}`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-0 top-0 h-[40rem] w-[40rem] rounded-full bg-[#F24C20]/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[30rem] w-[30rem] rounded-full bg-orange-500/5 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className={`mb-8 flex flex-col gap-5 rounded-[2.5rem] px-8 py-6 backdrop-blur-3xl md:flex-row md:items-center md:justify-between shadow-2xl ${isDarkMode ? 'border border-white/10 bg-white/5' : 'border border-[#f2d7c2] bg-white/90'}`}>
          <div className="flex items-center gap-6">
            <button 
              onClick={onBack}
              className={`p-3 rounded-2xl transition-all group ${isDarkMode ? 'bg-white/5 border border-white/10 hover:bg-[#F24C20] hover:text-white' : 'bg-white border border-[#f2d7c2] text-[#2b160e] hover:bg-[#F24C20] hover:text-white'}`}
            >
               <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#F24C20] mb-0.5">Venture Intelligence</p>
              <h1 className={`text-2xl font-black text-[#1f120d]`}>{idea.title}</h1>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSaved((v) => !v)}
              className={`rounded-2xl px-6 py-3.5 text-xs font-black uppercase tracking-widest transition duration-300 flex items-center gap-2 ${
                saved
                  ? "bg-white text-slate-900 shadow-xl"
                  : isDarkMode ? "border border-white/10 bg-white/5 text-white hover:border-[#F24C20]/50 hover:bg-white/10" : "border border-[#f2d7c2] bg-white text-[#2b160e] hover:border-[#F24C20]/50 hover:bg-[#fff7ef]"
              }`}
            >
              <Heart className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
              {saved ? "Concept Saved" : "Save Concept"}
            </button>
            {isOwner ? (
              <button
                onClick={() => navigate('/dashboard-startup')}
                className="group relative overflow-hidden rounded-2xl bg-[#F24C20] px-8 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-[#F24C20]/30 transition hover:scale-[1.02] active:scale-95"
              >
                <span className="relative">View Dashboard</span>
              </button>
            ) : (
              <button
                onClick={handleContactFounder}
                disabled={contactingFounder}
                className="group relative overflow-hidden rounded-2xl bg-[#F24C20] px-8 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-[#F24C20]/30 transition hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span className="relative">{contactingFounder ? 'Connecting...' : 'Contact Founder'}</span>
              </button>
            )}
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
          <div className={`overflow-hidden rounded-[3rem] backdrop-blur-3xl shadow-2xl ${isDarkMode ? 'border border-white/10 bg-black/40' : 'border border-[#f2d7c2] bg-white'}`}>
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

            <div className={`grid grid-cols-4 gap-4 p-6 ${isDarkMode ? 'bg-white/5 border-t border-white/10' : 'bg-white/80 border-t border-[#f2d7c2]'}`}>
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
            <div className={`rounded-[3rem] p-8 backdrop-blur-3xl shadow-2xl ${isDarkMode ? 'border border-white/10 bg-[#0b0d14]' : 'border border-[#f2d7c2] bg-white'}`}>
              <div className="flex items-center gap-5">
                <div className="relative">
                   {idea.creator?.profile_image ? (
                        <img src={idea.creator.profile_image} className="w-16 h-16 rounded-3xl object-cover border border-[#F24C20]/30 shadow-xl shadow-[#F24C20]/10" />
                   ) : (
                        <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-2xl font-black text-[#F24C20] ${isDarkMode ? 'bg-neutral-900 border border-white/10' : 'bg-[#fff7ef] border border-[#f2d7c2]'}`}>
                             {idea.creator?.full_name?.charAt(0)}
                        </div>
                   )}
                   <div className={`absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full shadow-lg ${isDarkMode ? 'border-2 border-neutral-900' : 'border-2 border-white'}`} />
                </div>
                <div>
                  <h3 className={`text-xl font-black uppercase text-[#1f120d]`}>{idea.creator?.full_name || 'Anonymous Founder'}</h3>
                  <p className={`text-[10px] font-bold uppercase tracking-widest mb-1.5 ${isDarkMode ? 'text-slate-500' : 'text-[#7a5a49]'}`}>Market Opportunity Creator</p>
                  <div className="flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                     <span className="text-[9px] font-black text-emerald-400 uppercase">Trusted Founder</span>
                  </div>
                </div>
              </div>
              <p className={`mt-8 text-sm leading-7 ${isDarkMode ? 'text-slate-400' : 'text-[#5f6f8f]'}`}>
                Building a validated venture targeting high-growth {typeof idea.category === 'string' ? idea.category : idea.category?.name} sectors. Dedicated to engineering a scalable solution model for the modern digital economy.
              </p>
              <div className="mt-8 flex flex-wrap gap-2">
                {(idea.tags || ["AI", "Innovation", "Global Scale"]).map((tag: string) => (
                  <span key={tag} className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-[#F24C20] ${isDarkMode ? 'border border-white/5 bg-white/5' : 'border border-[#f2d7c2] bg-[#fff7ef]'}`}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {stats.map((item) => (
                <div key={item.label} className={`rounded-[2rem] p-6 backdrop-blur-3xl transition-all group ${isDarkMode ? 'border border-white/10 bg-black/40 hover:bg-white/5' : 'border border-[#f2d7c2] bg-white hover:bg-[#fff7ef]'}`}>
                  <p className={`text-2xl font-black group-hover:text-[#F24C20] transition-colors text-[#1f120d]`}>{item.value}</p>
                  <p className={`mt-1 text-[9px] font-bold uppercase tracking-[0.2em] ${isDarkMode ? 'text-slate-500' : 'text-[#7a5a49]'}`}>{item.label}</p>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className={`mt-10 rounded-[3rem] p-8 md:p-12 backdrop-blur-3xl shadow-2xl ${isDarkMode ? 'border border-white/10 bg-black/40' : 'border border-[#f2d7c2] bg-white'}`}>
          <SectionTitle
            eyebrow="Market Deep Dive"
            title="Strategic Architecture & Roadmap"
            desc="Explore the internal mechanics, traction metrics, and collaboration requirements for this verified venture concept."
            isDarkMode={isDarkMode}
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
                    : isDarkMode ? "border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white" : "border border-[#f2d7c2] bg-[#fff7ef] text-[#7a5a49] hover:bg-white hover:text-[#1f120d]"
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
            title={`More From ${typeof idea.category === 'string' ? idea.category : idea.category?.name}`}
            desc="Discover other high-potential ventures in the same ecosystem currently seeking investment and talent."
            isDarkMode={isDarkMode}
          />

          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3 mt-10">
            {similarIdeas.map((item: any, idx: number) => (
              <div key={idx} className={`group overflow-hidden rounded-[2.5rem] backdrop-blur-3xl transition-all duration-500 hover:-translate-y-2 hover:border-[#F24C20]/40 shadow-xl ${isDarkMode ? 'border border-white/10 bg-[#0b0d14] shadow-black/40' : 'border border-[#f2d7c2] bg-white shadow-black/10'}`}>
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={item.attachments?.[0] ? (item.attachments[0].startsWith('http') ? item.attachments[0] : `${import.meta.env.VITE_API_URL}${item.attachments[0]}`) : "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80"} 
                    alt={item.title} 
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-transparent" />
                  <span className={`absolute left-6 top-6 rounded-xl px-4 py-2 text-[9px] font-black uppercase tracking-widest text-[#F24C20] backdrop-blur-xl ${isDarkMode ? 'bg-black/60 border border-white/10' : 'bg-white/90 border border-[#f2d7c2]'}`}>
                    {typeof item.category === 'string' ? item.category : item.category?.name}
                  </span>
                </div>
                <div className="p-8">
                  <h3 className={`text-xl font-black group-hover:text-[#F24C20] transition-colors mb-4 truncate text-[#1f120d]`}>{item.title}</h3>
                  <p className={`text-xs leading-6 line-clamp-2 font-medium mb-8 text-[#6f7f9a]`}>{item.shortDescription}</p>
                  <div className="flex gap-4">
                    <button className={`flex-1 rounded-2xl py-4 text-[10px] font-black uppercase tracking-widest transition hover:bg-[#F24C20] hover:border-[#F24C20] hover:text-white ${isDarkMode ? 'border border-white/10 bg-white/5 text-white' : 'border border-[#f2d7c2] bg-[#fff7ef] text-[#2b160e]'}`}>Review</button>
                    <button className={`flex items-center justify-center p-4 rounded-2xl ${isDarkMode ? 'bg-white/5 border border-white/10 hover:bg-neutral-800 text-white' : 'bg-white border border-[#f2d7c2] hover:bg-[#fff7ef] text-[#2b160e]'}`}><Heart className="w-4 h-4" /></button>
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

function SectionTitle({ eyebrow, title, desc, isDarkMode }: any) {
  return (
    <div className="mb-6">
      <p className="mb-3 text-[10px] font-black uppercase tracking-[0.3em] text-[#F24C20]">{eyebrow}</p>
      <h2 className={`text-3xl font-black md:text-5xl tracking-tighter uppercase ${isDarkMode ? 'text-white' : 'text-[#f4c7ae]'}`}>{title}</h2>
      {desc ? <p className={`mt-6 max-w-3xl text-sm lg:text-base font-medium leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-[#91a4c5]'}`}>{desc}</p> : null}
    </div>
  );
}

function DetailItem({ label, value, icon, className = "", darkMode }: any) {
  return (
    <div className={`rounded-3xl border p-6 transition-all group flex flex-col justify-center ${
        darkMode 
        ? 'border-white/10 bg-white/5 hover:bg-white/[0.08]' 
        : 'border-gray-100 bg-gray-50 hover:bg-gray-100'
    } ${className}`}>
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#F24C20] mb-3">
        {icon && <span className="shrink-0">{icon}</span>}
        <span className="truncate">{label}</span>
      </div>
      <div className={`text-sm lg:text-base leading-tight font-black uppercase tracking-tight ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        {value || "-"}
      </div>
    </div>
  );
}

function ArrowLeft(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
  );
}

function Clock(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  );
}

function Globe(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
  );
}
