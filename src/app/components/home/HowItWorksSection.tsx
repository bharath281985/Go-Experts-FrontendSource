import { motion, useInView } from 'motion/react';
import { useRef, useState, useEffect } from 'react';
import { FileText, Users, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const steps = [
  {
    icon: FileText,
    title: 'Post Your Project',
    description: 'Describe your project needs and budget. Our AI helps you create the perfect brief.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Users,
    title: 'Match with Experts',
    description: 'Get matched with verified experts who have the exact skills you need.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: CheckCircle,
    title: 'Pay Securely & Deliver',
    description: 'Release payment only when you\'re 100% satisfied with the delivered work.',
    color: 'from-green-500 to-emerald-500',
  },
];

export default function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, []);

  const handleCTA = () => {
    if (isLoggedIn) {
      navigate('/dashboard');
    } else {
      navigate('/signin');
    }
  };

  return (
    <section 
      ref={ref} 
      className="relative py-32 overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at center, #1a0505 0%, #000000 100%)',
      }}
    >
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#F24C20]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-24"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-block mb-6"
          >
            <div className="px-5 py-2.5 rounded-full bg-[#F24C20]/10 border border-[#F24C20]/30 backdrop-blur-sm">
              <span className="text-sm font-medium text-[#F24C20]">Simple Process</span>
            </div>
          </motion.div>
          
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-white">How It </span>
            <span className="text-[#F24C20]">Works</span>
          </h2>
          
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
            Three simple steps to unlock the future of collaboration
          </p>
        </motion.div>

        {/* Vertical Timeline */}
        <div className="relative max-w-4xl mx-auto">
          {/* Vertical Connecting Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 hidden md:block">
            <motion.div
              className="h-full w-full bg-gradient-to-b from-transparent via-[#F24C20] to-transparent"
              initial={{ scaleY: 0 }}
              animate={isInView ? { scaleY: 1 } : {}}
              transition={{ duration: 2, delay: 0.5 }}
              style={{ transformOrigin: 'top' }}
            />
          </div>

          {/* Steps */}
          <div className="space-y-24">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -60 : 60 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8, delay: index * 0.3 }}
                className={`relative flex items-center gap-8 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Content Side */}
                <div className="flex-1">
                  <motion.div
                    whileHover={{ scale: 1.05, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="relative p-8 rounded-3xl bg-gradient-to-br from-neutral-900/90 to-neutral-950/90 backdrop-blur-xl border border-neutral-800 hover:border-[#F24C20]/50 overflow-hidden group"
                  >
                    {/* Glow Effect */}
                    <motion.div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: `radial-gradient(circle at ${index % 2 === 0 ? 'left' : 'right'}, rgba(242, 76, 32, 0.1) 0%, transparent 70%)`,
                      }}
                    />

                    <div className="relative">
                      {/* Step Number */}
                      <div className="absolute -top-4 -right-4 text-8xl font-bold text-neutral-900/50">
                        {String(index + 1).padStart(2, '0')}
                      </div>

                      {/* Icon */}
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={isInView ? { scale: 1, rotate: 0 } : {}}
                        transition={{ duration: 0.6, delay: index * 0.3 + 0.3, type: 'spring' }}
                        className="mb-6"
                      >
                        <div className={`inline-flex p-5 rounded-2xl bg-gradient-to-br ${step.color} shadow-xl`}>
                          <step.icon className="w-10 h-10 text-white" />
                        </div>
                      </motion.div>

                      {/* Title */}
                      <h3 className="text-3xl font-bold mb-4 text-white group-hover:text-[#F24C20] transition-colors">
                        {step.title}
                      </h3>

                      {/* Description */}
                      <p className="text-neutral-400 text-lg leading-relaxed">
                        {step.description}
                      </p>

                      {/* Decorative Element */}
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#F24C20] to-transparent opacity-0 group-hover:opacity-100"
                        initial={{ scaleX: 0 }}
                        whileHover={{ scaleX: 1 }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </motion.div>
                </div>

                {/* Center Node */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={isInView ? { scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.3 + 0.2, type: 'spring' }}
                  className="relative flex-shrink-0 hidden md:block"
                >
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#F24C20] to-orange-600 flex items-center justify-center shadow-2xl shadow-[#F24C20]/50 border-4 border-black">
                    <motion.div
                      className="text-white font-bold text-2xl"
                      animate={{
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.5,
                      }}
                    >
                      {index + 1}
                    </motion.div>
                  </div>

                  {/* Pulse Rings */}
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-[#F24C20]"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.5,
                    }}
                  />
                </motion.div>

                {/* Empty Space for Alignment */}
                <div className="flex-1 hidden md:block" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="text-center mt-20"
        >
          <motion.button
            onClick={handleCTA}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-4 bg-[#044071] hover:bg-[#055a99] text-white rounded-2xl font-semibold transition-all duration-300 shadow-2xl shadow-[#044071]/40 text-lg"
          >
            Get Started Now
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}