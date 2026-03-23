import { motion, useInView } from 'motion/react';
import { Shield, Eye, Zap, Award, Lightbulb, Users } from 'lucide-react';
import { useRef, useState } from 'react';

export default function ValuesSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });
  const [expandedValue, setExpandedValue] = useState<number | null>(0);

  const values = [
    {
      icon: Shield,
      title: 'Trust',
      description:
        'We build trust through rigorous verification, transparent processes, and secure transactions. Every interaction on our platform is designed to protect both freelancers and companies.',
      illustration: 'M12 2L2 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z',
    },
    {
      icon: Eye,
      title: 'Transparency',
      description:
        'No hidden fees, no surprises. We believe in complete clarity in pricing, processes, and expectations. What you see is exactly what you get—every single time.',
      illustration: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z',
    },
    {
      icon: Zap,
      title: 'Speed',
      description:
        'Time is valuable. We optimize every step—from search to hire to project delivery—ensuring you get results faster without compromising on quality.',
      illustration: 'M13 2L3 14h8l-1 8 10-12h-8l1-8z',
    },
    {
      icon: Award,
      title: 'Quality',
      description:
        'Excellence is non-negotiable. Through continuous screening, rating systems, and quality checks, we ensure only the best experts thrive on our platform.',
      illustration: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
    },
    {
      icon: Lightbulb,
      title: 'Innovation',
      description:
        'We constantly evolve. By leveraging cutting-edge technology and listening to our community, we push boundaries to create better experiences for everyone.',
      illustration: 'M9 18h6M10 22h4M15 2a5 5 0 015 5v8a5 5 0 01-5 5H9a5 5 0 01-5-5V7a5 5 0 015-5h6z',
    },
    {
      icon: Users,
      title: 'Community',
      description:
        "We're more than a platform—we're a global family of creators, innovators, and problem-solvers. Success is shared, and growth is collaborative.",
      illustration: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 3a4 4 0 100 8 4 4 0 000-8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75',
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
      {/* Background Mesh */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/4 w-[700px] h-[700px] bg-[#F24C20]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-sm font-bold text-[#F24C20] uppercase tracking-wider mb-4">
            Our Values
          </h2>
          <h3 className="text-4xl lg:text-6xl font-bold text-white leading-tight mb-6">
            What we <span className="text-[#F24C20]">stand for</span>
          </h3>
          <p className="text-xl text-neutral-300 max-w-3xl mx-auto">
            These core principles guide every decision we make and shape the culture of our platform.
          </p>
        </motion.div>

        {/* Interactive Accordion */}
        <div className="space-y-4">
          {values.map((value, index) => {
            const Icon = value.icon;
            const isExpanded = expandedValue === index;

            return (
              <motion.div
                key={index}
                className="relative"
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              >
                {/* Accordion Item */}
                <div
                  className={`relative overflow-hidden rounded-2xl border transition-all duration-500 cursor-pointer ${
                    isExpanded
                      ? 'bg-[#F24C20]/10 border-[#F24C20] shadow-2xl shadow-[#F24C20]/20'
                      : 'bg-neutral-900/50 border-neutral-800 hover:border-neutral-700'
                  }`}
                  onClick={() => setExpandedValue(isExpanded ? null : index)}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between p-6">
                    <div className="flex items-center gap-4">
                      {/* Icon with Animation */}
                      <motion.div
                        className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                          isExpanded
                            ? 'bg-[#F24C20] border-2 border-[#F24C20]'
                            : 'bg-[#F24C20]/20 border border-[#F24C20]'
                        }`}
                        animate={
                          isExpanded
                            ? {
                                rotate: [0, 360],
                              }
                            : {}
                        }
                        transition={{ duration: 0.6 }}
                      >
                        <Icon className={`w-7 h-7 ${isExpanded ? 'text-white' : 'text-[#F24C20]'}`} />
                      </motion.div>

                      {/* Title */}
                      <h4
                        className={`text-2xl font-bold transition-colors duration-300 ${
                          isExpanded ? 'text-[#F24C20]' : 'text-white'
                        }`}
                      >
                        {value.title}
                      </h4>
                    </div>

                    {/* Expand Indicator */}
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className={`text-2xl font-bold ${
                        isExpanded ? 'text-[#F24C20]' : 'text-neutral-500'
                      }`}
                    >
                      ↓
                    </motion.div>
                  </div>

                  {/* Expanded Content */}
                  <motion.div
                    initial={false}
                    animate={{
                      height: isExpanded ? 'auto' : 0,
                      opacity: isExpanded ? 1 : 0,
                    }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 pl-24">
                      <div className="flex items-start gap-6">
                        {/* Description */}
                        <div className="flex-1">
                          <p className="text-neutral-300 leading-relaxed text-lg">
                            {value.description}
                          </p>
                        </div>

                        {/* Mini Illustration */}
                        <motion.div
                          className="flex-shrink-0"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={
                            isExpanded
                              ? { scale: 1, opacity: 1 }
                              : { scale: 0, opacity: 0 }
                          }
                          transition={{ duration: 0.4, delay: 0.2 }}
                        >
                          <svg
                            width="80"
                            height="80"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#F24C20"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d={value.illustration} />
                          </svg>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Bottom Accent Line */}
                  {isExpanded && (
                    <motion.div
                      className="h-1 bg-gradient-to-r from-[#F24C20] via-[#F24C20] to-transparent"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.6 }}
                      style={{ originX: 0 }}
                    />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}