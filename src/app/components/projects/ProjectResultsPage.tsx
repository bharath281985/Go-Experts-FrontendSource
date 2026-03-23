import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Star, MapPin, Clock, IndianRupee, Heart, Search, SlidersHorizontal,
  TrendingUp, Award, CheckCircle, User, Briefcase,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import type { ProjectAnswers } from './ProjectFinderWizard';
import api from '@/app/utils/api';
import { toast } from 'sonner';

interface ProjectResultsPageProps {
  answers: ProjectAnswers;
}

export default function ProjectResultsPage({ answers }: ProjectResultsPageProps) {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedProjects, setSavedProjects] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProjects();
  }, [answers]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await api.get('/projects');
      if (res.data.success) {
        const processed = res.data.data.map((p: any) => ({
          ...p,
          id: p._id,
          matchScore: 80 + Math.floor(Math.random() * 20),
          proposals: Math.floor(Math.random() * 20)
        }));
        setProjects(processed);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const toggleSave = (id: string) => {
    setSavedProjects(prev =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  const filteredProjects = projects.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => b.matchScore - a.matchScore);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#F24C20] animate-spin mb-4" />
        <p className="text-neutral-400 font-medium">Finding the best matches for you...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <Header />

      <main className="pt-20">
        {/* Summary Banner */}
        <section className="relative py-12 bg-gradient-to-b from-neutral-900 to-neutral-950 border-b border-neutral-800">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <Briefcase className="w-8 h-8 text-[#F24C20]" />
                <h1 className="text-4xl font-bold text-white">
                  We found <span className="text-[#F24C20]">{filteredProjects.length}</span> matching projects
                </h1>
              </div>
              <p className="text-xl text-neutral-400 mb-6">
                Based on your preferences and skills
              </p>

              {/* Selected filters chips */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                {answers.projectType && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="px-4 py-2 rounded-full bg-[#F24C20]/10 border border-[#F24C20]/30 text-[#F24C20] text-sm font-medium"
                  >
                    {projectTypeLabels[answers.projectType] || answers.projectType}
                  </motion.div>
                )}
                {answers.budget && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.05 }}
                    className="px-4 py-2 rounded-full bg-[#F24C20]/10 border border-[#F24C20]/30 text-[#F24C20] text-sm font-medium"
                  >
                    Budget: {budgetLabels[answers.budget]}
                  </motion.div>
                )}
                {answers.timeline && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="px-4 py-2 rounded-full bg-[#F24C20]/10 border border-[#F24C20]/30 text-[#F24C20] text-sm font-medium"
                  >
                    Timeline: {timelineLabels[answers.timeline]}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Main Content - Split View */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex gap-8">
              {/* Left Sidebar - Filters */}
              <motion.aside
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="w-80 flex-shrink-0 space-y-6 sticky top-24 h-fit"
              >
                {/* Search */}
                <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800">
                  <div className="flex items-center gap-2 mb-4">
                    <SlidersHorizontal className="w-5 h-5 text-[#F24C20]" />
                    <h3 className="font-bold text-white">Refine Search</h3>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search projects..."
                      className="w-full pl-10 pr-4 py-3 bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#F24C20] transition-colors"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800">
                  <h4 className="font-semibold text-white mb-3">Category</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded border-neutral-700 text-[#F24C20] focus:ring-[#F24C20]" />
                      <span className="text-neutral-300">Website Design</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded border-neutral-700 text-[#F24C20] focus:ring-[#F24C20]" />
                      <span className="text-neutral-300">Mobile App</span>
                    </label>
                  </div>
                </div>

                {/* Budget Filter */}
                <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800">
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-[#F24C20]" />
                    Budget Range
                  </h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded border-neutral-700 text-[#F24C20] focus:ring-[#F24C20]" />
                      <span className="text-neutral-300">Under ₹15K</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded border-neutral-700 text-[#F24C20] focus:ring-[#F24C20]" />
                      <span className="text-neutral-300">₹15K - ₹50K</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded border-neutral-700 text-[#F24C20] focus:ring-[#F24C20]" />
                      <span className="text-neutral-300">₹50K+</span>
                    </label>
                  </div>
                </div>

                <button
                  onClick={() => setSearchTerm('')}
                  className="w-full py-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-medium transition-colors"
                >
                  Clear All Filters
                </button>
              </motion.aside>

              {/* Right Content - Project Cards */}
              <div className="flex-1 space-y-6">
                {/* Sort Options */}
                <div className="flex items-center justify-between">
                  <div className="text-neutral-400">
                    Showing <span className="text-white font-semibold">{filteredProjects.length}</span> projects
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-neutral-400 text-sm">Sort by:</span>
                    <select className="px-4 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-[#F24C20] transition-colors">
                      <option>Best match</option>
                      <option>Newest</option>
                      <option>Highest budget</option>
                    </select>
                  </div>
                </div>

                {/* Project Cards */}
                {filteredProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -4 }}
                    className="relative group"
                  >
                    <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 hover:border-[#F24C20]/50 transition-all overflow-hidden">
                      {/* Hover glow */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-[#F24C20]/5 to-transparent" />

                      <div className="relative">
                        {/* Project Info */}
                        <div className="flex-1 min-w-0">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#F24C20] transition-colors">
                                {project.title}
                              </h3>
                              <p className="text-neutral-400 line-clamp-2 mb-3">
                                {project.description}
                              </p>
                            </div>
                            <button
                              onClick={() => toggleSave(project.id)}
                              className="ml-4 p-2 rounded-lg bg-neutral-800/50 hover:bg-neutral-800 transition-colors"
                            >
                              <Heart
                                className={`w-5 h-5 ${savedProjects.includes(project.id)
                                  ? 'fill-[#F24C20] text-[#F24C20]'
                                  : 'text-neutral-400'
                                  }`}
                              />
                            </button>
                          </div>

                          {/* Meta Info */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="flex items-center gap-2">
                              <IndianRupee className="w-4 h-4 text-[#F24C20]" />
                              <div>
                                <div className="text-sm text-neutral-500">Budget</div>
                                <div className="font-bold text-white">₹{project.budget_range}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-neutral-400" />
                              <div>
                                <div className="text-sm text-neutral-500">Duration</div>
                                <div className="text-white">Fixed Price</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-neutral-400" />
                              <div>
                                <div className="text-sm text-neutral-500">Location</div>
                                <div className="text-white">Remote</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-neutral-400" />
                              <div>
                                <div className="text-sm text-neutral-500">Proposals</div>
                                <div className="text-white">{project.proposals}</div>
                              </div>
                            </div>
                          </div>

                          {/* Skills */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {project.skills_required?.map((skill: string) => (
                              <span
                                key={skill}
                                className="px-3 py-1 rounded-lg bg-neutral-800/50 border border-neutral-700 text-xs text-neutral-300"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>

                          {/* Footer */}
                          <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F24C20] to-orange-600 flex items-center justify-center text-white text-xs font-bold">
                                  {project.client_id?.full_name?.substring(0, 2).toUpperCase() || 'EX'}
                                </div>
                                <div>
                                  <div className="font-medium text-white text-sm">{project.client_id?.full_name}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-green-500/20 border border-green-500/30">
                                <CheckCircle className="w-3 h-3 text-green-400" />
                                <span className="text-xs text-green-400 font-medium">Verified</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="text-sm text-neutral-500">Posted {new Date(project.createdAt).toLocaleDateString()}</span>
                              <Link
                                to={`/projects/${project.id}`}
                                className="px-6 py-2 rounded-lg bg-[#044071] hover:bg-[#055a99] text-white font-medium transition-colors shadow-lg shadow-[#044071]/20"
                              >
                                View Details
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {filteredProjects.length === 0 && (
                  <div className="text-center py-20 bg-neutral-900/50 border border-neutral-800 rounded-2xl">
                    <p className="text-neutral-400">No projects found matching your search.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

// Helper labels
const projectTypeLabels: Record<string, string> = {
  website: 'Website Design',
  mobile: 'Mobile App',
  uiux: 'UI/UX Design',
  branding: 'Branding',
  marketing: 'Digital Marketing',
  writing: 'Content Writing',
  video: 'Video Editing',
  security: 'Cybersecurity',
  consulting: 'Business Consulting',
};

const budgetLabels: Record<string, string> = {
  '5k-15k': '₹5K-₹15K',
  '15k-50k': '₹15K-₹50K',
  '50k-1l': '₹50K-₹1L',
  '1l+': '₹1L+',
};

const timelineLabels: Record<string, string> = {
  urgent: 'Urgent',
  '1week': '1 week',
  '2-4weeks': '2-4 weeks',
  flexible: 'Flexible',
};
