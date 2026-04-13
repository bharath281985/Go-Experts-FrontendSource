import { motion, useInView } from 'motion/react';
import { useRef, useState, useEffect } from 'react';
import { Star, MapPin, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api, { getImgUrl } from '@/app/utils/api';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

export default function TalentSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [talents, setTalents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const mockTalents = [
    { id: '1', full_name: 'Sarah Johnson', role: 'Full Stack Developer', rating: '4.9', reviews: 124, location: 'San Francisco, CA', skills: ['React', 'Node.js', 'PostgreSQL'], hourly_rate: '1500', verified: true, profile_image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150' },
    { id: '2', full_name: 'David Chen', role: 'UI/UX Designer', rating: '4.8', reviews: 89, location: 'Austin, TX', skills: ['Figma', 'UI Design', 'Design Systems'], hourly_rate: '2000', verified: true, profile_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150' },
    { id: '3', full_name: 'Michel Williams', role: 'DevOps Engineer', rating: '5.0', reviews: 56, location: 'London, UK', skills: ['Docker', 'AWS', 'Kubernetes'], hourly_rate: '2500', verified: true, profile_image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150' },
    { id: '4', full_name: 'Aisha Patel', role: 'Product Manager', rating: '4.7', reviews: 112, location: 'Mumbai, India', skills: ['Agile', 'Scrum', 'Backlog Management'], hourly_rate: '1800', verified: true, profile_image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150' },
    { id: '6', full_name: 'Sirigiri Naresh', role: 'WordPress Developer', rating: '4.9', reviews: 156, location: 'Hyderabad, India', skills: ['WordPress', 'PHP', 'SEO'], hourly_rate: '1200', verified: true, profile_image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150&h=150' },
  ];

  useEffect(() => {
    const fetchTalents = async () => {
      try {
        const userStr = localStorage.getItem('user');
        const currentUser = userStr ? JSON.parse(userStr) : null;
        const currentUserId = currentUser?._id;

        const res = await api.get('/users/freelancers');
        if (res.data.success && res.data.data.length > 0) {
          // Filter out current user and take top 4
          const filtered = res.data.data.filter((t: any) => t._id !== currentUserId);
          const processed = filtered.slice(0, 4).map((t: any) => ({
            ...t,
            id: t._id, // Map database _id to id for Links
            rating: t.rating || (4.5 + Math.random() * 0.5).toFixed(1),
            reviews: t.reviews || Math.floor(Math.random() * 200),
            location: t.location || 'Remote',
            skills: t.skills || ['Expertise', 'Quality'],
            role: t.role || 'Expert Professional',
            profile_image: getImgUrl(t.profile_image) || null,
            hourly_rate: t.hourly_rate || '1200'
          }));
          setTalents(processed);
        } else {
          setTalents(mockTalents);
        }
      } catch (error) {
        console.error('Error fetching talents:', error);
        setTalents(mockTalents);
      } finally {
        setTimeout(() => setLoading(false), 800);
      }
    };
    fetchTalents();
  }, []);

  return (
    <section
      ref={ref}
      className="relative py-25 overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at bottom, #0f0505 0%, #000000 100%)',
      }}
    >
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/4 w-[700px] h-[700px] bg-[#F24C20]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/3 w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-3xl" />

        {/* Network Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-5">
          <defs>
            <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#F24C20" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-block mb-6"
          >
            <div className="px-5 py-2.5 rounded-full bg-[#F24C20]/10 border border-[#F24C20]/30 backdrop-blur-sm">
              <span className="text-sm font-medium text-[#F24C20]">Top 1% Verified</span>
            </div>
          </motion.div>

          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-white">Meet World-Class </span>
            <span className="text-[#F24C20]">Talent</span>
          </h2>

          <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
            Work with hand-vetted professionals who have proven track records
          </p>
        </motion.div>

        {/* Floating Talent Cards - Staggered Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16 items-stretch">
          {(loading ? mockTalents : talents).map((talent, index) => (
            <motion.div
              key={talent.id}
              initial={{ opacity: 0, y: 60, rotateY: -20 }}
              animate={isInView ? { opacity: 1, y: 0, rotateY: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.15 }}
              className={`relative group h-full ${loading ? 'animate-pulse pointer-events-none' : ''}`}
              style={{ perspective: '1000px' }}
            >
              <Link to={`/f/${talent.username || talent.id}`} className="block h-full">
                <motion.div
                  whileHover={!loading ? {
                    y: -12,
                    scale: 1.02,
                    rotateY: 3,
                  } : {}}
                  transition={{ duration: 0.4 }}
                  className="relative min-h-[520px] p-6 rounded-3xl bg-gradient-to-br from-neutral-900/90 to-neutral-950/90 backdrop-blur-xl border border-neutral-800 hover:border-[#F24C20]/50 overflow-hidden h-full flex flex-col"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Glow Effect */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: 'radial-gradient(circle at top, rgba(242, 76, 32, 0.15) 0%, transparent 70%)',
                    }}
                  />

                  {/* Top Badge */}
                  {talent.topRated && (
                    <motion.div
                      initial={{ scale: 0, rotate: -45 }}
                      animate={isInView ? { scale: 1, rotate: 0 } : {}}
                      transition={{ duration: 0.5, delay: index * 0.15 + 0.3, type: 'spring' }}
                      className="absolute top-4 right-4 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 text-xs font-semibold border border-purple-500/50 shadow-lg"
                    >
                      ⭐ Top Rated
                    </motion.div>
                  )}

                  {/* Content Container */}
                  <div className="relative text-center flex flex-col h-full">
                    {/* Top Content Area (Grows to push footer down) */}
                    <div className="flex flex-1 flex-col">
                      {/* Avatar */}
                      <motion.div
                        className="relative mx-auto inline-block mb-5"
                        whileHover={{ scale: 1.1, rotate: [0, -5, 5, -5, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        <div className="relative flex w-28 h-28 rounded-full bg-gradient-to-br from-[#F24C20] to-orange-600 items-center justify-center shadow-2xl shadow-[#F24C20]/40 p-[3px]">
                          <div className="w-full h-full rounded-full overflow-hidden bg-neutral-900">
                            <ImageWithFallback
                              src={getImgUrl(talent.profile_image) || `https://ui-avatars.com/api/?name=${encodeURIComponent(talent.full_name || talent.name)}&size=128&background=random&color=fff`}
                              alt={talent.full_name || talent.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Verified Badge */}
                          {talent.verified && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: index * 0.15 + 0.5, type: 'spring' }}
                              className="absolute -bottom-2 -right-2 w-9 h-9 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center border-4 border-black shadow-xl"
                            >
                              <CheckCircle className="w-5 h-5 text-white" />
                            </motion.div>
                          )}

                          {/* Pulse Ring */}
                          <motion.div
                            className="absolute inset-0 rounded-full border border-[#F24C20]/80"
                            animate={{
                              scale: [1, 1.12, 1],
                              opacity: [0.45, 0, 0.45],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              delay: index * 0.3,
                            }}
                          />
                        </div>
                      </motion.div>

                      {/* Name & Role */}
                      <h3 className="text-xl font-bold text-white mb-1 group-hover:text-[#F24C20] transition-colors line-clamp-1">
                        {talent.full_name || talent.name}
                      </h3>
                      <p className="text-sm text-neutral-400 mb-4 capitalize line-clamp-1">{talent.role}</p>

                      {/* Rating */}
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold text-white text-lg">{talent.rating}</span>
                        <span className="text-sm text-neutral-500">({talent.reviews})</span>
                      </div>

                      {/* Location */}
                      <div className="flex items-center justify-center gap-2 text-sm text-neutral-400 mb-5 min-w-0">
                        <MapPin className="w-4 h-4 text-[#F24C20]" />
                        <span className="line-clamp-1">{talent.location}</span>
                      </div>

                      {/* Skills/Categories */}
                      <div className="grid grid-cols-1 gap-2 content-start min-h-[120px] mb-6">
                        {talent.skills?.slice(0, 3).map((skill: any) => {
                          const skillName = typeof skill === 'object' ? skill.name : skill;
                          if (!skillName) return null;
                          return (
                            <span
                              key={typeof skill === 'object' ? skill._id : skill}
                              className="mx-auto block max-w-full truncate px-3 py-2 rounded-xl bg-neutral-800/70 text-xs font-medium text-neutral-300 border border-neutral-700 text-center"
                              title={skillName}
                            >
                              {skillName}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Footer Area - Price (Fixed at bottom) */}
                    <div className="pt-6 border-t border-neutral-800/50 mt-auto flex items-end justify-between gap-4 text-left">
                      <div className="text-2xl font-black text-[#F24C20] mb-0.5 tracking-tight">₹{talent.hourly_rate || '1200'}/hr</div>
                      <div className="text-[10px] uppercase tracking-widest font-bold text-neutral-500">Starting from</div>
                    </div>
                    <motion.div
                      className="opacity-80 group-hover:opacity-100 transition-opacity"
                      initial={{ x: -6 }}
                      whileHover={{ x: 0 }}
                    >
                      <div className="w-11 h-11 rounded-full bg-[#F24C20] flex items-center justify-center shadow-lg shadow-[#F24C20]/30">
                        <ArrowRight className="w-5 h-5 text-white" />
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View All CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center"
        >
          <Link to="/talent">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-[#F24C20] to-orange-600 hover:from-[#F24C20]/90 hover:to-orange-600/90 text-white rounded-2xl font-semibold transition-all duration-300 shadow-2xl shadow-[#F24C20]/40 group text-lg"
            >
              <span>Discover All Talent</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}