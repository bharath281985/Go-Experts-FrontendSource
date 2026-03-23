import { motion } from 'motion/react';
import { useTheme } from '@/app/components/ThemeProvider';
import { Bookmark, Briefcase, Users, Package, X, ExternalLink, Star, MapPin, DollarSign } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/app/utils/api';

type TabType = 'projects' | 'talents' | 'gigs';

interface SavedProject {
  id: string;
  title: string;
  description: string;
  budget: string;
  duration: string;
  skills: string[];
  postedBy: string;
  applicants: number;
}

interface SavedTalent {
  id: string;
  name: string;
  title: string;
  avatar: string;
  rating: number;
  hourlyRate: number;
  location: string;
  skills: string[];
  completedProjects: number;
}

interface SavedGig {
  id: string;
  title: string;
  seller: string;
  price: number;
  image: string;
  rating: number;
  reviews: number;
  category: string;
}

export default function SavedItems() {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('projects');

  const [savedProjects, setSavedProjects] = useState<any[]>([]);
  const [savedTalents, setSavedTalents] = useState<any[]>([]);
  const [savedGigs, setSavedGigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchSavedItems = async () => {
      setLoading(true);
      try {
        const gigRes = await api.get('/users/saved-gigs');
        if (gigRes.data.success) {
          // Map backend saved gigs to the frontend model schema
          const mappedGigs = gigRes.data.data.map((item: any) => {
             const gig = item.gig || {};
             return {
                id: gig._id,
                title: gig.title || 'Untitled Gig',
                seller: gig.freelancer_id?.full_name || 'Unknown',
                price: gig.investment_required || 0,
                image: gig.thumbnail ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${gig.thumbnail}` : 'https://via.placeholder.com/400',
                rating: 4.9,
                reviews: 15,
                category: gig.category || 'Uncategorized'
             };
          });
          setSavedGigs(mappedGigs);
        }
      } catch (err) {
        console.error('Failed to load saved items', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSavedItems();
  }, []);

  // Auto-switch to first tab with data
  useEffect(() => {
    if (!loading) {
      if (savedProjects.length > 0) setActiveTab('projects');
      else if (savedTalents.length > 0) setActiveTab('talents');
      else if (savedGigs.length > 0) setActiveTab('gigs');
    }
  }, [loading, savedProjects.length, savedTalents.length, savedGigs.length]);

  const tabs: { id: TabType; label: string; icon: any; count: number }[] = [
    { id: 'projects', label: 'Saved Projects', icon: Briefcase, count: savedProjects.length },
    { id: 'talents', label: 'Saved Talents', icon: Users, count: savedTalents.length },
    { id: 'gigs', label: 'Saved Gigs', icon: Package, count: savedGigs.length }
  ];

  const handleRemove = async (id: string, type: string) => {
    if (type === 'gigs') {
       try {
         const res = await api.post(`/users/saved-gigs/${id}`);
         if (res.data.success) {
            setSavedGigs(prev => prev.filter(g => g.id !== id));
         }
       } catch (err) { }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
          Saved Items
        </h1>
        <p className={`mt-2 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
          Access your saved projects, talents, and gigs
        </p>
      </motion.div>

      {/* Tabs */}
      <div className={`flex gap-2 p-1 rounded-xl ${isDarkMode ? 'bg-neutral-800/50' : 'bg-neutral-100'}`}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? isDarkMode
                    ? 'bg-[#F24C20] text-white shadow-lg'
                    : 'bg-[#F24C20] text-white shadow-lg'
                  : isDarkMode
                  ? 'text-neutral-400 hover:text-white'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id
                  ? 'bg-white/20'
                  : isDarkMode
                  ? 'bg-neutral-700'
                  : 'bg-neutral-200'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {/* Saved Projects */}
        {activeTab === 'projects' && (
          <div className="space-y-4">
            {savedProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-2xl border backdrop-blur-sm ${
                  isDarkMode
                    ? 'bg-neutral-900/50 border-neutral-800'
                    : 'bg-white/50 border-neutral-200'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                      {project.title}
                    </h3>
                    <p className={`mb-4 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                      {project.description}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemove(project.id, 'projects')}
                    className={`p-2 rounded-lg transition-colors ${
                      isDarkMode
                        ? 'hover:bg-red-500/10 text-red-400'
                        : 'hover:bg-red-50 text-red-600'
                    }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-3 mb-4">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                    isDarkMode ? 'bg-neutral-800' : 'bg-neutral-100'
                  }`}>
                    <DollarSign className={`w-4 h-4 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                      {project.budget}
                    </span>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                    isDarkMode ? 'bg-neutral-800' : 'bg-neutral-100'
                  }`}>
                    <span className={`text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                      Duration: {project.duration}
                    </span>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                    isDarkMode ? 'bg-neutral-800' : 'bg-neutral-100'
                  }`}>
                    <span className={`text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                      {project.applicants} applicants
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {project.skills.map((skill: string) => (
                    <span
                      key={skill}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        isDarkMode
                          ? 'bg-[#F24C20]/10 text-[#F24C20]'
                          : 'bg-[#F24C20]/10 text-[#F24C20]'
                      }`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                    Posted by {project.postedBy}
                  </span>
                  <button className="flex items-center gap-2 px-6 py-2 bg-[#044071] text-white rounded-lg font-medium hover:bg-[#044071]/90 transition-colors">
                    View Details
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}

            {savedProjects.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-12 rounded-2xl border backdrop-blur-sm text-center ${
                  isDarkMode
                    ? 'bg-neutral-900/50 border-neutral-800'
                    : 'bg-white/50 border-neutral-200'
                }`}
              >
                <Briefcase className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-neutral-700' : 'text-neutral-300'}`} />
                <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                  No Saved Projects
                </h3>
                <p className={isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}>
                  Start browsing projects and save the ones you like
                </p>
              </motion.div>
            )}
          </div>
        )}

        {/* Saved Talents */}
        {activeTab === 'talents' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {savedTalents.map((talent, index) => (
              <motion.div
                key={talent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-2xl border backdrop-blur-sm ${
                  isDarkMode
                    ? 'bg-neutral-900/50 border-neutral-800'
                    : 'bg-white/50 border-neutral-200'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <img
                      src={talent.avatar}
                      alt={talent.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                        {talent.name}
                      </h3>
                      <p className={`text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                        {talent.title}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                          <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                            {talent.rating}
                          </span>
                        </div>
                        <span className={`text-sm ${isDarkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                          ({talent.completedProjects} projects)
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(talent.id, 'talents')}
                    className={`p-2 rounded-lg transition-colors ${
                      isDarkMode
                        ? 'hover:bg-red-500/10 text-red-400'
                        : 'hover:bg-red-50 text-red-600'
                    }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className={`flex items-center gap-2 mb-4 text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                  <MapPin className="w-4 h-4" />
                  {talent.location}
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {talent.skills.slice(0, 4).map((skill: string) => (
                    <span
                      key={skill}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        isDarkMode
                          ? 'bg-neutral-800 text-neutral-300'
                          : 'bg-neutral-100 text-neutral-700'
                      }`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className={`text-xl font-bold ${isDarkMode ? 'text-[#F24C20]' : 'text-[#F24C20]'}`}>
                    ₹{talent.hourlyRate}/hr
                  </div>
                  <button className="px-6 py-2 bg-[#044071] text-white rounded-lg font-medium hover:bg-[#044071]/90 transition-colors">
                    View Profile
                  </button>
                </div>
              </motion.div>
            ))}

            {savedTalents.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`col-span-2 p-12 rounded-2xl border backdrop-blur-sm text-center ${
                  isDarkMode
                    ? 'bg-neutral-900/50 border-neutral-800'
                    : 'bg-white/50 border-neutral-200'
                }`}
              >
                <Users className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-neutral-700' : 'text-neutral-300'}`} />
                <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                  No Saved Talents
                </h3>
                <p className={isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}>
                  Browse talent profiles and save your favorites
                </p>
              </motion.div>
            )}
          </div>
        )}

        {/* Saved Gigs */}
        {activeTab === 'gigs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedGigs.map((gig, index) => (
              <motion.div
                key={gig.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className={`rounded-2xl border backdrop-blur-sm overflow-hidden ${
                  isDarkMode
                    ? 'bg-neutral-900/50 border-neutral-800'
                    : 'bg-white/50 border-neutral-200'
                }`}
              >
                <div className="relative">
                  <img src={gig.image} alt={gig.title} className="w-full h-48 object-cover" />
                  <button
                    onClick={() => handleRemove(gig.id, 'gigs')}
                    className="absolute top-3 right-3 p-2 rounded-lg bg-neutral-900/80 hover:bg-red-500/80 text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-5">
                  <div className={`text-xs font-medium mb-2 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                    {gig.category}
                  </div>
                  <h3 className={`font-semibold mb-3 line-clamp-2 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                    {gig.title}
                  </h3>

                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                    <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                      {gig.rating}
                    </span>
                    <span className={`text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                      ({gig.reviews})
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className={`text-xl font-bold ${isDarkMode ? 'text-[#F24C20]' : 'text-[#F24C20]'}`}>
                      ₹{gig.price.toLocaleString()}
                    </div>
                    <button className="px-4 py-2 bg-[#044071] text-white rounded-lg text-sm font-medium hover:bg-[#044071]/90 transition-colors">
                      View Gig
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}

            {savedGigs.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`col-span-3 p-12 rounded-2xl border backdrop-blur-sm text-center ${
                  isDarkMode
                    ? 'bg-neutral-900/50 border-neutral-800'
                    : 'bg-white/50 border-neutral-200'
                }`}
              >
                <Package className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-neutral-700' : 'text-neutral-300'}`} />
                <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                  No Saved Gigs
                </h3>
                <p className={isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}>
                  Explore gigs marketplace and save your favorites
                </p>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}