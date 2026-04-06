import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useTheme } from '@/app/components/ThemeProvider';
import {
  Search,
  Filter,
  MapPin,
  Clock,
  IndianRupee,
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  Star,
  TrendingUp,
  Users,
  Loader2
} from 'lucide-react';
import DonutChart from '@/app/components/dashboard/charts/DonutChart';
import { Link } from 'react-router-dom';
import api from '@/app/utils/api';
import { formatDistanceToNow } from 'date-fns';

export default function ExploreProjects() {
  const { isDarkMode } = useTheme();
  const [savedProjects, setSavedProjects] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [categories, setCategories] = useState<any[]>([]);
  const [location, setLocation] = useState('All Locations');
  const [expLevels, setExpLevels] = useState<string[]>([]);
  const [budgetRanges, setBudgetRanges] = useState<string[]>([]);
  const [availableBudgetRanges, setAvailableBudgetRanges] = useState<any[]>([]);
  const [availableExpLevels, setAvailableExpLevels] = useState<any[]>([]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (category !== 'All Categories') params.category = category;
      if (location !== 'All Locations') params.location = location;
      if (budgetRanges.length > 0) params.budget_range = budgetRanges[0];
      if (expLevels.length > 0) params.experience_level = expLevels[0]; // Simple filter for now

      const res = await api.get('/projects', { params });
      if (res.data.success) {
        setProjects(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchProjects();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm, category, location, expLevels, budgetRanges]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, stepsRes, favRes] = await Promise.all([
          api.get('/cms/categories'),
          api.get('/cms/registration-steps'),
          api.get('/users/favorites')
        ]);
        if (catRes.data.success) {
          setCategories(catRes.data.categories || catRes.data.data || []);
        }
        if (stepsRes.data.success) {
          const steps = stepsRes.data.data;
          const budgetStep = steps.find((s: any) => s.field === 'budgetRange');
          if (budgetStep) setAvailableBudgetRanges(budgetStep.options || []);
          const expStep = steps.find((s: any) => s.field === 'experienceLevel');
          if (expStep) setAvailableExpLevels(expStep.options || []);
        }
        if (favRes.data.success) {
          setSavedProjects(favRes.data.data.map((p: any) => p._id));
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };
    fetchData();
  }, []);

  const projectMatchData = [
    { name: 'Perfect Match', value: 35, color: '#F24C20' },
    { name: 'Good Match', value: 45, color: '#10b981' },
    { name: 'Okay Match', value: 20, color: '#64748b' }
  ];

  const toggleSave = async (projectId: string) => {
    try {
      const res = await api.put(`/users/favorites/${projectId}`);
      if (res.data.success) {
        if (res.data.isFavorited) {
          setSavedProjects(prev => [...prev, projectId]);
        } else {
          setSavedProjects(prev => prev.filter(id => id !== projectId));
        }
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
            Explore Projects
          </h1>
          <p className={`mt-2 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
            Find projects that match your skills and interests
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${isDarkMode
              ? 'bg-neutral-900 border-neutral-800 hover:border-neutral-700 text-white'
              : 'bg-white border-neutral-200 hover:border-neutral-300 text-neutral-900'
            }`}
        >
          <Filter className="w-4 h-4" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        {showFilters && (
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`lg:col-span-1 p-6 rounded-2xl border backdrop-blur-sm h-fit sticky top-24 ${isDarkMode
                ? 'bg-neutral-900/50 border-neutral-800'
                : 'bg-white/50 border-neutral-200'
              }`}
          >
            <h2 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
              Filters
            </h2>

            {/* Search */}
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-neutral-300' : 'text-neutral-700'
                }`}>
                Keyword Search
              </label>
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-neutral-500' : 'text-neutral-400'
                  }`} />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border outline-none ${isDarkMode
                      ? 'bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500'
                      : 'bg-white border-neutral-200 text-neutral-900 placeholder:text-neutral-400'
                    }`}
                />
              </div>
            </div>

            {/* Category */}
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-neutral-300' : 'text-neutral-700'
                }`}>
                Category
              </label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border outline-none ${isDarkMode
                  ? 'bg-neutral-800 border-neutral-700 text-white'
                  : 'bg-white border-neutral-200 text-neutral-900'
                }`}>
                <option>All Categories</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Budget Range */}
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-neutral-300' : 'text-neutral-700'
                }`}>
                Budget Range
              </label>
              <div className="space-y-2">
                {availableBudgetRanges.map((range) => (
                  <label key={range.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={budgetRanges.includes(range.label)}
                      onChange={(e) => {
                        if(e.target.checked) setBudgetRanges([range.label]);
                        else setBudgetRanges([]);
                      }}
                      className="w-4 h-4 rounded accent-[#F24C20]"
                    />
                    <span className={`text-sm ${isDarkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                      {range.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Experience Level */}
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-neutral-300' : 'text-neutral-700'
                }`}>
                Experience Level
              </label>
              <div className="space-y-2">
                {availableExpLevels.map((level) => (
                  <label key={level.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={expLevels.includes(level.label)}
                      onChange={(e) => {
                        if(e.target.checked) setExpLevels([level.label]); 
                        else setExpLevels([]);
                      }}
                      className="w-4 h-4 rounded accent-[#F24C20]"
                    />
                    <span className={`text-sm ${isDarkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                      {level.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-neutral-300' : 'text-neutral-700'
                }`}>
                Location
              </label>
              <select 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border outline-none ${isDarkMode
                  ? 'bg-neutral-800 border-neutral-700 text-white'
                  : 'bg-white border-neutral-200 text-neutral-900'
                }`}>
                <option>All Locations</option>
                <option>Remote</option>
                <option>Mumbai</option>
                <option>Bangalore</option>
                <option>Delhi</option>
              </select>
            </div>

            {/* Insights */}
            <div className={`p-4 rounded-xl border ${isDarkMode
                ? 'bg-neutral-800/50 border-neutral-700'
                : 'bg-neutral-50 border-neutral-200'
              }`}>
              <h3 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                Projects Matching Your Profile
              </h3>
              <DonutChart data={projectMatchData} size={140} />
            </div>
          </motion.aside>
        )}

        {/* Projects List */}
        <div className={showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}>
          {/* Results Header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`flex items-center justify-between p-4 rounded-xl mb-4 ${isDarkMode ? 'bg-neutral-900/50' : 'bg-neutral-50'
              }`}
          >
            <div className={`text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
              Showing <span className="font-semibold text-[#F24C20]">{projects.length}</span> projects
            </div>
            <select className={`px-4 py-2 rounded-lg border outline-none text-sm ${isDarkMode
                ? 'bg-neutral-800 border-neutral-700 text-white'
                : 'bg-white border-neutral-200 text-neutral-900'
              }`}>
              <option>Most Relevant</option>
              <option>Newest First</option>
              <option>Highest Budget</option>
              <option>Most Proposals</option>
            </select>
          </motion.div>

          {/* Project Cards */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-12 h-12 text-[#F24C20] animate-spin mb-4" />
                <p className={isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}>Loading projects...</p>
              </div>
            ) : projects.length > 0 ? (
              projects.map((project, index) => (
                <motion.div
                  key={project._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-6 rounded-2xl border backdrop-blur-sm hover:scale-[1.02] transition-all ${isDarkMode
                      ? 'bg-neutral-900/50 border-neutral-800 hover:border-neutral-700'
                      : 'bg-white/50 border-neutral-200 hover:border-neutral-300'
                    }`}
                >
                  <div className="flex gap-6">
                    {/* Project Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={project.image || 'https://images.unsplash.com/photo-1603985585179-3d71c35a537c?w=800&q=80'}
                        alt={project.title}
                        className="w-48 h-32 object-cover rounded-xl"
                      />
                    </div>
  
                    {/* Project Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <Link
                            to={`/dashboard/projects/${project._id}`}
                            className={`text-xl font-bold hover:text-[#F24C20] transition-colors ${isDarkMode ? 'text-white' : 'text-neutral-900'
                              }`}
                          >
                            {project.title}
                          </Link>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="px-3 py-1 bg-[#F24C20]/10 text-[#F24C20] text-xs font-medium rounded-full">
                              {project.category || 'General'}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleSave(project._id)}
                          className={`p-2 rounded-lg transition-colors ${savedProjects.includes(project._id)
                              ? 'bg-[#F24C20]/10 text-[#F24C20]'
                              : isDarkMode
                                ? 'hover:bg-neutral-800 text-neutral-400'
                                : 'hover:bg-neutral-100 text-neutral-600'
                            }`}
                        >
                          <Bookmark className={`w-5 h-5 ${savedProjects.includes(project._id) ? 'fill-current' : ''}`} />
                        </button>
                      </div>
  
                      {/* Metadata */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <IndianRupee className={`w-4 h-4 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`} />
                          <span className={`text-sm ${isDarkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                            {project.budget_range}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className={`w-4 h-4 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`} />
                          <span className={`text-sm ${isDarkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                            {project.timeline || 'TBD'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className={`w-4 h-4 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`} />
                          <span className={`text-sm ${isDarkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                            {project.location || 'Remote'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className={`w-4 h-4 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`} />
                          <span className={`text-sm ${isDarkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                            {project.proposals || 0} proposals
                          </span>
                        </div>
                      </div>
  
                      {/* Skills */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.skills_required?.map((skill: string) => (
                          <span
                            key={skill}
                            className={`px-3 py-1 rounded-lg text-xs ${isDarkMode
                                ? 'bg-neutral-800 text-neutral-300'
                                : 'bg-neutral-100 text-neutral-700'
                              }`}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
  
                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-800">
                        <div className="flex items-center gap-3">
                           <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F24C20] to-orange-600 flex items-center justify-center text-white text-xs font-bold">
                                 {project.client_id?.full_name?.substring(0, 2).toUpperCase() || 'EX'}
                              </div>
                              <Link 
                                to={`/dashboard/projects/explore?search=${project.client_id?.full_name}`}
                                className={`font-medium text-sm hover:text-[#F24C20] transition-colors ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}
                              >
                                 {project.client_id?.full_name || 'Client'}
                              </Link>
                           </div>
                           <span className="text-neutral-300 dark:text-neutral-700">|</span>
                           <span className={`text-xs ${isDarkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                             Posted {formatDistanceToNow(new Date(project.createdAt))} ago
                           </span>
                        </div>
                        <Link
                          to={`/dashboard/projects/${project._id}`}
                          className="px-6 py-2 bg-[#F24C20] hover:bg-orange-600 text-white rounded-lg font-medium transition-all"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-12 text-center border border-neutral-200 dark:border-neutral-800">
                <Search className="w-16 h-16 text-neutral-300 dark:text-neutral-700 mx-auto mb-4" />
                <h3 className="text-xl font-bold dark:text-white mb-2">No projects found</h3>
                <p className="text-neutral-500">Try adjusting your filters to find what you're looking for.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}