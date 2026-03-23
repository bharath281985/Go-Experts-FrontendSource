import { motion, useInView } from 'motion/react';
import { AlertCircle, Lightbulb, TrendingUp } from 'lucide-react';
import { useRef, useState } from 'react';

export default function WhyWeExistSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });
  const [activeStep, setActiveStep] = useState(0);

  const timeline = [
    {
      icon: AlertCircle,
      label: 'The Problem',
      title: 'Traditional Hiring is Broken',
      description:
        'Companies spend weeks finding talent, freelancers struggle with trust issues, and projects often fail due to poor matching and lack of verification.',
      stats: [
        { value: '45%', label: 'Projects fail' },
        { value: '3 weeks', label: 'Average hire time' },
      ],
      tone: 'dark',
    },
    {
      icon: Lightbulb,
      label: 'Our Solution',
      title: 'Smart Matching + Verification',
      description:
        'Go Experts uses intelligent algorithms to match verified experts with the right projects, complete with secure payments, quality screening, and transparent pricing.',
      stats: [
        { value: '98%', label: 'Success rate' },
        { value: '24 hours', label: 'Avg. match time' },
      ],
      tone: 'highlight',
    },
    {
      icon: TrendingUp,
      label: 'The Result',
      title: 'Win-Win for Everyone',
      description:
        'Companies get quality work delivered faster, freelancers build sustainable careers with fair compensation, and both parties benefit from a trusted ecosystem.',
      stats: [
        { value: '120K+', label: 'Happy experts' },
        { value: '64K+', label: 'Companies' },
      ],
      tone: 'success',
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative py-32 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #000000 0%, #0a0505 100%)',
      }}
    >
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#F24C20]/5 rounded-full blur-3xl" />
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
            Why Go Experts Exists
          </h2>
          <h3 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
            From <span className="text-neutral-500">problem</span> to{' '}
            <span className="text-[#F24C20]">solution</span>
          </h3>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Connecting Flow Line */}
          <div className="absolute top-0 left-0 right-0 h-full hidden lg:flex items-start justify-center pt-16">
            <div className="relative w-full max-w-5xl">
              <svg
                className="w-full h-2"
                viewBox="0 0 1000 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <motion.path
                  d="M 0 4 L 1000 4"
                  stroke="url(#lineGradient)"
                  strokeWidth="3"
                  initial={{ pathLength: 0 }}
                  animate={isInView ? { pathLength: 1 } : {}}
                  transition={{ duration: 2, delay: 0.5 }}
                />
                <defs>
                  <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#555" />
                    <stop offset="50%" stopColor="#F24C20" />
                    <stop offset="100%" stopColor="#F24C20" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Animated particles along the line */}
              <motion.div
                className="absolute top-0 left-0 w-2 h-2 bg-[#F24C20] rounded-full"
                initial={{ x: 0 }}
                animate={isInView ? { x: 980 } : {}}
                transition={{ duration: 2, delay: 0.5, ease: 'easeInOut' }}
              />
            </div>
          </div>

          {/* Timeline Steps */}
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-4">
            {timeline.map((step, index) => {
              const Icon = step.icon;
              const isActive = activeStep === index;

              return (
                <motion.div
                  key={index}
                  className="relative"
                  initial={{ opacity: 0, y: 60 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, delay: 0.6 + index * 0.2 }}
                  onHoverStart={() => setActiveStep(index)}
                >
                  {/* Step Card */}
                  <div
                    className={`relative p-8 rounded-2xl border transition-all duration-500 ${
                      step.tone === 'dark'
                        ? 'bg-neutral-900/50 border-neutral-700'
                        : step.tone === 'highlight'
                        ? 'bg-[#F24C20]/10 border-[#F24C20]'
                        : 'bg-[#044071]/10 border-[#044071]'
                    } ${isActive ? 'scale-105 shadow-2xl' : ''}`}
                    style={{
                      boxShadow: isActive
                        ? step.tone === 'highlight'
                          ? '0 20px 60px rgba(242, 76, 32, 0.4)'
                          : '0 20px 60px rgba(4, 64, 113, 0.4)'
                        : 'none',
                    }}
                  >
                    {/* Icon with glow */}
                    <motion.div
                      className="mb-6 relative inline-block"
                      animate={
                        isActive
                          ? {
                              scale: [1, 1.1, 1],
                            }
                          : {}
                      }
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <div
                        className={`w-16 h-16 rounded-full flex items-center justify-center ${
                          step.tone === 'dark'
                            ? 'bg-neutral-800'
                            : step.tone === 'highlight'
                            ? 'bg-[#F24C20]'
                            : 'bg-[#044071]'
                        }`}
                      >
                        <Icon className="w-8 h-8 text-white" />
                      </div>

                      {isActive && (
                        <motion.div
                          className={`absolute inset-0 rounded-full ${
                            step.tone === 'highlight' ? 'bg-[#F24C20]' : 'bg-[#044071]'
                          }`}
                          initial={{ scale: 1, opacity: 0.5 }}
                          animate={{ scale: 1.8, opacity: 0 }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      )}
                    </motion.div>

                    {/* Label */}
                    <div
                      className={`text-xs font-bold uppercase tracking-wider mb-3 ${
                        step.tone === 'dark'
                          ? 'text-neutral-500'
                          : step.tone === 'highlight'
                          ? 'text-[#F24C20]'
                          : 'text-[#044071]'
                      }`}
                    >
                      {step.label}
                    </div>

                    {/* Title */}
                    <h4 className="text-2xl font-bold text-white mb-4">{step.title}</h4>

                    {/* Description */}
                    <p className="text-neutral-400 mb-6 leading-relaxed">{step.description}</p>

                    {/* Stats */}
                    <div className="flex gap-6">
                      {step.stats.map((stat, statIndex) => (
                        <div key={statIndex}>
                          <motion.div
                            className={`text-3xl font-bold mb-1 ${
                              step.tone === 'highlight' ? 'text-[#F24C20]' : 'text-white'
                            }`}
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={isInView ? { opacity: 1, scale: 1 } : {}}
                            transition={{ duration: 0.6, delay: 1 + index * 0.2 + statIndex * 0.1 }}
                          >
                            {stat.value}
                          </motion.div>
                          <div className="text-sm text-neutral-500">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Step Number */}
                  <motion.div
                    className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-black border-2 border-[#F24C20] flex items-center justify-center font-bold text-[#F24C20] text-xl"
                    initial={{ scale: 0 }}
                    animate={isInView ? { scale: 1 } : {}}
                    transition={{ duration: 0.5, delay: 0.8 + index * 0.2 }}
                  >
                    {index + 1}
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
