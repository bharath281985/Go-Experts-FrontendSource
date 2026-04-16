import React, { useState, useEffect } from 'react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Rocket, 
  User, 
  Mail, 
  ShieldCheck, 
  TrendingUp, 
  Users, 
  Target, 
  CheckCircle, 
  Download,
  Eye,
  DollarSign,
  AlertCircle,
  Globe,
  Share2,
  Heart,
  MessageCircle,
  Lock
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/app/utils/api';
import { useTheme } from '@/app/components/ThemeProvider';
import { toast } from 'sonner';

export default function StartupIdeaPublicDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [idea, setIdea] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
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
      }
    } catch (err) {
      toast.error('Failed to load concept details');
      navigate('/explore-ideas');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async () => {
     if (!user || !localStorage.getItem('token')) {
        toast.error('Please login to unlock concept roadmaps');
        navigate('/login');
        return;
     }

     try {
        setIsUnlocking(true);
        const res = await api.post(`/startup-ideas/${id}/unlock`);
        if (res.data.success) {
           toast.success(res.data.message);
           fetchIdeaDetails(); // Reload with full info
        }
     } catch (err: any) {
        const msg = err.response?.data?.message || 'Access denied';
        if (msg.toLowerCase().includes('upgrade') || msg.toLowerCase().includes('limit')) {
            toast.error('Unlock limit exceeded. Please upgrade your subscription plan.');
            navigate('/dashboard/plans'); // Take them to plans
        } else {
            toast.error(msg);
        }
     } finally {
        setIsUnlocking(false);
     }
  };

  const handleRequestDeck = async () => {
    if (!idea.isUnlocked) {
        toast.error('Please unlock the roadmap first to request the deck.');
        return;
    }
    
    if (!idea.creator?._id) {
        toast.error('Founder details are incomplete. Please contact support.');
        return;
    }

    setSubmitting(true);
    try {
        // Find if there's a deck in attachments
        const deck = idea.attachments?.find((a: string) => a.toLowerCase().includes('deck') || a.toLowerCase().includes('pitch'));
        if (deck) {
            window.open(`${import.meta.env.VITE_API_URL}${deck}`, '_blank');
            toast.success('Concept deck opened in a new tab');
        } else {
            // Send inquiry message to founder
            await api.post(`/messages`, {
                receiverId: idea.creator._id,
                content: `An investor is interested in your concept "${idea.title}" and has requested the Pitch Deck. Please upload it and share.`
            });
            toast.success('Interest registered. The founder has been notified to share the latest pitch deck.');
        }
    } catch (err: any) {
        toast.error(err.response?.data?.message || 'Unable to process request at this time');
    } finally {
        setSubmitting(false);
    }
  };

  const handleScheduleMeet = async () => {
    if (!idea.isUnlocked) {
        toast.error('You must unlock creator contact details to schedule a meeting.');
        return;
    }

    if (!idea.creator?._id) {
        toast.error('Founder details are incomplete. Please try again later.');
        return;
    }
    
    setSubmitting(true);
    try {
        await api.post('/meetings', {
            creator_id: idea.creator._id,
            idea_id: id,
            meeting_date: new Date(Date.now() + 86400000 * 3).toISOString(), // Suggest 3 days from now
            mode: 'Google Meet',
            agenda: `Investment Discussion regarding startup concept: ${idea.title}`
        });
        toast.success(`Meeting request sent to ${idea.creator?.full_name}! Check your dashboard for updates.`);
    } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to send meeting request');
    } finally {
        setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-[#05060a]' : 'bg-gray-50'}`}>
        <div className="w-16 h-16 border-4 border-[#F24C20] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!idea) return null;

  const isOwner = idea.creator?._id === user._id || idea.creator === user._id;

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-[#05060a] text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Header />
      
      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Hero Section */}
          <section className={`overflow-hidden rounded-2xl lg:rounded-[32px] border transition-all p-6 lg:p-12 mb-8 lg:mb-12 shadow-2xl relative ${
              isDarkMode 
              ? 'border-white/10 bg-gradient-to-r from-[#F24C20]/10 via-white/[0.03] to-blue-500/10 shadow-black/20' 
              : 'border-gray-200 bg-white shadow-neutral-200/50'
          }`}>
            <div className="grid gap-8 lg:gap-12 lg:grid-cols-[1.4fr,0.8fr] lg:items-center relative z-10">
              <div>
                <button 
                  onClick={() => navigate('/explore-ideas')}
                  className="flex items-center gap-2 text-slate-500 hover:text-[#F24C20] mb-6 lg:mb-8 font-black text-[10px] lg:text-sm uppercase tracking-widest transition-colors group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  Explore Ideas
                </button>

                <div className="flex flex-wrap items-center gap-2 lg:gap-3 mb-6">
                  <div className="inline-flex items-center rounded-lg lg:rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 lg:px-4 py-1.5 lg:py-2 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5 mr-2" /> {idea.status}
                  </div>
                  <div className="inline-flex items-center rounded-lg lg:rounded-full border border-orange-500/30 bg-orange-500/10 px-3 lg:px-4 py-1.5 lg:py-2 text-[10px] font-black uppercase tracking-widest text-orange-400">
                    <Rocket className="w-3.5 h-3.5 mr-2" /> {idea.category}
                  </div>
                </div>

                <h1 className="text-3xl md:text-5xl lg:text-6xl font-black leading-[1.1] mb-6 tracking-tighter">
                  {idea.title}
                </h1>
                <p className={`text-base lg:text-xl leading-relaxed mb-8 max-w-2xl font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  {idea.shortDescription}
                </p>

                {!idea.isUnlocked ? (
                    <div className="p-6 lg:p-8 rounded-2xl lg:rounded-3xl bg-orange-500/10 border border-orange-500/20 mb-8 max-w-xl">
                        <div className="flex items-center gap-3 text-orange-500 font-black uppercase tracking-widest text-xs mb-3">
                            <Lock className="w-5 h-5" /> Detailed Roadmap Locked 
                        </div>
                        <p className="text-xs lg:text-sm text-slate-400 mb-6 leading-relaxed">Execution roadmap, problem/solution matrix, and founder contact info are gated. Gain full intelligence using 1 credit point.</p>
                        <button 
                            onClick={handleUnlock}
                            disabled={isUnlocking}
                            className={`w-full lg:w-auto px-8 py-4 bg-[#F24C20] text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-xl shadow-orange-500/20 active:scale-95 transition-all disabled:opacity-50`}
                        >
                            {isUnlocking ? 'Authorizing...' : 'Unlock Full Access'}
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <button 
                            onClick={handleScheduleMeet}
                            className="w-full sm:w-auto px-8 py-4 bg-[#F24C20] text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all hover:bg-orange-600 shadow-xl shadow-[#F24C20]/20 hover:scale-105 active:scale-95"
                        >
                            Schedule Meeting
                        </button>
                        <button className={`w-full sm:w-auto px-8 py-4 rounded-2xl border font-black transition-all hover:scale-105 active:scale-95 ${
                            isDarkMode 
                            ? 'border-white/10 bg-white/5 hover:bg-white/10 text-white' 
                            : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700 shadow-lg'
                        }`}>
                            <Heart className={`w-5 h-5 mx-auto ${idea.isSaved ? 'fill-current text-red-500' : ''}`} />
                        </button>
                    </div>
                )}
              </div>

              {/* Sidebar Preview */}
              <div className={`rounded-3xl lg:rounded-[40px] border p-6 lg:p-8 shadow-2xl ${
                  isDarkMode 
                  ? 'border-white/10 bg-[#0b0d14] shadow-black/40' 
                  : 'border-gray-100 bg-white shadow-neutral-200/50'
              }`}>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-3 lg:gap-4">
                    {/* Expert Column */}
                    <div className={`rounded-xl lg:rounded-3xl border p-3 lg:p-4 transition-all overflow-hidden flex flex-col justify-center ${
                        isDarkMode 
                        ? 'border-white/10 bg-white/5' 
                        : 'border-gray-100 bg-gray-50'
                    }`}>
                        <div className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-[#F24C20] mb-2">
                             Professional
                        </div>
                        <div className="flex items-center gap-1.5 lg:gap-3">
                            <div className="shrink-0 relative">
                                {idea.creator?.profile_image ? (
                                    <img src={idea.creator.profile_image} className="w-6 h-6 lg:w-10 lg:h-10 rounded-full object-cover border border-white/10" />
                                ) : (
                                    <div className="w-6 h-6 lg:w-10 lg:h-10 rounded-full bg-[#F24C20]/10 flex items-center justify-center text-[#F24C20] text-[8px] lg:text-sm font-black">
                                        {idea.creator?.full_name?.charAt(0)}
                                    </div>
                                )}
                                <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-neutral-900" />
                            </div>
                            <div className="min-w-0">
                                <h4 className="font-bold text-[9px] lg:text-sm text-white truncate leading-tight uppercase tracking-tight">
                                    {idea.creator?.full_name}
                                </h4>
                            </div>
                        </div>
                    </div>

                    {/* Ref ID Column */}
                    <DetailItem 
                        label="Ref ID" 
                        value={`#${idea._id.slice(-8).toUpperCase()}`} 
                        icon={<Target className="w-3 h-3 text-[#F24C20]" />} 
                        darkMode={isDarkMode} 
                    />

                    {/* Location Column */}
                    <DetailItem 
                        label="Location" 
                        value={idea.creator?.location || 'India'} 
                        icon={<Globe className="w-3 h-3 text-[#F24C20]" />} 
                        darkMode={isDarkMode} 
                    />

                    {/* Updated Column */}
                    <DetailItem 
                        label="Updated" 
                        value={new Date(idea.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} 
                        icon={<Clock className="w-3 h-3 text-[#F24C20]" />} 
                        darkMode={isDarkMode} 
                    />
                  </div>

                  <div className={`p-6 rounded-2xl lg:rounded-3xl bg-gradient-to-br from-[#F24C20] to-[#E23C10] text-white text-center shadow-lg shadow-orange-500/20`}>
                      <p className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Estimated Valuation</p>
                      <p className="text-2xl lg:text-3xl font-black">{idea.fundingAmount || "Seed Stage"}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="grid gap-8 lg:gap-12 xl:grid-cols-[1.6fr,0.9fr]">
            <div className="space-y-8 lg:space-y-12">
              <SectionCard title="Concept Overview" darkMode={isDarkMode}>
                <div className={`text-base lg:text-lg leading-relaxed whitespace-pre-wrap font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  {idea.detailedDescription}
                </div>
              </SectionCard>

              <SectionCard title="Problem & Solution Matrix" darkMode={isDarkMode}>
                <div className="space-y-4 lg:space-y-6">
                  <DetailItem label="The Friction (Problem)" value={idea.problem} className="border-red-500/20 bg-red-500/5 text-slate-300" darkMode={isDarkMode} />
                  <DetailItem label="The Evolution (Solution)" value={idea.solution} className="border-emerald-500/20 bg-emerald-500/5 text-slate-300" darkMode={isDarkMode} />
                  <DetailItem label="Why It Scales (USP)" value={idea.uniqueness} className="border-blue-500/20 bg-blue-500/5 text-slate-300" darkMode={isDarkMode} />
                </div>
              </SectionCard>

              <SectionCard title="Market Realignment" darkMode={isDarkMode}>
                <div className="grid md:grid-cols-2 gap-4 lg:gap-6">
                  <DetailItem label="Target Segment" value={idea.targetAudience} darkMode={isDarkMode} />
                  <DetailItem label="Market Potential" value={idea.marketSize} darkMode={isDarkMode} />
                </div>
              </SectionCard>

              <SectionCard title="Roadmap & Sustainability" darkMode={isDarkMode}>
                <div className="space-y-6 lg:space-y-8">
                  <div className="p-6 lg:p-8 rounded-2xl lg:rounded-[32px] bg-gradient-to-br from-indigo-900/40 to-black/40 border border-indigo-500/30">
                     <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Capital Allocation Model</p>
                     <p className={`text-xs lg:text-sm leading-relaxed ${isDarkMode ? 'text-indigo-100' : 'text-slate-600'}`}>{idea.useOfFunds}</p>
                  </div>
                  <DetailItem label="Strategic Milestones" value={idea.milestones} darkMode={isDarkMode} />
                </div>
              </SectionCard>
            </div>

            <div className="space-y-6 lg:space-y-8">
              <SectionCard title="Intelligence Summary" darkMode={isDarkMode}>
                <div className="space-y-1 text-sm font-medium">
                  <SummaryRow label="Stage" value={idea.status === 'approved' ? 'Growth Ready' : 'Incubation'} darkMode={isDarkMode} />
                  <SummaryRow label="Domain" value={idea.category} darkMode={isDarkMode} />
                  <SummaryRow label="Legality" value={idea.ndaRequired === 'Yes' ? 'NDA Required' : 'Public Domain'} darkMode={isDarkMode} highlight={idea.ndaRequired === 'Yes'} />
                  <SummaryRow label="Creator Verification" value="Identity Verified" darkMode={isDarkMode} color="text-emerald-500" />
                </div>
              </SectionCard>

              {!isOwner ? (
                <div className={`p-6 lg:p-8 rounded-2xl lg:rounded-[40px] border shadow-2xl relative overflow-hidden group ${
                    isDarkMode 
                    ? 'border-white/10 bg-[#0b0d14] shadow-black/40' 
                    : 'border-gray-100 bg-white shadow-neutral-200/50'
                }`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#F24C20]/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                  <h2 className="text-xl lg:text-2xl font-black mb-6 flex items-center gap-3">
                      <MessageCircle className="w-6 h-6 text-[#F24C20]" />
                      Investor Access
                  </h2>
                  <p className="text-slate-400 text-xs lg:text-sm leading-6 lg:leading-7 mb-8">
                    Interested in the expansion of this approved concept? Connect with the founder team to explore funding, strategic partnerships, or operational collaboration.
                  </p>
                  <div className="space-y-4">
                    <button 
                      onClick={handleRequestDeck}
                      disabled={submitting}
                      className="w-full py-4 bg-[#F24C20] text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-[#F24C20]/20 hover:scale-[1.02] disabled:opacity-50 transition-transform"
                    >
                      {submitting ? 'Processing...' : 'Request Pitch Deck'}
                    </button>
                    <button 
                      onClick={handleScheduleMeet}
                      disabled={submitting}
                      className={`w-full py-4 rounded-2xl border font-black uppercase tracking-widest text-sm transition-all hover:scale-[1.02] disabled:opacity-50 ${
                        isDarkMode 
                        ? 'border-white/10 bg-white/5 hover:bg-white/10 text-white' 
                        : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                    }`}>
                      Schedule Founder Meet
                    </button>
                  </div>
                </div>
              ) : (
                <div className={`p-6 lg:p-8 rounded-2xl lg:rounded-[40px] border shadow-2xl relative overflow-hidden group ${
                    isDarkMode 
                    ? 'border-white/10 bg-emerald-500/5 shadow-black/40' 
                    : 'border-emerald-100 bg-emerald-50 shadow-neutral-200/50'
                }`}>
                   <h2 className="text-xl lg:text-2xl font-black mb-4 flex items-center gap-3 text-emerald-500">
                      <ShieldCheck className="w-6 h-6" />
                      Concept Owned
                  </h2>
                  <p className="text-slate-400 text-xs lg:text-sm leading-6 lg:leading-7">
                    You are viewing your own published concept. Investors will see contact options and pitch deck requests here.
                  </p>
                </div>
              )}

              {idea.tags && idea.tags.length > 0 && (
                <SectionCard title="Innovation Tags" darkMode={isDarkMode}>
                    <div className="flex flex-wrap gap-2">
                        {idea.tags.map((tag: string) => (
                            <span key={tag} className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest ${
                                isDarkMode ? 'bg-white/5 border border-white/10 text-slate-400' : 'bg-gray-100 text-gray-600'
                            }`}>
                                {tag}
                            </span>
                        ))}
                    </div>
                </SectionCard>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function SectionCard({ title, children, darkMode }: any) {
  return (
    <section className={`rounded-3xl lg:rounded-[40px] border p-6 lg:p-10 transition-all ${
        darkMode 
        ? 'border-white/10 bg-[#0b0d14] shadow-2xl shadow-black/20' 
        : 'border-gray-100 bg-white shadow-neutral-100'
    }`}>
      <div className="flex items-center gap-3 lg:gap-4 mb-6 lg:mb-8">
          <div className="w-1.5 h-6 bg-[#F24C20] rounded-full" />
          <h2 className="text-base lg:text-2xl font-black uppercase tracking-widest text-white leading-tight">{title}</h2>
      </div>
      <div>{children}</div>
    </section>
  );
}

function DetailItem({ label, value, icon, className = "", darkMode }: any) {
  return (
    <div className={`rounded-xl lg:rounded-3xl border p-3 lg:p-6 transition-all group flex flex-col justify-center ${
        darkMode 
        ? 'border-white/10 bg-white/5 hover:bg-white/[0.08]' 
        : 'border-gray-100 bg-gray-50 hover:bg-gray-100'
    } ${className}`}>
      <div className="flex items-center gap-1.5 text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-[#F24C20] mb-2 lg:mb-3">
        {icon && <span className="shrink-0">{icon}</span>}
        <span className="truncate">{label}</span>
      </div>
      <div className={`text-[10px] lg:text-base leading-tight font-black uppercase tracking-tight ${darkMode ? 'text-white' : 'text-gray-800'} line-clamp-2`}>
        {value || "-"}
      </div>
    </div>
  );
}

function SummaryRow({ label, value, darkMode, highlight, color }: any) {
    return (
        <div className={`flex items-center justify-between py-4 border-b ${darkMode ? 'border-white/5' : 'border-gray-100'}`}>
            <span className="text-slate-500 uppercase text-[9px] lg:text-[10px] font-black tracking-widest mr-4">{label}</span>
            <span className={`text-sm font-black text-right ${color ? color : (highlight ? 'text-[#F24C20]' : 'text-white')}`}>
                {value}
            </span>
        </div>
    );
}

function Clock(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  );
}
