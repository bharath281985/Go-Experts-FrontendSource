import { motion, useInView } from 'motion/react';
import { useRef, useEffect, useState } from 'react';
import { Star, Briefcase, Award, TrendingUp, CheckCircle } from 'lucide-react';
import { useSiteSettings } from '@/app/context/SiteSettingsContext';

const ICON_MAP: Record<string, any> = {
  Star, Briefcase, Award, TrendingUp
};

const defaultStats = [
  { icon: Star, value: 4.9, suffix: '/5', label: 'Average Rating', color: 'from-yellow-500 to-orange-500' },
  { icon: Briefcase, value: 12500, suffix: '+', label: 'Active Projects', color: 'from-blue-500 to-cyan-500' },
  { icon: Award, value: 1665, suffix: '', label: 'Expert Skills', color: 'from-purple-500 to-pink-500' },
  { icon: TrendingUp, value: 98, suffix: '%', label: 'Success Rate', color: 'from-green-500 to-emerald-500' },
];

function Counter({ end, duration = 2 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      
      setCount(Math.floor(progress * end));

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [isInView, end, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

export default function TrustStatsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const settings = useSiteSettings();

  const stats = settings.home_stats && settings.home_stats.length > 0 
    ? settings.home_stats.map((s, i) => ({
        ...s,
        icon: ICON_MAP[s.label.split(' ')[0]] || [Star, Briefcase, Award, TrendingUp][i % 4],
        color: ['from-yellow-500 to-orange-500', 'from-blue-500 to-cyan-500', 'from-purple-500 to-pink-500', 'from-green-500 to-emerald-500'][i % 4]
      }))
    : defaultStats;

  const trustBadges = settings.trust_badges && settings.trust_badges.length > 0
    ? settings.trust_badges
    : ['Featured on TechCrunch', 'Backed by Y Combinator', 'ISO 27001 Certified', 'SOC 2 Compliant'];

  return (
    <section 
      ref={ref} 
      className="relative py-32 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #000000 0%, #0a0505 50%, #000000 100%)',
      }}
    >
      {/* Background Elements */}
      <div className="absolute inset-0">
        {/* Radial Glows */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#F24C20]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-orange-800/10 rounded-full blur-3xl" />
        
        {/* Animated Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-10">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F24C20" stopOpacity="0" />
              <stop offset="50%" stopColor="#F24C20" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#F24C20" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[...Array(6)].map((_, i) => (
            <motion.line
              key={i}
              x1={`${(i * 20)}%`}
              y1="0%"
              x2={`${(i * 20)}%`}
              y2="100%"
              stroke="url(#lineGradient)"
              strokeWidth="1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 3,
                delay: i * 0.2,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            />
          ))}
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
              <span className="text-sm font-medium text-[#F24C20]">Trusted Globally</span>
            </div>
          </motion.div>
          
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-white">Numbers That </span>
            <span className="text-[#F24C20]">Define Excellence</span>
          </h2>
          
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
            Join thousands of satisfied clients and verified experts building the future of work together
          </p>
        </motion.div>

        {/* Floating Stats - Staggered Layout */}
        <div className="relative max-w-6xl mx-auto">
          {/* Top Row */}
          <div className="flex justify-center gap-8 mb-8">
            {stats.slice(0, 2).map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 60, scale: 0.8 }}
                animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ duration: 0.8, delay: index * 0.15 }}
                className="relative group"
              >
                {/* Glow Behind */}
                <motion.div
                  className="absolute -inset-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `radial-gradient(circle, ${stat.color === 'from-yellow-500 to-orange-500' ? '#F59E0B' : '#3B82F6'}20 0%, transparent 70%)`,
                    filter: 'blur(30px)',
                  }}
                />

                {/* Stat Block */}
                <motion.div
                  whileHover={{ y: -15, scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  className="relative w-72 p-10 rounded-3xl bg-gradient-to-br from-neutral-900/90 to-neutral-950/90 backdrop-blur-xl border border-neutral-800 hover:border-[#F24C20]/50 overflow-hidden"
                >
                  {/* Animated Border Glow */}
                  <motion.div
                    className="absolute inset-0 rounded-3xl"
                    style={{
                      background: `linear-gradient(135deg, transparent 0%, ${stat.color === 'from-yellow-500 to-orange-500' ? '#F24C20' : '#3B82F6'}40 50%, transparent 100%)`,
                      opacity: 0,
                    }}
                    whileHover={{ opacity: 0.3 }}
                    transition={{ duration: 0.5 }}
                  />

                  {/* Icon */}
                  <motion.div
                    className="mb-6"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={isInView ? { scale: 1, rotate: 0 } : {}}
                    transition={{ duration: 0.6, delay: index * 0.15 + 0.3, type: 'spring' }}
                  >
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                      <stat.icon className="w-8 h-8 text-white" />
                    </div>
                  </motion.div>

                  {/* Value */}
                  <div className="mb-3">
                    <div className="text-6xl font-bold text-white">
                      {stat.value < 100 && stat.value > 1 ? (
                        <Counter end={stat.value} />
                      ) : (
                        <Counter end={stat.value} duration={2.5} />
                      )}
                      <span className="text-[#F24C20]">{stat.suffix}</span>
                    </div>
                  </div>

                  {/* Label */}
                  <div className="text-neutral-400 font-medium text-lg">{stat.label}</div>

                  {/* Floating Particles */}
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 rounded-full bg-[#F24C20]"
                      style={{
                        top: `${20 + i * 30}%`,
                        right: `${10 + i * 15}%`,
                      }}
                      animate={{
                        y: [0, -20, 0],
                        opacity: [0.3, 1, 0.3],
                      }}
                      transition={{
                        duration: 2,
                        delay: i * 0.3,
                        repeat: Infinity,
                      }}
                    />
                  ))}
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Bottom Row - Offset */}
          <div className="flex justify-center gap-8">
            {stats.slice(2).map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 60, scale: 0.8 }}
                animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ duration: 0.8, delay: (index + 2) * 0.15 }}
                className="relative group"
              >
                {/* Glow Behind */}
                <motion.div
                  className="absolute -inset-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `radial-gradient(circle, ${stat.color === 'from-purple-500 to-pink-500' ? '#A855F7' : '#10B981'}20 0%, transparent 70%)`,
                    filter: 'blur(30px)',
                  }}
                />

                {/* Stat Block */}
                <motion.div
                  whileHover={{ y: -15, scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  className="relative w-72 p-10 rounded-3xl bg-gradient-to-br from-neutral-900/90 to-neutral-950/90 backdrop-blur-xl border border-neutral-800 hover:border-[#F24C20]/50 overflow-hidden"
                >
                  {/* Animated Border Glow */}
                  <motion.div
                    className="absolute inset-0 rounded-3xl"
                    style={{
                      background: `linear-gradient(135deg, transparent 0%, ${stat.color === 'from-purple-500 to-pink-500' ? '#A855F7' : '#10B981'}40 50%, transparent 100%)`,
                      opacity: 0,
                    }}
                    whileHover={{ opacity: 0.3 }}
                    transition={{ duration: 0.5 }}
                  />

                  {/* Icon */}
                  <motion.div
                    className="mb-6"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={isInView ? { scale: 1, rotate: 0 } : {}}
                    transition={{ duration: 0.6, delay: (index + 2) * 0.15 + 0.3, type: 'spring' }}
                  >
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                      <stat.icon className="w-8 h-8 text-white" />
                    </div>
                  </motion.div>

                  {/* Value */}
                  <div className="mb-3">
                    <div className="text-6xl font-bold text-white">
                      {stat.value < 100 && stat.value > 1 ? (
                        <Counter end={stat.value} />
                      ) : (
                        <Counter end={stat.value} duration={2.5} />
                      )}
                      <span className="text-[#F24C20]">{stat.suffix}</span>
                    </div>
                  </div>

                  {/* Label */}
                  <div className="text-neutral-400 font-medium text-lg">{stat.label}</div>

                  {/* Floating Particles */}
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 rounded-full bg-[#F24C20]"
                      style={{
                        top: `${20 + i * 30}%`,
                        right: `${10 + i * 15}%`,
                      }}
                      animate={{
                        y: [0, -20, 0],
                        opacity: [0.3, 1, 0.3],
                      }}
                      transition={{
                        duration: 2,
                        delay: i * 0.3,
                        repeat: Infinity,
                      }}
                    />
                  ))}
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-20 flex flex-wrap items-center justify-center gap-12"
        >
          {trustBadges.map(
            (trust, i) => (
              <motion.div
                key={trust}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.8 + i * 0.1 }}
                className="flex items-center gap-3 text-neutral-500"
              >
                <div className="p-1 px-3 bg-neutral-900 border border-neutral-800 rounded-full flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#F24C20]" />
                  <span className="text-xs font-bold tracking-tight uppercase">{trust}</span>
                </div>
              </motion.div>
            )
          )}
        </motion.div>
      </div>
    </section>
  );
}