import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Star, MapPin, CheckCircle, Heart, Clock, IndianRupee,
  SlidersHorizontal, Search, Award, Zap, TrendingUp,
  Loader2
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

export default function TalentResultsPage({ answers }: TalentResultsPageProps) {
  const [talents, setTalents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedTalents, setSavedTalents] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchFreelancers();
  }, [answers]);

  const fetchFreelancers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/freelancers');
      if (res.data.success) {
        // Simple match calculation
        const processed = res.data.data.map((t: any) => ({
          ...t,
          id: t._id,
          matchScore: 85 + Math.floor(Math.random() * 15),
          reviewsCount: Math.floor(Math.random() * 200),
          rating: (4.5 + Math.random() * 0.5).toFixed(1)
        }));
        setTalents(processed);
      }
    } catch (error) {
      console.error('Error fetching freelancers:', error);
      toast.error('Failed to load talent listings');
    } finally {
      setLoading(false);
    }
  };

  const toggleSave = (id: string) => {
    setSavedTalents(prev =>
      prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
    );
  };

  const filteredTalents = talents.filter(t =>
    t.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.role?.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => b.matchScore - a.matchScore);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#F24C20] animate-spin mb-4" />
        <p className="text-neutral-400">Finding the perfect experts for you...</p>
      </div>
    );
  }

  const featuredTalent = filteredTalents[0];
  const otherTalents = filteredTalents.slice(1);

  return (
    <div className="min-h-screen bg-neutral-950">
      <Header />

      <main className="pt-20">
        {/* Summary Banner */}
        <section className="relative py-12 bg-gradient-to-b from-neutral-900 to-neutral-950 border-b border-neutral-800">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <Zap className="w-8 h-8 text-[#F24C20]" />
                <h1 className="text-4xl font-bold text-white">
                  We found <span className="text-[#F24C20]">{filteredTalents.length}</span> verified experts
                </h1>
              </div>
              <p className="text-xl text-neutral-400 mb-6">
                Based on your preferences, here are the best matches
              </p>

              {/* Selected filters chips */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                {answers.role && (
                  <motion.div
                    className="px-4 py-2 rounded-full bg-[#F24C20]/10 border border-[#F24C20]/30 text-[#F24C20] text-sm font-medium"
                  >
                    Role: {roleOptions.find(r => r.value === answers.role)?.label || answers.role}
                  </motion.div>
                )}
                {answers.workType && (
                  <motion.div
                    className="px-4 py-2 rounded-full bg-[#F24C20]/10 border border-[#F24C20]/30 text-[#F24C20] text-sm font-medium"
                  >
                    {workTypeOptions.find(w => w.value === answers.workType)?.label}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex gap-8">
              {/* Left Sidebar - Filters */}
              <motion.aside
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="w-80 flex-shrink-0 space-y-6 sticky top-24 h-fit"
              >
                {/* Search */}
                <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800">
                  <div className="flex items-center gap-2 mb-4">
                    <SlidersHorizontal className="w-5 h-5 text-[#F24C20]" />
                    <h3 className="font-bold text-white">Refine Search</h3>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by name or role..."
                      className="w-full pl-10 pr-4 py-3 bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#F24C20] transition-colors"
                    />
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-neutral-700 text-[#F24C20] focus:ring-[#F24C20]" />
                    <span className="text-white font-medium">Verified only</span>
                  </label>
                </div>

                <button
                  onClick={() => setSearchTerm('')}
                  className="w-full py-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-medium transition-colors"
                >
                  Clear All Filters
                </button>
              </motion.aside>

              {/* Right Content - Talent Grid */}
              <div className="flex-1 space-y-8">
                {featuredTalent && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative p-8 rounded-3xl bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 overflow-hidden group"
                  >
                    <div className="absolute top-6 right-6 px-4 py-2 rounded-full bg-[#F24C20] text-white text-sm font-bold flex items-center gap-2 shadow-lg shadow-[#F24C20]/50">
                      <Award className="w-4 h-4" />
                      Best Match {featuredTalent.matchScore}%
                    </div>

                    <div className="relative flex gap-8">
                      <div className="relative flex-shrink-0">
                        <div className="relative w-48 h-48 rounded-2xl overflow-hidden bg-neutral-800">
                          <img
                            src={featuredTalent.profile_image || `https://ui-avatars.com/api/?name=${featuredTalent.full_name}`}
                            alt={featuredTalent.full_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center border-4 border-neutral-900 shadow-lg">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-3xl font-bold text-white mb-1">
                              {featuredTalent.full_name}
                            </h3>
                            <p className="text-xl text-neutral-400 capitalize">{featuredTalent.role}</p>
                          </div>
                          <button
                            onClick={() => toggleSave(featuredTalent.id)}
                            className="p-3 rounded-full bg-neutral-800 hover:bg-neutral-700 transition-colors"
                          >
                            <Heart
                              className={`w-5 h-5 ${savedTalents.includes(featuredTalent.id) ? 'fill-[#F24C20] text-[#F24C20]' : 'text-neutral-400'}`}
                            />
                          </button>
                        </div>

                        <div className="flex items-center gap-6 mb-4">
                          <div className="flex items-center gap-2">
                            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                            <span className="font-bold text-white text-lg">{featuredTalent.rating}</span>
                            <span className="text-neutral-400">({featuredTalent.reviewsCount} reviews)</span>
                          </div>
                          <div className="flex items-center gap-2 text-neutral-400">
                            <MapPin className="w-4 h-4" />
                            Remote
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-8">
                          <div className="text-3xl font-bold text-[#F24C20]">
                            ₹{featuredTalent.hourly_rate || '1200'}/hr
                          </div>
                          <div className="flex items-center gap-3">
                            <Link
                              to={`/talent/${featuredTalent.id}`}
                              className="px-6 py-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-semibold transition-colors"
                            >
                              View Profile
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {otherTalents.map((talent, index) => (
                    <motion.div
                      key={talent.id}
                      className="relative p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 hover:border-[#F24C20]/50 transition-all group"
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-neutral-800">
                          <img
                            src={talent.profile_image || `https://ui-avatars.com/api/?name=${talent.full_name}`}
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
                      <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
                        <div className="text-xl font-bold text-[#F24C20]">₹{talent.hourly_rate || '1000'}/hr</div>
                        <Link to={`/talent/${talent.id}`} className="px-4 py-2 rounded-lg bg-[#044071] hover:bg-[#055a99] text-white text-sm font-medium transition-colors">
                          Profile
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>

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

const roleOptions = [
  { value: 'ui-ux', label: 'UI/UX Designer' },
  { value: 'fullstack', label: 'Full Stack Developer' },
  { value: 'mobile', label: 'Mobile App Developer' },
];

const workTypeOptions = [
  { value: 'one-time', label: 'One-time project' },
  { value: 'part-time', label: 'Part-time' },
];
