import { motion, useInView } from 'motion/react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useState } from 'react';

export default function TestimonialsSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });
  const [activeIndex, setActiveIndex] = useState(0);

  const testimonials = [
    {
      quote:
        "Go Experts transformed how we hire talent. Within 24 hours, we found a verified expert who delivered exceptional work. The quality screening process gives us complete confidence.",
      name: 'Sarah Johnson',
      role: 'CTO',
      company: 'TechFlow Inc.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
      companyLogo: '🚀',
    },
    {
      quote:
        "As a freelancer, Go Experts has been life-changing. Secure payments, quality clients, and a supportive community. I've built a sustainable career here and couldn't be happier.",
      name: 'Marcus Chen',
      role: 'Full-Stack Developer',
      company: 'Independent Expert',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      companyLogo: '💻',
    },
    {
      quote:
        "The transparency and speed are unmatched. We've completed 50+ projects through Go Experts, and every single experience has been smooth. This is the future of freelancing.",
      name: 'Elena Rodriguez',
      role: 'Head of Product',
      company: 'InnovateCo',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop',
      companyLogo: '⚡',
    },
  ];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const activeTestimonial = testimonials[activeIndex];

  return (
    <section
      ref={sectionRef}
      className="relative py-32 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #000000 0%, #0a0505 100%)',
      }}
    >
      {/* Background with blur */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-[#F24C20]/5 rounded-full blur-3xl" />
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
            Success Stories
          </h2>
          <h3 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
            What our community <span className="text-[#F24C20]">says</span>
          </h3>
        </motion.div>

        {/* Cinematic Testimonial Slider */}
        <div className="relative">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.6 }}
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            {/* Left: Portrait */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative w-full aspect-square max-w-md mx-auto">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-[#F24C20]/20 rounded-3xl blur-3xl" />

                {/* Image Container */}
                <div className="relative rounded-3xl overflow-hidden border-4 border-[#F24C20]/30">
                  <img
                    src={activeTestimonial.image}
                    alt={activeTestimonial.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                  {/* Company Badge */}
                  <div className="absolute bottom-6 left-6 right-6 flex items-center gap-3 bg-black/70 backdrop-blur-md p-4 rounded-xl border border-neutral-800">
                    <div className="text-4xl">{activeTestimonial.companyLogo}</div>
                    <div>
                      <p className="text-white font-bold text-sm">
                        {activeTestimonial.company}
                      </p>
                      <p className="text-neutral-400 text-xs">{activeTestimonial.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right: Quote Content */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {/* Quote Icon */}
              <motion.div
                className="mb-8"
                animate={{
                  rotate: [0, 5, 0],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Quote className="w-16 h-16 text-[#F24C20]" />
              </motion.div>

              {/* Rating Stars */}
              <div className="flex gap-1 mb-6">
                {[...Array(activeTestimonial.rating)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.6 + i * 0.1 }}
                  >
                    <Star className="w-6 h-6 text-[#F24C20] fill-[#F24C20]" />
                  </motion.div>
                ))}
              </div>

              {/* Quote Text */}
              <motion.blockquote
                className="text-2xl lg:text-3xl text-white leading-relaxed mb-8 font-light"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                "{activeTestimonial.quote}"
              </motion.blockquote>

              {/* Author Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1 }}
              >
                <p className="text-xl font-bold text-white mb-1">
                  {activeTestimonial.name}
                </p>
                <p className="text-[#F24C20] font-medium">
                  {activeTestimonial.role}
                </p>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-center gap-6 mt-16">
            {/* Previous Button */}
            <motion.button
              onClick={handlePrev}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-14 h-14 rounded-full bg-neutral-900 border border-neutral-800 hover:border-[#F24C20] flex items-center justify-center transition-all duration-300 group"
            >
              <ChevronLeft className="w-6 h-6 text-neutral-400 group-hover:text-[#F24C20] transition-colors" />
            </motion.button>

            {/* Dots Indicator */}
            <div className="flex gap-3">
              {testimonials.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === activeIndex
                      ? 'w-12 bg-[#F24C20]'
                      : 'w-2 bg-neutral-700 hover:bg-neutral-600'
                  }`}
                  whileHover={{ scale: 1.2 }}
                />
              ))}
            </div>

            {/* Next Button */}
            <motion.button
              onClick={handleNext}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-14 h-14 rounded-full bg-neutral-900 border border-neutral-800 hover:border-[#F24C20] flex items-center justify-center transition-all duration-300 group"
            >
              <ChevronRight className="w-6 h-6 text-neutral-400 group-hover:text-[#F24C20] transition-colors" />
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
}
