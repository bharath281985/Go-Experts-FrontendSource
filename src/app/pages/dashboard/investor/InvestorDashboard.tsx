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
  ExternalLink,
  Plus,
  Clock,
  MapPin,
  TrendingDown,
  DollarSign,
  ChevronRight,
  Filter,
  Bookmark
} from "lucide-react";
import PremiumDashboardLayout from "@/app/components/dashboard/PremiumDashboardLayout";
import ChatWindow from "@/app/components/dashboard/ChatWindow";
import KYCSettings from "@/app/components/dashboard/KYCSettings";
import SubscriptionCredits from "@/app/pages/dashboard/shared/SubscriptionCredits";
import { useTheme } from "@/app/components/ThemeProvider";
import { motion, AnimatePresence } from "motion/react";

// --- Specialized UI Components ---

function Badge({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'success' | 'warning' | 'error' | 'info' }) {
  const styles = {
    default: "border-neutral-800 bg-neutral-900 text-neutral-400",
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    warning: "border-orange-500/30 bg-orange-500/10 text-orange-400",
    error: "border-red-500/30 bg-red-500/10 text-red-400",
    info: "border-blue-500/30 bg-blue-500/10 text-blue-400"
  };
  return (
    <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${styles[variant]}`}>
      {children}
    </span>
  );
}

function StatCard({ label, value, icon: Icon, trend }: { label: string; value: string; icon: any; trend?: string }) {
    const { isDarkMode } = useTheme();
    return (
        <motion.div 
            whileHover={{ y: -5 }}
            className={`rounded-2xl border p-6 transition-all ${isDarkMode ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'}`}
        >
            <div className="flex items-start justify-between">
                <div className={`rounded-xl p-3 ${isDarkMode ? 'bg-neutral-800' : 'bg-neutral-100'}`}>
                    <Icon className="w-6 h-6 text-[#F24C20]" />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-xs font-medium ${trend.startsWith('+') ? 'text-emerald-400' : 'text-neutral-500'}`}>
                        {trend.startsWith('+') ? <TrendingUp className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {trend}
                    </div>
                )}
            </div>
            <div className="mt-4">
                <div className={`text-sm font-medium ${isDarkMode ? 'text-neutral-500' : 'text-neutral-500'}`}>{label}</div>
                <div className={`mt-1 text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>{value}</div>
            </div>
        </motion.div>
    );
}

function DealCard({ deal }: { deal: any }) {
    const { isDarkMode } = useTheme();
    const idea = deal.startup_idea || {};
    return (
        <div className={`group rounded-2xl border p-5 transition-all hover:shadow-xl ${isDarkMode ? 'bg-neutral-900/40 border-neutral-800 hover:border-[#F24C20]/50' : 'bg-white border-neutral-200 hover:border-[#F24C20]/30 shadow-sm'}`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#F24C20]/10 flex items-center justify-center text-[#F24C20] font-bold">
                        {idea.title?.[0] || 'S'}
                    </div>
                    <div>
                        <h4 className={`font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>{idea.title || 'Untitled Startup'}</h4>
                        <p className="text-xs text-neutral-500">{idea.category || 'Tech/AI'}</p>
                    </div>
                </div>
                <Badge variant={deal.status === 'shortlisted' ? 'info' : deal.status === 'interested' ? 'success' : 'default'}>
                    {deal.status}
                </Badge>
            </div>
            
            <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-500">Ask Amount</span>
                    <span className={`font-semibold ${isDarkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>{idea.fundingAmount || 'N/A'}</span>
                </div>
                <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                    <div className="h-full bg-[#F24C20]" style={{ width: `${deal.score || 45}%` }} />
                </div>
                <div className="flex items-center justify-between text-[10px] text-neutral-500">
                    <span>Investment Score</span>
                    <span>{deal.score || 45}%</span>
                </div>
            </div>

            <div className="mt-5 pt-4 border-t border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <Clock className="w-3 h-3" />
                    {new Date(deal.updatedAt).toLocaleDateString()}
                </div>
                <button className="text-xs font-bold text-[#F24C20] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    View Data Room <ChevronRight className="w-3 h-3"/>
                </button>
            </div>
        </div>
    );
}

function StartupDiscoverCard({ idea }: { idea: any }) {
    const { isDarkMode } = useTheme();
    return (
        <div className={`rounded-2xl border overflow-hidden group ${isDarkMode ? 'bg-neutral-900/40 border-neutral-800' : 'bg-white border-neutral-200'}`}>
            <div className="relative h-32 bg-gradient-to-br from-[#F24C20]/20 to-orange-500/5 p-4 flex items-end">
                 <div className="absolute top-3 right-3">
                     <button className="p-2 rounded-lg bg-black/20 backdrop-blur-md text-white hover:bg-[#F24C20] transition-colors">
                        <Plus className="w-4 h-4" />
                     </button>
                 </div>
                 <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-lg px-2 py-1 text-[10px] font-bold text-white uppercase tracking-tight">
                    {idea.status}
                 </div>
            </div>
            <div className="p-5">
                <h4 className={`font-bold truncate ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>{idea.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-400">{idea.category}</span>
                </div>
                <p className="mt-3 text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                    {idea.shortDescription}
                </p>
                
                <div className="mt-5 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-[#F24C20]" />
                        <span className="text-sm font-bold text-[#F24C20]">{idea.fundingAmount || 'Hidden'}</span>
                    </div>
                    <button className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-neutral-100 text-neutral-600'}`}>
                        <ExternalLink className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

function MeetingItem({ meeting }: { meeting: any }) {
    const { isDarkMode } = useTheme();
    return (
        <div className={`flex items-center justify-between p-4 rounded-xl border ${isDarkMode ? 'bg-neutral-900/20 border-neutral-800 hover:bg-neutral-800/10' : 'bg-white border-neutral-100 hover:bg-neutral-50'}`}>
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold overflow-hidden ${isDarkMode ? 'bg-neutral-800' : 'bg-neutral-100'}`}>
                    <span className="text-[10px] text-[#F24C20] uppercase font-black">{new Date(meeting.meeting_date).toLocaleString('default', { month: 'short' })}</span>
                    <span className={`text-lg leading-none ${isDarkMode ? 'text-white' : 'text-black'}`}>{new Date(meeting.meeting_date).getDate()}</span>
                </div>
                <div>
                  <h5 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>{meeting.founder?.full_name || 'Founder'}</h5>
                  <p className="text-xs text-neutral-500 font-medium">{meeting.startup_idea?.title || 'General Intro'}</p>
                </div>
            </div>
            <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-400">
                    <Clock className="w-3 h-3" />
                    {new Date(meeting.meeting_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <button className={`mt-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    meeting.status === 'scheduled' ? 'bg-[#F24C20] text-white' : 'bg-neutral-800 text-neutral-500'
                }`}>
                    {meeting.status === 'scheduled' ? 'Join Now' : meeting.status}
                </button>
            </div>
        </div>
    );
}

// --- Main Dashboard Component ---

export default function InvestorDashboard() {
  const { isDarkMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [stats, setStats] = useState({ savedIdeas: 0, activeDeals: 0, meetings: 0, unreadMessages: 0 });
  const [pipeline, setPipeline] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [discoverIdeas, setDiscoverIdeas] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [kycStatus, setKycStatus] = useState('unverified');

  // Navigation State
  const [activeMenuId, setActiveMenuId] = useState('overview');
  const [activeSubId, setActiveSubId] = useState('summary');

  useEffect(() => {
    const path = location.pathname;
    if (path === '/dashboard-investor') {
        setActiveMenuId('overview');
        setActiveSubId('summary');
    } else {
        const parts = path.split('/').filter(p => p !== '');
        if (parts.length >= 2) {
            setActiveMenuId(parts[1]);
            setActiveSubId(parts[2] || '');
        }
    }
  }, [location.pathname]);

  const handleNav = (menu: string, sub: string = '') => {
      const path = menu === 'overview' ? '/dashboard-investor' : `/dashboard-investor/${menu}${sub ? `/${sub}` : ''}`;
      navigate(path);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [s, p, m, d, c] = await Promise.all([
        api.get('/investor/dashboard/stats'),
        api.get('/investor/dashboard/pipeline'),
        api.get('/meetings'),
        api.get('/startup-ideas'),
        api.get('/messages/conversations')
      ]);
      if (s.data.success) setStats(s.data.data);
      if (p.data.success) setPipeline(p.data.data);
      if (m.data.success) setMeetings(m.data.data);
      if (d.data.success) setDiscoverIdeas(d.data.data);
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
    <PremiumDashboardLayout userType="investor">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Floating Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
                <motion.h1 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`text-4xl font-black tracking-tight flex items-center gap-4 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}
                >
                    Investor <span className="text-[#F24C20]">Command Center</span>
                    <Badge variant={kycStatus === 'fully_verified' ? 'success' : kycStatus === 'pending' ? 'warning' : 'default'}>
                        {kycStatus.replace('_', ' ')}
                    </Badge>
                </motion.h1>
                <p className={`mt-2 font-medium ${isDarkMode ? 'text-neutral-500' : 'text-neutral-500'}`}>
                    Real-time venture intelligence and deal management.
                </p>
            </div>
            <div className="flex items-center gap-3">
                <button 
                   onClick={fetchData}
                   className={`p-3 rounded-2xl border transition-all ${isDarkMode ? 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white' : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'}`}
                >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button 
                  onClick={() => handleNav('discover')}
                  className="flex items-center gap-2 rounded-2xl bg-[#F24C20] px-6 py-3 font-bold text-white shadow-xl shadow-[#F24C20]/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    New Investment
                </button>
            </div>
        </div>

        {/* --- SECTION: OVERVIEW --- */}
        {activeMenuId === 'overview' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard label="Saved Ideas" value={stats.savedIdeas.toString()} icon={Bookmark} trend="+12% this week" />
                    <StatCard label="Active Deals" value={stats.activeDeals.toString()} icon={Briefcase} trend="+3 new" />
                    <StatCard label="Total Meetings" value={stats.meetings.toString()} icon={Calendar} trend="2 requested" />
                    <StatCard label="Unread Msgs" value={stats.unreadMessages.toString()} icon={MessageSquare} trend="5 active threads" />
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Pipeline Preview */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>Priority Deal Flow</h3>
                            <button onClick={() => handleNav('pipeline')} className="text-sm font-bold text-[#F24C20] hover:underline">View All Pipeline</button>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {pipeline.slice(0, 4).length > 0 ? pipeline.slice(0, 4).map(deal => (
                                <DealCard key={deal._id} deal={deal} />
                            )) : (
                                <div className="col-span-2 py-20 text-center border-2 border-dashed border-neutral-800 rounded-3xl text-neutral-600">
                                    Your deal flow is empty. Start discovering startups.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Upcoming Meetings */}
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

        {/* --- SECTION: PIPELINE / DEAL FLOW --- */}
        {activeMenuId === 'pipeline' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
                 <div className="flex items-center justify-between">
                    <div>
                        <h2 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>Manage Deal Flow</h2>
                        <p className="text-sm text-neutral-500">Organize and track your active investment opportunities.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className={`p-2.5 rounded-xl border ${isDarkMode ? 'border-neutral-800 text-neutral-400' : 'border-neutral-200 text-neutral-600'}`}>
                            <Filter className="w-5 h-5" />
                        </button>
                    </div>
                 </div>

                 <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {pipeline.map(deal => (
                        <DealCard key={deal._id} deal={deal} />
                    ))}
                    <button className={`group rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-8 transition-all hover:bg-[#F24C20]/5 hover:border-[#F24C20]/30 min-h-[200px] ${isDarkMode ? 'border-neutral-800' : 'border-neutral-200'}`}>
                        <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center group-hover:bg-[#F24C20] transition-colors mb-4">
                            <Plus className="w-6 h-6 text-neutral-400 group-hover:text-white" />
                        </div>
                        <span className="text-sm font-bold text-neutral-500 group-hover:text-[#F24C20]">Ad-hoc Deal</span>
                    </button>
                 </div>
            </div>
        )}

        {/* --- SECTION: DISCOVER --- */}
        {activeMenuId === 'discover' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-neutral-500">
                        <Search className="w-5 h-5" />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search sectors, technology, traction..."
                        className={`w-full pl-12 pr-6 py-4 rounded-3xl border-0 ring-1 outline-none focus:ring-2 focus:ring-[#F24C20] transition-all text-lg font-medium shadow-2xl ${isDarkMode ? 'bg-neutral-900 ring-neutral-800 text-white placeholder:text-neutral-600' : 'bg-white ring-neutral-200 text-neutral-900 placeholder:text-neutral-400'}`}
                    />
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {discoverIdeas.map(idea => (
                        <StartupDiscoverCard key={idea._id} idea={idea} />
                    ))}
                </div>
            </div>
        )}

        {/* --- SECTION: MEETINGS --- */}
        {activeMenuId === 'meetings' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
                 <div className="flex items-center justify-between mb-2">
                    <h2 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>Investment Calendar</h2>
                    <div className="flex items-center gap-2">
                        <button className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-100 text-neutral-600'}`}>Overview</button>
                        <button className="px-4 py-2 rounded-xl bg-[#F24C20] text-white text-xs font-bold uppercase tracking-widest">Schedule New</button>
                    </div>
                 </div>

                 <div className={`rounded-3xl border p-8 ${isDarkMode ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white border-neutral-200'}`}>
                    <div className="grid gap-4 max-w-4xl mx-auto">
                        {meetings.length > 0 ? meetings.map(m => (
                            <MeetingItem key={m._id} meeting={m} />
                        )) : (
                            <div className="text-center py-20 text-neutral-600">
                                No meetings scheduled. Check your "Interested" deals to initiate contact.
                            </div>
                        )}
                    </div>
                 </div>
            </div>
        )}

        {/* --- SECTION: MESSAGES --- */}
        {activeMenuId === 'messages' && (
            <div className="flex h-[75vh] rounded-[3.5rem] border overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-700 bg-black/20 backdrop-blur-3xl border-neutral-800">
                {/* Conversations Sidebar */}
                <div className="w-80 lg:w-96 border-r border-neutral-800 flex flex-col">
                    <div className="p-8 border-b border-neutral-800">
                        <h3 className="text-2xl font-black text-white italic tracking-tighter">Venture Inbox</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {conversations.map(conv => (
                            <div 
                                key={conv.user?._id} 
                                onClick={() => setSelectedConversation(conv)}
                                className={`p-4 rounded-3xl flex items-center gap-4 cursor-pointer transition-all border ${
                                    selectedConversation?.user?._id === conv.user?._id 
                                    ? 'bg-[#F24C20]/10 border-[#F24C20]/30 shadow-lg shadow-[#F24C20]/5' 
                                    : 'hover:bg-neutral-800 border-transparent'
                                }`}
                            >
                                <div className="relative">
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
                        ))}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col h-full bg-neutral-900/60 transition-all">
                    {selectedConversation ? (
                        <ChatWindow 
                            otherUser={selectedConversation.user} 
                            onClose={() => setSelectedConversation(null)} 
                        />
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                            <div className="w-24 h-24 rounded-[2rem] bg-neutral-800 flex items-center justify-center mb-8 rotate-3 shadow-2xl">
                                <MessageSquare className="w-10 h-10 text-neutral-600 -rotate-3" />
                            </div>
                            <h4 className="text-2xl font-black text-white italic tracking-tighter">Launch Conversation</h4>
                            <p className="mt-3 text-sm font-bold text-neutral-500 max-w-sm uppercase tracking-[0.2em] leading-relaxed">
                                Connect with the ecosystem. Choose a thread to start negotiating.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        )}
        
        {/* --- SECTION: SETTINGS --- */}
        {activeMenuId === 'settings' && (
            <div className="animate-in fade-in slide-in-from-bottom-5 duration-500 max-w-4xl">
                 <div className="mb-10">
                    <h2 className={`text-4xl font-black italic tracking-tighter ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>Capital Governance</h2>
                    <p className="text-sm font-bold text-neutral-500 uppercase tracking-widest mt-2 px-1">Manage your identity and investment credentials.</p>
                </div>
                <KYCSettings userRole="investor" />
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
