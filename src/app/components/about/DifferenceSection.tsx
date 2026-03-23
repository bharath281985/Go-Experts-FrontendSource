import { motion, useInView } from 'motion/react';
import { Shield, Zap, Target, Lock, DollarSign, CheckCircle2 } from 'lucide-react';
import { useRef } from 'react';

export default function DifferenceSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  const features = [
    {
      icon: Shield,
      title: 'Verified Experts',
      description: 'Every freelancer goes through rigorous identity and skills verification',
      image: 'https://images.unsplash.com/photo-1758518731457-5ef826b75b3b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzcyUyMHRlYW18ZW58MXx8fHwxNzY5MjM1MDgzfDA&ixlib=rb-4.1.0&q=80&w=400',
    },
    {
      icon: Lock,
      title: 'Secure Payments',
      description: 'Escrow protection and milestone-based payments ensure safety',
      image: 'https://images.unsplash.com/photo-1628763448616-5d81ad40b1fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVlbGFuY2VyJTIwd29ya2luZyUyMGxhcHRvcHxlbnwxfHx8fDE3NjkyMzUxNTZ8MA&ixlib=rb-4.1.0&q=80&w=400',
    },
    {
      icon: Zap,
      title: 'Faster Hiring',
      description: 'Find and hire verified experts in hours, not weeks',
      image: 'https://images.unsplash.com/photo-1598986646512-9330bcc4c0dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZW1vdGUlMjB3b3JrJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NjkyMTE2NjZ8MA&ixlib=rb-4.1.0&q=80&w=400',
    },
    {
      icon: Target,
      title: 'Smart Matching',
      description: 'AI-powered algorithms connect you with the perfect talent',
      image: 'https://images.unsplash.com/photo-1739298061740-5ed03045b280?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwY29sbGFib3JhdGlvbiUyMHdvcmtzcGFjZXxlbnwxfHx8fDE3NjkxOTIzMzZ8MA&ixlib=rb-4.1.0&q=80&w=400',
    },
    {
      icon: DollarSign,
      title: 'Transparent Pricing',
      description: 'No hidden fees. Know exactly what you pay and earn',
      image: 'https://images.unsplash.com/photo-1559077533-7f64c0f20280?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdGFydHVwJTIwb2ZmaWNlJTIwbW9kZXJufGVufDF8fHx8MTc2OTE2ODYwM3ww&ixlib=rb-4.1.0&q=80&w=400',
    },
    {
      icon: CheckCircle2,
      title: 'Quality Screening',
      description: 'Continuous monitoring and rating system ensures excellence',
      image: 'https://images.unsplash.com/photo-1739298061757-7a3339cee982?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaXZlcnNlJTIwdGVhbSUyMHBvcnRyYWl0fGVufDF8fHx8MTc2OTIzNTE1N3ww&ixlib=rb-4.1.0&q=80&w=400',
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative py-32 overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at bottom, #0a0505 0%, #000000 100%)',
      }}
    >
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-[#F24C20]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-[#044071]/10 rounded-full blur-3xl" />
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
            What Makes Us Different
          </h2>
          <h3 className="text-4xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Built for <span className="text-[#F24C20]">excellence</span>
          </h3>
          <p className="text-xl text-neutral-300 max-w-3xl mx-auto">
            We don't just connect people—we build trust, ensure quality, and create lasting value for everyone involved.
          </p>
        </motion.div>

        {/* Bento Grid Layout */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isLarge = index === 0 || index === 4;

            return (
              <motion.div
                key={index}
                className={`relative group overflow-hidden rounded-2xl ${
                  isLarge ? 'md:col-span-2 lg:col-span-1' : ''
                }`}
                initial={{ opacity: 0, y: 60, scale: 0.9 }}
                animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                {/* Background Image with Overlay */}
                <div className="absolute inset-0">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
                </div>

                {/* Hover Glow */}
                <motion.div
                  className="absolute inset-0 bg-[#F24C20]/0 group-hover:bg-[#F24C20]/10 transition-all duration-500"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                />

                {/* Content */}
                <div className="relative p-8 h-full flex flex-col justify-end min-h-[280px]">
                  {/* Icon */}
                  <motion.div
                    className="mb-4 relative inline-block"
                    whileHover={{ scale: 1.1, rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="w-14 h-14 rounded-xl bg-[#F24C20]/20 border border-[#F24C20] flex items-center justify-center backdrop-blur-sm">
                      <Icon className="w-7 h-7 text-[#F24C20]" />
                    </div>

                    {/* Glow effect on hover */}
                    <motion.div
                      className="absolute inset-0 rounded-xl bg-[#F24C20]"
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ opacity: 0.3, scale: 1.2 }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.div>

                  {/* Title */}
                  <h4 className="text-2xl font-bold text-white mb-3 group-hover:text-[#F24C20] transition-colors duration-300">
                    {feature.title}
                  </h4>

                  {/* Description */}
                  <p className="text-neutral-400 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Hover Border Animation */}
                  <motion.div
                    className="absolute inset-0 border-2 border-[#F24C20]/0 group-hover:border-[#F24C20]/50 rounded-2xl transition-all duration-500"
                    initial={{ scale: 0.95, opacity: 0 }}
                    whileHover={{ scale: 1, opacity: 1 }}
                  />
                </div>

                {/* Tilt Effect Background */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-[#F24C20]/0 to-[#F24C20]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    transform: 'translateZ(0)',
                  }}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
