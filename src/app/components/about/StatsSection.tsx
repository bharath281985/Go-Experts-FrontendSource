import { motion, useInView, useMotionValue, useTransform, animate } from 'motion/react';
import { Star, Briefcase, Users, Building2, TrendingUp } from 'lucide-react';
import { useRef, useEffect } from 'react';

export default function StatsSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.4 });

  const stats = [
    {
      icon: Star,
      value: 4.8,
      suffix: '/5',
      label: 'Average Rating',
      color: '#F24C20',
      isDecimal: true,
    },
    {
      icon: Briefcase,
      value: 210,
      suffix: '+',
      label: 'Active Contracts',
      color: '#F24C20',
      isDecimal: false,
    },
    {
      icon: TrendingUp,
      value: 1665,
      suffix: '',
      label: 'Skills Available',
      color: '#F24C20',
      isDecimal: false,
    },
    {
      icon: Users,
      value: 120,
      suffix: 'K+',
      label: 'Expert Freelancers',
      color: '#F24C20',
      isDecimal: false,
    },
    {
      icon: Building2,
      value: 64,
      suffix: 'K+',
      label: 'Companies Trust Us',
      color: '#F24C20',
      isDecimal: false,
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative py-32 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #000000 0%, #0f0808 50%, #000000 100%)',
      }}
    >
      {/* Background Spotlight */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(ellipse, #F24C20 0%, transparent 60%)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.05, 0.15, 0.05],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
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
            Trusted by Thousands
          </h2>
          <h3 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
            The numbers speak for themselves
          </h3>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <StatCard
                key={index}
                stat={stat}
                Icon={Icon}
                index={index}
                isInView={isInView}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Separate component for animated counter
function StatCard({
  stat,
  Icon,
  index,
  isInView,
}: {
  stat: any;
  Icon: any;
  index: number;
  isInView: boolean;
}) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) =>
    stat.isDecimal ? latest.toFixed(1) : Math.round(latest)
  );

  useEffect(() => {
    if (isInView) {
      const controls = animate(count, stat.value, {
        duration: 2,
        delay: 0.5 + index * 0.1,
        ease: 'easeOut',
      });
      return controls.stop;
    }
  }, [isInView, stat.value, count, index]);

  return (
    <motion.div
      className="relative group"
      initial={{ opacity: 0, y: 60, scale: 0.8 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
    >
      {/* Glow Effect */}
      <motion.div
        className="absolute inset-0 bg-[#F24C20]/0 group-hover:bg-[#F24C20]/10 rounded-2xl blur-xl transition-all duration-500"
        initial={{ scale: 0.8, opacity: 0 }}
        whileHover={{ scale: 1.3, opacity: 1 }}
      />

      <div className="relative p-8 bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 group-hover:border-[#F24C20]/50 rounded-2xl transition-all duration-500">
        {/* Icon with Animation */}
        <motion.div
          className="mb-6 relative"
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: index * 0.5,
          }}
        >
          <div className="w-14 h-14 rounded-xl bg-[#F24C20]/20 border border-[#F24C20] flex items-center justify-center">
            <Icon className="w-7 h-7 text-[#F24C20]" />
          </div>

          {/* Icon Glow Pulse */}
          <motion.div
            className="absolute inset-0 rounded-xl bg-[#F24C20]"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: index * 0.3,
            }}
          />
        </motion.div>

        {/* Stat Value with Counter */}
        <div className="mb-2">
          <motion.span className="text-4xl lg:text-5xl font-bold text-[#F24C20]">
            {rounded}
          </motion.span>
          <span className="text-3xl font-bold text-[#F24C20]">{stat.suffix}</span>
        </div>

        {/* Label */}
        <p className="text-neutral-400 font-medium">{stat.label}</p>

        {/* Bottom accent line */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1 bg-[#F24C20]"
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.8 + index * 0.1 }}
          style={{ originX: 0 }}
        />
      </div>
    </motion.div>
  );
}
