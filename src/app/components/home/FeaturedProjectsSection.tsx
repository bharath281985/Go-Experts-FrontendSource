import { motion, useInView } from 'motion/react';
import { useRef, useState, useEffect } from 'react';
import { Heart, MapPin, Clock, IndianRupee, User, ArrowRight, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '@/app/utils/api';
import { toast } from 'sonner';

export default function FeaturedProjectsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (userStr && token) {
      setIsLoggedIn(true);
      fetchFavorites();
    }
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects?is_featured=true');
      if (res.data.success) {
        setProjects(res.data.data.slice(0, 8)); // Fetch more to check if > 4 exist
      }
    } catch (error) {
      console.error('Error fetching featured projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const res = await api.get('/users/favorites');
      if (res.data.success) {
        setFavorites(res.data.data.map((p: any) => p._id));
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent, projectId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      toast.error('Please login to save favorites');
      navigate('/signin');
      return;
    }

    try {
      const res = await api.put(`/users/favorites/${projectId}`);
      if (res.data.success) {
        if (res.data.isFavorited) {
          setFavorites(prev => [...prev, projectId]);
          toast.success('Project added to favorites');
        } else {
          setFavorites(prev => prev.filter(id => id !== projectId));
          toast.success('Project removed from favorites');
        }
      }
    } catch (error) {
      toast.error('Failed to update favorites');
    }
  };

  return (
    <section
      ref={ref}
      className="relative py-25 overflow-hidden"
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

        {/* Featured Projects Grid */}
        <div className="max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 text-[#F24C20] animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {projects.slice(0, 4).map((project, index) => (
                <motion.div
                  key={project._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group h-full"
                >
                  <Link to={`/projects/${project._id}`} className="h-full block">
                    <motion.div
                      whileHover={{ y: -8 }}
                      transition={{ duration: 0.3 }}
                      className="relative h-full p-6 rounded-[2.5rem] bg-neutral-900/40 backdrop-blur-xl border border-neutral-800/50 hover:border-[#F24C20]/50 overflow-hidden flex flex-col"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#F24C20] to-orange-600 flex items-center justify-center text-sm font-bold text-white">
                            {project.client_id?.full_name?.substring(0, 1).toUpperCase() || 'P'}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white truncate max-w-[120px]">{project.client_id?.full_name || 'Anonymous'}</div>
                            <div className="text-[10px] text-neutral-500 uppercase tracking-widest font-black">Verified</div>
                          </div>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => handleToggleFavorite(e, project._id)}
                          className={`p-2 rounded-xl transition-all ${
                            favorites.includes(project._id) ? 'bg-[#F24C20]/20' : 'bg-neutral-800/50 hover:bg-[#F24C20]/10'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${favorites.includes(project._id) ? 'text-[#F24C20] fill-[#F24C20]' : 'text-neutral-500'}`} />
                        </motion.button>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold mb-4 text-white group-hover:text-[#F24C20] transition-colors leading-tight line-clamp-2">
                        {project.title}
                      </h3>

                      {/* Budget */}
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F24C20]/10 border border-[#F24C20]/20 mb-6 w-fit">
                        <IndianRupee className="w-3.5 h-3.5 text-[#F24C20]" />
                        <span className="text-sm font-bold text-[#F24C20]">{project.budget_range || project.budget}</span>
                      </div>

                      <div className="flex-grow">
                        {/* Details */}
                        <div className="flex flex-wrap gap-x-4 gap-y-2 mb-6">
                          <div className="flex items-center gap-2 text-[10px] text-neutral-500 uppercase font-black tracking-widest">
                            <Clock className="w-3 h-3 text-[#F24C20]" />
                            <span>{"Flexible"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-neutral-500 uppercase font-black tracking-widest">
                            <MapPin className="w-3 h-3 text-[#F24C20]" />
                            <span>{project.location || "Remote"}</span>
                          </div>
                        </div>

                        {/* Featured Skills */}
                        <div className="flex flex-wrap gap-1.5 mb-6">
                          {project.skills_required?.slice(0, 3).map((tag: string) => (
                            <span key={tag} className="px-2 py-1 rounded bg-neutral-800/50 text-[10px] font-bold text-neutral-400 border border-neutral-700/50">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="pt-6 border-t border-neutral-800 flex items-center justify-between">
                        <div className="text-[10px] font-black uppercase tracking-widest text-[#F24C20]">
                          Featured
                        </div>
                        <div className="flex items-center gap-1 text-white text-xs font-bold group-hover:gap-2 transition-all">
                          View <ArrowRight className="w-3 h-3" />
                        </div>
                      </div>

                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* View All CTA - Only shown if more than 4 exists */}
        {projects.length > 4 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center mt-16 max-w-7xl mx-auto px-6"
          >
            <Link to="/projects">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-[#F24C20] to-orange-600 hover:from-[#F24C20]/90 hover:to-orange-600/90 text-white rounded-2xl font-semibold transition-all duration-300 shadow-2xl shadow-[#F24C20]/20 group"
              >
                <span className="text-lg">Browse All Projects</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
          </motion.div>
        )}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
