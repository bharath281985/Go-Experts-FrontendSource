import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Zap } from 'lucide-react';

export default function FinalCTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section 
      ref={ref} 
      className="relative py-40 overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at center, #1a0505 0%, #000000 100%)',
      }}
    >
      {/* Epic Background Elements */}
      <div className="absolute inset-0">
        {/* Main Glow */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] rounded-full opacity-20"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            background: 'radial-gradient(circle, #F24C20 0%, transparent 70%)',
          }}
        />

        {/* Floating Orbs */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-br from-[#F24C20]/20 to-orange-600/10 blur-2xl"
            style={{
              width: Math.random() * 200 + 100,
              height: Math.random() * 200 + 100,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, Math.random() * 60 - 30],
              x: [0, Math.random() * 60 - 30],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: Math.random() * 10 + 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Radial Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-5">
          <defs>
            <radialGradient id="radialLines">
              <stop offset="0%" stopColor="#F24C20" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#F24C20" stopOpacity="0" />
            </radialGradient>
          </defs>
          {[...Array(16)].map((_, i) => {
            const angle = (i * 22.5 * Math.PI) / 180;
            return (
              <motion.line
                key={i}
                x1="50%"
                y1="50%"
                x2={`${50 + Math.cos(angle) * 50}%`}
                y2={`${50 + Math.sin(angle) * 50}%`}
                stroke="url(#radialLines)"
                strokeWidth="1"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                  duration: 2,
                  delay: i * 0.1,
                  repeat: Infinity,
                  repeatType: 'reverse',
                }}
              />
            );
          })}
        </svg>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1 }}
        >
          {/* Badge */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={isInView ? { scale: 1, rotate: 0 } : {}}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-[#F24C20]/10 border border-[#F24C20]/30 mb-10 backdrop-blur-sm"
          >
            <Sparkles className="w-5 h-5 text-[#F24C20]" />
            <span className="text-sm font-semibold text-neutral-300">Join 50,000+ Professionals Worldwide</span>
            <Zap className="w-5 h-5 text-[#F24C20]" />
          </motion.div>

          {/* Epic Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight"
          >
            <span className="block text-white mb-3">
              Ready to{' '}
              <motion.span
                className="relative inline-block"
                animate={{
                  textShadow: [
                    '0 0 20px rgba(242, 76, 32, 0.5)',
                    '0 0 40px rgba(242, 76, 32, 0.8)',
                    '0 0 20px rgba(242, 76, 32, 0.5)',
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <span className="text-[#F24C20]">Transform</span>
                <motion.svg
                  className="absolute -bottom-3 left-0 w-full h-4"
                  viewBox="0 0 400 16"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
                  transition={{ duration: 2, delay: 1 }}
                >
                  <motion.path
                    d="M0,8 Q100,0 200,8 T400,8"
                    stroke="#F24C20"
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                  />
                </motion.svg>
              </motion.span>
            </span>
            <span className="block text-white">Your Career?</span>
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-2xl text-neutral-400 mb-16 max-w-3xl mx-auto leading-relaxed"
          >
            Whether you're looking to hire top talent or find your next opportunity,{' '}
            <span className="text-[#F24C20] font-semibold">Go Experts</span> is your gateway to success.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16"
          >
            <Link to="/signup">
              <motion.button
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="group px-12 py-5 bg-gradient-to-r from-[#F24C20] to-orange-600 hover:from-[#F24C20]/90 hover:to-orange-600/90 text-white rounded-2xl font-bold transition-all duration-300 flex items-center gap-3 shadow-2xl shadow-[#F24C20]/50 text-lg"
              >
                <span>Get Started Now</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </motion.button>
            </Link>
            
            <Link to="/projects">
              <motion.button
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="px-12 py-5 bg-neutral-900/80 hover:bg-neutral-800 border-2 border-neutral-800 hover:border-[#F24C20]/50 text-white rounded-2xl font-bold transition-all duration-300 backdrop-blur-xl text-lg"
              >
                Browse Projects
              </motion.button>
            </Link>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex flex-wrap items-center justify-center gap-8 text-sm text-neutral-500"
          >
            {[
              { icon: '✓', text: 'No credit card required' },
              { icon: '✓', text: 'Free to join' },
              { icon: '✓', text: 'Cancel anytime' },
            ].map((item, i) => (
              <motion.div
                key={item.text}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 1 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold shadow-lg shadow-green-500/30">
                  {item.icon}
                </div>
                <span className="font-medium">{item.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Animated Doodles */}
        <motion.svg
          className="absolute top-20 left-10 w-32 h-32 text-[#F24C20] opacity-20"
          viewBox="0 0 100 100"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
          <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="5,5" />
          <circle cx="50" cy="50" r="25" stroke="currentColor" strokeWidth="1.5" fill="none" strokeDasharray="3,3" />
        </motion.svg>

        <motion.svg
          className="absolute bottom-20 right-10 w-40 h-40 text-[#F24C20] opacity-20"
          viewBox="0 0 100 100"
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        >
          <path d="M20,50 L80,50 M80,50 L70,40 M80,50 L70,60" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="5,5" />
          <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="1.5" fill="none" strokeDasharray="4,4" />
        </motion.svg>

        <motion.svg
          className="absolute top-1/2 right-1/4 w-24 h-24 text-[#F24C20] opacity-15"
          viewBox="0 0 100 100"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        >
          <path d="M50,10 L90,90 L10,90 Z" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="5,5" />
        </motion.svg>
      </div>
    </section>
  );
}