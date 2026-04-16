import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Star, MapPin, Clock, IndianRupee, Heart, Search, SlidersHorizontal,
  TrendingUp, Award, CheckCircle, User, Briefcase,
  Loader2, XCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import type { ProjectAnswers } from './ProjectFinderWizard';
import api from '@/app/utils/api';
import { toast } from 'sonner';

interface ProjectResultsPageProps {
  answers: ProjectAnswers;
}

const projectTypeLabels: Record<string, string> = {
  website: 'Website Design',
  mobile: 'Mobile App',
  uiux: 'UI/UX Design',
  branding: 'Branding',
  marketing: 'Digital Marketing',
  writing: 'Content Writing',
  video: 'Video Editing',
  security: 'Cybersecurity',
  consulting: 'Business Consulting',
};

const budgetLabels: Record<string, string> = {
  '5k-15k': '₹5K-₹15K',
  '15k-50k': '₹15K-₹50K',
  '50k-1l': '₹50K-₹1L',
  '1l+': '₹1L+',
};

const timelineLabels: Record<string, string> = {
  urgent: 'Urgent',
  '1week': '1 week',
  '2-4weeks': '2-4 weeks',
  flexible: 'Flexible',
};

export default function ProjectResultsPage({ answers }: ProjectResultsPageProps) {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [subscriptionPlan, setSubscriptionPlan] = useState<string | null>(null);
  
  // Local state for filters
  const [filters, setFilters] = useState<ProjectAnswers>({
    ...answers,
    skills: answers.skills || [],
    extraFilters: answers.extraFilters || []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<any[]>([]);
  const [availableSkills, setAvailableSkills] = useState<any[]>([]);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (userStr && token) {
      setIsLoggedIn(true);
      fetchUserSubscription();
    }
    fetchLookups();
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [filters, searchTerm]);

  const fetchLookups = async () => {
    try {
      const [catsRes, skillsRes] = await Promise.all([
        api.get('/cms/categories'),
        api.get('/cms/skills')
      ]);
      setAvailableCategories(catsRes.data.data || catsRes.data.categories || []);
      setAvailableSkills(skillsRes.data.data || []);
    } catch (err) {
      console.error('Failed to fetch filter lookups:', err);
    }
  };

  const fetchUserSubscription = async () => {
    try {
      const res = await api.get('/subscription/my-status');
      if (res.data.success && res.data.subscription) {
        setSubscriptionPlan(res.data.subscription.plan_id?.name || 'Free');
      }
    } catch (err) {
      console.error('Error fetching subscription:', err);
    }
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const userStr = localStorage.getItem('user');
      const currentUser = userStr ? JSON.parse(userStr) : null;
      const currentUserId = currentUser?._id;

      // In real app, we'd pass filters to backend. For now, matching wizard results logic.
      const res = await api.get('/projects');
      if (res.data.success) {
        // Filter out projects posted by the current logged-in user
        let filtered = res.data.data.filter((p: any) => {
          const pClientId = p.client_id?._id || p.client_id;
          return pClientId !== currentUserId;
        });
        
        // Client-side filtering as fallback/enhancement
        if (filters.projectType) {
           filtered = filtered.filter((p: any) => p.category?.toLowerCase() === filters.projectType.toLowerCase());
        }
        if (filters.skills && filters.skills.length > 0) {
           filtered = filtered.filter((p: any) => p.skills?.some((s: any) => filters.skills.includes(s.name || s)));
        }

        const processed = filtered.map((p: any) => ({
          ...p,
          id: p._id,
          matchScore: p.matchScore || (80 + Math.floor(Math.random() * 20)),
          proposals: p.proposals || 0,
          isUnlocked: p.isUnlocked,
          isApplied: p.isApplied
        }));
        setProjects(processed);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const clearAllFilters = () => {
    setFilters({
      projectType: '',
      priceType: '',
      budget: '',
      timeline: '',
      experience: '',
      workPreference: '',
      skills: [],
      extraFilters: []
    });
    setSearchTerm('');
  };

  const toggleSkill = (skill: string) => {
    setFilters(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const filteredProjects = projects.filter(p => {
    const term = searchTerm.toLowerCase();
    return (
      (p.title && p.title.toLowerCase().includes(term)) ||
      (p.description && p.description.toLowerCase().includes(term)) ||
      (p.category && p.category.toLowerCase().includes(term))
    );
  }).sort((a, b) => b.matchScore - a.matchScore);

  const displayProjects = (isLoggedIn && (subscriptionPlan !== 'Free' && subscriptionPlan !== null)) 
    ? filteredProjects 
    : filteredProjects.slice(0, 10);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#F24C20] animate-spin mb-4" />
        <p className="text-neutral-400 font-medium">Finding the best matches for you...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <Header />

      <main className="pt-20">
        <section className="relative py-12 bg-gradient-to-b from-neutral-900 to-neutral-950 border-b border-neutral-800">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <Briefcase className="w-8 h-8 text-[#F24C20]" />
                <h1 className="text-4xl font-bold text-white">
                  We found <span className="text-[#F24C20]">{filteredProjects.length}</span> matching projects
                </h1>
              </div>
              <p className="text-xl text-neutral-400">Based on your preferences and skills</p>
            </motion.div>
          </div>
        </section>

        <section className="py-8 lg:py-12">
          <div className="max-w-7xl mx-auto px-4 lg:px-6">
            <div className="flex flex-col lg:row gap-8">
              {/* Mobile Filter Toggle */}
              <div className="lg:hidden flex flex-col gap-4">
                 <button 
                  onClick={() => setIsMobileFiltersOpen(true)}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-neutral-900 border border-neutral-800 rounded-2xl text-white font-bold shadow-xl active:scale-95 transition-all"
                >
                  <SlidersHorizontal className="w-5 h-5 text-[#F24C20]" />
                  Refine Your Search
                </button>
                <div className="text-neutral-400 text-sm font-medium">
                  We found <span className="text-white font-bold">{filteredProjects.length}</span> matching projects
                </div>
              </div>

              {/* Sidebar / Filters */}
              <div className="flex flex-col lg:flex-row gap-8">
              <aside className="hidden lg:block w-80 flex-shrink-0 space-y-6 sticky top-24 h-[calc(100vh-120px)] overflow-y-auto no-scrollbar scrollbar-hide pr-2">
                <div className="p-6 rounded-3xl bg-neutral-900/50 border border-neutral-800 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="w-5 h-5 text-[#F24C20]" />
                      <h3 className="font-black text-white uppercase tracking-tighter">Refine Results</h3>
                    </div>
                    <button 
                      onClick={clearAllFilters}
                      className="text-[10px] font-black text-[#F24C20] uppercase tracking-widest hover:underline"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="space-y-8">
                    {/* Search */}
                    <div>
                      <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-3 block">Search Content</label>
                      <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-[#F24C20] transition-colors" />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search titles or items..."
                          className="w-full pl-12 pr-4 py-3 bg-neutral-950 border border-neutral-800 rounded-2xl text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:border-[#F24C20] transition-all"
                        />
                      </div>
                    </div>

                    {/* Categories */}
                    <div>
                      <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-3 block">Category</label>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => setFilters(prev => ({ ...prev, projectType: '' }))}
                          className={`flex items-center justify-between p-3 rounded-xl border text-sm font-bold transition-all ${
                            !filters.projectType ? 'bg-[#F24C20]/10 border-[#F24C20]/30 text-[#F24C20]' : 'border-neutral-800 text-neutral-400 hover:border-neutral-700'
                          }`}
                        >
                          All Categories
                          {!filters.projectType && <CheckCircle className="w-4 h-4" />}
                        </button>
                        {availableCategories.slice(0, 8).map(cat => (
                          <button
                            key={cat._id}
                            onClick={() => setFilters(prev => ({ ...prev, projectType: cat.name }))}
                            className={`flex items-center justify-between p-3 rounded-xl border text-sm font-bold transition-all ${
                              filters.projectType === cat.name ? 'bg-[#F24C20]/10 border-[#F24C20]/30 text-[#F24C20]' : 'border-neutral-800 text-neutral-400 hover:border-neutral-700'
                            }`}
                          >
                            {cat.name}
                            {filters.projectType === cat.name && <CheckCircle className="w-4 h-4" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Budget Range */}
                    <div>
                      <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-3 block">Budget Range</label>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(budgetLabels).map(([key, label]) => {
                          const isSelected = filters.budget === key;
                          return (
                            <button
                              key={key}
                              onClick={() => setFilters(prev => ({ ...prev, budget: isSelected ? '' : key }))}
                              className={`px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-wider transition-all ${
                                isSelected ? 'bg-[#F24C20] border-[#F24C20] text-white' : 'border-neutral-800 text-neutral-500 hover:border-neutral-700 hover:text-neutral-400'
                              }`}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Skills Toggle */}
                    <div>
                      <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-3 block">Tech Stack</label>
                      <div className="flex flex-wrap gap-2">
                        {availableSkills.slice(0, 10).map(skill => {
                          const isSelected = filters.skills.includes(skill.name);
                          return (
                            <button
                              key={skill._id}
                              onClick={() => toggleSkill(skill.name)}
                              className={`px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-wider transition-all ${
                                isSelected ? 'bg-[#F24C20] border-[#F24C20] text-white' : 'border-neutral-800 text-neutral-500 hover:border-neutral-700 hover:text-neutral-400'
                              }`}
                            >
                              {skill.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </aside>

              {/* Mobile Filter Drawer */}
              <div className={`lg:hidden fixed inset-0 z-[100] transition-all duration-300 ${isMobileFiltersOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileFiltersOpen(false)} />
                <div className={`absolute bottom-0 left-0 right-0 max-h-[90vh] bg-neutral-900 rounded-t-[2.5rem] border-t border-neutral-800 p-6 overflow-y-auto transition-transform duration-300 ${isMobileFiltersOpen ? 'translate-y-0' : 'translate-y-full'}`}>
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold text-white">Filters</h3>
                    <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 rounded-full bg-neutral-800 text-neutral-400"><XCircle className="w-6 h-6" /></button>
                  </div>
                  
                  <div className="space-y-8 pb-8">
                    <div>
                      <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-3 block">Keywords</label>
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search titles or items..."
                        className="w-full px-4 py-4 bg-neutral-950 border border-neutral-800 rounded-2xl text-white text-sm focus:outline-none focus:border-[#F24C20] transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-3 block">Category</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setFilters(prev => ({ ...prev, projectType: '' }))}
                          className={`p-3 rounded-xl border text-sm font-bold transition-all ${
                            !filters.projectType ? 'bg-[#F24C20]/10 border-[#F24C20]/30 text-[#F24C20]' : 'border-neutral-800 text-neutral-400'
                          }`}
                        >
                          All Categories
                        </button>
                        {availableCategories.slice(0, 8).map(cat => (
                          <button
                            key={cat._id}
                            onClick={() => setFilters(prev => ({ ...prev, projectType: cat.name }))}
                            className={`p-3 rounded-xl border text-sm font-bold transition-all ${
                              filters.projectType === cat.name ? 'bg-[#F24C20]/10 border-[#F24C20]/30 text-[#F24C20]' : 'border-neutral-800 text-neutral-400'
                            }`}
                          >
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button 
                      onClick={() => setIsMobileFiltersOpen(false)}
                      className="w-full py-4 bg-[#F24C20] text-white rounded-2xl font-bold shadow-lg shadow-[#F24C20]/20"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-6">
                <div className="hidden lg:flex items-center justify-between mb-2">
                  <div className="text-neutral-400 text-sm font-medium">
                    We found <span className="text-white font-bold">{filteredProjects.length}</span> matching projects
                  </div>
                </div>

                {displayProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -4 }}
                    className="relative group"
                  >
                    <div className="p-5 md:p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 hover:border-[#F24C20]/50 transition-all overflow-hidden group">
                      <div className="relative">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                            <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-[#F24C20] transition-colors leading-tight">
                              {project.title}
                            </h3>
                            <div className="flex gap-2 shrink-0">
                              {project.isApplied && (
                                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] font-black uppercase rounded-lg border border-green-500/30 whitespace-nowrap">
                                  Applied
                                </span>
                              )}
                              {project.isUnlocked && !project.isApplied && (
                                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase rounded-lg border border-blue-500/30 whitespace-nowrap">
                                  Unlocked
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-neutral-400 text-sm line-clamp-2 md:line-clamp-none mb-6">
                            {project.description}
                          </p>

                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-[#F24C20]/10 flex items-center justify-center shrink-0">
                                <IndianRupee className="w-5 h-5 text-[#F24C20]" />
                              </div>
                              <div>
                                <div className="text-[10px] text-neutral-500 font-black uppercase tracking-widest">Budget</div>
                                <div className="font-bold text-white text-sm md:text-base">₹{project.budget_range}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-neutral-800/50 flex items-center justify-center shrink-0">
                                <Clock className="w-5 h-5 text-neutral-400" />
                              </div>
                              <div>
                                <div className="text-[10px] text-neutral-500 font-black uppercase tracking-widest">Type</div>
                                <div className="font-bold text-white text-sm md:text-base">Fixed Price</div>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-6 border-t border-neutral-800">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700 flex items-center justify-center overflow-hidden">
                                {project.client_id?.profile_image ? (
                                  <img src={project.client_id.profile_image} className="w-full h-full object-cover" alt="" />
                                ) : (
                                  <span className="text-white text-xs font-bold">{project.client_id?.full_name?.substring(0, 2).toUpperCase()}</span>
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-bold text-white truncate">{project.client_id?.full_name || 'Anonymous Client'}</div>
                                <div className="text-[10px] text-neutral-500 font-black uppercase tracking-widest">Verified Client</div>
                              </div>
                            </div>
                            <Link to={`/projects/${project.id}`} className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold transition-all text-center ${
                              project.isApplied 
                              ? 'bg-emerald-600/10 text-emerald-500 border border-emerald-500/20' 
                              : 'bg-[#044071] hover:bg-[#055a99] text-white shadow-xl shadow-blue-900/10'
                            }`}>
                              {project.isApplied ? 'View Application' : 'View Details'}
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {((!isLoggedIn && filteredProjects.length > 10) || (isLoggedIn && subscriptionPlan === 'Free' && filteredProjects.length > 10)) && (
                   <motion.div 
                     initial={{ opacity: 0, y: 30 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     className="mt-12 p-8 md:p-12 rounded-[2rem] bg-gradient-to-br from-[#044071] to-[#012a4a] text-center relative overflow-hidden"
                   >
                     <div className="relative z-10">
                       <Briefcase className="w-12 h-12 md:w-16 md:h-16 text-white mx-auto mb-6 opacity-80" />
                       <h3 className="text-2xl md:text-4xl font-black text-white mb-4 italic tracking-tighter">
                         {isLoggedIn ? 'Upgrade for More Opportunities' : 'Want to See More Projects?'}
                       </h3>
                       <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
                         {isLoggedIn 
                            ? 'You have reached the limit of your Free plan. Upgrade to view and apply for high-value projects.'
                            : 'Join our platform to access hundreds of active projects and start your freelance journey today.'}
                       </p>
                       <Link 
                         to={isLoggedIn ? "/plans" : "/signup"}
                         className="inline-flex items-center gap-3 px-10 md:px-12 py-4 md:py-5 bg-[#F24C20] text-white rounded-2xl font-black text-lg md:text-xl shadow-2xl hover:scale-105 transition-all w-full sm:w-auto justify-center"
                       >
                         {isLoggedIn ? 'Upgrade My Plan' : 'Sign Up to Unlock More'}
                       </Link>
                     </div>
                   </motion.div>
                )}

                {filteredProjects.length === 0 && (
                  <div className="text-center py-20 bg-neutral-900/50 border border-neutral-800 rounded-2xl">
                    <p className="text-neutral-400">No projects found matching your search.</p>
                  </div>
                )}
              </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
