import { motion, useInView } from 'motion/react';
import { useRef, useState, useEffect } from 'react';
import { Heart, MapPin, Clock, IndianRupee, User, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '@/app/utils/api';

export default function FeaturedProjectsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const scrollRef = useRef<HTMLDivElement>(null);

  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get('/projects');
        if (res.data.success) {
          // Take only the first 6 projects
          setProjects(res.data.data.slice(0, 6));
        }
      } catch (error) {
        console.error('Error fetching featured projects:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  return (
    <section
      ref={ref}
      className="relative py-32 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #000000 0%, #0f0505 50%, #000000 100%)',
      }}
    >
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] bg-[#F24C20]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-orange-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Section Header */}
        <div className="max-w-7xl mx-auto px-6 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-block mb-6"
            >
              <div className="px-5 py-2.5 rounded-full bg-[#F24C20]/10 border border-[#F24C20]/30 backdrop-blur-sm">
                <span className="text-sm font-medium text-[#F24C20]">Opportunity Showcase</span>
              </div>
            </motion.div>

            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="text-white">Featured </span>
              <span className="text-[#F24C20]">Projects</span>
            </h2>

            <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
              Discover handpicked opportunities from verified clients worldwide
            </p>
          </motion.div>
        </div>

        {/* Horizontal Scrolling Projects */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative"
        >
          {/* Gradient Edges */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 text-[#F24C20] animate-spin" />
            </div>
          ) : (
            <div
              ref={scrollRef}
              className="flex gap-6 overflow-x-auto pb-8 px-6 scrollbar-hide snap-x snap-mandatory"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >

              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, x: 100 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="flex-shrink-0 w-[420px] snap-start group"
                >
                  <Link to={`/projects/${project.id}`}>
                    <motion.div
                      whileHover={{ y: -12, scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                      className="relative h-full p-8 rounded-3xl bg-gradient-to-br from-neutral-900/80 to-neutral-950/80 backdrop-blur-xl border border-neutral-800 hover:border-[#F24C20]/50 overflow-hidden"
                    >
                      {/* Animated Background Gradient */}
                      <motion.div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{
                          background: 'radial-gradient(circle at top right, rgba(242, 76, 32, 0.15) 0%, transparent 70%)',
                        }}
                      />

                      {/* Content */}
                      <div className="relative">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F24C20] to-orange-600 flex items-center justify-center text-2xl shadow-lg">
                              {project.avatar}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-white">{project.postedBy}</div>
                              <div className="text-xs text-neutral-500">Posted 2 days ago</div>
                            </div>
                          </div>

                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 rounded-xl bg-neutral-800/50 hover:bg-[#F24C20]/20 border border-neutral-700 hover:border-[#F24C20]/50 transition-all"
                          >
                            <Heart className="w-5 h-5 text-neutral-400 group-hover:text-[#F24C20] transition-colors" />
                          </motion.button>
                        </div>

                        {/* Title */}
                        <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-[#F24C20] transition-colors leading-tight min-h-[3.5rem]">
                          {project.title}
                        </h3>

                        {/* Budget */}
                        <div className="flex items-center gap-4 mb-6">
                          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F24C20]/10 border border-[#F24C20]/30">
                            <IndianRupee className="w-5 h-5 text-[#F24C20]" />
                            <span className="text-lg font-bold text-[#F24C20]">{project.budget_range || project.budget}</span>
                          </div>
                          <div className="px-3 py-1.5 rounded-lg bg-neutral-800/70 text-sm text-neutral-300 border border-neutral-700">
                            Fixed Price
                          </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-3 mb-6">
                          <div className="flex items-center gap-3 text-sm text-neutral-400">
                            <Clock className="w-4 h-4 text-[#F24C20]" />
                            <span>{"Flexible"}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-neutral-400">
                            <MapPin className="w-4 h-4 text-[#F24C20]" />
                            <span>{project.location || "Remote"}</span>
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-6">
                          {project.skills_required?.map((tag: string) => (
                            <span
                              key={tag}
                              className="px-3 py-1.5 rounded-lg bg-neutral-800/60 text-xs font-medium text-neutral-300 border border-neutral-700"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Level Badge */}
                        <div className="flex items-center justify-between">
                          <div className={`inline-flex px-4 py-2 rounded-full text-xs font-semibold ${project.level === 'Expert' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50' :
                            project.level === 'Senior' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' :
                              project.level === 'Intermediate' ? 'bg-green-500/20 text-green-400 border border-green-500/50' :
                                'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                            }`}>
                            {project.level} Level
                          </div>

                          <motion.div
                            className="flex items-center gap-2 text-[#F24C20] opacity-0 group-hover:opacity-100 transition-opacity"
                            initial={{ x: -10 }}
                            whileHover={{ x: 0 }}
                          >
                            <span className="text-sm font-semibold">View Details</span>
                            <ArrowRight className="w-4 h-4" />
                          </motion.div>
                        </div>

                        {/* Animated Underline */}
                        <motion.div
                          className="absolute bottom-0 left-8 right-8 h-1 bg-gradient-to-r from-transparent via-[#F24C20] to-transparent"
                          initial={{ scaleX: 0 }}
                          whileHover={{ scaleX: 1 }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* View All CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center mt-16 max-w-7xl mx-auto px-6"
        >
          <Link to="/projects">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-[#F24C20] to-orange-600 hover:from-[#F24C20]/90 hover:to-orange-600/90 text-white rounded-2xl font-semibold transition-all duration-300 shadow-2xl shadow-[#F24C20]/40 group"
            >
              <span className="text-lg">Browse All Projects</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </Link>
        </motion.div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
