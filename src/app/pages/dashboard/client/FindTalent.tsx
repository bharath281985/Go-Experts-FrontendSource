import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Search, Filter, Star, MapPin, 
  CheckCircle, Loader2, ArrowRight, X,
  SlidersHorizontal, Briefcase, Award
} from 'lucide-react';
import { useTheme } from '@/app/components/ThemeProvider';
import api from '@/app/utils/api';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function FindTalent() {
  const { isDarkMode } = useTheme();
  const [talents, setTalents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [talentsRes, catsRes] = await Promise.all([
        api.get('/users/freelancers'),
        api.get('/cms/categories')
      ]);

      if (talentsRes.data.success) {
        setTalents(talentsRes.data.data);
      }
      if (catsRes.data.success) {
        setCategories(catsRes.data.data.filter((c: any) => c.is_active));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load talent listings');
    } finally {
      setLoading(false);
    }
  };

  const filteredTalents = talents.filter(t => {
    const matchesSearch = t.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         t.bio?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           t.categories?.some((c: any) => c._id === selectedCategory || c.name === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(categorySearch.toLowerCase())
  ).slice(0, categorySearch ? 50 : 15); // Show top 15 by default, more when searching

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-[#F24C20] animate-spin mb-4" />
        <p className={isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}>
          Finding the best talent for you...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-2 text-[#F24C20]">
            <Users className="w-6 h-6" />
            <span className="text-sm font-bold tracking-wider uppercase">Talent Pool</span>
          </div>
          <h1 className={`text-4xl font-black ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
            Find Talent
          </h1>
          <p className={`mt-2 max-w-xl ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
            Browse our curated list of world-class freelancers and hire the perfect match for your project.
          </p>
        </motion.div>

        <div className="flex items-center gap-4">
          <div className={`relative w-full md:w-80 group ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
              isDarkMode ? 'text-neutral-500 group-focus-within:text-[#F24C20]' : 'text-neutral-400 group-focus-within:text-[#F24C20]'
            }`} />
            <input
              type="text"
              placeholder="Search by name, bio, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-xl border outline-none transition-all ${
                isDarkMode 
                  ? 'bg-neutral-900/50 border-neutral-800 focus:border-[#F24C20] focus:ring-1 focus:ring-[#F24C20]' 
                  : 'bg-white border-neutral-200 focus:border-[#F24C20] focus:ring-1 focus:ring-[#F24C20]'
              }`}
            />
          </div>
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`p-3 rounded-xl border transition-all ${
              isFilterOpen 
                ? 'bg-[#F24C20] border-[#F24C20] text-white' 
                : isDarkMode 
                  ? 'bg-neutral-900/50 border-neutral-800 text-neutral-400 hover:text-white' 
                  : 'bg-white border-neutral-200 text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Categories Section */}
      <div className={`p-6 rounded-3xl border transition-all ${isDarkMode ? 'bg-neutral-900/40 border-neutral-800' : 'bg-white border-neutral-200'}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-[#F24C20]" />
            <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
              Browse by Expertise
            </h3>
          </div>
          
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
            <input
              type="text"
              placeholder="Search category..."
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 text-xs rounded-xl outline-none border transition-all ${
                isDarkMode 
                  ? 'bg-neutral-950 border-neutral-800 focus:border-[#F24C20]' 
                  : 'bg-neutral-50 border-neutral-200 focus:border-[#F24C20]'
              }`}
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all border ${
              selectedCategory === 'all'
                ? 'bg-[#F24C20] border-[#F24C20] text-white shadow-lg shadow-[#F24C20]/20'
                : isDarkMode
                  ? 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:bg-neutral-800'
                  : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            All Talent
          </button>
          {filteredCategories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setSelectedCategory(cat._id)}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all border ${
                selectedCategory === cat._id
                  ? 'bg-[#F24C20] border-[#F24C20] text-white shadow-lg shadow-[#F24C20]/20'
                  : isDarkMode
                    ? 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:bg-neutral-800'
                    : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              {cat.name}
            </button>
          ))}
          {!categorySearch && categories.length > 15 && (
            <div className={`px-4 py-2 text-xs font-black uppercase text-neutral-600`}>
              Search for more...
            </div>
          )}
        </div>
      </div>

      {/* Talent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredTalents.map((talent, index) => (
            <motion.div
              layout
              key={talent._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
              className={`group overflow-hidden rounded-3xl border transition-all hover:shadow-2xl ${
                isDarkMode 
                  ? 'bg-neutral-900/40 border-neutral-800 hover:border-[#F24C20]/50' 
                  : 'bg-white border-neutral-200 hover:border-[#F24C20]/50'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="relative">
                    <img
                      src={talent.profile_image ? (talent.profile_image.startsWith('http') ? talent.profile_image : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${talent.profile_image}`) : `https://ui-avatars.com/api/?name=${talent.full_name}&background=random`}
                      alt={talent.full_name}
                      className="w-20 h-20 rounded-2xl object-cover ring-2 ring-neutral-800"
                    />
                    {talent.kyc_details?.is_verified && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-neutral-900">
                        <CheckCircle className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold text-lg truncate ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                      {talent.full_name}
                    </h3>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-bold text-yellow-400">4.9</span>
                      <span className="text-xs text-neutral-500">(120+ reviews)</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {talent.skills?.slice(0, 2).map((skill: any) => (
                        <span key={skill._id} className="px-2 py-0.5 rounded-md bg-neutral-800 text-[10px] font-bold text-neutral-400 uppercase">
                          {typeof skill === 'object' ? skill.name : skill}
                        </span>
                      ))}
                      {talent.skills?.length > 2 && (
                        <span className="px-2 py-0.5 rounded-md bg-neutral-800 text-[10px] font-bold text-neutral-400 uppercase">
                          +{talent.skills.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <p className={`line-clamp-2 text-sm mb-6 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                  {talent.bio || "No bio provided. Skilled professional ready to take on new projects."}
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-neutral-800/50">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Hourly Rate</span>
                    <span className="text-xl font-black text-[#F24C20]">₹{talent.hourly_rate || '1200'}<span className="text-xs text-neutral-500 font-bold">/hr</span></span>
                  </div>
                  <Link
                    to={`/dashboard/talent/${talent._id}`}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      isDarkMode 
                        ? 'bg-neutral-800 text-white hover:bg-[#F24C20]' 
                        : 'bg-neutral-100 text-neutral-900 hover:bg-[#F24C20] hover:text-white'
                    }`}
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredTalents.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-20 h-20 bg-neutral-900 rounded-full flex items-center justify-center mb-6">
            <Search className="w-10 h-10 text-neutral-700" />
          </div>
          <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
            No talent found
          </h3>
          <p className="mt-2 text-neutral-500 max-w-sm">
            We couldn't find any experts matching your current search or filters. Try adjusting them.
          </p>
          <button 
            onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
            className="mt-6 text-[#F24C20] font-bold hover:underline"
          >
            Clear all filters
          </button>
        </motion.div>
      )}
    </div>
  );
}
