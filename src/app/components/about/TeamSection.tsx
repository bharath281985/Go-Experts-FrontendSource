import { motion, useInView } from 'motion/react';
import { useRef, useState } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';

export default function TeamSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });
  const scrollRef = useRef<HTMLDivElement>(null);
  const [expandedMember, setExpandedMember] = useState<number | null>(null);

  const team = [
    {
      name: 'Sarah Chen',
      role: 'CEO & Co-Founder',
      tagline: 'Building the future of work',
      what: 'Leading our vision to revolutionize freelancing through trust and technology.',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=500&fit=crop',
    },
    {
      name: 'Marcus Rodriguez',
      role: 'CTO',
      tagline: 'Engineering excellence',
      what: 'Architecting scalable systems that connect millions of experts and companies.',
      image: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=500&fit=crop',
    },
    {
      name: 'Priya Sharma',
      role: 'Head of Product',
      tagline: 'Designing seamless experiences',
      what: 'Creating intuitive products that make hiring experts feel effortless.',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=500&fit=crop',
    },
    {
      name: 'James Wilson',
      role: 'Head of Operations',
      tagline: 'Scaling with precision',
      what: 'Ensuring quality and trust at every interaction across our global platform.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
    },
    {
      name: 'Elena Popov',
      role: 'VP of Growth',
      tagline: 'Expanding horizons',
      what: 'Growing our community of experts and companies across 150+ countries.',
      image: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&h=500&fit=crop',
    },
    {
      name: 'David Kim',
      role: 'Head of Trust & Safety',
      tagline: 'Protecting our community',
      what: 'Building systems that ensure every transaction is secure and verified.',
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop',
    },
  ];

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section
      ref={sectionRef}
      className="relative py-32 overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at top, #0a0505 0%, #000000 100%)',
      }}
    >
      {/* Background Glow with Orange Edges */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-[#F24C20]/10 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-[#F24C20]/10 to-transparent" />
        <div className="absolute top-1/2 left-0 w-40 h-full bg-gradient-to-r from-[#F24C20]/5 to-transparent" />
        <div className="absolute top-1/2 right-0 w-40 h-full bg-gradient-to-l from-[#F24C20]/5 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-sm font-bold text-[#F24C20] uppercase tracking-wider mb-4">
            Meet Our Team
          </h2>
          <h3 className="text-4xl lg:text-6xl font-bold text-white leading-tight mb-6">
            The <span className="text-[#F24C20]">people</span> behind Go Experts
          </h3>
          <p className="text-xl text-neutral-300 max-w-3xl mx-auto">
            A diverse team of innovators, builders, and dreamers working to transform the future of freelancing.
          </p>
        </motion.div>

        {/* Scroll Controls */}
        <div className="flex justify-center gap-4 mb-8">
          <motion.button
            onClick={() => scroll('left')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 hover:border-[#F24C20] flex items-center justify-center transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5 text-neutral-400 hover:text-[#F24C20]" />
          </motion.button>
          <motion.button
            onClick={() => scroll('right')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 hover:border-[#F24C20] flex items-center justify-center transition-all duration-300"
          >
            <ArrowRight className="w-5 h-5 text-neutral-400 hover:text-[#F24C20]" />
          </motion.button>
        </div>

        {/* Horizontal Scroll Gallery */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {team.map((member, index) => {
            const isExpanded = expandedMember === index;

            return (
              <motion.div
                key={index}
                className="relative flex-shrink-0 group cursor-pointer"
                style={{ width: isExpanded ? '400px' : '300px' }}
                initial={{ opacity: 0, x: 100 }}
                animate={isInView ? { opacity: 1, x: 0, width: isExpanded ? '400px' : '300px' } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                onHoverStart={() => setExpandedMember(index)}
                onHoverEnd={() => setExpandedMember(null)}
              >
                {/* Card */}
                <div className="relative h-[500px] rounded-2xl overflow-hidden">
                  {/* Image */}
                  <div className="absolute inset-0">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                  </div>

                  {/* Glow Border on Hover */}
                  <motion.div
                    className="absolute inset-0 border-2 border-[#F24C20]/0 group-hover:border-[#F24C20]/80 rounded-2xl transition-all duration-500"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                  />

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    {/* Name & Role */}
                    <motion.div
                      initial={{ y: 0 }}
                      animate={{ y: isExpanded ? -20 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h4 className="text-2xl font-bold text-white mb-1">{member.name}</h4>
                      <p className="text-[#F24C20] font-semibold mb-2">{member.role}</p>
                      <p className="text-neutral-400 italic text-sm mb-4">{member.tagline}</p>
                    </motion.div>

                    {/* Expanded Content */}
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{
                        opacity: isExpanded ? 1 : 0,
                        height: isExpanded ? 'auto' : 0,
                      }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 border-t border-neutral-700">
                        <p className="text-sm font-bold text-[#F24C20] mb-2">What I do at Go Experts:</p>
                        <p className="text-neutral-300 leading-relaxed">{member.what}</p>
                      </div>
                    </motion.div>
                  </div>

                  {/* Spotlight Effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-t from-[#F24C20]/0 via-[#F24C20]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ pointerEvents: 'none' }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Hide scrollbar styles */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
