import { motion, useInView } from 'motion/react';
import { TrendingUp, Globe2, Rocket, Heart } from 'lucide-react';
import { useRef } from 'react';

export default function VisionSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  const visionPoints = [
    {
      icon: Globe2,
      title: 'Global Talent',
      description: 'Access to verified experts from every corner of the world',
      color: '#F24C20',
    },
    {
      icon: Rocket,
      title: 'Fast Hiring',
      description: 'Connect with the right talent in minutes, not months',
      color: '#F24C20',
    },
    {
      icon: TrendingUp,
      title: 'Growth',
      description: 'Empowering freelancers to scale their careers exponentially',
      color: '#F24C20',
    },
    {
      icon: Heart,
      title: 'Trust',
      description: 'Building lasting relationships through transparency and quality',
      color: '#F24C20',
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative py-32 overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at center, #0f0505 0%, #000000 100%)',
      }}
    >
      {/* Glowing Orbital Background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
          style={{
            background: 'radial-gradient(circle, #F24C20 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.2, 0.1],
            rotate: [0, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Orbiting rings */}
        {[400, 550, 700].map((size, index) => (
          <motion.div
            key={index}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#F24C20]/20"
            style={{
              width: size,
              height: size,
            }}
            animate={{
              rotate: [0, 360],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 30 + index * 10,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <motion.h2
            className="text-sm font-bold text-[#F24C20] uppercase tracking-wider mb-4"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Our Vision
          </motion.h2>
          <motion.h3
            className="text-4xl lg:text-6xl font-bold mb-6 text-white leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            The <span className="text-[#F24C20]">future</span> is now
          </motion.h3>
          <motion.p
            className="text-xl text-neutral-300 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            We envision a world where geographical boundaries don't limit opportunity, 
            where quality work is always rewarded, and where every freelancer can build 
            a thriving, sustainable career.
          </motion.p>
        </motion.div>

        {/* Vision Points Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {visionPoints.map((point, index) => {
            const Icon = point.icon;
            return (
              <motion.div
                key={index}
                className="relative group"
                initial={{ opacity: 0, y: 60 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.7 + index * 0.15 }}
              >
                {/* Glow on hover */}
                <motion.div
                  className="absolute inset-0 bg-[#F24C20]/0 group-hover:bg-[#F24C20]/10 rounded-2xl blur-xl transition-all duration-500"
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileHover={{ scale: 1.2, opacity: 1 }}
                />

                <div className="relative p-8 bg-neutral-900/30 backdrop-blur-sm border border-neutral-800 group-hover:border-[#F24C20]/50 rounded-2xl transition-all duration-500 h-full">
                  {/* Icon */}
                  <motion.div
                    className="mb-6 relative"
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <div className="w-16 h-16 rounded-xl bg-[#F24C20]/20 border border-[#F24C20] flex items-center justify-center">
                      <Icon className="w-8 h-8 text-[#F24C20]" />
                    </div>
                    
                    {/* Stroke draw animation */}
                    <motion.svg
                      className="absolute -inset-2"
                      viewBox="0 0 80 80"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                    >
                      <motion.rect
                        x="2"
                        y="2"
                        width="76"
                        height="76"
                        rx="12"
                        fill="none"
                        stroke={point.color}
                        strokeWidth="2"
                        initial={{ pathLength: 0 }}
                        whileHover={{ pathLength: 1 }}
                        transition={{ duration: 0.8 }}
                      />
                    </motion.svg>
                  </motion.div>

                  {/* Content */}
                  <h4 className="text-2xl font-bold text-white mb-3 group-hover:text-[#F24C20] transition-colors duration-300">
                    {point.title}
                  </h4>
                  <p className="text-neutral-400 leading-relaxed">
                    {point.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
