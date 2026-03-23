import { motion } from 'motion/react';
import { ArrowRight, Sparkles, Users, Globe } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';

export default function AboutHero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    // Generate random particles
    const particleCount = 30;
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
      style={{
        background: 'radial-gradient(ellipse at top, #1a0808 0%, #0a0505 50%, #000000 100%)',
      }}
    >
      {/* Animated Particles */}
      <div className="absolute inset-0">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 bg-[#F24C20] rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: particle.delay,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Radial Glow */}
      <motion.div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, #F24C20 0%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#F24C20]/10 border border-[#F24C20]/20 rounded-full mb-8"
            >
              <Sparkles className="w-4 h-4 text-[#F24C20]" />
              <span className="text-[#F24C20] font-medium">About Go Experts</span>
            </motion.div>

            <motion.h1
              className="text-5xl lg:text-7xl font-bold mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <span className="text-white">Building the </span>
              <span className="text-[#F24C20]">future</span>
              <br />
              <span className="text-white">of freelancing</span>
            </motion.h1>

            <motion.p
              className="text-xl text-neutral-300 mb-10 leading-relaxed max-w-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              With <span className="text-[#F24C20] font-semibold">trust</span>, <span className="text-[#F24C20] font-semibold">speed</span> & <span className="text-[#F24C20] font-semibold">verified experts</span>, we're revolutionizing how companies and freelancers connect and collaborate.
            </motion.p>

            <motion.div
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-[#044071] hover:bg-[#055a99] text-white rounded-lg transition-all duration-300 font-semibold shadow-lg shadow-[#044071]/30 flex items-center gap-2"
              >
                Explore Projects
                <ArrowRight className="w-5 h-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-transparent border-2 border-[#F24C20] text-[#F24C20] hover:bg-[#F24C20]/10 rounded-lg transition-all duration-300 font-semibold"
              >
                Become a Seller
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Right: Animated Visual */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <div className="relative w-full h-[500px]">
              {/* Central Orbit */}
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-[#F24C20]/20 border-2 border-[#F24C20] flex items-center justify-center"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(242, 76, 32, 0.3)',
                    '0 0 60px rgba(242, 76, 32, 0.6)',
                    '0 0 20px rgba(242, 76, 32, 0.3)',
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Globe className="w-16 h-16 text-[#F24C20]" />
              </motion.div>

              {/* Orbiting Icons */}
              {[
                { Icon: Users, angle: 0, radius: 180, delay: 0 },
                { Icon: Sparkles, angle: 120, radius: 180, delay: 0.5 },
                { Icon: ArrowRight, angle: 240, radius: 180, delay: 1 },
              ].map(({ Icon, angle, radius, delay }, index) => {
                const radian = (angle * Math.PI) / 180;
                const x = Math.cos(radian) * radius;
                const y = Math.sin(radian) * radius;

                return (
                  <motion.div
                    key={index}
                    className="absolute top-1/2 left-1/2"
                    style={{
                      x,
                      y,
                      marginLeft: -20,
                      marginTop: -20,
                    }}
                    animate={{
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: 'linear',
                      delay,
                    }}
                  >
                    <motion.div
                      className="w-20 h-20 rounded-full bg-neutral-900 border border-[#F24C20]/30 flex items-center justify-center"
                      whileHover={{ scale: 1.2 }}
                      animate={{
                        rotate: [0, -360],
                      }}
                      transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    >
                      <Icon className="w-8 h-8 text-[#F24C20]" />
                    </motion.div>
                  </motion.div>
                );
              })}

              {/* Floating Lines */}
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute top-1/2 left-1/2 w-0.5 h-32 bg-gradient-to-b from-[#F24C20] to-transparent origin-top"
                  style={{
                    transform: `translate(-50%, -50%) rotate(${i * 120}deg)`,
                  }}
                  animate={{
                    opacity: [0.2, 0.6, 0.2],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.7,
                  }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
    </section>
  );
}
