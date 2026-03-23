import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useTheme } from '@/app/components/ThemeProvider';
import { Briefcase, Star, Clock, Bookmark, BookmarkCheck, Search, Filter, TrendingUp, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '@/app/utils/api';
import { toast } from 'sonner';

export default function FindGigs() {
  const { isDarkMode } = useTheme();
  const [savedGigs, setSavedGigs] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(true);
  const [gigs, setGigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  const [categories, setCategories] = useState<any[]>([]);
  const [availableBudgetRanges, setAvailableBudgetRanges] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrices, setSelectedPrices] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [gigsRes, catRes, stepsRes, savedRes] = await Promise.all([
          api.get('/gigs'),
          api.get('/cms/categories'),
          api.get('/cms/registration-steps'),
          api.get('/users/saved-gigs')
        ]);
        if (gigsRes.data.success) {
          setGigs(gigsRes.data.data);
        }
        if (catRes.data.success) {
          setCategories(catRes.data.categories || catRes.data.data || []);
        }
        if (stepsRes.data.success) {
          const steps = stepsRes.data.data;
          const budgetStep = steps.find((s: any) => s.field === 'budgetRange');
          if (budgetStep) setAvailableBudgetRanges(budgetStep.options || []);
        }
        if (savedRes.data.success) {
          setSavedGigs(savedRes.data.data.map((item: any) => item.gig?._id || item.gig));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredGigs = gigs.filter(g => {
    if (activeCategory !== 'All' && g.category !== activeCategory) return false;
    if (searchTerm && !g.title?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    
    if (selectedPrices.length > 0) {
      const price = g.investment_required || 0;
      const matchesPrice = selectedPrices.some(rangeValue => {
        try {
          const val = rangeValue.toLowerCase();
          if (val.includes('+')) {
            const minVal = parseFloat(val) * (val.includes('k') ? 1000 : val.includes('l') ? 100000 : 1);
            return price >= minVal;
          } else if (val.includes('-')) {
            const parts = val.split('-');
            const parsePart = (p: string) => parseFloat(p) * (p.includes('k') ? 1000 : p.includes('l') ? 100000 : 1);
            return price >= parsePart(parts[0]) && price <= parsePart(parts[1]);
          }
        } catch { return false; }
        return false;
      });
      if (!matchesPrice) return false;
    }
    
    return true;
  });

  const activeGigs = filteredGigs;

  const toggleSave = async (gigId: string) => {
    try {
      const res = await api.post(`/users/saved-gigs/${gigId}`);
      if (res.data.success) {
        setSavedGigs(prev =>
          prev.includes(gigId) ? prev.filter(id => id !== gigId) : [...prev, gigId]
        );
        toast.success(res.data.message);
      }
    } catch (err) {
      toast.error('Failed to save gig');
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
            Find Gigs
          </h1>
          <p className={`mt-2 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
            Browse and purchase ready-to-go services from top freelancers
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

      {/* Featured Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-3 overflow-x-auto pb-2"
      >
        {['All', ...categories.map(c => c.name)].map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${activeCategory === category
              ? 'bg-[#F24C20] text-white'
              : isDarkMode
                ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
          >
            {category}
          </button>
        ))}
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
                Search Gigs
              </label>
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-neutral-500' : 'text-neutral-400'
                  }`} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border outline-none ${isDarkMode
                    ? 'bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500'
                    : 'bg-white border-neutral-200 text-neutral-900 placeholder:text-neutral-400'
                    }`}
                />
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-neutral-300' : 'text-neutral-700'
                }`}>
                Price Range
              </label>
              <div className="space-y-2">
                {availableBudgetRanges.map((range) => (
                  <label key={range.value} className="flex items-center gap-2 cursor-pointer">
                    <input 
                       type="checkbox" 
                       className="w-4 h-4 rounded accent-[#F24C20]" 
                       checked={selectedPrices.includes(range.value)}
                       onChange={(e) => {
                         if(e.target.checked) setSelectedPrices([...selectedPrices, range.value]);
                         else setSelectedPrices(selectedPrices.filter(v => v !== range.value));
                       }}
                    />
                    <span className={`text-sm ${isDarkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                      {range.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Delivery Time */}
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-neutral-300' : 'text-neutral-700'
                }`}>
                Delivery Time
              </label>
              <div className="space-y-2">
                {['24 Hours', '3 Days', '7 Days', 'Anytime'].map((time) => (
                  <label key={time} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded accent-[#F24C20]" />
                    <span className={`text-sm ${isDarkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                      {time}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Seller Level */}
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-neutral-300' : 'text-neutral-700'
                }`}>
                Seller Level
              </label>
              <div className="space-y-2">
                {['Top Rated', 'Level 2', 'Level 1', 'New Seller'].map((level) => (
                  <label key={level} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded accent-[#F24C20]" />
                    <span className={`text-sm ${isDarkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                      {level}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </motion.aside>
        )}

        {/* Gigs Grid */}
        <div className={showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}>
          {/* Results Header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`flex items-center justify-between p-4 rounded-xl mb-4 ${isDarkMode ? 'bg-neutral-900/50' : 'bg-neutral-50'
              }`}
          >
            <div className={`text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
              Showing <span className="font-semibold text-[#F24C20]">{filteredGigs.length}</span> gigs
            </div>
            <select className={`px-4 py-2 rounded-lg border outline-none text-sm ${isDarkMode
              ? 'bg-neutral-800 border-neutral-700 text-white'
              : 'bg-white border-neutral-200 text-neutral-900'
              }`}>
              <option>Recommended</option>
              <option>Best Selling</option>
              <option>Newest</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </motion.div>

          {/* Gigs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGigs.map((gig, index) => {
              const gigId = gig._id || gig.id;
              const sellerName = gig.freelancer_id?.full_name || gig.seller || 'Unknown Seller';
              const sellerImage = gig.freelancer_id?.profile_image 
                ? `${import.meta.env.VITE_API_URL}${gig.freelancer_id.profile_image}`
                : gig.sellerAvatar || 'https://via.placeholder.com/150';
              const gigImage = gig.thumbnail 
                ? `${import.meta.env.VITE_API_URL}${gig.thumbnail}` 
                : gig.image || 'https://via.placeholder.com/600';
              const startingPrice = gig.investment_required || gig.startingPrice || 0;
              const level = gig.level || 'Top Rated Seller';
              const rating = gig.rating || 4.9;
              const reviews = gig.reviews || Math.floor(Math.random() * 50) + 10;
              const delivery = gig.delivery || '3 Days';
              
              return (
              <motion.div
                key={gigId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex flex-col rounded-2xl border backdrop-blur-sm overflow-hidden hover:scale-105 transition-all ${isDarkMode
                  ? 'bg-neutral-900/50 border-neutral-800 hover:border-neutral-700'
                  : 'bg-white/50 border-neutral-200 hover:border-neutral-300'
                  }`}
              >
                {/* Gig Image */}
                <div className="relative group">
                  <img
                    src={gigImage}
                    alt={gig.title}
                    className="w-full h-48 object-cover"
                  />
                  <button
                    onClick={() => toggleSave(gigId)}
                    className={`absolute top-3 right-3 p-2 rounded-lg backdrop-blur-sm transition-all ${savedGigs.includes(gigId)
                      ? 'bg-[#F24C20] text-white'
                      : 'bg-white/90 text-neutral-900 hover:bg-white'
                      }`}
                  >
                    {savedGigs.includes(gigId) ? (
                      <BookmarkCheck className="w-4 h-4" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>
                  {level === 'Top Rated Seller' && (
                    <div className="absolute top-3 left-3 px-3 py-1 bg-[#F24C20] text-white text-xs font-bold rounded-full flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Top Rated
                    </div>
                  )}
                </div>

                {/* Gig Content */}
                <div className="p-4 flex-1 flex flex-col">
                  {/* Seller Info */}
                  <div className="flex items-center gap-2 mb-3">
                    <img
                      src={sellerImage}
                      alt={sellerName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                        {sellerName}
                      </div>
                      <div className={`text-xs ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                        {level}
                      </div>
                    </div>
                  </div>

                  {/* Gig Title */}
                  <Link
                    to={`/gigs/${gigId}`}
                    className={`block text-sm font-semibold mb-3 line-clamp-2 hover:text-[#F24C20] transition-colors ${isDarkMode ? 'text-white' : 'text-neutral-900'
                      }`}
                  >
                    {gig.title}
                  </Link>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3 mt-auto">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                      <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                        {rating}
                      </span>
                    </div>
                    <span className={`text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                      ({reviews})
                    </span>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
                    <div className="flex items-center gap-2 text-sm text-neutral-400">
                      <Clock className="w-4 h-4" />
                      <span>{delivery}</span>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                        Starting at
                      </div>
                      <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                        ₹{startingPrice.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )})}
          </div>
        </div>
      </div>
    </div>
  );
}
