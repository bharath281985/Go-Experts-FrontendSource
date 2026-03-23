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
        // Simple logic to calculate match score for demo/UX purposes
        const processedGigs = res.data.data.map((gig: any) => {
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
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8">
            {/* Left Sidebar - Filters */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-80 flex-shrink-0 space-y-6"
            >
              <div className="sticky top-28">
                {/* Filter Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Filters</h3>
                  <button className="text-sm text-[#F24C20] hover:text-orange-400 transition-colors">
                    Clear All
                  </button>
                </div>

                {/* Price Range */}
                <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 mb-4">
                  <h4 className="font-semibold text-white mb-4">Price Range</h4>
                  <div className="space-y-2">
                    {['all', '499-999', '999-2999', '2999-9999', '10000+'].map((range) => (
                      <label key={range} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="radio"
                          name="price"
                          value={range}
                          checked={priceRange === range}
                          onChange={(e) => setPriceRange(e.target.value)}
                          className="w-4 h-4 text-[#F24C20] focus:ring-[#F24C20]"
                        />
                        <span className="text-neutral-300 group-hover:text-white transition-colors">
                          {range === 'all' ? 'Any Price' : `₹${range.replace('-', ' - ')}`}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Delivery Time */}
                <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 mb-4">
                  <h4 className="font-semibold text-white mb-4">Delivery Time</h4>
                  <div className="space-y-2">
                    {['all', '24h', '2-3days', '1week', 'flexible'].map((time) => (
                      <label key={time} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="radio"
                          name="delivery"
                          value={time}
                          checked={deliveryTime === time}
                          onChange={(e) => setDeliveryTime(e.target.value)}
                          className="w-4 h-4 text-[#F24C20] focus:ring-[#F24C20]"
                        />
                        <span className="text-neutral-300 group-hover:text-white transition-colors">
                          {time === 'all' ? 'Any Time' : time === '24h' ? '24 Hours' : time === '2-3days' ? '2-3 Days' : time === '1week' ? '1 Week' : 'Flexible'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Rating */}
                <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 mb-4">
                  <h4 className="font-semibold text-white mb-4">Seller Rating</h4>
                  <div className="space-y-2">
                    {['all', '4.5+', '4.0+', '3.5+'].map((r) => (
                      <label key={r} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="radio"
                          name="rating"
                          value={r}
                          checked={rating === r}
                          onChange={(e) => setRating(e.target.value)}
                          className="w-4 h-4 text-[#F24C20] focus:ring-[#F24C20]"
                        />
                        <span className="text-neutral-300 group-hover:text-white transition-colors flex items-center gap-1">
                          {r === 'all' ? 'Any Rating' : r}
                          {r !== 'all' && <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Toggle Filters */}
                <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800">
                  <h4 className="font-semibold text-white mb-4">Features</h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" className="w-4 h-4 rounded text-[#F24C20] focus:ring-[#F24C20]" />
                      <span className="text-neutral-300 group-hover:text-white transition-colors">Verified Sellers Only</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" className="w-4 h-4 rounded text-[#F24C20] focus:ring-[#F24C20]" />
                      <span className="text-neutral-300 group-hover:text-white transition-colors">Include Revisions</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" className="w-4 h-4 rounded text-[#F24C20] focus:ring-[#F24C20]" />
                      <span className="text-neutral-300 group-hover:text-white transition-colors">Source Files</span>
                    </label>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Content - Gig Results */}
            <div className="flex-1">
              {matchedGigs.length === 0 ? (
                <div className="bg-neutral-900 rounded-3xl p-20 text-center border border-neutral-800">
                  <Package className="w-16 h-16 text-neutral-800 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-white mb-2">No gigs matched your criteria</h3>
                  <p className="text-neutral-400">Try adjusting your filters or search preferences.</p>
                </div>
              ) : (
                <>
                  {/* Sort & View Options */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="text-neutral-400">
                      Showing <span className="text-white font-semibold">{matchedGigs.length}</span> results
                    </div>
                    <div className="flex items-center gap-4">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-[#F24C20] transition-colors"
                      >
                        <option value="match">Best Match</option>
                        <option value="popular">Most Popular</option>
                        <option value="rating">Highest Rated</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="newest">Newest</option>
                      </select>
                    </div>
                  </div>

                  {/* Bento Grid Layout */}
                  <div className="grid grid-cols-12 gap-4 auto-rows-[280px]">
                    {matchedGigs.map((gig, index) => {
                      // Featured gigs get larger tiles
                      const isFeatured = gig.featured && index < 2;
                      const gridClass = isFeatured
                        ? 'col-span-8 row-span-2'
                        : index % 5 === 0
                          ? 'col-span-6 row-span-1'
                          : 'col-span-6 row-span-1';

                      const thumbnailUrl = gig.thumbnail
                        ? (gig.thumbnail.startsWith('http') ? gig.thumbnail : `${import.meta.env.VITE_API_URL}${gig.thumbnail}`)
                        : 'https://images.unsplash.com/photo-1618761714954-0b8cd0026356?w=800&q=80';

                      const sellerName = gig.freelancer_id?.full_name || 'Expert Freelancer';
                      const sellerAvatar = gig.freelancer_id?.profile_image
                        ? (gig.freelancer_id.profile_image.startsWith('http') ? gig.freelancer_id.profile_image : `${import.meta.env.VITE_API_URL}${gig.freelancer_id.profile_image}`)
                        : `https://ui-avatars.com/api/?name=${sellerName}`;

                      return (
                        <motion.div
                          key={gig.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className={`${gridClass} group relative`}
                        >
                          <Link
                            to={`/gigs/${gig.id}`}
                            className="block h-full rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 hover:border-[#F24C20]/50 transition-all duration-300"
                          >
                            {/* Gig Image */}
                            <div className="relative h-full overflow-hidden">
                              <ImageWithFallback
                                src={thumbnailUrl}
                                alt={gig.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                              {/* Match Score Badge */}
                              {gig.matchScore >= 90 && (
                                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-green-500/90 backdrop-blur-sm text-white text-xs font-bold flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3" />
                                  {gig.matchScore}% Match
                                </div>
                              )}

                              {/* Badge */}
                              {gig.matchScore > 95 && (
                                <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-[#F24C20]/90 backdrop-blur-sm text-white text-xs font-bold flex items-center gap-1">
                                  <Award className="w-3 h-3" />
                                  Top Rated
                                </div>
                              )}

                              {/* Save Button */}
                              <button 
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleToggleSave(gig.id);
                                }}
                                className={`absolute top-4 right-4 p-2.5 backdrop-blur-sm rounded-full transition-all group-hover:opacity-100 ${
                                  savedGigs.includes(gig.id) ? 'bg-[#F24C20] opacity-100' : 'bg-white/10 opacity-0 hover:bg-white/20'
                                }`}
                              >
                                <Heart className={`w-4 h-4 ${savedGigs.includes(gig.id) ? 'fill-white text-white' : 'text-white'}`} />
                              </button>

                              {/* Content Overlay */}
                              <div className="absolute inset-x-0 bottom-0 p-6">
                                {/* Seller Info */}
                                <div className="flex items-center gap-3 mb-3">
                                  <ImageWithFallback
                                    src={sellerAvatar}
                                    alt={sellerName}
                                    className="w-10 h-10 rounded-full object-cover ring-2 ring-white/20"
                                  />
                                  <div>
                                    <div className="font-medium text-white text-sm">{sellerName}</div>
                                    <div className="text-xs text-[#F24C20]">Pro Verified</div>
                                  </div>
                                </div>

                                {/* Gig Title */}
                                <h3 className="font-bold text-white mb-3 line-clamp-2 group-hover:text-[#F24C20] transition-colors">
                                  {gig.title}
                                </h3>

                                {/* Rating & Price */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-black/30 backdrop-blur-sm">
                                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                      <span className="font-bold text-sm text-white">{(4.5 + Math.random() * 0.5).toFixed(1)}</span>
                                    </div>
                                    <span className="text-xs text-neutral-400">({gig.reviews})</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-3 h-3 text-neutral-400" />
                                    <span className="text-xs text-neutral-400">3d</span>
                                  </div>
                                </div>

                                {/* Price Tag */}
                                <div className="mt-4 flex items-end justify-between">
                                  <div>
                                    <span className="text-xs text-neutral-400">Starting at</span>
                                    <div className="text-2xl font-bold text-white">₹{gig.investment_required?.toLocaleString()}</div>
                                  </div>
                                  <button className="px-4 py-2 bg-[#044071] hover:bg-[#055a99] text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-[#044071]/30 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0">
                                    View Gig
                                  </button>
                                </div>
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Load More */}
                  <div className="mt-12 text-center">
                    <button className="px-8 py-3 bg-neutral-900 border border-neutral-800 hover:border-[#F24C20] text-white hover:text-[#F24C20] rounded-xl transition-all font-medium">
                      Load More Gigs
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
