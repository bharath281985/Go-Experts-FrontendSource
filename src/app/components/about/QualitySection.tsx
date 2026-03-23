import { motion, useInView } from 'motion/react';
import { UserCheck, FileCheck, Eye, Star, Activity } from 'lucide-react';
import { useRef } from 'react';

export default function QualitySection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  const steps = [
    {
      icon: UserCheck,
      title: 'Identity Check',
      description: 'Verify real identity through government ID and live verification.',
      order: 1,
    },
    {
      icon: FileCheck,
      title: 'Skills Verification',
      description: 'Validate expertise through tests, certifications, and assessments.',
      order: 2,
    },
    {
      icon: Eye,
      title: 'Portfolio Review',
      description: 'Evaluate past work quality, client feedback, and project outcomes.',
      order: 3,
    },
    {
      icon: Star,
      title: 'Rating System',
      description: 'Monitor ongoing performance through client ratings and reviews.',
      order: 4,
    },
    {
      icon: Activity,
      title: 'Continuous Monitoring',
      description: 'Track quality metrics, response times, and project success rates.',
      order: 5,
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
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-[#044071]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#F24C20]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-sm font-bold text-[#F24C20] uppercase tracking-wider mb-4">
            Quality Assurance
          </h2>
          <h3 className="text-4xl lg:text-6xl font-bold text-white leading-tight mb-6">
            How we ensure <span className="text-[#F24C20]">quality</span>
          </h3>
          <p className="text-xl text-neutral-300 max-w-3xl mx-auto">
            Our comprehensive 5-step screening process ensures that only verified, high-quality experts join our platform.
          </p>
        </motion.div>

        {/* Process Flow */}
        <div className="relative">
          {/* Connecting Path Line */}
          <div className="absolute top-0 left-0 right-0 h-full hidden lg:block">
            <svg
              className="absolute top-24 left-1/2 -translate-x-1/2 w-full max-w-5xl"
              height="400"
              viewBox="0 0 1000 400"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Curved path connecting all steps */}
              <motion.path
                d="M 100 50 Q 250 20 400 80 T 700 120 T 900 80"
                stroke="url(#pathGradient)"
                strokeWidth="3"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={isInView ? { pathLength: 1 } : {}}
                transition={{ duration: 2.5, delay: 0.5 }}
              />
              <defs>
                <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#F24C20" stopOpacity="0.3" />
                  <stop offset="50%" stopColor="#F24C20" stopOpacity="1" />
                  <stop offset="100%" stopColor="#044071" stopOpacity="0.8" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Steps Grid */}
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <motion.div
                  key={index}
                  className="relative flex flex-col items-center text-center group"
                  initial={{ opacity: 0, y: 60 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, delay: 0.6 + index * 0.15 }}
                >
                  {/* Step Node */}
                  <motion.div
                    className="relative mb-6 z-10"
                    whileHover={{ scale: 1.15 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Glowing Background */}
                    <motion.div
                      className="absolute inset-0 rounded-full bg-[#F24C20]"
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.3, 0, 0.3],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.4,
                      }}
                    />

                    {/* Icon Container */}
                    <div className="relative w-24 h-24 rounded-full bg-neutral-900 border-4 border-[#F24C20] flex items-center justify-center group-hover:bg-[#F24C20] transition-all duration-500">
                      <Icon className="w-10 h-10 text-[#F24C20] group-hover:text-white transition-colors duration-500" />
                    </div>

                    {/* Order Badge */}
                    <motion.div
                      className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#F24C20] border-2 border-black flex items-center justify-center text-white font-bold text-sm"
                      initial={{ scale: 0 }}
                      animate={isInView ? { scale: 1 } : {}}
                      transition={{ duration: 0.5, delay: 1 + index * 0.15 }}
                    >
                      {step.order}
                    </motion.div>
                  </motion.div>

                  {/* Content */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.6, delay: 0.8 + index * 0.15 }}
                  >
                    <h4 className="text-xl font-bold text-white mb-3 group-hover:text-[#F24C20] transition-colors duration-300">
                      {step.title}
                    </h4>
                    <p className="text-neutral-400 leading-relaxed text-sm">
                      {step.description}
                    </p>
                  </motion.div>

                  {/* Arrow Indicator (desktop only) */}
                  {index < steps.length - 1 && (
                    <motion.div
                      className="hidden lg:block absolute top-12 -right-4 text-[#F24C20] text-3xl"
                      initial={{ opacity: 0, x: -20 }}
                      animate={isInView ? { opacity: 0.5, x: 0 } : {}}
                      transition={{ duration: 0.6, delay: 1.2 + index * 0.15 }}
                    >
                      →
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="mt-20 text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1.5 }}
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-[#F24C20]/10 border border-[#F24C20]/30 rounded-full">
            <div className="w-3 h-3 rounded-full bg-[#F24C20] animate-pulse" />
            <span className="text-neutral-300">
              <span className="text-[#F24C20] font-bold">98%</span> of our experts pass this screening
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
