import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import {
  Search, SlidersHorizontal, Star, Clock, Heart,
  X, ChevronDown, Filter, TrendingUp, Award,
  Loader2, Package
} from 'lucide-react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import type { GigPreferences } from '@/app/components/gigs/GigFinderWizard';
import api from '@/app/utils/api';
import { toast } from 'sonner';

interface GigResultsPageProps {
  preferences: GigPreferences;
  onReset: () => void;
}

export default function GigResultsPage({ preferences, onReset }: GigResultsPageProps) {
  const [gigs, setGigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState('all');
  const [deliveryTime, setDeliveryTime] = useState('all');
  const [rating, setRating] = useState('all');
  const [sortBy, setSortBy] = useState('match');
  const [savedGigs, setSavedGigs] = useState<string[]>([]);

  useEffect(() => {
    fetchGigs();
    fetchSavedGigs();
  }, [preferences]);

  const fetchSavedGigs = async () => {
    try {
      const res = await api.get('/users/saved-gigs');
      if (res.data.success) {
        setSavedGigs(res.data.data.map((item: any) => item.gig._id));
      }
    } catch (error) {
      console.error('Error fetching saved gigs:', error);
    }
  };

  const handleToggleSave = async (gigId: string) => {
    try {
      const res = await api.post(`/users/saved-gigs/${gigId}`);
      if (res.data.success) {
        if (res.data.saved) {
          setSavedGigs(prev => [...prev, gigId]);
          toast.success('Gig saved to bookmarks');
        } else {
          setSavedGigs(prev => prev.filter(id => id !== gigId));
          toast.success('Gig removed from bookmarks');
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Please login to save gigs');
    }
  };

  const fetchGigs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/gigs');
      if (res.data.success) {
        const userStr = localStorage.getItem('user');
        const currentUser = userStr ? JSON.parse(userStr) : null;
        const currentUserId = currentUser?._id;

        // Simple logic to calculate match score for demo/UX purposes
        const processedGigs = res.data.data
          .filter((gig: any) => {
            const gigFreelancerId = gig.freelancer_id?._id || gig.freelancer_id;
            return gigFreelancerId !== currentUserId;
          })
          .map((gig: any) => {
            let score = 80 + Math.floor(Math.random() * 20); // Base score
            // If category matches exactly
            if (preferences.category.includes(gig.category.toLowerCase())) score += 5;
            // If price matches preference range
            // (Note: in a real app, you'd have more complex logic)
            return {
              ...gig,
              id: gig._id,
              matchScore: Math.min(score, 100),
              reviews: Math.floor(Math.random() * 500) // Dummy reviews for now
            };
          });
        setGigs(processedGigs);
      }
    } catch (error) {
      console.error('Error fetching gigs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGigs = gigs
    .filter(gig => {
      if (priceRange !== 'all') {
        const [min, max] = priceRange.split('-').map(Number);
        if (max) return gig.investment_required >= min && gig.investment_required <= max;
        return gig.investment_required >= min;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'match') return b.matchScore - a.matchScore;
      if (sortBy === 'price-low') return a.investment_required - b.investment_required;
      if (sortBy === 'price-high') return b.investment_required - a.investment_required;
      return 0;
    });

  const matchedGigs = filteredGigs; // Already filtered and sorted

  const getPreferenceLabel = (key: keyof GigPreferences, value: string | string[]) => {
    const labels: Record<string, string> = {
      // Categories
      logo: 'Logo Design',
      uiux: 'UI/UX Design',
      webdev: 'Web Development',
      mobileapp: 'Mobile App',
      video: 'Video Editing',
      marketing: 'Social Media',
      seo: 'SEO',
      writing: 'Content Writing',
      security: 'Cybersecurity',
      // Goals
      quick: 'Quick Delivery',
      quality: 'Premium Quality',
      budget: 'Budget-Friendly',
      support: 'Long-term Support',
      // Experience
      new: 'New Sellers',
      rising: 'Rising Talent',
      toprated: 'Top Rated',
      verified: 'Verified Only',
    };

    if (Array.isArray(value)) {
      return value.map(v => labels[v] || v).join(', ');
    }
    return labels[value] || value;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-20">
        <Loader2 className="w-12 h-12 text-[#F24C20] animate-spin mb-4" />
        <p className="text-neutral-400">Finding the best gigs for you...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 pt-24 pb-16">
      {/* Summary Header */}
      <section className="py-12 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  We found <span className="text-[#F24C20]">{matchedGigs.length} gigs</span> matching your needs
                </h1>
                <p className="text-xl text-neutral-400">
                  Personalized results based on your preferences
                </p>
              </div>
              <button
                onClick={onReset}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-[#F24C20] text-white transition-all"
              >
                <Filter className="w-4 h-4" />
                New Search
              </button>
            </div>

            {/* Selected Preferences Chips */}
            <div className="flex flex-wrap gap-3">
              {preferences.category && (
                <div className="px-4 py-2 rounded-lg bg-[#F24C20]/10 border border-[#F24C20]/30 text-[#F24C20] text-sm font-medium flex items-center gap-2">
                  {getPreferenceLabel('category', preferences.category)}
                  <button className="hover:text-[#F24C20]/80">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {preferences.budgetRange && (
                <div className="px-4 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 text-sm font-medium flex items-center gap-2">
                  ₹{preferences.budgetRange}
                </div>
              )}
              {preferences.deliveryTime && (
                <div className="px-4 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 text-sm font-medium flex items-center gap-2">
                  {preferences.deliveryTime}
                </div>
              )}
              {preferences.experienceLevel && (
                <div className="px-4 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 text-sm font-medium flex items-center gap-2">
                  {getPreferenceLabel('experienceLevel', preferences.experienceLevel)}
                </div>
          </motion.div>
        </div>
      </section>

      <section className="py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="lg:hidden mb-8 space-y-4">
             <button 
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-neutral-900 border border-neutral-800 rounded-2xl text-white font-bold shadow-xl active:scale-95 transition-all"
            >
              <SlidersHorizontal className="w-5 h-5 text-[#F24C20]" />
              Refine Your Search
            </button>
            <div className="text-neutral-400 text-sm font-medium">
              We found <span className="text-white font-bold">{matchedGigs.length}</span> matching gigs
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`${showFilters ? 'flex' : 'hidden'} lg:flex w-full lg:w-80 flex-shrink-0 flex-col space-y-6 lg:sticky lg:top-28 h-auto lg:h-[calc(100vh-140px)] overflow-y-auto no-scrollbar`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-white">Filters</h3>
                <button 
                  onClick={() => {
                    setPriceRange('all');
                    setDeliveryTime('all');
                    setRating('all');
                  }}
                  className="text-sm text-[#F24C20] hover:text-orange-400 transition-colors"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800">
                  <h4 className="font-semibold text-white mb-4">Price Range</h4>
                  <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                    {['all', '499-999', '999-2999', '2999-9999', '10000+'].map((range) => (
                      <label key={range} className="flex items-center gap-3 cursor-pointer group">
                        <input type="radio" name="price" value={range} checked={priceRange === range} onChange={(e) => setPriceRange(e.target.value)} className="w-4 h-4 text-[#F24C20] focus:ring-[#F24C20]" />
                        <span className="text-neutral-300 group-hover:text-white transition-colors text-sm lg:text-base">
                          {range === 'all' ? 'Any Price' : `₹${range.replace('-', ' - ')}`}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800">
                  <h4 className="font-semibold text-white mb-4">Delivery Time</h4>
                  <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                    {['all', '24h', '2-3days', '1week', 'flexible'].map((time) => (
                      <label key={time} className="flex items-center gap-3 cursor-pointer group">
                        <input type="radio" name="delivery" value={time} checked={deliveryTime === time} onChange={(e) => setDeliveryTime(e.target.value)} className="w-4 h-4 text-[#F24C20] focus:ring-[#F24C20]" />
                        <span className="text-neutral-300 group-hover:text-white transition-colors text-sm lg:text-base">
                          {time === 'all' ? 'Any Time' : time === '24h' ? '24 Hours' : time === '2-3days' ? '2-3 Days' : time === '1week' ? '1 Week' : 'Flexible'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800">
                  <h4 className="font-semibold text-white mb-4">Seller Rating</h4>
                  <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                    {['all', '4.5+', '4.0+', '3.5+'].map((r) => (
                      <label key={r} className="flex items-center gap-3 cursor-pointer group">
                        <input type="radio" name="rating" value={r} checked={rating === r} onChange={(e) => setRating(e.target.value)} className="w-4 h-4 text-[#F24C20] focus:ring-[#F24C20]" />
                        <span className="text-neutral-300 group-hover:text-white transition-colors flex items-center gap-1 text-sm lg:text-base">
                          {r === 'all' ? 'Any Rating' : r}
                          {r !== 'all' && <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              
              {showFilters && (
                <button onClick={() => setShowFilters(false)} className="lg:hidden w-full py-4 bg-[#F24C20] text-white rounded-2xl font-bold mt-4">
                  Apply Filters
                </button>
              )}
            </motion.div>

            <div className="flex-1">
              {matchedGigs.length === 0 ? (
                <div className="bg-neutral-900 rounded-3xl p-12 lg:p-20 text-center border border-neutral-800">
                  <Package className="w-12 h-12 lg:w-16 lg:h-16 text-neutral-800 mx-auto mb-6" />
                  <h3 className="text-xl lg:text-2xl font-bold text-white mb-2">No gigs matched your criteria</h3>
                  <p className="text-neutral-400 text-sm lg:text-base">Try adjusting your filters or search preferences.</p>
                </div>
              ) : (
                <>
                  <div className="hidden lg:flex items-center justify-between mb-8">
                    <div className="text-neutral-400">
                      Showing <span className="text-white font-semibold">{matchedGigs.length}</span> results
                    </div>
                    <div className="flex items-center gap-4">
                      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-[#F24C20] transition-colors">
                        <option value="match">Best Match</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 lg:gap-6 auto-rows-auto lg:auto-rows-[280px]">
                    {matchedGigs.map((gig, index) => {
                      const isFeatured = gig.featured && index < 2;
                      const gridClass = isFeatured ? 'lg:col-span-8 lg:row-span-2' : 'lg:col-span-6 lg:row-span-1';
                      const thumbnailUrl = gig.thumbnail ? (gig.thumbnail.startsWith('http') ? gig.thumbnail : `${import.meta.env.VITE_API_URL}${gig.thumbnail}`) : 'https://images.unsplash.com/photo-1618761714954-0b8cd0026356?w=800&q=80';
                      const sellerName = gig.freelancer_id?.full_name || 'Expert Freelancer';
                      const sellerAvatar = gig.freelancer_id?.profile_image ? (gig.freelancer_id.profile_image.startsWith('http') ? gig.freelancer_id.profile_image : `${import.meta.env.VITE_API_URL}${gig.freelancer_id.profile_image}`) : `https://ui-avatars.com/api/?name=${sellerName}`;

                      return (
                        <motion.div key={gig.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }} className={`${gridClass} group relative h-[400px] lg:h-full`}>
                          <Link to={`/gigs/${gig.id}`} className="block h-full rounded-2xl lg:rounded-[2.5rem] overflow-hidden bg-neutral-900 border border-neutral-800 hover:border-[#F24C20]/50 transition-all duration-300">
                            <div className="relative h-full overflow-hidden">
                              <ImageWithFallback src={thumbnailUrl} alt={gig.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
                              {gig.matchScore >= 90 && (
                                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-green-500/90 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3" /> {gig.matchScore}% Match
                                </div>
                              )}
                              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleToggleSave(gig.id); }} className={`absolute top-4 right-4 p-2.5 backdrop-blur-sm rounded-full transition-all ${savedGigs.includes(gig.id) ? 'bg-[#F24C20] opacity-100' : 'bg-white/10 opacity-0 lg:opacity-0 group-hover:opacity-100 hover:bg-white/20'}`}>
                                <Heart className={`w-4 h-4 ${savedGigs.includes(gig.id) ? 'fill-white text-white' : 'text-white'}`} />
                              </button>
                              <div className="absolute inset-x-0 bottom-0 p-6 lg:p-8">
                                <div className="flex items-center gap-3 mb-4">
                                  <div className="w-10 h-10 rounded-full border-2 border-white/20 overflow-hidden shrink-0">
                                    <ImageWithFallback src={sellerAvatar} alt={sellerName} className="w-full h-full object-cover" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-bold text-white text-sm truncate">{sellerName}</div>
                                    <div className="text-[10px] text-[#F24C20] font-black uppercase tracking-widest">Verified Pro</div>
                                  </div>
                                </div>
                                <h3 className="text-lg lg:text-xl font-bold text-white mb-4 line-clamp-2 leading-tight group-hover:text-[#F24C20] transition-colors">{gig.title}</h3>
                                <div className="flex items-end justify-between gap-4">
                                  <div className="shrink-0">
                                    <div className="text-[10px] text-neutral-500 font-black uppercase tracking-widest mb-1">Starting at</div>
                                    <div className="text-2xl lg:text-3xl font-black text-white">₹{gig.investment_required?.toLocaleString()}</div>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 backdrop-blur-sm border border-white/10">
                                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                                      <span className="font-black text-white text-xs">{(4.5 + Math.random() * 0.5).toFixed(1)}</span>
                                    </div>
                                    <div className="w-12 h-12 rounded-2xl bg-[#044071] group-hover:bg-[#F24C20] flex items-center justify-center transition-all shadow-xl group-hover:rotate-12">
                                      <TrendingUp className="w-6 h-6 text-white" />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>

                  <div className="mt-12 text-center px-4">
                    <button className="w-full sm:w-auto px-10 py-4 bg-neutral-900 border border-neutral-800 hover:border-[#F24C20] text-white hover:text-[#F24C20] rounded-2xl transition-all font-black uppercase tracking-widest text-sm">
                      Load More Opportunities
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
