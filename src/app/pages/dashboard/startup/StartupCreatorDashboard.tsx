import { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "@/app/utils/api";
import { toast } from "sonner";
import { 
  Loader2, 
  RefreshCw, 
  Layers, 
  Users, 
  Calendar, 
  MessageSquare, 
  Shield, 
  UserCircle2, 
  Settings as SettingsIcon,
  CheckCircle,
  TrendingUp,
  FileText,
  Search,
  Briefcase,
  Lightbulb,
  Plus,
  ArrowUpRight,
  Clock,
  Eye,
  Heart,
  ChevronRight,
  DollarSign,
  Rocket
} from "lucide-react";
import PremiumDashboardLayout from "@/app/components/dashboard/PremiumDashboardLayout";
import ChatWindow from "@/app/components/dashboard/ChatWindow";
import KYCSettings from "@/app/components/dashboard/KYCSettings";
import StartupIdeaForm from "@/app/components/dashboard/StartupIdeaForm";
import SubscriptionCredits from "@/app/pages/dashboard/shared/SubscriptionCredits";
import ExploreStartupIdeas from "@/app/pages/dashboard/shared/ExploreStartupIdeas";
import StartupIdeaDashboardDetail from "@/app/pages/dashboard/shared/StartupIdeaDashboardDetail";
import Settings from "@/app/pages/dashboard/shared/Settings";
import { useTheme } from "@/app/components/ThemeProvider";
import { motion, AnimatePresence } from "motion/react";

// --- Specialized UI Components ---

function Badge({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'success' | 'warning' | 'error' | 'info' }) {
    const styles = {
      default: "border-neutral-800 bg-neutral-900 text-neutral-400 font-bold",
      success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-black",
      warning: "border-orange-500/30 bg-orange-500/10 text-orange-400 font-black",
      error: "border-red-500/30 bg-red-500/10 text-red-400 font-black",
      info: "border-blue-500/30 bg-blue-500/10 text-blue-400 font-black"
    };
    return (
      <span className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-wider ${styles[variant]}`}>
        {children}
      </span>
    );
}

function StatCard({ label, value, icon: Icon, trend }: { label: string; value: string; icon: any; trend?: string }) {
    const { isDarkMode } = useTheme();
    return (
        <motion.div 
            whileHover={{ y: -5 }}
            className={`rounded-3xl border p-6 transition-all ${isDarkMode ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'}`}
        >
            <div className="flex items-start justify-between">
                <div className={`rounded-2xl p-4 ${isDarkMode ? 'bg-neutral-800' : 'bg-neutral-100'}`}>
                    <Icon className="w-8 h-8 text-[#F24C20]" />
                </div>
            </div>
            <div className="mt-6">
                <div className="text-sm font-bold text-neutral-500 uppercase tracking-widest">{label}</div>
                <div className={`mt-2 text-4xl font-black ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>{value}</div>
                {trend && (
                    <div className="mt-2 flex items-center gap-1 text-xs font-bold text-emerald-400">
                        <TrendingUp className="w-3 h-3" />
                        {trend}
                    </div>
                )}
            </div>
        </motion.div>
    );
}

function IdeaCard({ idea }: { idea: any }) {
    const { isDarkMode } = useTheme();
    const ideaTitle = idea?.title || idea?.name || 'Untitled Idea';
    const ideaCategory = typeof idea?.category === 'object'
      ? (idea.category?.name || idea.category?.title || 'Uncategorized')
      : (idea?.category || 'Uncategorized');

    return (
        <div className={`group relative flex flex-col rounded-[2.5rem] border transition-all duration-500 overflow-hidden min-h-[480px] ${
            isDarkMode 
            ? 'bg-[#0b0d14] border-neutral-800' 
            : 'bg-white border-neutral-200'
          }`}
        >
          {/* Subtle Aura Border */}
          <div className="absolute inset-0 border border-[#F24C20]/0 group-hover:border-[#F24C20]/20 rounded-[2.5rem] transition-all pointer-events-none" />

          <div className="p-8 pb-0">
            <div className="flex items-center justify-between mb-6">
              <div className="flex flex-col gap-2">
                 <span className="px-3 py-1 bg-white/5 border border-white/10 text-[#F24C20] text-[9px] font-black uppercase tracking-widest rounded-lg self-start">
                   {ideaCategory}
                 </span>
                 <span className="px-3 py-1 bg-white/5 border border-white/10 text-neutral-400 text-[9px] font-black uppercase tracking-widest rounded-lg self-start">
                   {idea.stage || 'Market MVP'}
                 </span>
              </div>
              <Badge variant={idea.status === 'approved' ? 'success' : idea.status === 'pending' ? 'warning' : 'default'}>
                  {idea.status}
              </Badge>
            </div>

            <h4 className={`text-2xl font-black mb-3 leading-tight group-hover:text-[#F24C20] transition-colors line-clamp-2 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>{ideaTitle}</h4>
            <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 mb-8 font-medium">
              {idea.shortDescription}
            </p>

            {/* Performance Stats Row */}
            <div className="grid grid-cols-3 gap-3 mb-8">
               {[
                  { label: 'Views', value: idea.views || '0', color: isDarkMode ? 'text-white' : 'text-neutral-900' },
                  { label: 'Leads', value: idea.contacts?.length || '0', color: isDarkMode ? 'text-white' : 'text-neutral-900' },
                  { label: 'Ask', value: idea.fundingAmount ? `$${idea.fundingAmount/1000}k` : 'N/A', color: 'text-[#F24C20]' }
               ].map((stat, i) => (
                 <div key={i} className={`rounded-2xl p-4 text-center border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-neutral-50 border-neutral-100'}`}>
                    <div className={`text-base font-black ${stat.color}`}>{stat.value}</div>
                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{stat.label}</div>
                 </div>
               ))}
            </div>

            {/* Specialist Badges */}
            <div className="flex flex-wrap gap-2 mb-8">
               {(idea.neededRoles || ['Talent Search Active']).slice(0, 2).map((role: string, i: number) => (
                 <span key={i} className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-tighter border ${isDarkMode ? 'bg-neutral-900 border-neutral-800 text-slate-300' : 'bg-neutral-100 border-neutral-200 text-neutral-600'}`}>
                    {role}
                 </span>
               ))}
            </div>
          </div>

          <div className={`mt-auto p-8 pt-0 border-t ${isDarkMode ? 'border-white/5 bg-white/5' : 'border-neutral-100 bg-neutral-50/50'}`}>
            <div className="flex items-center justify-between mt-6">
                <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-500 uppercase">
                    <Clock className="w-3.5 h-3.5" />
                    Live since {new Date(idea.createdAt).toLocaleDateString()}
                </div>
                <button 
                    onClick={() => navigate(`/dashboard-startup/ideas/${idea._id}`)}
                    className="p-3 rounded-2xl bg-[#F24C20] text-white hover:scale-110 transition-all shadow-xl shadow-[#F24C20]/20"
                    title={`Open ${ideaTitle}`}
                >
                    <ArrowUpRight className="w-4 h-4" />
                </button>
            </div>
          </div>
        </div>
    );
}

function MeetingItem({ meeting }: { meeting: any }) {
    const { isDarkMode } = useTheme();
    return (
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 rounded-3xl border gap-4 transition-all ${isDarkMode ? 'bg-neutral-900/20 border-neutral-800 hover:bg-neutral-800/20' : 'bg-white border-neutral-100 hover:bg-neutral-50 shadow-sm'}`}>
            <div className="flex items-center gap-4 sm:gap-5">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#F24C20]/10 flex flex-col items-center justify-center font-black flex-shrink-0">
                    <span className="text-[10px] text-[#F24C20] uppercase tracking-widest leading-none">{new Date(meeting.meeting_date).toLocaleString('default', { month: 'short' })}</span>
                    <span className={`text-xl sm:text-2xl leading-none mt-1 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>{new Date(meeting.meeting_date).getDate()}</span>
                </div>
                <div className="min-w-0">
                  <h5 className={`text-sm sm:text-base font-black truncate ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>{meeting.investor?.full_name || 'Anonymous Investor'}</h5>
                  <p className="text-[10px] sm:text-xs font-bold text-[#F24C20] uppercase tracking-tight mt-0.5 truncate">{meeting.startup_idea?.title || 'Idea Discussion'}</p>
                </div>
            </div>
            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-neutral-800/50">
                <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-neutral-500 uppercase tracking-widest">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-[#F24C20]" />
                    {new Date(meeting.meeting_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <button className={`px-4 sm:px-5 py-2 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] transition-all shadow-xl ${
                    meeting.status === 'scheduled' ? 'bg-[#F24C20] text-white shadow-[#F24C20]/20' : 'bg-neutral-800 text-neutral-500'
                }`}>
                    {meeting.status === 'scheduled' ? 'Start Intro' : meeting.status}
                </button>
            </div>
        </div>
    );
}

// --- Main Dashboard Component ---

export default function StartupCreatorDashboard() {
  const { isDarkMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const getIdeaTitle = (idea: any) => idea?.title || idea?.name || 'Untitled Idea';
  const getIdeaCategory = (idea: any) => {
    if (!idea?.category) return 'Uncategorized';
    if (typeof idea.category === 'object') return idea.category.name || idea.category.title || 'Uncategorized';
    return idea.category;
  };

  // Data State
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalIdeas: 0, approved: 0, investorLeads: 0, unreadMessages: 0 });
  const [ideas, setIdeas] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [kycStatus, setKycStatus] = useState('unverified');

  // Navigation State
  const [activeMenuId, setActiveMenuId] = useState('overview');
  const [activeSubId, setActiveSubId] = useState<string | null>(null);

  useEffect(() => {
    const path = location.pathname;
    const parts = path.split('/').filter(p => p !== '');
    
    if (path === '/dashboard-startup' || parts.length === 1) {
        setActiveMenuId('overview');
        setActiveSubId(null);
    } else {
        setActiveMenuId(parts[1]);
        setActiveSubId(parts[2] || null);
    }
  }, [location.pathname]);

  const handleNav = (menu: string, sub?: string) => {
      const path = menu === 'overview' ? '/dashboard-startup' : `/dashboard-startup/${menu}${sub ? `/${sub}` : ''}`;
      navigate(path);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [s, i, m, c] = await Promise.all([
        api.get('/startup-ideas/my-stats'),
        api.get('/startup-ideas/my-ideas'),
        api.get('/meetings'),
        api.get('/messages/conversations')
      ]);
      if (s.data.success) setStats(s.data.data);
      if (i.data.success) setIdeas(i.data.data);
      if (m.data.success) setMeetings(m.data.data);
      if (c.data.success) setConversations(c.data.data);

      const kRes = await api.get('/kyc/status');
      if (kRes.data.success) setKycStatus(kRes.data.data.status);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-[#F24C20] animate-spin" />
      </div>
    );
  }

  return (
    <PremiumDashboardLayout userType="startup_creator">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Dynamic Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="flex flex-wrap items-center gap-3">
                    <h1 className={`text-2xl sm:text-4xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                        Founder <span className="text-[#F24C20]">Command Center</span>
                    </h1>
                    <Badge variant={kycStatus === 'fully_verified' ? 'success' : kycStatus === 'pending' ? 'warning' : 'default'}>
                        {kycStatus.replace('_', ' ')}
                    </Badge>
                </div>
                <p className={`mt-2 text-sm sm:text-base font-medium ${isDarkMode ? 'text-neutral-500' : 'text-neutral-500'}`}>
                    Global pitch oversight and investor lead intelligence.
                </p>
            </motion.div>

            {/* Dynamic Sliding Marquee for Founder Dashboard */}
            <div className={`hidden xl:flex flex-1 overflow-hidden relative rounded-2xl border h-14 items-center max-w-xl ${isDarkMode ? 'bg-neutral-900/30 border-neutral-800' : 'bg-neutral-50 border-neutral-100'}`}>
              <div className="absolute left-0 top-0 bottom-0 px-3 bg-[#F24C20] text-white flex items-center z-10 skew-x-[-12deg] -ml-2">
                 <div className="skew-x-[12deg] flex items-center gap-2">
                    <Rocket className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-tighter">GLOBAL PULSE</span>
                 </div>
              </div>
              <div className="flex w-full overflow-hidden ml-16">
                 <motion.div 
                   animate={{ x: ["100%", "-200%"] }}
                   transition={{ 
                     repeat: Infinity, 
                     duration: 35, 
                     ease: "linear" 
                   }}
                   className="flex items-center gap-12 whitespace-nowrap"
                 >
                    {ideas.length > 0 ? ideas.slice(0, 5).map((idea, i) => (
                      <div key={idea._id || i} className="flex items-center gap-3">
                         <span className="w-1.5 h-1.5 rounded-full bg-[#F24C20]" />
                         <span className={`text-[11px] font-black uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>{getIdeaTitle(idea)}</span>
                         <span className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[8px] font-bold text-[#F24C20] uppercase">{getIdeaCategory(idea)}</span>
                      </div>
                    )) : (
                      <span className="text-xs text-neutral-500 font-bold uppercase tracking-widest">Scanning global marketplace...</span>
                    )}
                 </motion.div>
              </div>
           </div>

            <div className="flex items-center gap-3">
                <button 
                   onClick={fetchData}
                   className={`p-3 rounded-2xl border transition-all ${isDarkMode ? 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white' : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'}`}
                >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button 
                  onClick={() => {
                      if (kycStatus !== 'fully_verified') {
                          toast.error('KYC verification required to submit startup ideas. Please complete your profile in Settings section.', {
                              action: {
                                  label: 'Settings',
                                  onClick: () => handleNav('settings')
                              }
                          });
                          return;
                      }
                      handleNav('ideas', 'new');
                  }}
                  className="flex items-center gap-2 rounded-2xl bg-[#F24C20] px-6 py-3 font-bold text-white shadow-xl shadow-[#F24C20]/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    New Startup Pitch
                </button>
            </div>
        </div>

        {/* --- SECTION: OVERVIEW --- */}
        {activeMenuId === 'overview' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard label="Live pitches" value={stats.totalIdeas.toString()} icon={Lightbulb} trend="+1 this week" />
                    <StatCard label="Approved Decks" value={stats.approved.toString()} icon={CheckCircle} />
                    <StatCard label="Investor Leads" value={stats.investorLeads.toString()} icon={Users} trend="+3 interests" />
                    <StatCard label="Unread Msgs" value={stats.unreadMessages.toString()} icon={MessageSquare} trend="Active threads" />
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Ideas Gallery */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>Current Portfolios</h3>
                            <button onClick={() => handleNav('ideas')} className="text-sm font-bold text-[#F24C20] hover:underline">Manage All</button>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {ideas.slice(0, 4).length > 0 ? ideas.slice(0, 4).map(idea => (
                                <IdeaCard key={idea._id} idea={idea} />
                            )) : (
                                <div className="col-span-2 py-20 text-center border-2 border-dashed border-neutral-800 rounded-3xl text-neutral-600">
                                    Your portfolio is empty. Launch your first idea.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Leads & Meetings Side */}
                    <div className="space-y-6">
                         <div className="flex items-center justify-between">
                            <h3 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>Upcoming</h3>
                            <button onClick={() => handleNav('meetings')} className="text-sm font-bold text-[#F24C20] hover:underline">Calendar</button>
                        </div>
                        <div className={`rounded-3xl border p-4 space-y-3 ${isDarkMode ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white border-neutral-100'}`}>
                                {meetings.slice(0, 5).length > 0 ? meetings.slice(0, 5).map(m => (
                                    <MeetingItem key={m._id} meeting={m} />
                                )) : (
                                    <div className="py-12 text-center text-xs text-neutral-500 italic">No meetings scheduled.</div>
                                )}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- SECTION: IDEAS --- */}
        {activeMenuId === 'ideas' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
                 {activeSubId === 'new' ? (
                    <div className="space-y-8">
                         <div className="flex items-center gap-4">
                            <button 
                                onClick={() => handleNav('ideas')}
                                className="p-3 rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-all shadow-xl"
                            >
                                <ChevronRight className="w-5 h-5 rotate-180" />
                            </button>
                            <div>
                                <h2 className={`text-3xl font-black italic tracking-tighter ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>Pitch Deck <span className="text-[#F24C20]">Launchpad</span></h2>
                                <p className="text-xs font-bold text-neutral-500 uppercase tracking-[0.3em] mt-2">Initialize your venture's trajectory.</p>
                            </div>
                        </div>

                        <StartupIdeaForm 
                            onSuccess={() => {
                                fetchData();
                                handleNav('ideas');
                            }} 
                            onCancel={() => handleNav('ideas')}
                        />
                    </div>
                 ) : activeSubId ? (
                    <div className="space-y-8">
                         <div className="flex items-center gap-4">
                            <button 
                                onClick={() => handleNav('ideas')}
                                className="p-3 rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-all shadow-xl"
                            >
                                <ChevronRight className="w-5 h-5 rotate-180" />
                            </button>
                            <h2 className={`text-2xl font-black italic tracking-tighter ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>Concept <span className="text-[#F24C20]">Intelligence</span></h2>
                        </div>
                        <StartupIdeaDashboardDetail ideaId={activeSubId} />
                    </div>
                 ) : (
                    <>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h2 className={`text-2xl sm:text-3xl font-black ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>Pitch Collection</h2>
                                <p className="text-xs sm:text-sm font-bold text-neutral-500 uppercase tracking-widest mt-1">Manage, Edit and Track your startup ideas.</p>
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {ideas.map(idea => (
                                <IdeaCard key={idea._id} idea={idea} />
                            ))}
                            <button 
                                onClick={() => {
                                    if (kycStatus !== 'fully_verified') {
                                        toast.error('KYC verification required. Please complete your profile in Settings.', {
                                            action: {
                                                label: 'Settings',
                                                onClick: () => handleNav('settings')
                                            }
                                        });
                                        return;
                                    }
                                    handleNav('ideas', 'new');
                                }}
                                className={`group rounded-[2rem] sm:rounded-[2.5rem] border-2 sm:border-4 border-dashed flex flex-col items-center justify-center p-8 sm:p-12 transition-all hover:bg-[#F24C20]/5 hover:border-[#F24C20]/50 min-h-[200px] sm:min-h-[300px] ${isDarkMode ? 'border-neutral-800' : 'border-neutral-200'}`}
                            >
                                <div className="w-12 h-12 sm:w-20 sm:h-20 rounded-xl sm:rounded-[2rem] bg-neutral-900 flex items-center justify-center group-hover:bg-[#F24C20] group-hover:rotate-12 transition-all mb-4 sm:mb-6" >
                                    <Plus className="w-6 h-6 sm:w-10 sm:h-10 text-neutral-400 group-hover:text-white" />
                                </div>
                                <span className="text-xs sm:text-base font-black text-neutral-500 group-hover:text-[#F24C20] uppercase tracking-widest">New Presentation</span>
                            </button>
                        </div>
                    </>
                 )}
            </div>
        )}

        {/* --- SECTION: ANALYTICS --- */}
        {activeMenuId === 'analytics' && (
             <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
                <h2 className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>Traction Metrics</h2>
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className={`lg:col-span-2 rounded-[3.5rem] border p-12 flex flex-col items-center justify-center min-h-[400px] ${isDarkMode ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white border-neutral-100'}`}>
                        <div className="p-8 rounded-full bg-blue-500/10 mb-8 animate-pulse">
                            <TrendingUp className="w-20 h-20 text-blue-500" />
                        </div>
                        <h4 className="text-2xl font-black text-white">Visual Insights Coming Soon</h4>
                        <p className="mt-4 text-neutral-500 font-bold max-w-sm text-center uppercase tracking-widest text-xs">
                            We are integrating interactive charts to help you visualize investor behavior.
                        </p>
                    </div>
                    <div className="space-y-6">
                         <div className={`p-8 rounded-[3rem] border ${isDarkMode ? 'bg-[#F24C20]/10 border-[#F24C20]/30' : 'bg-orange-50 border-orange-200'}`}>
                            <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#F24C20] mb-4">Top Performing Pitch</h5>
                            <h3 className="text-2xl font-black text-white">{ideas[0] ? getIdeaTitle(ideas[0]) : 'N/A'}</h3>
                            <div className="mt-6 flex items-center gap-6">
                                <div>
                                    <span className="text-[8px] font-black uppercase text-neutral-500">Total Views</span>
                                    <span className="block text-xl font-black text-white">{ideas[0]?.views || 0}</span>
                                </div>
                                <div className="w-px h-8 bg-neutral-800" />
                                <div>
                                    <span className="text-[8px] font-black uppercase text-neutral-500">C-Rate</span>
                                    <span className="block text-xl font-black text-white">4.2%</span>
                                </div>
                            </div>
                         </div>
                    </div>
                </div>
             </div>
        )}

        {/* --- SECTION: MESSAGES --- */}
        {activeMenuId === 'messages' && (
            <div className="flex flex-col md:flex-row h-[80vh] md:h-[75vh] rounded-[2rem] sm:rounded-[3.5rem] border overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-700 bg-black/20 backdrop-blur-3xl border-neutral-800 relative">
                {/* Conversations Sidebar */}
                <div className={`w-full md:w-80 lg:w-96 border-r border-neutral-800 flex flex-col ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-6 sm:p-8 border-b border-neutral-800">
                        <h3 className="text-xl sm:text-2xl font-black text-white italic tracking-tighter">Founder Inbox</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {conversations.length > 0 ? conversations.map(conv => (
                            <div 
                                key={conv.user?._id || conv._id} 
                                onClick={() => setSelectedConversation(conv)}
                                className={`p-4 rounded-3xl flex items-center gap-4 cursor-pointer transition-all border ${
                                    selectedConversation?.user?._id === conv.user?._id 
                                    ? 'bg-[#F24C20]/10 border-[#F24C20]/30 shadow-lg shadow-[#F24C20]/5' 
                                    : 'hover:bg-neutral-800 border-transparent'
                                }`}
                            >
                                <div className="relative flex-shrink-0">
                                    <div className="w-12 h-12 rounded-2xl bg-neutral-700 overflow-hidden ring-2 ring-neutral-800">
                                         <img src={conv.user?.profile_image || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100"} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    {conv.unreadCount > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#F24C20] rounded-full ring-4 ring-neutral-900 shadow-xl" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <span className={`text-sm font-black truncate ${selectedConversation?.user?._id === conv.user?._id ? 'text-[#F24C20]' : 'text-white'}`}>{conv.user?.full_name}</span>
                                    </div>
                                    <p className="text-[10px] font-bold text-neutral-500 truncate uppercase tracking-tight">{conv.lastMessage?.content}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="py-20 text-center text-neutral-500 italic text-sm">No conversations yet.</div>
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className={`flex-1 flex flex-col h-full bg-neutral-900/60 transition-all ${selectedConversation ? 'flex' : 'hidden md:flex'}`}>
                    {selectedConversation ? (
                        <ChatWindow 
                            otherUser={selectedConversation.user} 
                            onClose={() => setSelectedConversation(null)} 
                        />
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 sm:p-12">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[2rem] bg-neutral-800 flex items-center justify-center mb-8 rotate-3 shadow-2xl">
                                <MessageSquare className="w-8 h-8 sm:w-10 sm:h-10 text-neutral-600 -rotate-3" />
                            </div>
                            <h4 className="text-xl sm:text-2xl font-black text-white italic tracking-tighter">Engage with Investors</h4>
                            <p className="mt-3 text-[10px] sm:text-sm font-bold text-neutral-500 max-w-sm uppercase tracking-[0.2em] leading-relaxed">
                                Negotiate terms and secure your funding. Select a thread to start chatting.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        )}
        {/* MARKETPLACE ACCESS REMOVED - ONLY INVESTOR ACCESS */}

        {/* --- SECTION: SETTINGS --- */}
        {activeMenuId === 'settings' && (
            <div className="animate-in fade-in slide-in-from-bottom-5 duration-500">
                <Settings />
            </div>
        )}

        {/* --- SECTION: SUBSCRIPTION --- */}
        {activeMenuId === 'subscription' && (
            <div className="animate-in fade-in slide-in-from-bottom-5 duration-500">
                <SubscriptionCredits />
            </div>
        )}

      </div>
    </PremiumDashboardLayout>
  );
}
