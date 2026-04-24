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
  Bookmark,
  Camera,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  Globe,
  Rocket
} from "lucide-react";
import PremiumDashboardLayout from "@/app/components/dashboard/PremiumDashboardLayout";
import ChatWindow from "@/app/components/dashboard/ChatWindow";
import KYCSettings from "@/app/components/dashboard/KYCSettings";
import SubscriptionCredits from "@/app/pages/dashboard/shared/SubscriptionCredits";
import ExploreStartupIdeas from "@/app/pages/dashboard/shared/ExploreStartupIdeas";
import StartupIdeaDashboardDetail from "@/app/pages/dashboard/shared/StartupIdeaDashboardDetail";
import FindTalent from "@/app/pages/dashboard/client/FindTalent";
import Settings from "@/app/pages/dashboard/shared/Settings";
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

function DealCard({ deal, navigate }: { deal: any; navigate: any }) {
    const { isDarkMode } = useTheme();
    const idea = deal.startup_idea || {};
    
    const handleViewRoom = () => {
        if (idea._id) {
            navigate(`/dashboard-investor/startup-ideas/${idea._id}`);
        } else {
            toast.error("Idea details not available");
        }
    };
    
    return (
        <div 
            onClick={handleViewRoom} 
            className={`group relative cursor-pointer rounded-[2.5rem] border p-6 transition-all duration-500 overflow-hidden ${
                isDarkMode 
                ? 'bg-[#0b0d14] border-neutral-800 hover:border-[#F24C20]/50 hover:shadow-2xl hover:shadow-[#F24C20]/10' 
                : 'bg-white border-neutral-200 hover:border-[#F24C20]/30 shadow-sm'
            }`}
        >
            {/* Subtle Aura */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#F24C20]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#F24C20]/10 flex items-center justify-center text-[#F24C20] font-black text-xl border border-[#F24C20]/20 group-hover:rotate-6 transition-transform">
                            {idea.title?.[0] || 'S'}
                        </div>
                        <div className="min-w-0">
                            <h4 className={`font-black truncate tracking-tight text-lg ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>{idea.title || 'Untitled Startup'}</h4>
                            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mt-0.5">{idea.category || 'Tech/AI'}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Growth Ask</span>
                        <span className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>${idea.fundingAmount ? `${idea.fundingAmount/1000}k` : 'N/A'}</span>
                    </div>
                    <div className="space-y-2">
                        <div className="w-full bg-neutral-900 rounded-full h-2 overflow-hidden border border-white/5">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${deal.score || 45}%` }}
                                className="h-full bg-gradient-to-r from-[#F24C20] to-orange-500" 
                            />
                        </div>
                        <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-neutral-500">
                            <span>Venture Fit Score</span>
                            <span className="text-[#F24C20]">{deal.score || 45}%</span>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-500 uppercase tracking-tight">
                        <Clock className="w-3.5 h-3.5" />
                        Updated {new Date(deal.updatedAt).toLocaleDateString()}
                    </div>
                    <Badge variant={deal.status === 'shortlisted' ? 'info' : deal.status === 'interested' ? 'success' : 'default'}>
                        {deal.status}
                    </Badge>
                </div>
            </div>
        </div>
    );
}

function StartupDiscoverCard({ idea }: { idea: any }) {
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();
    return (
        <div 
            onClick={() => navigate(`/dashboard-investor/explore-ideas`)}
            className={`rounded-3xl border overflow-hidden group transition-all duration-500 cursor-pointer ${
                isDarkMode 
                ? 'bg-[#0b0d14] border-neutral-800 hover:border-[#F24C20]/30' 
                : 'bg-white border-neutral-200 shadow-sm'
            }`}
        >
            <div className="relative h-28 bg-gradient-to-br from-[#F24C20]/20 to-orange-500/5 p-5 flex items-end overflow-hidden">
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Explore Concept</span>
                 </div>
                 <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl px-2.5 py-1 text-[8px] font-black text-white uppercase tracking-widest">
                    {idea.category}
                 </div>
            </div>
            <div className="p-6">
                <h4 className={`font-black text-base truncate transition-colors group-hover:text-[#F24C20] ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>{idea.title}</h4>
                <p className="mt-3 text-[11px] text-neutral-500 line-clamp-2 leading-relaxed font-medium">
                    {idea.shortDescription}
                </p>
                
                <div className="mt-6 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-neutral-600 uppercase tracking-widest">Target Ask</span>
                        <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-sm font-black text-[#F24C20] tracking-tight">${idea.fundingAmount ? `${idea.fundingAmount/1000}k` : 'Hidden'}</span>
                        </div>
                    </div>
                    <div className="flex -space-x-2">
                        {[1,2,3].map(i => (
                            <div key={i} className="w-6 h-6 rounded-full border-2 border-[#0b0d14] bg-neutral-800 overflow-hidden">
                                <img src={`https://images.unsplash.com/photo-${1500 + i}?w=50`} alt="" className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
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
                {meeting.status === 'scheduled' && meeting.meeting_link ? (
                    <a href={meeting.meeting_link} target="_blank" rel="noreferrer" className="mt-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all bg-[#F24C20] text-white hover:bg-[#d43a12]">
                        Join Now
                    </a>
                ) : (
                    <button className={`mt-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all bg-neutral-800 text-neutral-500 cursor-not-allowed`}>
                        {meeting.status}
                    </button>
                )}
            </div>
        </div>
    );
}

// --- Investor Settings Component ---

function InvestorSettings({ isDarkMode }: { isDarkMode: boolean }) {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'kyc'>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>({
    full_name: '', email: '', phone_number: '', bio: '', location: '', profile_image: '',
    linkedin: '', website: ''
  });
  const fileInputRef = useState<any>(null)[0];

  useEffect(() => {
    api.get('/auth/me').then(res => {
      if (res.data.success) {
        const u = res.data.user;
        setProfile({
          full_name: u.full_name || '',
          email: u.email || '',
          phone_number: u.phone_number || '',
          bio: u.bio || '',
          location: u.location || '',
          profile_image: u.profile_image || '',
          linkedin: u.social_links?.linkedin || '',
          website: u.portfolio_url || ''
        });
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await api.put('/auth/update-profile', {
        full_name: profile.full_name,
        phone_number: profile.phone_number,
        bio: profile.bio,
        location: profile.location,
        social_links: { linkedin: profile.linkedin },
        portfolio_url: profile.website
      });
      if (res.data.success) {
        const stored = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...stored, ...res.data.user }));
        toast.success('Profile updated successfully!');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally { setSaving(false); }
  };

  const handleSendResetLink = async () => {
    setSaving(true);
    try {
      await api.post('/auth/forgot-password', { email: profile.email });
      toast.success('Password reset link sent to ' + profile.email);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send reset link');
    } finally { setSaving(false); }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append('profile', file);
    setSaving(true);
    try {
      const res = await api.put('/auth/update-profile', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setProfile((p: any) => ({ ...p, profile_image: res.data.user.profile_image }));
        const stored = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...stored, profile_image: res.data.user.profile_image }));
        toast.success('Profile photo updated!');
      }
    } catch { toast.error('Failed to upload photo'); }
    finally { setSaving(false); }
  };

  const getProfileImgSrc = () => {
    if (!profile.profile_image) return 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80';
    if (profile.profile_image.startsWith('http')) return profile.profile_image;
    return `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${profile.profile_image.startsWith('/') ? '' : '/'}${profile.profile_image}`;
  };

  const inputCls = `w-full px-4 py-3 rounded-2xl border text-sm font-medium outline-none transition-all focus:border-[#F24C20] ${isDarkMode ? 'bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-600' : 'bg-neutral-50 border-neutral-200 text-neutral-900 placeholder:text-neutral-400'}`;
  
  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: UserIcon },
    { id: 'security' as const, label: 'Security', icon: Lock },
    { id: 'kyc' as const, label: 'KYC Verification', icon: Shield },
  ];

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-[#F24C20]"/></div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-5 duration-500">
      <div className="mb-8">
        <h2 className={`text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
          Account Settings
        </h2>
        <p className={`mt-1 text-sm font-medium ${isDarkMode ? 'text-neutral-500' : 'text-neutral-500'}`}>
          Manage your investor profile, security, and KYC verification.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tab Sidebar */}
        <div className={`lg:col-span-1 p-3 rounded-3xl border h-fit ${isDarkMode ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white border-neutral-200'}`}>
          <nav className="flex lg:flex-col gap-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all w-full text-left ${
                    activeTab === tab.id
                      ? 'bg-[#F24C20]/10 text-[#F24C20] border border-[#F24C20]/20'
                      : isDarkMode ? 'text-neutral-400 hover:bg-neutral-800 hover:text-white' : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-bold">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className={`lg:col-span-3 p-6 md:p-8 rounded-3xl border ${isDarkMode ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white border-neutral-200'}`}>
          
          {/* --- PROFILE TAB --- */}
          {activeTab === 'profile' && (
            <div className="space-y-8">
              <div>
                <h3 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>Profile Information</h3>
                <p className="text-sm text-neutral-500 mt-1">Your public investor identity on the platform.</p>
              </div>

              {/* Avatar */}
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <img
                    src={getProfileImgSrc()}
                    alt="Profile"
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-[#F24C20]/20"
                  />
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="w-5 h-5 text-white" />
                    <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                  </label>
                </div>
                <div>
                  <p className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>{profile.full_name || 'Investor'}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{profile.email}</p>
                  <label className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[#F24C20] cursor-pointer hover:underline">
                    <Camera className="w-3 h-3" /> Change Photo
                    <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                  </label>
                </div>
              </div>

              {/* Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input type="text" value={profile.full_name} onChange={e => setProfile({...profile, full_name: e.target.value})} className={inputCls + ' pl-11'} placeholder="Your full name" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input type="email" value={profile.email} disabled className={inputCls + ' pl-11 opacity-50 cursor-not-allowed'} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input type="tel" value={profile.phone_number} onChange={e => setProfile({...profile, phone_number: e.target.value})} className={inputCls + ' pl-11'} placeholder="+91 98765 43210" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input type="text" value={profile.location} onChange={e => setProfile({...profile, location: e.target.value})} className={inputCls + ' pl-11'} placeholder="City, Country" />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Investor Bio</label>
                  <textarea 
                    rows={3} value={profile.bio} maxLength={300}
                    onChange={e => setProfile({...profile, bio: e.target.value})}
                    className={inputCls + ' resize-none'}
                    placeholder="Brief description of your investment focus, portfolio, and thesis..."
                  />
                  <p className="text-right text-[10px] text-neutral-600 mt-1">{profile.bio.length}/300</p>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">LinkedIn Profile</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input type="url" value={profile.linkedin} onChange={e => setProfile({...profile, linkedin: e.target.value})} className={inputCls + ' pl-11'} placeholder="https://linkedin.com/in/..." />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Website / Portfolio</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input type="url" value={profile.website} onChange={e => setProfile({...profile, website: e.target.value})} className={inputCls + ' pl-11'} placeholder="https://yourwebsite.com" />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-2xl bg-[#F24C20] px-8 py-3.5 font-bold text-sm text-white shadow-xl shadow-[#F24C20]/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Save Profile
                </button>
              </div>
            </div>
          )}

          {/* --- SECURITY TAB --- */}
          {activeTab === 'security' && (
            <div className="space-y-8">
              <div>
                <h3 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>Security Settings</h3>
                <p className="text-sm text-neutral-500 mt-1">Manage your password and account protection.</p>
              </div>

              <div className={`p-8 rounded-3xl border ${isDarkMode ? 'bg-neutral-800/30 border-neutral-700' : 'bg-neutral-50 border-neutral-200'}`}>
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-[#F24C20]/10 flex items-center justify-center flex-shrink-0">
                    <Lock className="w-7 h-7 text-[#F24C20]" />
                  </div>
                  <div className="flex-1">
                    <h4 className={`text-lg font-black ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>Change Password</h4>
                    <p className="text-sm text-neutral-500 mt-1 mb-6">
                      We'll send a secure password reset link to <strong className={isDarkMode ? 'text-white' : 'text-neutral-900'}>{profile.email}</strong>. Click the link in your email to set a new password.
                    </p>
                    <button
                      onClick={handleSendResetLink}
                      disabled={saving}
                      className="flex items-center gap-2 rounded-2xl bg-[#F24C20] px-8 py-3.5 font-bold text-sm text-white shadow-xl shadow-[#F24C20]/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                      Send Reset Link
                    </button>
                  </div>
                </div>
              </div>
              
              <div className={`p-8 rounded-3xl border ${isDarkMode ? 'border-red-900/30 bg-red-900/10' : 'border-red-200 bg-red-50'}`}>
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-7 h-7 text-red-500" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-red-500">Danger Zone</h4>
                    <p className="text-sm text-neutral-500 mt-1 mb-6">Permanently deleting your account will wipe all your investment data, deal pipeline, and messages. This action cannot be undone.</p>
                    <button 
                      onClick={() => toast.error('Please contact support to delete your investor account.')}
                      className="flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 text-red-500 px-6 py-3 text-sm font-bold hover:bg-red-500/20 transition-all"
                    >
                      Request Account Deletion
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- KYC TAB --- */}
          {activeTab === 'kyc' && (
            <div className="space-y-2">
              <div className="mb-6">
                <h3 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>KYC Verification</h3>
                <p className="text-sm text-neutral-500 mt-1">Complete verification to unlock all deal access and build trust with founders.</p>
              </div>
              <KYCSettings userRole="investor" />
            </div>
          )}

        </div>
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
                    className={`text-2xl sm:text-3xl md:text-4xl font-black tracking-tight flex flex-wrap items-center gap-2 sm:gap-4 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}
                >
                    Investor <span className="text-[#F24C20]">Command Center</span>
                    <Badge className="text-[10px] sm:text-xs px-2 py-0.5" variant={kycStatus === 'fully_verified' ? 'success' : kycStatus === 'pending' ? 'warning' : 'default'}>
                        {kycStatus.replace('_', ' ')}
                    </Badge>
                </motion.h1>
                <p className={`mt-2 font-medium ${isDarkMode ? 'text-neutral-500' : 'text-neutral-500'}`}>
                    Real-time venture intelligence and deal management.
                </p>
            </div>

            {/* Dynamic Sliding Marquee for Investor Dashboard */}
            <div className={`hidden xl:flex flex-1 overflow-hidden relative rounded-2xl border h-14 items-center max-w-xl ${isDarkMode ? 'bg-neutral-900/30 border-neutral-800' : 'bg-neutral-50 border-neutral-100'}`}>
              <div className="absolute left-0 top-0 bottom-0 px-3 bg-[#F24C20] text-white flex items-center z-10 skew-x-[-12deg] -ml-2">
                 <div className="skew-x-[12deg] flex items-center gap-2">
                    <Rocket className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-tighter">MARKET PULSE</span>
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
                    {discoverIdeas.length > 0 ? discoverIdeas.slice(0, 5).map((idea, i) => (
                      <div key={idea._id || i} className="flex items-center gap-3">
                         <span className="w-1.5 h-1.5 rounded-full bg-[#F24C20]" />
                         <span className={`text-[11px] font-black uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>{idea.title}</span>
                         <span className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[8px] font-bold text-[#F24C20] uppercase">{idea.category || 'Tech'}</span>
                      </div>
                    )) : (
                      <span className="text-xs text-neutral-500 font-bold uppercase tracking-widest">Scanning latest submissions...</span>
                    )}
                 </motion.div>
              </div>
           </div>

            <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto">
                <button 
                   onClick={fetchData}
                   className={`p-2.5 sm:p-3 rounded-2xl border transition-all ${isDarkMode ? 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white' : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'}`}
                >
                    <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button 
                   onClick={() => handleNav('explore-ideas')}
                   className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-2xl bg-[#F24C20] px-4 sm:px-6 py-3 font-bold text-white shadow-xl shadow-[#F24C20]/20 hover:scale-[1.02] active:scale-95 transition-all text-sm sm:text-base"
                >
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
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
                                <DealCard key={deal._id} deal={deal} navigate={navigate} />
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
                        <DealCard key={deal._id} deal={deal} navigate={navigate} />
                    ))}
                    <button onClick={() => handleNav('explore-ideas')} className={`group rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-8 transition-all hover:bg-[#F24C20]/5 hover:border-[#F24C20]/30 min-h-[200px] ${isDarkMode ? 'border-neutral-800' : 'border-neutral-200'}`}>
                        <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center group-hover:bg-[#F24C20] transition-colors mb-4">
                            <Plus className="w-6 h-6 text-neutral-400 group-hover:text-white" />
                        </div>
                        <span className="text-sm font-bold text-neutral-500 group-hover:text-[#F24C20]">Discover Deal</span>
                    </button>
                 </div>
            </div>
        )}

        {/* --- SECTION: DISCOVER / MARKETPLACE --- */}
        {activeMenuId === 'explore-ideas' && (
            <div className="animate-in fade-in slide-in-from-bottom-5 duration-500">
                <ExploreStartupIdeas />
            </div>
        )}

        {/* --- SECTION: TALENT DISCOVERY --- */}
        {activeMenuId === 'talent' && (
            <div className="animate-in fade-in slide-in-from-bottom-5 duration-500">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>Talent Marketplace</h2>
                        <p className="text-neutral-500 font-medium mt-1">Discover world-class freelancers and agencies for your projects.</p>
                    </div>
                </div>
                <FindTalent />
            </div>
        )}

        {/* --- SECTION: MEETINGS --- */}
        {activeMenuId === 'meetings' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <h2 className={`text-xl sm:text-2xl font-black ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>Investment Calendar</h2>
                    <div className="flex items-center gap-2">
                        <button className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-100 text-neutral-600'}`}>Overview</button>
                        <button onClick={() => toast.info('Scheduling module is pending integration')} className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#F24C20] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#d43a12] transition-colors">Schedule New</button>
                    </div>
                 </div>

                 <div className={`rounded-3xl border p-4 sm:p-8 ${isDarkMode ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white border-neutral-200'}`}>
                    <div className="grid gap-4 max-w-4xl mx-auto">
                        {meetings.length > 0 ? meetings.map(m => (
                            <MeetingItem key={m._id} meeting={m} />
                        )) : (
                            <div className="text-center py-16 sm:py-20 text-neutral-600 text-sm">
                                No meetings scheduled. Check your "Interested" deals to initiate contact.
                            </div>
                        )}
                    </div>
                 </div>
            </div>
        )}

        {/* --- SECTION: MESSAGES --- */}
        {activeMenuId === 'messages' && (
            <div className="flex h-[75vh] rounded-3xl sm:rounded-[3.5rem] border overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-700 bg-black/20 backdrop-blur-3xl border-neutral-800 shadow-2xl">
                {/* Conversations Sidebar */}
                <div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 border-r border-neutral-800 flex-col`}>
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
                <div className={`${!selectedConversation ? 'hidden md:flex' : 'flex'} flex-1 flex-col h-full bg-neutral-900/60 transition-all`}>
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
