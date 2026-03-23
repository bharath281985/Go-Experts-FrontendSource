import { motion, useInView } from 'motion/react';
import { useRef, useState, useEffect } from 'react';
import { Star, MapPin, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '@/app/utils/api';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

export default function TalentSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [talents, setTalents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTalents = async () => {
      try {
        const res = await api.get('/users/freelancers');
        if (res.data.success) {
          // Take only the first 4 talents, and mock missing fields for UI display
          const processed = res.data.data.slice(0, 4).map((t: any) => ({
            ...t,
            rating: (4.5 + Math.random() * 0.5).toFixed(1),
            reviews: Math.floor(Math.random() * 200)
          }));
          setTalents(processed);
        }
      } catch (error) {
        console.error('Error fetching talents:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTalents();
  }, []);

  return (
    <section
      ref={ref}
      className="relative py-32 overflow-hidden"
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
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-[#F24C20] animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {talents.map((talent, index) => (
              <motion.div
                key={talent.id}
                initial={{ opacity: 0, y: 60, rotateY: -20 }}
                animate={isInView ? { opacity: 1, y: 0, rotateY: 0 } : {}}
                transition={{ duration: 0.8, delay: index * 0.15 }}
                className="relative group"
                style={{
                  perspective: '1000px',
                }}
              >
                <Link to={`/talent/${talent.id}`}>
                  <motion.div
                    whileHover={{
                      y: -20,
                      scale: 1.05,
                      rotateY: 5,
                    }}
                    transition={{ duration: 0.4 }}
                    className="relative p-8 rounded-3xl bg-gradient-to-br from-neutral-900/90 to-neutral-950/90 backdrop-blur-xl border border-neutral-800 hover:border-[#F24C20]/50 overflow-hidden"
                    style={{
                      transformStyle: 'preserve-3d',
                    }}
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

                    {/* Content */}
                    <div className="relative text-center">
                      {/* Avatar */}
                      <motion.div
                        className="relative inline-block mb-6"
                        whileHover={{ scale: 1.1, rotate: [0, -5, 5, -5, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#F24C20] to-orange-600 flex items-center justify-center shadow-2xl shadow-[#F24C20]/40 relative">
                          <div className="w-full h-full rounded-full overflow-hidden">
                            <ImageWithFallback
                              src={talent.profile_image ? (talent.profile_image.startsWith('http') ? talent.profile_image : `${import.meta.env.VITE_API_URL}${talent.profile_image}`) : `https://ui-avatars.com/api/?name=${talent.full_name || talent.name}&size=128`}
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
                            className="absolute inset-0 rounded-full border-2 border-[#F24C20]"
                            animate={{
                              scale: [1, 1.3, 1],
                              opacity: [0.5, 0, 0.5],
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
                      <h3 className="text-xl font-bold text-white mb-1 group-hover:text-[#F24C20] transition-colors">
                        {talent.full_name || talent.name}
                      </h3>
                      <p className="text-sm text-neutral-400 mb-4 capitalize">{talent.role}</p>

                      {/* Rating */}
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold text-white text-lg">{talent.rating}</span>
                        <span className="text-sm text-neutral-500">({talent.reviews})</span>
                      </div>

                      {/* Location */}
                      <div className="flex items-center justify-center gap-2 text-sm text-neutral-400 mb-6">
                        <MapPin className="w-4 h-4 text-[#F24C20]" />
                        <span>{talent.location}</span>
                      </div>

                      {/* Skills */}
                      <div className="flex flex-wrap gap-2 justify-center mb-6">
                        {talent.skills?.slice(0, 3).map((skill: string) => (
                          <span
                            key={skill}
                            className="px-3 py-1.5 rounded-lg bg-neutral-800/70 text-xs font-medium text-neutral-300 border border-neutral-700"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      {/* Price */}
                      <div className="pt-4 border-t border-neutral-800">
                        <div className="text-2xl font-bold text-[#F24C20] mb-1">₹{talent.hourly_rate || '1200'}/hr</div>
                        <div className="text-xs text-neutral-500">Starting rate</div>
                      </div>

                      {/* Hover Arrow */}
                      <motion.div
                        className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        initial={{ x: -10 }}
                        whileHover={{ x: 0 }}
                      >
                        <div className="w-10 h-10 rounded-full bg-[#F24C20] flex items-center justify-center shadow-lg">
                          <ArrowRight className="w-5 h-5 text-white" />
                        </div>
                      </motion.div>

                      {/* Floating Particles */}
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-1.5 h-1.5 rounded-full bg-[#F24C20]"
                          style={{
                            top: `${30 + i * 20}%`,
                            left: `${10 + i * 30}%`,
                          }}
                          animate={{
                            y: [0, -15, 0],
                            opacity: [0.3, 1, 0.3],
                          }}
                          transition={{
                            duration: 2,
                            delay: i * 0.4,
                            repeat: Infinity,
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

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
