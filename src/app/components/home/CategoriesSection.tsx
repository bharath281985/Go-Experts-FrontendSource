import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Palette,
  Code,
  Smartphone,
  TrendingUp,
  PenTool,
  Video,
  Shield,
  Brain,
} from 'lucide-react';

import { useState, useEffect } from 'react';
import api from '../../utils/api';

const defaultCategories = [
  {
    icon: <Palette className="w-8 h-8 text-white" />,
    title: 'UI/UX Design',
    count: '2,450+ experts',
    color: 'from-purple-500 to-pink-500',
    bgGlow: 'bg-purple-500/20',
  },
  {
    icon: <Code className="w-8 h-8 text-white" />,
    title: 'Web Development',
    count: '3,200+ experts',
    color: 'from-blue-500 to-cyan-500',
    bgGlow: 'bg-blue-500/20',
  },
  {
    icon: <Smartphone className="w-8 h-8 text-white" />,
    title: 'App Development',
    count: '1,800+ experts',
    color: 'from-green-500 to-emerald-500',
    bgGlow: 'bg-green-500/20',
  },
  {
    icon: <TrendingUp className="w-8 h-8 text-white" />,
    title: 'Digital Marketing',
    count: '2,100+ experts',
    color: 'from-orange-500 to-red-500',
    bgGlow: 'bg-orange-500/20',
  },
  {
    icon: <PenTool className="w-8 h-8 text-white" />,
    title: 'Content Writing',
    count: '1,650+ experts',
    color: 'from-yellow-500 to-orange-500',
    bgGlow: 'bg-yellow-500/20',
  },
  {
    icon: <Video className="w-8 h-8 text-white" />,
    title: 'Video Editing',
    count: '980+ experts',
    color: 'from-red-500 to-pink-500',
    bgGlow: 'bg-red-500/20',
  },
  {
    icon: <Shield className="w-8 h-8 text-white" />,
    title: 'Cybersecurity',
    count: '720+ experts',
    color: 'from-indigo-500 to-purple-500',
    bgGlow: 'bg-indigo-500/20',
  },
  {
    icon: <Brain className="w-8 h-8 text-white" />,
    title: 'AI/ML Engineering',
    count: '1,320+ experts',
    color: 'from-cyan-500 to-blue-500',
    bgGlow: 'bg-cyan-500/20',
  },
];

export default function CategoriesSection() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get('/cms/categories');
        const categoryList = res.data.categories || res.data.data;
        if (res.data.success && Array.isArray(categoryList)) {
          // Filter for active top-level categories
          const topLevel = categoryList.filter((c: any) => c.is_active && !c.parent);

          if (topLevel.length > 0) {
            const colors = [
              'from-purple-500 to-pink-500',
              'from-blue-500 to-cyan-500',
              'from-green-500 to-emerald-500',
              'from-orange-500 to-red-500',
              'from-yellow-500 to-orange-500',
              'from-red-500 to-pink-500',
              'from-indigo-500 to-purple-500',
              'from-cyan-500 to-blue-500'
            ];

            const mapped = topLevel.map((c: any, i: number) => ({
              id: c._id,
              title: c.name,
              image: c.image,
              icon: c.icon || '📁',
              description: c.description ? (c.description.length > 200 ? c.description.substring(0, 197) + '...' : c.description) : 'Explore verified experts and services.',
              color: colors[i % colors.length],
              bgGlow: `bg-${colors[i % colors.length].split('-')[1]}-500/20`,
              imageError: false
            }));
            setCategories(mapped);
          } else {
            setCategories(defaultCategories);
          }
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setCategories(defaultCategories);
      } finally {
        setLoading(false);
      }
    };
    fetchCats();
  }, []);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const handleImageError = (index: number) => {
    setCategories(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], imageError: true };
      return updated;
    });
  };

  return (
    <section ref={ref} className="relative py-20 overflow-hidden bg-neutral-950">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(242,76,32,0.1),transparent_70%)]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
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
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-block mb-4">
            <div className="px-4 py-2 rounded-full bg-[#F24C20]/10 border border-[#F24C20]/20">
              <span className="text-sm font-medium text-[#F24C20]">Explore Categories</span>
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
            Enter the Skill Portals
          </h2>
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
            Discover verified experts across every domain. Each category is a gateway to exceptional talent.
          </p>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.slice(0, 4).map((category, index) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -10 }}
              className="group relative cursor-pointer"
              onClick={() => navigate(`/projects?search=${encodeURIComponent(category.title)}`)}
            >
              {/* Card */}
              <div className="relative h-full p-6 rounded-2xl bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 hover:border-[#F24C20]/50 transition-all duration-300 overflow-hidden">
                {/* Glow Effect */}
                <motion.div
                  className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${category.color} blur-3xl -z-10`}
                  initial={{ scale: 0 }}
                  whileHover={{ scale: 1 }}
                />

                {/* Portal Ring Animation */}
                <motion.div
                  className="absolute inset-0 rounded-2xl"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                >
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
                    <motion.circle
                      cx="100"
                      cy="100"
                      r="90"
                      stroke="url(#gradient)"
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray="5,5"
                      initial={{ pathLength: 0, rotate: 0 }}
                      whileHover={{ pathLength: 1, rotate: 360 }}
                      transition={{ duration: 2 }}
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#F24C20" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#F24C20" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                </motion.div>

                {/* Icon */}
                {/* Header: Icon/Image + Title */}
                <div className="flex items-center gap-4 mb-6">
                  <motion.div
                    className={`shrink-0 inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br ${category.color} shadow-lg overflow-hidden`}
                    whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    {!category.imageError && category.image ? (
                      <img
                        src={`${import.meta.env.VITE_API_URL || 'https://backendapis.goexperts.in'}${category.image}`}
                        alt={category.title}
                        className="w-full h-full object-cover"
                        onError={() => handleImageError(index)}
                      />
                    ) : (
                      <span className="text-3xl">{category.icon}</span>
                    )}
                  </motion.div>

                  <h3 className="text-xl font-bold text-white group-hover:text-[#F24C20] transition-colors leading-tight">
                    {category.title}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-neutral-400 text-sm mb-6 leading-relaxed line-clamp-4">
                  {category.description}
                </p>

                {/* CTA */}
                <motion.div
                  className="flex items-center gap-2 text-sm font-medium text-[#F24C20]"
                  initial={{ x: 0 }}
                  whileHover={{ x: 5 }}
                >
                  <span>View Projects</span>
                  <motion.svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </motion.svg>
                </motion.div>

                {/* Sketch underline */}
                <motion.svg
                  className="absolute bottom-4 left-6 right-6 h-1"
                  viewBox="0 0 100 4"
                  initial={{ pathLength: 0 }}
                  whileHover={{ pathLength: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.path
                    d="M0,2 Q25,0 50,2 T100,2"
                    stroke="#F24C20"
                    strokeWidth="1"
                    fill="none"
                    strokeDasharray="2,2"
                  />
                </motion.svg>
              </div>

              {/* Doodle Elements */}
              <motion.svg
                className="absolute -top-2 -right-2 w-12 h-12 text-[#F24C20] opacity-0 group-hover:opacity-50"
                viewBox="0 0 50 50"
                initial={{ rotate: 0, scale: 0 }}
                whileHover={{ rotate: 180, scale: 1 }}
                transition={{ duration: 0.6 }}
              >
                <motion.circle
                  cx="25"
                  cy="25"
                  r="20"
                  stroke="currentColor"
                  strokeWidth="1"
                  fill="none"
                  strokeDasharray="3,3"
                />
              </motion.svg>
            </motion.div>
          ))}
        </div>

        {/* View All Categories Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-12"
        >
          <button 
            onClick={() => navigate('/categories')}
            className="px-8 py-4 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-[#F24C20]/50 rounded-xl text-white font-semibold transition-all duration-300 group"
          >
            <span className="flex items-center gap-2">
              Explore All Categories
              <motion.span
                initial={{ x: 0 }}
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                →
              </motion.span>
            </span>
          </button>
        </motion.div>
      </div>
    </section>
  );
}
