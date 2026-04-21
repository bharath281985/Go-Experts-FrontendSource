import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Star, MapPin, CheckCircle, Heart, Clock, IndianRupee,
  SlidersHorizontal, Search, Award, Zap, TrendingUp,
  Loader2, XCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import type { QuestionaryAnswers } from './TalentFinderWizard';
import api from '@/app/utils/api';
import { toast } from 'sonner';

interface TalentResultsPageProps {
  answers: QuestionaryAnswers;
}

const roleOptions = [
  { value: 'ui-ux', label: 'UI/UX Designer' },
  { value: 'fullstack', label: 'Full Stack Developer' },
  { value: 'mobile', label: 'Mobile App Developer' },
];

const workTypeOptions = [
  { value: 'one-time', label: 'One-time project' },
  { value: 'part-time', label: 'Part-time' },
];

export default function TalentResultsPage({ answers }: TalentResultsPageProps) {
  const [talents, setTalents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [subscriptionPlan, setSubscriptionPlan] = useState<string | null>(null);
  
  // Local state for filters
  const [filters, setFilters] = useState<QuestionaryAnswers>({
    ...answers,
    skills: answers.skills || [],
    preferences: answers.preferences || []
  });
  const [searchTerm, setSearchTerm] = useState(answers.searchTerm || '');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<any[]>([]);
  const [availableSkills, setAvailableSkills] = useState<any[]>([]);
  
  const mockTalentsFallback = [
    { _id: 'mock-1', full_name: 'Sarah Johnson', role: 'Full Stack Developer', rating: '4.9', reviews: 124, location: 'San Francisco, CA', skills: ['React', 'Node.js', 'PostgreSQL'], hourly_rate: '1500', verified: true },
    { _id: 'mock-2', full_name: 'David Chen', role: 'UI/UX Designer', rating: '4.8', reviews: 89, location: 'Austin, TX', skills: ['Figma', 'UI Design'], hourly_rate: '2000', verified: true },
    { _id: 'mock-6', full_name: 'Sirigiri Naresh', role: 'WordPress Developer', rating: '4.9', reviews: 156, location: 'Hyderabad, India', skills: ['WordPress', 'PHP', 'SEO'], hourly_rate: '1200', verified: true }
  ];

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
    fetchFreelancers();
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

  const fetchFreelancers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.role) params.append('role', filters.role);
      if (filters.skills && filters.skills.length > 0) {
        filters.skills.forEach((s: string) => params.append('skills', s));
      }
      if (searchTerm) params.append('search', searchTerm);

      const userStr = localStorage.getItem('user');
      const currentUser = userStr ? JSON.parse(userStr) : null;
      const currentUserId = currentUser?._id;

      const res = await api.get(`/users/freelancers?${params.toString()}`);
      if (res.data.success) {
        const rawData = res.data.data.length > 0 ? res.data.data : mockTalentsFallback;
        const filtered = rawData.filter((t: any) => t._id !== currentUserId);
        const processed = filtered.map((t: any) => {
          let score = 85; // Base score

          // Calculate match based on filters dynamically
          if (filters.skills && filters.skills.length > 0) {
            const userSkills = t.skills?.map((s: any) => typeof s === 'object' ? s.name : s) || [];
            const matchedSkills = filters.skills.filter(s => userSkills.includes(s));
            const skillScore = (matchedSkills.length / filters.skills.length) * 10;
            score += skillScore;
          } else {
            // If no active filters, derive 'match' from profile strength (rating + verified)
            const ratingScore = (parseFloat(t.rating || '4.5') / 5) * 10;
            score += ratingScore;
            if (t.verified) score += 5;
          }

          // Cap the score at 99%
          const matchScore = Math.min(Math.floor(score), 99);

          return {
            ...t,
            id: t._id || t.id,
            matchScore: matchScore,
            reviewsCount: t.reviews || Math.floor(Math.random() * 200),
            rating: t.rating || (4.5 + Math.random() * 0.5).toFixed(1),
            profile_image: t.profile_image ? (t.profile_image.startsWith('http') ? t.profile_image : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${t.profile_image}`) : null
          };
        });
        setTalents(processed);
      }
    } catch (error) {
      console.error('Error fetching freelancers:', error);
      toast.error('Failed to load talent listings');
    } finally {
      setLoading(false);
    }
  };

  const clearAllFilters = () => {
    setFilters({
      role: '',
      workType: '',
      budget: '',
      experience: '',
      location: '',
      availability: '',
      skills: [],
      preferences: [],
      searchTerm: ''
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

  const filteredTalents = talents.sort((a, b) => b.matchScore - a.matchScore);

  const featuredTalent = filteredTalents[0];
  const otherTalents = filteredTalents.slice(1);

  const renderTalentCard = (talent: any, index: number) => (
    <motion.div
      key={talent.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="relative p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 hover:border-[#F24C20]/50 transition-all group flex flex-col h-full"
    >
      <div className="flex-1">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-20 h-20 rounded-xl overflow-hidden bg-neutral-800 flex-shrink-0">
            <img
              src={talent.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(talent.full_name || 'Expert')}&size=128&background=random&color=fff`}
              onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(talent.full_name || 'Expert')}&size=128&background=random&color=fff`; }}
              alt={talent.full_name}
              className="w-full h-full object-cover group-hover:scale-110 transition-all"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-white mb-1 truncate">{talent.full_name}</h4>
            <p className="text-sm text-neutral-400 capitalize truncate">{talent.role}</p>
            <div className="flex items-center gap-2 mt-2">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-white">{talent.rating}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t border-neutral-800 mt-auto">
        <div className="text-xl font-bold text-[#F24C20]">Starts from ₹{talent.hourly_rate || '1000'}</div>
        <Link to={`/f/${talent.username || talent.id}`} className="px-4 py-2 rounded-lg bg-[#044071] hover:bg-[#055a99] text-white text-sm font-medium transition-colors">
          Profile
        </Link>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#F24C20] animate-spin mb-4" />
        <p className="text-neutral-400">Finding the perfect experts for you...</p>
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
              <div className="flex flex-col md:flex-row items-center justify-center gap-3 lg:gap-4 mb-4">
                <TrendingUp className="w-8 h-8 lg:w-10 lg:h-10 text-[#F24C20]" />
                <h1 className="text-2xl lg:text-4xl font-bold text-white">
                  We found <span className="text-[#F24C20]">{filteredTalents.length}</span> world-class experts
                </h1>
              </div>
              <p className="text-lg lg:text-xl text-neutral-400">Ready to transform your vision into reality</p>
            </motion.div>
          </div>
        </section>

        <section className="py-8 lg:py-12">
          <div className="max-w-7xl mx-auto px-4 lg:px-6">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Mobile Filter Toggle */}
              <div className="lg:hidden">
                <button 
                  onClick={() => setIsMobileFiltersOpen(true)}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-neutral-900 border border-neutral-800 rounded-2xl text-white font-bold shadow-xl active:scale-95 transition-all"
                >
                  <SlidersHorizontal className="w-5 h-5 text-[#F24C20]" />
                  Refine Your Search
                </button>
              </div>

              {/* Sidebar / Filters Overlay */}
              <aside className="hidden lg:block w-80 flex-shrink-0 space-y-6 sticky top-24 h-[calc(100vh-120px)] overflow-y-auto no-scrollbar scrollbar-hide pr-2">
                <div className="p-6 rounded-3xl bg-neutral-900/50 border border-neutral-800 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="w-5 h-5 text-[#F24C20]" />
                      <h3 className="font-black text-white uppercase tracking-tighter">Refine Search</h3>
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
                      <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-3 block">Keywords</label>
                      <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-[#F24C20] transition-colors" />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Name, role, or skill..."
                          className="w-full pl-12 pr-4 py-3 bg-neutral-950 border border-neutral-800 rounded-2xl text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:border-[#F24C20] transition-all"
                        />
                      </div>
                    </div>

                    {/* Roles/Categories */}
                    <div>
                      <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-3 block">Specialization</label>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => setFilters(prev => ({ ...prev, role: '' }))}
                          className={`flex items-center justify-between p-3 rounded-xl border text-sm font-bold transition-all ${
                            !filters.role ? 'bg-[#F24C20]/10 border-[#F24C20]/30 text-[#F24C20]' : 'border-neutral-800 text-neutral-400 hover:border-neutral-700'
                          }`}
                        >
                          All Roles
                          {!filters.role && <CheckCircle className="w-4 h-4" />}
                        </button>
                        {availableCategories.slice(0, 8).map(cat => (
                          <button
                            key={cat._id}
                            onClick={() => setFilters(prev => ({ ...prev, role: cat.name }))}
                            className={`flex items-center justify-between p-3 rounded-xl border text-sm font-bold transition-all ${
                              filters.role === cat.name ? 'bg-[#F24C20]/10 border-[#F24C20]/30 text-[#F24C20]' : 'border-neutral-800 text-neutral-400 hover:border-neutral-700'
                            }`}
                          >
                            {cat.name}
                            {filters.role === cat.name && <CheckCircle className="w-4 h-4" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Skills */}
                    <div>
                      <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-3 block">Required Skills</label>
                      <div className="flex flex-wrap gap-2">
                        {availableSkills.slice(0, 15).map(skill => {
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
                    {/* Copy of filters for mobile */}
                    <div>
                      <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-3 block">Keywords</label>
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Name, role, or skill..."
                        className="w-full px-4 py-4 bg-neutral-950 border border-neutral-800 rounded-2xl text-white text-sm focus:outline-none focus:border-[#F24C20]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-3 block">Specialization</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setFilters(prev => ({ ...prev, role: '' }))}
                          className={`p-3 rounded-xl border text-sm font-bold transition-all ${
                            !filters.role ? 'bg-[#F24C20]/10 border-[#F24C20]/30 text-[#F24C20]' : 'border-neutral-800 text-neutral-400'
                          }`}
                        >
                          All Roles
                        </button>
                        {availableCategories.slice(0, 8).map(cat => (
                          <button
                            key={cat._id}
                            onClick={() => setFilters(prev => ({ ...prev, role: cat.name }))}
                            className={`p-3 rounded-xl border text-sm font-bold transition-all ${
                              filters.role === cat.name ? 'bg-[#F24C20]/10 border-[#F24C20]/30 text-[#F24C20]' : 'border-neutral-800 text-neutral-400'
                            }`}
                          >
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-3 block">Required Skills</label>
                      <div className="flex flex-wrap gap-2">
                        {availableSkills.slice(0, 15).map(skill => (
                          <button
                            key={skill._id}
                            onClick={() => toggleSkill(skill.name)}
                            className={`px-4 py-2 rounded-full border text-xs font-bold uppercase tracking-wider transition-all ${
                              filters.skills.includes(skill.name) ? 'bg-[#F24C20] border-[#F24C20] text-white' : 'border-neutral-800 text-neutral-500'
                            }`}
                          >
                            {skill.name}
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

              <div className="flex-1 space-y-8">
                {featuredTalent && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative p-6 lg:p-8 rounded-3xl bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 overflow-hidden group"
                  >
                    <div className="absolute top-4 lg:top-6 right-4 lg:right-6 px-3 lg:px-4 py-1.5 lg:py-2 rounded-full bg-[#F24C20] text-white text-[10px] lg:text-sm font-bold flex items-center gap-2 shadow-lg shadow-[#F24C20]/50 z-10">
                      <Award className="w-3 h-3 lg:w-4 lg:h-4" />
                      Best Match {featuredTalent.matchScore}%
                    </div>
                    <div className="relative flex gap-4 lg:gap-8">
                      <div className="relative flex-shrink-0">
                        <div className="relative w-24 h-24 lg:w-48 lg:h-48 rounded-2xl overflow-hidden bg-neutral-800">
                          <img
                            src={featuredTalent.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(featuredTalent.full_name || 'Expert')}&size=200&background=random&color=fff`}
                            onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(featuredTalent.full_name || 'Expert')}&size=200&background=random&color=fff`; }}
                            alt={featuredTalent.full_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute -bottom-1 -right-1 lg:-bottom-2 lg:-right-2 w-7 h-7 lg:w-10 lg:h-10 bg-green-500 rounded-full flex items-center justify-center border-2 lg:border-4 border-neutral-900 shadow-lg">
                          <CheckCircle className="w-3.5 h-3.5 lg:w-5 lg:h-5 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="mb-2 lg:mb-3">
                          <h3 className="text-xl lg:text-3xl font-bold text-white mb-0.5 truncate">{featuredTalent.full_name}</h3>
                          <p className="text-sm lg:text-xl text-neutral-400 capitalize truncate">{featuredTalent.role}</p>
                        </div>
                        <div className="flex items-center gap-2 mb-3 lg:mb-4">
                          <Star className="w-4 h-4 lg:w-5 lg:h-5 fill-yellow-400 text-yellow-400" />
                          <span className="font-bold text-white lg:text-lg">{featuredTalent.rating}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 lg:gap-4 lg:mt-8">
                          <div className="text-xl lg:text-3xl font-bold text-[#F24C20]">Starts from ₹{featuredTalent.hourly_rate || '1200'}</div>
                          <Link to={`/f/${featuredTalent.username || featuredTalent.id}`} className="w-full sm:w-auto px-4 lg:px-6 py-2 lg:py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-sm lg:font-semibold transition-colors text-center">View Profile</Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(isLoggedIn && (subscriptionPlan !== 'Free' && subscriptionPlan !== null)) 
                    ? otherTalents.map((talent, index) => renderTalentCard(talent, index))
                    : otherTalents.slice(0, 10).map((talent, index) => renderTalentCard(talent, index))
                  }
                </div>

                {((!isLoggedIn && otherTalents.length > 10) || (isLoggedIn && subscriptionPlan === 'Free' && otherTalents.length > 10)) && (
                   <motion.div 
                     initial={{ opacity: 0, y: 30 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     className="mt-12 p-8 lg:p-12 rounded-[2rem] lg:rounded-[2.5rem] bg-gradient-to-br from-[#F24C20] to-orange-600 text-center relative overflow-hidden"
                   >
                     <div className="relative z-10">
                       <Award className="w-12 h-12 lg:w-16 lg:h-16 text-white mx-auto mb-6 opacity-80" />
                       <h3 className="text-2xl lg:text-4xl font-black text-white mb-4 italic tracking-tighter">
                         {isLoggedIn ? 'Upgrade Your Performance' : 'Unlock Your Potential'}
                       </h3>
                       <p className="text-lg lg:text-xl text-white/90 mb-10 max-w-2xl mx-auto font-medium">
                         {isLoggedIn 
                            ? 'You have reached the limit of your Free plan. Upgrade to access our full network of elite experts.'
                            : 'Join our exclusive community to discover thousands of world-class talents and start building today.'}
                       </p>
                       <Link 
                         to={isLoggedIn ? "/plans" : "/signup"}
                         className="inline-flex items-center gap-3 px-8 lg:px-12 py-4 lg:py-5 bg-white text-[#F24C20] rounded-2xl font-black text-lg lg:text-xl shadow-2xl hover:scale-105 transition-all w-full sm:w-auto justify-center"
                       >
                         {isLoggedIn ? 'View Subscription Plans' : 'Sign Up to See More'}
                       </Link>
                     </div>
                   </motion.div>
                )}

                {filteredTalents.length === 0 && (
                  <div className="text-center py-20 bg-neutral-900/50 border border-neutral-800 rounded-2xl text-neutral-400">
                    No experts found matching your search.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
