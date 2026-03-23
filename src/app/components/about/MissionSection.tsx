import { motion, useInView } from 'motion/react';
import { Target, Zap, Users, Shield } from 'lucide-react';
import { useRef, useState } from 'react';

export default function MissionSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const missionCards = [
    {
      icon: Target,
      title: 'Connect',
      description: 'Bridge the gap between companies and verified experts',
    },
    {
      icon: Zap,
      title: 'Accelerate',
      description: 'Speed up hiring and project delivery',
    },
    {
      icon: Shield,
      title: 'Secure',
      description: 'Ensure trust and safety in every transaction',
    },
    {
      icon: Users,
      title: 'Empower',
      description: 'Enable freelancers to build sustainable careers',
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative py-32 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #000000 0%, #0a0505 50%, #000000 100%)',
      }}
    >
      {/* Background Glow */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] bg-[#F24C20]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#044071]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Mission Text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-sm font-bold text-[#F24C20] uppercase tracking-wider mb-4">
                Our Mission
              </h2>
              <h3 className="text-4xl lg:text-5xl font-bold mb-6 text-white leading-tight">
                Revolutionizing the{' '}
                <span className="text-[#F24C20]">future of work</span>
              </h3>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-4"
            >
              <p className="text-lg text-neutral-300 leading-relaxed">
                We believe that the future of work is <span className="text-[#F24C20] font-semibold">flexible</span>, <span className="text-[#F24C20] font-semibold">global</span>, and <span className="text-[#F24C20] font-semibold">human-centric</span>. 
                Our mission is to create a platform where talent and opportunity meet seamlessly.
              </p>

              <p className="text-lg text-neutral-300 leading-relaxed">
                By combining cutting-edge technology with a deep understanding of what both 
                freelancers and companies need, we're building more than just a marketplace—we're 
                creating a <span className="text-[#F24C20] font-semibold">community</span> where everyone thrives.
              </p>

              {/* Animated underline */}
              <motion.div
                className="h-1 bg-gradient-to-r from-[#F24C20] to-transparent"
                initial={{ width: 0 }}
                animate={isInView ? { width: '100%' } : {}}
                transition={{ duration: 1.2, delay: 0.8 }}
              />
            </motion.div>
          </motion.div>

          {/* Right: Mission Cards Stack */}
          <motion.div
            className="relative h-[500px]"
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {missionCards.map((card, index) => {
              const isHovered = hoveredCard === index;
              const Icon = card.icon;

              return (
                <motion.div
                  key={index}
                  className="absolute left-0 right-0 p-8 bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-2xl cursor-pointer"
                  initial={{ y: 100, opacity: 0 }}
                  animate={
                    isInView
                      ? {
                          y: index * 80,
                          opacity: 1,
                          scale: isHovered ? 1.05 : 1,
                          zIndex: isHovered ? 10 : missionCards.length - index,
                        }
                      : {}
                  }
                  transition={{
                    duration: 0.6,
                    delay: 0.5 + index * 0.15,
                    scale: { duration: 0.2 },
                  }}
                  onHoverStart={() => setHoveredCard(index)}
                  onHoverEnd={() => setHoveredCard(null)}
                  style={{
                    boxShadow: isHovered
                      ? '0 20px 60px rgba(242, 76, 32, 0.3)'
                      : '0 10px 30px rgba(0, 0, 0, 0.5)',
                  }}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon with pulse animation */}
                    <motion.div
                      className="relative"
                      animate={
                        isHovered
                          ? {
                              scale: [1, 1.2, 1],
                            }
                          : {}
                      }
                      transition={{ duration: 0.6 }}
                    >
                      <div className="w-14 h-14 rounded-xl bg-[#F24C20]/20 border border-[#F24C20] flex items-center justify-center">
                        <Icon className="w-7 h-7 text-[#F24C20]" />
                      </div>
                      {isHovered && (
                        <motion.div
                          className="absolute inset-0 rounded-xl bg-[#F24C20]/30"
                          initial={{ scale: 1, opacity: 1 }}
                          animate={{ scale: 1.5, opacity: 0 }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                      )}
                    </motion.div>

                    <div>
                      <h4 className="text-xl font-bold text-white mb-2">{card.title}</h4>
                      <p className="text-neutral-400">{card.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
