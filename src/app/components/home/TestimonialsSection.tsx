import { motion, useInView, AnimatePresence } from 'motion/react';
import { useRef, useState } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

import api from '@/app/utils/api';
import { useEffect } from 'react';

const defaultTestimonials = [
  { name: 'Jessica Martinez', role: 'CEO, TechStart', rating: 5, text: 'Go Experts connected us with incredible talent that transformed our product. The quality and professionalism exceeded all expectations.', avatar: '👩‍💼' },
  { name: 'Alex Thompson', role: 'Freelance Designer', rating: 5, text: 'As a freelancer, Go Experts has been a game-changer. I found consistent, high-quality projects and clients who value my work.', avatar: '🎨' },
  { name: 'Michael Chen', role: 'CTO, InnovateLabs', rating: 5, text: 'The verification process ensures we only work with top-tier professionals. It\'s saved us countless hours in vetting.', avatar: '👨‍💻' },
];

export default function TestimonialsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [activeIndex, setActiveIndex] = useState(0);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/cms/testimonials');
        if (res.data.success && res.data.testimonials.length > 0) {
          setData(res.data.testimonials);
        } else {
          setData(defaultTestimonials);
        }
      } catch {
        setData(defaultTestimonials);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const testimonials = data;

  const nextTestimonial = () => {
    if (testimonials.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    if (testimonials.length === 0) return;
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const activeTestimonial = testimonials[activeIndex] || defaultTestimonials[0];

  return (
    <section
      ref={ref}
      className="relative py-18 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #000000 0%, #0a0505 50%, #000000 100%)',
      }}
    >
      {/* Background Glow - Follows Active Testimonial */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full opacity-20 blur-3xl"
        animate={{
          background: `radial-gradient(circle, #F24C20 0%, transparent 70%)`,
        }}
        transition={{ duration: 1 }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-block mb-6"
          >
            <div className="px-5 py-2.5 rounded-full bg-[#F24C20]/10 border border-[#F24C20]/30 backdrop-blur-sm">
              <span className="text-sm font-medium text-[#F24C20]">Trust Stories</span>
            </div>
          </motion.div>

          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-white">Loved by </span>
            <span className="text-[#F24C20]">Thousands</span>
          </h2>

          <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
            Real stories from real people building amazing things together
          </p>
        </motion.div>

        {/* Main Testimonial Display */}
        <div className="relative max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="relative"
            >
              {/* Large Quote Card */}
              <div className="relative p-12 md:p-16 rounded-4xl bg-gradient-to-br from-neutral-900/90 to-neutral-950/90 backdrop-blur-xl border border-neutral-800 overflow-hidden">
                {/* Quote Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="absolute top-8 left-8"
                >
                  <Quote className="w-20 h-20 text-[#F24C20]/20" />
                </motion.div>

                {/* Background Glow */}
                <motion.div
                  className="absolute inset-0 opacity-30"
                  style={{
                    background: 'radial-gradient(circle at top right, rgba(242, 76, 32, 0.15) 0%, transparent 70%)',
                  }}
                  animate={{
                    opacity: [0.2, 0.4, 0.2],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                  }}
                />

                <div className="relative">
                  {/* Stars */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex gap-2 mb-8 justify-center"
                  >
                    {[...Array(activeTestimonial.rating)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.4 + i * 0.1, type: 'spring' }}
                      >
                        <Star className="w-8 h-8 fill-yellow-400 text-yellow-400" />
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Quote Text - Animated */}
                  <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-2xl md:text-3xl text-neutral-200 font-medium leading-relaxed mb-12 text-center max-w-4xl mx-auto"
                  >
                    &ldquo;{activeTestimonial.text}&rdquo;
                  </motion.p>

                  {/* Author Info - Large Portrait */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-col items-center gap-4"
                  >
                    {/* Avatar */}
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: [0, -5, 5, -5, 0] }}
                      transition={{ duration: 0.5 }}
                      className="relative"
                    >
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#F24C20] to-orange-600 flex items-center justify-center text-5xl shadow-2xl shadow-[#F24C20]/50 border-4 border-neutral-900">
                        {activeTestimonial.avatar}
                      </div>

                      {/* Pulse Ring */}
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-[#F24C20]"
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.5, 0, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                        }}
                      />
                    </motion.div>

                    {/* Name & Role */}
                    <div className="text-center">
                      <h4 className="text-2xl font-bold text-white mb-1">
                        {activeTestimonial.name}
                      </h4>
                      <p className="text-neutral-400 text-lg">{activeTestimonial.role}</p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          <div className="flex items-center justify-center gap-4 mt-12">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={prevTestimonial}
              className="w-14 h-14 rounded-full bg-neutral-900 hover:bg-[#F24C20] border border-neutral-800 hover:border-[#F24C20] flex items-center justify-center text-neutral-400 hover:text-white transition-all duration-300 shadow-lg"
            >
              <ChevronLeft className="w-6 h-6" />
            </motion.button>

            {/* Dots Indicator */}
            <div className="flex gap-3">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className="group"
                >
                  <motion.div
                    className={`h-2 rounded-full transition-all duration-300 ${index === activeIndex
                      ? 'w-12 bg-[#F24C20]'
                      : 'w-2 bg-neutral-700 group-hover:bg-neutral-600'
                      }`}
                    whileHover={{ scale: 1.2 }}
                  />
                </button>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={nextTestimonial}
              className="w-14 h-14 rounded-full bg-neutral-900 hover:bg-[#F24C20] border border-neutral-800 hover:border-[#F24C20] flex items-center justify-center text-neutral-400 hover:text-white transition-all duration-300 shadow-lg"
            >
              <ChevronRight className="w-6 h-6" />
            </motion.button>
          </div>
        </div>

        {/* Small Preview Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20"
        >
          {testimonials.map((testimonial, index) => (
            <motion.button
              key={testimonial.name}
              onClick={() => setActiveIndex(index)}
              whileHover={{ y: -5, scale: 1.02 }}
              className={`p-6 rounded-2xl border transition-all duration-300 text-left ${index === activeIndex
                ? 'bg-neutral-900/90 border-[#F24C20]/50'
                : 'bg-neutral-900/50 border-neutral-800 hover:border-neutral-700'
                }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F24C20] to-orange-600 flex items-center justify-center text-2xl">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-white text-sm">{testimonial.name}</div>
                  <div className="text-xs text-neutral-500">{testimonial.role}</div>
                </div>
              </div>
              <p className="text-sm text-neutral-400 line-clamp-2">
                &ldquo;{testimonial.text}&rdquo;
              </p>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
