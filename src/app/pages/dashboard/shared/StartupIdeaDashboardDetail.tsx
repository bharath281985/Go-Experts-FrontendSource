import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Rocket, ShieldCheck, Lock, Coins, AlertTriangle, X, CheckCircle,
  TrendingUp, Target, Globe, Clock, MessageCircle, Heart, Share2, DollarSign, User
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/app/utils/api';
import { useTheme } from '@/app/components/ThemeProvider';
import { toast } from 'sonner';

export default function StartupIdeaDashboardDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [idea, setIdea] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [user, setUser] = useState<any>(JSON.parse(localStorage.getItem('user') || '{}'));

  useEffect(() => {
    fetchIdeaDetails();
  }, [id]);

  const fetchIdeaDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/startup-ideas/${id}`);
      if (res.data.success) {
        setIdea(res.data.data);
        // Check if favorite
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        const isFav = userData.favorite_ideas?.some((favId: string | any) => 
          typeof favId === 'string' ? favId === res.data.data._id : favId._id === res.data.data._id
        );
        setIsFavorite(!!isFav);
      }
    } catch (err: any) {
      toast.error('Concept details are temporarily unavailable');
      navigate('/dashboard/explore-ideas');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async () => {
     try {
        setIsUnlocking(true);
        const res = await api.post(`/startup-ideas/${id}/unlock`);
        if (res.data.success) {
           toast.success(res.data.message);
           fetchIdeaDetails(); // Reload with full info
        }
     } catch (err: any) {
        toast.error(err.response?.data?.message || 'Access denied. Please check your plan limits.');
     } finally {
        setIsUnlocking(false);
     }
  };

  const handleSendInquiry = async () => {
    if (!idea?.creator?._id) {
        toast.error('Founder details are incomplete.');
        return;
    }

    setSubmitting(true);
    try {
        await api.post(`/messages`, {
            receiverId: idea.creator._id,
            content: `I am interested in your concept "${idea.title}" and would like to discuss potential collaboration or investment.`
        });
        toast.success(`Inquiry sent to ${idea.creator.full_name}! Check your messages for their reply.`);
    } catch (err: any) {
        toast.error(err.response?.data?.message || 'Unable to send inquiry at this time');
    } finally {
        setSubmitting(false);
    }
  };

  const handleRequestVideoPitch = async () => {
    if (!idea?.creator?._id) {
        toast.error('Founder details are incomplete.');
        return;
    }

    setSubmitting(true);
    try {
        await api.post(`/messages`, {
            receiverId: idea.creator._id,
            content: `I have viewed your concept "${idea.title}" and would like to request a recorded video pitch or demo.`
        });
        toast.success('Interest registered. The founder has been notified to share a video pitch.');
    } catch (err: any) {
        toast.error(err.response?.data?.message || 'Unable to process request');
    } finally {
        setSubmitting(false);
    }
  };

  const handleToggleFavorite = async () => {
    try {
        const res = await api.post(`/users/favorites-ideas/${idea._id}`);
        if (res.data.success) {
            const nextFav = !isFavorite;
            setIsFavorite(nextFav);
            toast.success(res.data.message);
            
            // Update local storage user for consistency
            const userData = JSON.parse(localStorage.getItem('user') || '{}');
            if (nextFav) {
                userData.favorite_ideas = [...(userData.favorite_ideas || []), idea._id];
            } else {
                userData.favorite_ideas = userData.favorite_ideas?.filter((id: string) => id !== idea._id);
            }
            localStorage.setItem('user', JSON.stringify(userData));
        }
    } catch (err: any) {
        toast.error('Unable to update saved status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#F24C20] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!idea) return null;

  const isUnlocked = idea.isUnlocked;

  return (
    <div className="space-y-8 pb-12">
      {/* Header Area */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
             isDarkMode ? 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white' : 'bg-white border border-neutral-200 text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Marketplace
        </button>

        <div className="flex items-center gap-4">
           <button 
              onClick={handleToggleFavorite}
              className={`p-3 rounded-xl border transition-all ${
                 isFavorite 
                 ? 'bg-[#F24C20]/10 border-[#F24C20] text-[#F24C20]' 
                 : isDarkMode ? 'bg-neutral-900 border-neutral-800 hover:bg-neutral-800 text-neutral-500' : 'bg-white border-neutral-200 hover:bg-neutral-50 text-neutral-500'
           }`}>
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-[#F24C20]' : ''}`} />
           </button>
           <button className={`p-3 rounded-xl border transition-all ${
              isDarkMode ? 'bg-neutral-900 border-neutral-800 hover:bg-neutral-800' : 'bg-white border-neutral-200 hover:bg-neutral-50'
           }`}>
              <Share2 className="w-5 h-5 text-neutral-500" />
           </button>
        </div>
      </div>

      {/* Hero Banner Part */}
      <div className={`p-8 lg:p-12 rounded-[32px] border relative overflow-hidden ${
          isDarkMode ? 'bg-[#0b0d14] border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'
      }`}>
         <div className="relative z-10 grid lg:grid-cols-[1.5fr,1fr] gap-12 items-center">
            <div>
               <div className="flex items-center gap-3 mb-6">
                  <span className="px-3 py-1 rounded bg-[#F24C20]/10 text-[#F24C20] text-xs font-black uppercase tracking-widest">{idea.category}</span>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 uppercase tracking-widest">
                     <ShieldCheck className="w-4 h-4" /> Go Expert Verified
                  </span>
               </div>
               <h1 className="text-4xl lg:text-5xl font-black mb-6 leading-tight">{idea.title}</h1>
               <p className={`text-lg leading-relaxed max-w-2xl ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>{idea.shortDescription}</p>
            </div>

            {/* Quick Stats Grid */}
            <div className={`grid grid-cols-2 gap-4 p-6 rounded-[24px] border ${
               isDarkMode ? 'bg-white/[0.03] border-white/5' : 'bg-neutral-50 border-neutral-100'
            }`}>
               <StatItem label="Est. Valuation" value={idea.fundingAmount || 'Seed'} icon={<DollarSign className="w-4 h-4" />} />
               <StatItem label="Target Market" value={idea.targetAudience || 'B2B SMBs'} icon={<Target className="w-4 h-4" />} />
               <StatItem label="Expert Founder" value={idea.creator?.full_name} icon={<Clock className="w-4 h-4" />} />
               <StatItem label="Ref ID" value={`#${idea._id.slice(-6).toUpperCase()}`} icon={<Rocket className="w-4 h-4" />} />
            </div>
         </div>
      </div>

      {/* Restricted Content Logic */}
      {!isUnlocked ? (
         <div className={`p-12 rounded-[32px] border text-center relative overflow-hidden ${
            isDarkMode ? 'bg-orange-500/5 border-orange-500/10' : 'bg-orange-50 border-orange-100'
         }`}>
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent blur-3xl" />
            <div className="relative z-10 max-w-2xl mx-auto">
               <div className="w-20 h-20 rounded-3xl bg-orange-500/10 flex items-center justify-center mx-auto mb-8 border border-orange-500/20 shadow-2xl shadow-orange-500/20">
                  <Lock className="w-10 h-10 text-orange-500" />
               </div>
               <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter">Roadmap Locked</h2>
               <p className={`text-lg mb-8 leading-relaxed ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                  To access the full market strategy, competitor matrix, founders contact, and execution roadmap, please use 1 credit point from your subscription plan.
               </p>
               <button 
                  onClick={handleUnlock}
                  disabled={isUnlocking}
                  className="px-12 py-4 bg-[#F24C20] text-white rounded-[20px] font-black text-lg shadow-2xl shadow-orange-500/40 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
               >
                  {isUnlocking ? 'Deducting Credit...' : 'Confirm Access (1 Credit)'}
               </button>
            </div>
         </div>
      ) : (
         <div className="grid lg:grid-cols-[1.5fr,1fr] gap-8">
            {/* Left Content Column */}
            <div className="space-y-8">
               <SectionBox title="Detailed Concept" icon={<Info className="w-5 h-5" />}>
                  <p className="text-neutral-400 mt-4 leading-relaxed whitespace-pre-wrap">{idea.detailedDescription}</p>
               </SectionBox>

               <div className="grid md:grid-cols-2 gap-6">
                  <SectionBox title="Problem Statement" accent="red">
                     <p className="text-neutral-400 mt-2 text-sm">{idea.problem}</p>
                  </SectionBox>
                  <SectionBox title="The Evolution (Solution)" accent="green">
                     <p className="text-neutral-400 mt-2 text-sm">{idea.solution}</p>
                  </SectionBox>
               </div>

               <SectionBox title='The "Unfair" Advantage' accent="blue">
                   <p className="text-neutral-400 mt-2 leading-relaxed">{idea.uniqueness}</p>
               </SectionBox>

               <SectionBox title="Founder Milestones">
                   <div className="relative pt-8 space-y-12">
                      <div className="absolute left-4 top-10 bottom-4 w-0.5 bg-neutral-800" />
                      {['Prototype Development', 'Beta Testing / POC', 'Go-To-Market Execution', 'Series Seed Preparation'].map((m, i) => (
                         <div key={i} className="relative flex items-center gap-6">
                            <div className="w-8 h-8 rounded-full bg-[#F24C20] flex items-center justify-center relative z-10 border-4 border-[#0b0d14]">
                               <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                            <div>
                               <h5 className="font-bold text-white uppercase text-xs tracking-widest">{m}</h5>
                               <p className="text-[10px] text-neutral-500 mt-1 uppercase">Phase {i+1} Priority</p>
                            </div>
                         </div>
                      ))}
                   </div>
               </SectionBox>
            </div>

            {/* Right Contact / Action Column */}
            <div className="space-y-8">
               <div className={`p-8 rounded-[32px] border sticky top-8 ${
                  isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'
               }`}>
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                     <User className="w-6 h-6 text-[#F24C20]" />
                     Venture Founders
                  </h3>
                  
                  <div className="flex items-center gap-4 mb-8">
                      <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center text-[#F24C20] font-black text-2xl border border-orange-500/10 uppercase">
                         {idea.creator?.full_name?.charAt(0)}
                      </div>
                      <div>
                         <h4 className="font-bold text-lg">{idea.creator?.full_name}</h4>
                         <p className="text-xs text-neutral-500">Verified Concept Creator</p>
                      </div>
                  </div>

                  <div className="space-y-4 mb-8 text-sm">
                      <div className="flex items-center justify-between py-3 border-b border-neutral-800">
                         <span className="text-neutral-500 uppercase text-[10px] font-bold tracking-widest">Email</span>
                         <span className="font-bold">{idea.creator?.email || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-neutral-800">
                         <span className="text-neutral-500 uppercase text-[10px] font-bold tracking-widest">Phone</span>
                         <span className="font-bold text-emerald-500">Gated - Request Meet</span>
                      </div>
                  </div>

                  <div className="space-y-3">
                      <button 
                        onClick={handleSendInquiry}
                        disabled={submitting}
                        className="w-full py-4 bg-[#F24C20] text-white rounded-2xl font-black shadow-xl shadow-orange-500/20 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-xs disabled:opacity-50"
                      >
                         {submitting ? 'Sending...' : 'Send Direct Inquiry'}
                      </button>
                      <button 
                        onClick={handleRequestVideoPitch}
                        disabled={submitting}
                        className={`w-full py-4 rounded-2xl border font-black uppercase tracking-widest text-xs hover:bg-neutral-800 transition-all disabled:opacity-50 ${
                         isDarkMode ? 'border-neutral-800 text-neutral-400' : 'border-neutral-200 text-neutral-600'
                      }`}>
                         {submitting ? 'Requesting...' : 'Request Video Pitch'}
                      </button>
                  </div>

                  <div className="mt-8 p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                      <div className="flex items-center gap-2 text-blue-400 mb-2">
                         <AlertTriangle className="w-4 h-4" />
                         <span className="text-[10px] font-bold uppercase tracking-widest">Investor Safety</span>
                      </div>
                      <p className="text-[10px] text-neutral-500 leading-relaxed uppercase">Perform independent due diligence before making any financial commitments. Concepts are expert-vetted but market risk exists.</p>
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}

function SectionBox({ title, children, accent, icon }: any) {
   const { isDarkMode } = useTheme();
   const borderColor = accent === 'red' ? 'border-red-500/20' : accent === 'green' ? 'border-emerald-500/20' : accent === 'blue' ? 'border-blue-500/20' : 'border-neutral-800';
   const bgColor = accent === 'red' ? 'bg-red-500/5' : accent === 'green' ? 'bg-emerald-500/5' : accent === 'blue' ? 'bg-blue-500/5' : (isDarkMode ? 'bg-neutral-900/50' : 'bg-white');

   return (
      <div className={`p-8 rounded-[32px] border ${borderColor} ${bgColor} transition-all duration-300`}>
         <div className="flex items-center gap-2 mb-4">
            <div className={`w-1.5 h-6 rounded-full ${accent === 'red' ? 'bg-red-500' : accent === 'green' ? 'bg-emerald-500' : accent === 'blue' ? 'bg-blue-500' : 'bg-[#F24C20]'}`} />
            <h2 className="font-black text-sm uppercase tracking-[0.2em]">{title}</h2>
            {icon && <span className="ml-auto opacity-50">{icon}</span>}
         </div>
         {children}
      </div>
   );
}

function StatItem({ label, value, icon }: any) {
   return (
      <div className="space-y-1">
         <div className="flex items-center gap-1.5 text-[9px] font-black text-neutral-500 uppercase tracking-widest">
            {icon} {label}
         </div>
         <div className="text-xs font-black truncate">{value || '-'}</div>
      </div>
   );
}

function Info(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
  );
}
