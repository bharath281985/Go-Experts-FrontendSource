import { motion, useInView } from 'motion/react';
import { ArrowRight, CheckCircle2, Shield, Zap } from 'lucide-react';
import { useRef } from 'react';

export default function CTASection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.4 });

  const trustBadges = [
    { icon: Shield, label: 'Verified Experts' },
    { icon: Zap, label: 'Fast Hiring' },
    { icon: CheckCircle2, label: 'Quality Guaranteed' },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative py-32 overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at center, #1a0808 0%, #000000 100%)',
      }}
    >
      {/* Mesh Glow Background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[800px] rounded-full"
          style={{
            background: 'radial-gradient(ellipse, #F24C20 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Animated particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#F24C20] rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Main Heading */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <motion.h2
            className="text-5xl lg:text-7xl font-bold text-white leading-tight mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Ready to work with{' '}
            <span className="text-[#F24C20]">verified experts</span>?
          </motion.h2>

          <motion.p
            className="text-xl lg:text-2xl text-neutral-300 mb-12 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Join <span className="text-[#F24C20] font-bold">120,000+</span> experts and{' '}
            <span className="text-[#F24C20] font-bold">64,000+</span> companies already
            building the future of work.
          </motion.p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-6 mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 20px 60px rgba(4, 64, 113, 0.5)' }}
            whileTap={{ scale: 0.95 }}
            className="group px-10 py-5 bg-[#044071] hover:bg-[#055a99] text-white rounded-xl transition-all duration-300 font-bold text-lg shadow-2xl shadow-[#044071]/40 flex items-center gap-3"
          >
            Post a Project
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </motion.button>

          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: '0 20px 60px rgba(242, 76, 32, 0.3)',
            }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-5 bg-transparent border-2 border-[#F24C20] text-[#F24C20] hover:bg-[#F24C20]/10 rounded-xl transition-all duration-300 font-bold text-lg"
          >
            Explore Talent
          </motion.button>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-8"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          {trustBadges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <motion.div
                key={index}
                className="flex items-center gap-3 px-6 py-3 bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-full"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.6, delay: 1 + index * 0.15 }}
                whileHover={{ scale: 1.05, borderColor: '#F24C20' }}
              >
                <Icon className="w-5 h-5 text-[#F24C20]" />
                <span className="text-neutral-300 font-medium">{badge.label}</span>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Animated Underline Strokes */}
        <motion.div
          className="mt-16 relative h-1 max-w-md mx-auto"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-[#F24C20] to-transparent"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </motion.div>
      </div>
    </section>
  );
}
