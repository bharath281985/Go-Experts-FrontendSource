import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Star,
  MapPin,
  CheckCircle,
  Briefcase,
  Clock,
  IndianRupee,
  MessageCircle,
  Bookmark,
  Award,
  Loader2,
  AlertCircle,
  Link as LinkIcon,
  ExternalLink
} from 'lucide-react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getImgUrl } from '@/app/utils/api';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { useTheme } from '@/app/components/ThemeProvider';
import api from '@/app/utils/api';
import { toast } from 'sonner';
import { CreditUnlockModal } from '@/app/components/subscription/CreditUnlockModal';
import { Lock } from 'lucide-react';

export default function TalentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('about');
  const [saved, setSaved] = useState(false);
  const [talent, setTalent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  useEffect(() => {
    fetchTalentDetails();
    checkIfUnlocked();
  }, [id]);

  const checkIfUnlocked = async () => {
    try {
      const res = await api.get(`/subscription/is-unlocked/${id}`);
      if (res.data.success && res.data.isUnlocked) {
        setIsUnlocked(true);
      }
    } catch (err) {
      console.error('Error checking unlock status:', err);
    }
  };

  const fetchTalentDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/users/freelancers/${id}`);
      if (res.data.success) {
        // Enhance with mock data for fields not in backend yet
        const data = res.data.data;
        setTalent({
          ...data,
          rating: data.rating || 'New',
          reviewCount: data.review_count || 0,
          totalOrders: data.total_orders || 0,
          responseTime: data.response_time || '1 hour',
          availability: data.availability || 'Available',
          whyHireMe: data.why_hire_me || [
            'Professional approach to every project',
            'Strong communication skills',
            'Fast turnaround and quality delivery',
            '100% satisfaction guaranteed'
          ],
          workProcess: data.work_process || [
            { step: 1, title: 'Discovery', description: 'Understanding project requirements and goals.' },
            { step: 2, title: 'Execution', description: 'Working on the design/development with updates.' },
            { step: 3, title: 'Review', description: 'Collecting feedback and making necessary revisions.' }
          ],
          portfolio: data.portfolio || [],
          gigs: []
        });
      }
    } catch (err: any) {
      console.error('Error fetching talent details:', err);
      setError(err.response?.data?.message || 'Failed to load talent profile');
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#F24C20] animate-spin mb-4" />
        <p className="text-neutral-400">Loading profile...</p>
      </div>
    );
  }

  if (error || !talent) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
        <p className="text-neutral-400 mb-6">{error || 'Profile not found'}</p>
        <Link to="/talent" className="px-6 py-3 bg-[#F24C20] text-white rounded-lg font-bold">
          Back to Talent
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: 'about', label: 'About' },
    { id: 'skills', label: 'Skills' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'qualification', label: 'Qualification' },
    { id: 'reviews', label: 'Reviews' },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 pt-20">
      {/* Hero Cover Section */}
      <div className="relative h-80 bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-900/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-neutral-950 to-transparent" />
      </div>

      {/* Profile Header */}
      <div className="relative max-w-7xl mx-auto px-6 -mt-32">
        <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
          {/* Avatar Area */}
          <div className="relative group">
            <div className="w-48 h-48 rounded-3xl overflow-hidden border-8 border-neutral-950 shadow-2xl relative z-10">
              <ImageWithFallback
                src={getImgUrl(talent.profile_image) || `https://ui-avatars.com/api/?name=${talent.full_name}&size=256`}
                alt={talent.full_name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center border-4 border-neutral-950 z-20 shadow-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* User Info Card */}
          <div className="flex-1 w-full bg-neutral-900/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
            <div className="flex flex-col lg:flex-row justify-between gap-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 flex items-center gap-3">
                  {talent.full_name}
                  {talent.kyc_details?.is_verified && (
                    <span className="px-3 py-1 bg-green-500/10 text-green-400 text-xs font-bold rounded-lg border border-green-500/20">Verified</span>
                  )}
                </h1>
                <p className="text-xl text-neutral-400 font-medium mb-4 capitalize">{talent.role || 'Professional Expert'}</p>

                <div className="flex flex-wrap items-center gap-6 text-neutral-300">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold">{talent.rating}</span>
                    <span className="text-neutral-500">({talent.reviewCount} reviews)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#F24C20]" />
                    <span>Remote, World</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => !isUnlocked ? setShowUnlockModal(true) : navigate(`/dashboard/talent/hire/${id}`)}
                  className={`flex-1 md:flex-none px-8 py-4 ${isUnlocked ? 'bg-[#F24C20] hover:bg-[#d9431b]' : 'bg-neutral-800 hover:bg-neutral-700'} text-white rounded-2xl font-bold transition-all shadow-lg shadow-[#F24C20]/25 transform hover:-translate-y-1 flex items-center justify-center gap-2`}
                >
                  {!isUnlocked && <Lock className="w-5 h-5" />}
                  Hire Specialist
                </button>
                <button
                  onClick={() => !isUnlocked ? setShowUnlockModal(true) : navigate(`/dashboard/messages?user=${id}`)}
                  className={`p-4 ${isUnlocked ? 'bg-[#F24C20]/10 border-[#F24C20] text-[#F24C20]' : 'bg-white/5 border-white/10 text-white'} rounded-2xl border transition-all relative group`}
                >
                  {!isUnlocked && <div className="absolute -top-1 -right-1 p-1 bg-red-500 rounded-lg"><Lock className="w-2.5 h-2.5" /></div>}
                  <MessageCircle className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setSaved(!saved)}
                  className={`p-4 rounded-2xl border transition-all ${saved ? 'bg-[#F24C20]/10 border-[#F24C20] text-[#F24C20]' : 'bg-white/5 border-white/10 text-white hover:border-[#F24C20]'}`}
                >
                  <Bookmark className={`w-6 h-6 ${saved ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { icon: IndianRupee, label: 'Hourly Rate', value: `₹${talent.hourly_rate || '0'}`, color: 'text-green-400' },
            { icon: Briefcase, label: 'Experience', value: talent.experience_level || 'Professional', color: 'text-[#F24C20]' },
            { icon: Clock, label: 'Response', value: talent.responseTime, color: 'text-blue-400' },
            { icon: Star, label: 'Rating', value: talent.rating, color: 'text-yellow-400' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 bg-neutral-900/40 border border-white/5 rounded-3xl hover:bg-neutral-900/60 transition-colors"
            >
              <stat.icon className={`w-6 h-6 ${stat.color} mb-3`} />
              <div className="text-sm text-neutral-500 font-medium">{stat.label}</div>
              <div className="text-xl font-bold text-white">{stat.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-8 mb-8 border-b border-white/5 overflow-x-auto pb-1 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 text-sm font-bold transition-all relative ${activeTab === tab.id ? 'text-[#F24C20]' : 'text-neutral-500 hover:text-white'}`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-[#F24C20] rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content Rendering */}
        <div className="pb-24 max-w-4xl">
          {activeTab === 'about' && (
            <div className="space-y-12">
              <section>
                <h2 className="text-2xl font-bold text-white mb-6">Professional Profile</h2>
                <p className="text-neutral-400 text-lg leading-relaxed">{talent.bio || 'This expert hasn\'t provided a bio yet.'}</p>
              </section>

              <section className="p-8 bg-neutral-900/40 border border-white/5 rounded-[2rem]">
                <h3 className="text-xl font-bold text-white mb-6">Why Hire Me</h3>
                <div className="grid gap-4">
                  {talent.whyHireMe.map((item: string, i: number) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </div>
                      <span className="text-neutral-300">{item}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-xl font-bold text-white mb-6">Work Process</h3>
                <div className="flex flex-col gap-6">
                  {talent.workProcess.map((p: any) => (
                    <div key={p.step} className="flex gap-6">
                      <div className="text-4xl font-black text-white/5 select-none">{p.step.toString().padStart(2, '0')}</div>
                      <div>
                        <h4 className="font-bold text-white mb-1">{p.title}</h4>
                        <p className="text-neutral-500">{p.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'skills' && (
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {talent.skills?.length > 0 ? (
                talent.skills.map((skill: string) => (
                  <div key={skill} className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                    <span className="text-white font-bold">{skill}</span>
                    <Award className="w-5 h-5 text-[#F24C20]" />
                  </div>
                ))
              ) : (
                <p className="text-neutral-500 italic">No specific skills listed.</p>
              )}
            </section>
          )}

          {activeTab === 'portfolio' && (
            <section className="relative">
              {!isUnlocked ? (
                <div className="relative py-20 px-8 bg-neutral-900/40 border border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center text-center overflow-hidden">
                  <div className="absolute inset-0 blur-2xl opacity-10 bg-gradient-to-br from-[#F24C20] via-transparent to-blue-500" />
                  <div className="w-20 h-20 rounded-[2rem] bg-[#F24C20]/10 flex items-center justify-center mb-6 relative">
                    <Lock className="w-10 h-10 text-[#F24C20]" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">Portfolio is Locked</h3>
                  <p className="text-neutral-500 max-w-sm mb-8">This specialist has hidden their portfolio projects. Use 1 credit to unlock their full works and case studies.</p>
                  <button 
                    onClick={() => setShowUnlockModal(true)}
                    className="px-8 py-4 bg-[#F24C20] text-white rounded-2xl font-bold shadow-xl shadow-[#F24C20]/20 hover:scale-105 transition-transform"
                  >
                    Unlock Portfolio Now
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {talent.portfolio?.length > 0 ? (
                    talent.portfolio.map((item: any, i: number) => (
                      <div key={i} className={`group relative rounded-[2rem] overflow-hidden border ${isDarkMode ? 'bg-neutral-900 border-white/5' : 'bg-white border-neutral-200'} shadow-2xl transition-all hover:-translate-y-2`}>
                        <div className="aspect-[16/10] overflow-hidden relative">
                          <ImageWithFallback 
                            src={item.image || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80'} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                            alt={item.title} 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent opacity-60" />
                          
                          {item.duration_days && (
                            <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-1.5 text-[10px] font-bold text-white uppercase tracking-wider">
                              <Clock className="w-3 h-3 text-[#F24C20]" />
                              {item.duration_days} Days to Complete
                            </div>
                          )}
                        </div>
                        
                        <div className="p-6">
                          <h4 className="text-xl font-bold text-white mb-3 group-hover:text-[#F24C20] transition-colors">{item.title}</h4>
                          <p className="text-neutral-400 text-sm line-clamp-3 mb-6 leading-relaxed">
                            {item.description || 'Professional execution with high attention to detail and user experience.'}
                          </p>
                          
                          <div className="flex flex-wrap items-center gap-3">
                            {item.links && item.links.map((link: string, lIdx: number) => (
                              <a 
                                key={lIdx}
                                href={link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-[#F24C20] rounded-xl border border-white/10 hover:border-[#F24C20] text-xs font-bold text-white transition-all group/link"
                              >
                                 <LinkIcon className="w-3.5 h-3.5" />
                                 {link.includes('github') ? 'GitHub' : link.includes('behance') ? 'Behance' : 'Live Project'}
                                 <ExternalLink className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                              </a>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-20 bg-white/5 rounded-[2.5rem] border border-dashed border-white/10 w-full">
                      <Briefcase className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
                      <p className="text-neutral-500 font-medium">No projects added to the portfolio yet.</p>
                    </div>
                  )}
                  <CreditUnlockModal 
        isOpen={showUnlockModal}
        onClose={() => setShowUnlockModal(false)}
        targetId={id!}
        targetType="freelancer"
        onUnlocked={() => setIsUnlocked(true)}
      />
    </div>
              )}
            </section>
          )}

          {activeTab === 'qualification' && (
            <section className="space-y-8">
              <div className="p-8 bg-neutral-900/40 border border-white/5 rounded-[2.5rem]">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <Award className="w-6 h-6 text-[#F24C20]" />
                  Educational Credentials
                </h3>
                {talent.kyc_details?.is_verified ? (
                  <div className="flex items-start gap-4 p-6 bg-green-500/5 border border-green-500/20 rounded-2xl">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-green-500">Academic Background Verified</p>
                      <p className="text-neutral-400 text-sm mt-1">This specialist has provided authentic educational documents that have been verified by the GoExperts validation team.</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-neutral-500 italic">Credential verification is currently in progress.</p>
                )}
              </div>
            </section>
          )}

          {activeTab === 'reviews' && (
            <section className="space-y-6">
              <p className="text-neutral-500 italic">No reviews yet for this expert.</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}