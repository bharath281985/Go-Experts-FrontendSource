import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '@/app/components/ThemeProvider';
import { Bookmark, Briefcase, Users, Package, X, ExternalLink, Star, MapPin, DollarSign, Loader2, Sparkles, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/app/utils/api';

type TabType = 'projects' | 'talents' | 'gigs' | 'ideas';

export default function SavedItems() {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [userType, setUserType] = useState<string>('client');
  const [activeTab, setActiveTab] = useState<TabType>('talents');

  const [savedProjects, setSavedProjects] = useState<any[]>([]);
  const [savedTalents, setSavedTalents] = useState<any[]>([]);
  const [savedGigs, setSavedGigs] = useState<any[]>([]);
  const [savedIdeas, setSavedIdeas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const role = storedUser.role || (storedUser.roles && storedUser.roles[0]) || 'client';
    setUserType(role);
    
    // Set default tab based on role
    if (role === 'freelancer') setActiveTab('projects');
    else setActiveTab('talents');

    fetchSavedItems();
    
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab === 'ideas') setActiveTab('ideas');
  }, []);

  const fetchSavedItems = async () => {
    setLoading(true);
    try {
      const [gigRes, projectRes, ideaRes, talentRes] = await Promise.all([
        api.get('/users/saved-gigs'),
        api.get('/users/favorites'),
        api.get('/users/favorites-ideas'),
        api.get('/users/favorites-users')
      ]);

      if (gigRes.data.success) {
        setSavedGigs(gigRes.data.data.map((item: any) => {
          const gig = item.gig || {};
          return {
            id: gig._id,
            title: gig.title || 'Untitled Service',
            seller: gig.freelancer_id?.full_name || 'Expert',
            price: gig.investment_required || 0,
            image: gig.thumbnail ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${gig.thumbnail}` : 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80',
            rating: gig.rating || 4.9,
            reviews: gig.review_count || 0,
            category: gig.category || 'Professional Service'
          };
        }));
      }

      if (projectRes.data.success) {
        setSavedProjects(projectRes.data.data.map((p: any) => ({
             id: p._id,
             title: p.title,
             description: p.description,
             budget: p.budget_range,
             duration: p.timeline || 'TBD',
             skills: p.skills_required || [],
             postedBy: p.client_id?.full_name || 'Organizer',
             applicants: 5,
             status: p.status
        })));
      }

      if (ideaRes.data.success) {
        setSavedIdeas(ideaRes.data.data.map((i: any) => ({
             id: i._id,
             title: i.title,
             shortDescription: i.shortDescription,
             category: i.category,
             creator: i.creator?.full_name || 'Visionary',
             status: i.status
        })));
      }

      if (talentRes.data.success) {
        setSavedTalents(talentRes.data.data.map((t: any) => ({
             id: t._id,
             name: t.full_name,
             title: t.role_title || 'Expert Professional',
             avatar: t.profile_image ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${t.profile_image}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(t.full_name)}&background=044071&color=fff`,
             rating: t.review_score || 0,
             hourlyRate: t.hourly_rate || 0,
             location: t.location || 'Remote',
             skills: t.skills?.map((s: any) => s.name || s) || [],
             completedProjects: t.completed_projects || 0
        })));
      }
    } catch (err) {
      console.error('Failed to load saved items', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id: string, type: TabType) => {
    try {
      let endpoint = '';
      if (type === 'gigs') endpoint = `/users/saved-gigs/${id}`;
      else if (type === 'projects') endpoint = `/users/favorites/${id}`;
      else if (type === 'ideas') endpoint = `/users/favorites-ideas/${id}`;
      else if (type === 'talents') endpoint = `/users/favorites-users/${id}`;

      const res = await (type === 'gigs' ? api.post(endpoint) : api.put(endpoint));
      if (res.data.success) {
        if (type === 'gigs') setSavedGigs(prev => prev.filter(g => g.id !== id));
        else if (type === 'projects') setSavedProjects(prev => prev.filter(p => p.id !== id));
        else if (type === 'ideas') setSavedIdeas(prev => prev.filter(i => i.id !== id));
        else if (type === 'talents') setSavedTalents(prev => prev.filter(t => t.id !== id));
      }
    } catch (err) {
      console.error('Removal failed', err);
    }
  };

  const clientTabs: { id: TabType; label: string; icon: any; count: number }[] = [
    { id: 'talents', label: 'Expert Bookmarks', icon: Users, count: savedTalents.length },
    { id: 'gigs', label: 'Interesting Services', icon: Package, count: savedGigs.length },
    { id: 'ideas', label: 'Venture Pipeline', icon: Bookmark, count: savedIdeas.length },
    { id: 'projects', label: 'Market Insights', icon: Briefcase, count: savedProjects.length }
  ];

  const freelancerTabs: { id: TabType; label: string; icon: any; count: number }[] = [
    { id: 'projects', label: 'Saved Projects', icon: Briefcase, count: savedProjects.length },
    { id: 'ideas', label: 'Startup Concepts', icon: Bookmark, count: savedIdeas.length },
    { id: 'gigs', label: 'Service Inspiration', icon: Package, count: savedGigs.length },
    { id: 'talents', label: 'Expert Network', icon: Users, count: savedTalents.length }
  ];

  const tabs = userType === 'client' ? clientTabs : freelancerTabs;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-[#F24C20] animate-spin" />
        <p className={`font-medium ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>Securing your saved collection...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-end">
        <div>
          <h1 className={`text-4xl font-black ${isDarkMode ? 'text-white' : 'text-neutral-900'} tracking-tight`}>
            Saved Items
          </h1>
          <p className={`mt-2 text-lg ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
            Curating your personal dashboard of {userType === 'client' ? 'top-tier talent and services' : 'high-potential projects and ideas'}
          </p>
        </div>
        {tabs.length > 0 && (
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#F24C20]/10 rounded-2xl border border-[#F24C20]/20">
            <Sparkles className="w-4 h-4 text-[#F24C20]" />
            <span className="text-xs font-black uppercase tracking-widest text-[#F24C20]">Personalized for You</span>
          </div>
        )}
      </motion.div>

      <div className={`p-1.5 rounded-2xl border flex gap-1 overflow-x-auto no-scrollbar ${isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-100 border-neutral-200'}`}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-6 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[#F24C20] text-white shadow-xl shadow-[#F24C20]/30'
                  : isDarkMode
                  ? 'text-neutral-500 hover:text-white hover:bg-neutral-800'
                  : 'text-neutral-500 hover:text-neutral-900 hover:bg-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              <span className={`ml-1 px-2 py-0.5 rounded-lg text-[10px] ${isActive ? 'bg-white/20' : isDarkMode ? 'bg-neutral-800' : 'bg-neutral-200'}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'talents' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {savedTalents.map((talent, index) => (
                <div
                  key={talent.id}
                  className={`group p-6 rounded-[2.5rem] border transition-all duration-500 relative ${
                    isDarkMode ? 'bg-neutral-900/50 border-neutral-800 hover:border-[#F24C20]/50 hover:bg-neutral-900' : 'bg-white border-neutral-200 hover:border-[#F24C20]/50 hover:shadow-2xl'
                  }`}
                >
                  <button
                    onClick={() => handleRemove(talent.id, 'talents')}
                    className="absolute top-6 right-6 p-2.5 rounded-2xl bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="flex gap-6 mb-6">
                    <img src={talent.avatar} alt={talent.name} className="w-24 h-24 rounded-[2rem] object-cover border-4 border-[#F24C20]/10 shadow-xl" />
                    <div>
                      <h3 className={`text-xl font-black mb-1 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>{talent.name}</h3>
                      <p className="text-[#F24C20] font-bold text-sm tracking-wide uppercase">{talent.title}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 rounded-lg">
                          <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-black text-yellow-600">{talent.rating || 'New'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-neutral-500">
                          <MapPin className="w-3.5 h-3.5" />
                          <span className="text-sm font-medium">{talent.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-8">
                    {talent.skills.slice(0, 4).map((skill: string) => (
                      <span key={skill} className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'bg-neutral-800 text-neutral-400 border border-neutral-700' : 'bg-neutral-50 text-neutral-500 border border-neutral-100'}`}>
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-6 border-t border-neutral-800/50 dark:border-neutral-800">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-1">Standard Rate</div>
                      <div className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>₹{talent.hourlyRate}<span className="text-sm text-neutral-500 font-medium">/hr</span></div>
                    </div>
                    <button onClick={() => navigate(`/f/${talent.id}`)} className="px-8 py-3 bg-[#044071] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-lg shadow-[#044071]/30">
                      View Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'gigs' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedGigs.map((gig) => (
                <div key={gig.id} className={`group rounded-[2.5rem] border overflow-hidden transition-all duration-500 ${isDarkMode ? 'bg-neutral-900/50 border-neutral-800 hover:bg-neutral-900' : 'bg-white border-neutral-200 hover:shadow-2xl'}`}>
                  <div className="relative h-56 overflow-hidden">
                    <img src={gig.image} alt={gig.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <button onClick={() => handleRemove(gig.id, 'gigs')} className="absolute top-4 right-4 p-2.5 rounded-2xl bg-black/60 text-white backdrop-blur-md transition-all hover:bg-red-500">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-6">
                    <div className="text-[10px] font-black uppercase tracking-widest text-[#F24C20] mb-3">{gig.category}</div>
                    <h3 className={`text-lg font-black leading-tight mb-4 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>{gig.title}</h3>
                    <div className="flex items-center justify-between pt-4 border-t border-neutral-800/50 dark:border-neutral-800">
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-1">Starts at</div>
                        <div className="text-xl font-black text-[#F24C20]">₹{gig.price.toLocaleString()}</div>
                      </div>
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${isDarkMode ? 'bg-neutral-800' : 'bg-neutral-50'}`}>
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                        <span className={`text-xs font-black ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>{gig.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'ideas' && (
            <div className="space-y-4">
              {savedIdeas.map((idea) => (
                <div key={idea.id} className={`group p-8 rounded-[3rem] border transition-all duration-500 ${isDarkMode ? 'bg-neutral-900/50 border-neutral-800 hover:bg-neutral-900' : 'bg-white border-neutral-200 hover:shadow-xl'}`}>
                  <div className="flex justify-between items-start mb-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="px-4 py-1 rounded-full bg-orange-500/10 text-orange-500 text-[10px] font-black uppercase tracking-[0.2em]">
                          {idea.category}
                        </span>
                        <span className={`text-[10px] uppercase font-black tracking-widest flex items-center gap-1.5 ${idea.status === 'approved' ? 'text-green-500' : 'text-yellow-500'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${idea.status === 'approved' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                          {idea.status}
                        </span>
                      </div>
                      <h3 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>{idea.title}</h3>
                    </div>
                    <button onClick={() => handleRemove(idea.id, 'ideas')} className="p-2.5 rounded-2xl bg-neutral-800/10 hover:bg-red-500/10 text-neutral-500 hover:text-red-500 transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <p className={`text-lg leading-relaxed mb-8 max-w-3xl ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>{idea.shortDescription}</p>
                  <div className="flex items-center justify-between pt-6 border-t border-neutral-800/50 dark:border-neutral-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-neutral-800 flex items-center justify-center text-white font-black text-sm">{idea.creator.charAt(0)}</div>
                      <div className="text-xs font-black uppercase tracking-widest text-neutral-500">Conceptualized by {idea.creator}</div>
                    </div>
                    <button onClick={() => navigate(`/dashboard/startup-ideas/${idea.id}`)} className="flex items-center gap-3 px-8 py-3.5 bg-[#F24C20] text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-xl shadow-[#F24C20]/20">
                      Explore Concept <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="space-y-6">
              {savedProjects.map((project) => (
                <div key={project.id} className={`group p-8 rounded-[3rem] border transition-all duration-500 relative overflow-hidden ${isDarkMode ? 'bg-neutral-900/50 border-neutral-800 hover:bg-neutral-900' : 'bg-white border-neutral-200 hover:shadow-xl'}`}>
                  {project.status === 'closed' && (
                    <div className="absolute top-8 -right-12 bg-neutral-800 text-white border border-white/20 px-14 py-1.5 rotate-45 font-black text-[10px] tracking-[0.2em] shadow-2xl z-20">PROJECT FILLED</div>
                  )}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1 max-w-2xl">
                      <h3 className={`text-2xl font-black mb-3 ${isDarkMode ? 'text-white' : 'text-neutral-900'} ${project.status === 'closed' ? 'opacity-50' : ''}`}>{project.title}</h3>
                      <p className={`text-lg leading-relaxed mb-6 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>{project.description}</p>
                    </div>
                    <button onClick={() => handleRemove(project.id, 'projects')} className="p-2.5 rounded-2xl bg-neutral-800/10 hover:bg-red-500/10 text-neutral-500 hover:text-red-500 transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-4 mb-8">
                    <div className="flex items-center gap-2.5 px-5 py-2.5 bg-green-500/10 rounded-[1.5rem]">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-black text-green-600 tracking-tight">₹{project.budget}</span>
                    </div>
                    <div className="flex items-center gap-2.5 px-5 py-2.5 bg-blue-500/10 rounded-[1.5rem]">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-black text-blue-600">Timeline: {project.duration}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-6 border-t border-neutral-800/50 dark:border-neutral-800">
                    <div className="text-xs font-black uppercase tracking-widest text-neutral-500">Initiated by {project.postedBy}</div>
                    <button onClick={() => navigate(`/dashboard/projects/${project.id}`)} className="flex items-center gap-3 px-8 py-3.5 bg-[#044071] text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform">
                      Analyze Project <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {loading === false && ((activeTab === 'talents' && savedTalents.length === 0) || (activeTab === 'gigs' && savedGigs.length === 0) || (activeTab === 'ideas' && savedIdeas.length === 0) || (activeTab === 'projects' && savedProjects.length === 0)) && (
            <div className={`p-20 rounded-[4rem] text-center border-2 border-dashed ${isDarkMode ? 'bg-neutral-900/20 border-neutral-800' : 'bg-neutral-50/50 border-neutral-200'}`}>
              <div className="w-24 h-24 bg-neutral-800/10 rounded-[3rem] flex items-center justify-center mx-auto mb-8">
                {activeTab === 'talents' ? <Users className="w-12 h-12 text-neutral-500" /> : activeTab === 'gigs' ? <Package className="w-12 h-12 text-neutral-500" /> : activeTab === 'ideas' ? <Bookmark className="w-12 h-12 text-neutral-500" /> : <Briefcase className="w-12 h-12 text-neutral-500" />}
              </div>
              <h3 className={`text-2xl font-black mb-3 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>Collection Empty</h3>
              <p className={`text-lg max-w-md mx-auto ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>You haven't added any {activeTab} to your personal collection yet. Start exploring to curate your dashboard.</p>
              <button onClick={() => navigate('/dashboard')} className="mt-10 px-10 py-4 bg-[#F24C20] text-white rounded-[2rem] font-black text-sm uppercase tracking-widest hover:scale-105 transition-transform shadow-2xl shadow-[#F24C20]/20">Explore Marketplace</button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}