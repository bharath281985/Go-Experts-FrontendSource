import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '@/app/components/ThemeProvider';
import {
  FileText, Plus, Clock, Users, CheckCircle, XCircle,
  MessageSquare, Loader2, Briefcase, TrendingUp, Award,
  IndianRupee, ArrowRight, Zap, Target
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api, { getImgUrl } from '@/app/utils/api';
import { toast } from 'sonner';

export default function MyProjects() {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'ongoing' | 'completed' | 'cancelled'>('all');
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userType = localStorage.getItem('userType') || (user?.role === 'client' ? 'client' : 'freelancer');
  const isFreelancer = userType === 'freelancer';

  useEffect(() => {
    fetchProjects();
  }, [userType]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/projects/my?role=${userType}`);
      if (res.data.success) setProjects(res.data.data);
    } catch (error) {
      console.error('Error fetching my projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptAward = async (projectId: string) => {
    try {
      setLoading(true);
      const res = await api.put(`/projects/${projectId}/accept`);
      if (res.data.success) {
        toast.success('Project award accepted! You can now start working.');
        fetchProjects();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to accept award');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteProject = async (projectId: string) => {
    try {
      setLoading(true);
      const res = await api.put(`/projects/${projectId}/complete`);
      if (res.data.success) {
        toast.success('Project marked as completed!');
        fetchProjects();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to complete project');
    } finally {
      setLoading(false);
    }
  };

  const getProjectStatus = (project: any): 'ongoing' | 'completed' | 'cancelled' | 'pending' | 'live' | 'awarded' => {
    if (project.status === 'completed') return 'completed';
    if (isFreelancer) {
      const pStatus = project.proposal_status || 'pending';
      if (pStatus === 'awarded') return 'awarded';
      if (pStatus === 'accepted') return 'ongoing';
      if (pStatus === 'rejected' || pStatus === 'expired') return 'cancelled';
      return 'pending';
    }
    // Client: project with hired freelancer → ongoing
    if (project.hired_freelancer_id) return 'ongoing';
    if (project.status === 'closed') return 'ongoing';
    return project.status === 'live' ? 'live' : project.status;
  };

  const filteredProjects = projects.filter(project => {
    if (activeTab === 'all') return true;
    const status = getProjectStatus(project);
    if (activeTab === 'ongoing') return status === 'ongoing' || status === 'awarded';
    return status === activeTab;
  });

  const stats = {
    total: projects.length,
    ongoing: projects.filter(p => ['ongoing', 'awarded'].includes(getProjectStatus(p))).length,
    completed: projects.filter(p => getProjectStatus(p) === 'completed').length,
    spent: isFreelancer
      ? projects.filter(p => getProjectStatus(p) === 'ongoing').reduce((sum, p) => sum + (p.my_bid || 0), 0)
      : projects.filter(p => getProjectStatus(p) === 'completed').reduce((sum, p) => sum + (p.budget || 0), 0),
  };

  const tabCounts = {
    all: projects.length,
    ongoing: projects.filter(p => ['ongoing', 'awarded'].includes(getProjectStatus(p))).length,
    completed: projects.filter(p => getProjectStatus(p) === 'completed').length,
    cancelled: projects.filter(p => getProjectStatus(p) === 'cancelled').length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ongoing':
      case 'live':
        return { label: 'Ongoing', cls: 'bg-blue-500/15 text-blue-400 border border-blue-500/30', dot: 'bg-blue-400' };
      case 'awarded':
        return { label: 'Awarded', cls: 'bg-amber-500/15 text-amber-400 border border-amber-500/30', dot: 'bg-amber-400' };
      case 'completed':
        return { label: 'Completed', cls: 'bg-green-500/15 text-green-400 border border-green-500/30', dot: 'bg-green-400' };
      case 'cancelled':
      case 'rejected':
      case 'expired':
        return { label: 'Cancelled', cls: 'bg-red-500/15 text-red-400 border border-red-500/30', dot: 'bg-red-400' };
      default:
        return { label: status || 'Pending', cls: 'bg-neutral-500/15 text-neutral-400 border border-neutral-500/30', dot: 'bg-neutral-400' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 text-[#F24C20] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
            {isFreelancer ? 'My Proposals' : 'My Projects'}
          </h1>
          <p className={`mt-1 text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
            {isFreelancer ? 'Track your proposals and active work' : 'Manage projects and track hired talent'}
          </p>
        </div>
        {!isFreelancer && (
          <Link
            to="/dashboard/projects/create"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-[#F24C20] hover:bg-orange-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-[#F24C20]/20 hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            New Project
          </Link>
        )}
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: isFreelancer ? 'Total Bids' : 'Total Posted', value: stats.total, icon: FileText, color: 'text-[#F24C20]', bg: 'bg-[#F24C20]/10' },
          { label: 'Ongoing', value: stats.ongoing, icon: Zap, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10' },
          { label: isFreelancer ? 'Active Value' : 'Total Spent', value: `₹${stats.spent.toLocaleString()}`, icon: IndianRupee, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className={`p-4 md:p-5 rounded-2xl border backdrop-blur-sm ${isDarkMode ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white/50 border-neutral-200'}`}>
            <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
              <div className={`p-1.5 md:p-2 rounded-lg ${s.bg}`}><s.icon className={`w-3.5 h-3.5 md:w-4 md:h-4 ${s.color}`} /></div>
              <span className={`text-[10px] md:text-xs font-medium ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>{s.label}</span>
            </div>
            <div className={`text-lg md:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>{s.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className={`flex gap-1 p-1.5 rounded-xl ${isDarkMode ? 'bg-neutral-900/70 border border-neutral-800' : 'bg-neutral-100'} overflow-x-auto custom-scrollbar`}>
        {(['all', 'ongoing', 'completed', 'cancelled'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`relative flex-1 min-w-[100px] md:min-w-0 px-4 py-2.5 rounded-lg font-medium text-xs md:text-sm capitalize transition-all ${activeTab === tab
                ? 'bg-[#F24C20] text-white shadow-lg shadow-[#F24C20]/20'
                : isDarkMode ? 'text-neutral-400 hover:text-white hover:bg-neutral-800' : 'text-neutral-600 hover:text-neutral-900 hover:bg-white'
              }`}>
            {tab}
            {tabCounts[tab] > 0 && (
              <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === tab ? 'bg-white/20 text-white' : 'bg-neutral-700 text-neutral-300'}`}>
                {tabCounts[tab]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Projects List */}
      <AnimatePresence mode="wait">
        <div className="space-y-4">
          {filteredProjects.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className={`p-16 rounded-2xl border text-center ${isDarkMode ? 'bg-neutral-900/50 border-neutral-800 border-dashed' : 'bg-white/50 border-neutral-200 border-dashed'}`}>
              <Target className={`w-14 h-14 mx-auto mb-4 ${isDarkMode ? 'text-neutral-700' : 'text-neutral-300'}`} />
              <h3 className={`text-lg font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>No {activeTab} projects</h3>
              <p className={`text-sm mb-6 ${isDarkMode ? 'text-neutral-500' : 'text-neutral-500'}`}>
                {activeTab === 'ongoing' ? 'Projects you are hired for will appear here' : `You don't have any ${activeTab} projects yet`}
              </p>
              {!isFreelancer && (
                <Link to="/dashboard/projects/create"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#F24C20] text-white rounded-xl font-semibold text-sm hover:bg-orange-600 transition-all">
                  <Plus className="w-4 h-4" />
                  Create Project
                </Link>
              )}
            </motion.div>
          ) : (
            filteredProjects.map((project, index) => {
              const pStatus = getProjectStatus(project);
              const badge = getStatusBadge(pStatus);
              const isOngoing = pStatus === 'ongoing';
              const isAwarded = pStatus === 'awarded';
              const isCompleted = pStatus === 'completed';
              const hiredFreelancer = project.hired_freelancer_id;

              return (
                <motion.div key={project._id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.07 }}
                  className={`relative rounded-2xl border overflow-hidden transition-all hover:shadow-xl ${isOngoing
                      ? isDarkMode
                        ? 'bg-neutral-900/70 border-blue-500/30 hover:border-blue-500/50 hover:shadow-blue-500/10'
                        : 'bg-white border-blue-200 hover:border-blue-300'
                      : isCompleted
                        ? isDarkMode
                          ? 'bg-neutral-900/50 border-green-500/20 hover:border-green-500/30 hover:shadow-green-500/5'
                          : 'bg-white border-green-100 hover:border-green-200'
                        : isDarkMode
                          ? 'bg-neutral-900/50 border-neutral-800 hover:border-neutral-700'
                          : 'bg-white border-neutral-200 hover:border-neutral-300'
                    }`}>

                  {/* Ongoing accent line */}
                  {isOngoing && <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500" />}
                  {isCompleted && <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-500 to-emerald-400" />}

                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">

                      {/* Left: Image */}
                      <div className="flex-shrink-0 relative">
                        <img
                          src={project.image || `https://images.unsplash.com/photo-1603985585179-3d71c35a537c?w=400&q=80`}
                          alt={project.title}
                          className={`w-full lg:w-44 h-28 object-cover rounded-xl shadow-md border ${isDarkMode ? 'border-neutral-700/50' : 'border-neutral-200'}`}
                        />
                        {isOngoing && (
                          <div className="absolute top-2 left-2">
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded-full">
                              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                              ACTIVE
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Middle: Info */}
                      <div className="flex-1 min-w-0">
                        {/* Title row */}
                        <div className="flex flex-wrap items-start gap-2 mb-2">
                          {project.category && (
                            <span className="px-2.5 py-0.5 bg-[#F24C20]/10 text-[#F24C20] text-[11px] font-semibold rounded-full border border-[#F24C20]/20">
                              {project.category}
                            </span>
                          )}
                          <span className={`flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-bold rounded-full ${badge.cls}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot} ${isOngoing ? 'animate-pulse' : ''}`} />
                            {isFreelancer ? `Proposal: ${badge.label}` : badge.label}
                          </span>
                        </div>

                        <h3 className={`text-lg font-bold mb-3 leading-snug ${isDarkMode ? 'text-white' : 'text-neutral-900'} line-clamp-2`}>
                          {project.title}
                        </h3>

                        {/* Hired Freelancer Info — shown for ongoing client projects */}
                        {!isFreelancer && isOngoing && hiredFreelancer && (
                          <div className={`flex flex-col sm:flex-row sm:items-center gap-3 mb-4 p-3 md:p-4 rounded-xl border ${isDarkMode ? 'bg-blue-500/5 border-blue-500/20' : 'bg-blue-50 border-blue-100'}`}>
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="relative flex-shrink-0">
                                <img
                                    src={hiredFreelancer.profile_image
                                    ? (hiredFreelancer.profile_image.startsWith('http') ? hiredFreelancer.profile_image : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${hiredFreelancer.profile_image}`)
                                    : `https://ui-avatars.com/api/?name=${hiredFreelancer.full_name}&background=F24C20&color=fff`}
                                    alt={hiredFreelancer.full_name}
                                    className="w-9 h-9 rounded-full object-cover border-2 border-blue-400/50"
                                />
                                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-neutral-900 rounded-full" />
                                </div>
                                <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                    <Award className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                                    <span className={`text-[10px] font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>Hired Freelancer</span>
                                </div>
                                <div className={`text-sm font-bold truncate ${isDarkMode ? 'text-white' : 'text-neutral-800'}`}>
                                    {hiredFreelancer.full_name || 'Anonymous'}
                                </div>
                                </div>
                            </div>
                            <button
                              onClick={() => navigate(`/dashboard/messages?user=${hiredFreelancer._id || hiredFreelancer}`)}
                              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg text-xs font-semibold transition-colors border border-blue-500/20"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              Message
                            </button>
                          </div>
                        )}

                        {/* Freelancer view: client info */}
                        {isFreelancer && project.client_id && (
                          <div className={`flex flex-col sm:flex-row sm:items-center justify-between mb-3 p-3 rounded-xl border gap-3 ${isDarkMode ? 'bg-neutral-800/40 border-neutral-700/50' : 'bg-neutral-50 border-neutral-200'}`}>
                            <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                              <Users className="w-3.5 h-3.5" />
                              <span>Client: <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-neutral-800'}`}>{project.client_id.full_name || 'Anonymous'}</span></span>
                            </div>
                            <button
                              onClick={() => navigate(`/dashboard/messages?user=${project.client_id?._id || project.client_id}`)}
                              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-2 bg-[#F24C20]/10 hover:bg-[#F24C20]/20 text-[#F24C20] rounded-lg text-xs font-semibold transition-colors border border-[#F24C20]/20"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              Message
                            </button>
                          </div>
                        )}

                        {/* Stats pills */}
                        <div className="flex flex-wrap gap-2">
                          {!isFreelancer && (
                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${isDarkMode ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-100 text-neutral-600'}`}>
                              <Users className="w-3.5 h-3.5" />
                              {project.proposals || 0} Proposals
                            </div>
                          )}
                          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${isDarkMode ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-100 text-neutral-600'}`}>
                            <IndianRupee className="w-3.5 h-3.5" />
                            {isFreelancer ? `Your bid: ₹${(project.my_bid || 0).toLocaleString()}` : `Budget: ${project.budget_range || 'N/A'}`}
                          </div>
                          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${isDarkMode ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-100 text-neutral-600'}`}>
                            <Clock className="w-3.5 h-3.5" />
                            {project.deadline || 'Flexible'}
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-3 flex-shrink-0">
                        {/* Progress ring for ongoing */}
                        {isOngoing && (
                          <div className="relative w-16 h-16 flex-shrink-0">
                            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 60 60">
                              <circle cx="30" cy="30" r="24" fill="none" stroke={isDarkMode ? '#262626' : '#e5e7eb'} strokeWidth="5" />
                              <circle cx="30" cy="30" r="24" fill="none" stroke="#3b82f6" strokeWidth="5"
                                strokeDasharray={`${2 * Math.PI * 24}`}
                                strokeDashoffset={`${2 * Math.PI * 24 * (1 - (project.progress || 0) / 100)}`}
                                strokeLinecap="round" className="transition-all duration-700" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-sm font-bold text-blue-400">{project.progress || 0}%</span>
                            </div>
                          </div>
                        )}
                        {isCompleted && (
                          <div className="w-12 h-12 flex-shrink-0 bg-green-500/10 rounded-xl flex items-center justify-center border border-green-500/30">
                            <CheckCircle className="w-6 h-6 text-green-400" />
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex flex-col gap-2 w-full lg:w-auto">
                          {/* Accept Award (freelancer) */}
                          {isFreelancer && isAwarded && (
                            <button onClick={() => handleAcceptAward(project._id)}
                              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-amber-500/20">
                              <Award className="w-4 h-4" />
                              Accept Award
                            </button>
                          )}

                          {/* Mark Complete */}
                          {((isFreelancer && project.proposal_status === 'accepted') || (!isFreelancer && project.hired_freelancer_id)) && project.status !== 'completed' && (
                            <button onClick={() => handleCompleteProject(project._id)}
                              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-green-600/20">
                              <CheckCircle className="w-4 h-4" />
                              Mark Complete
                            </button>
                          )}

                          {/* Manage / View */}
                          <Link to={`/dashboard/projects/${project._id}`}
                            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${isOngoing
                                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                                : 'bg-gradient-to-r from-[#F24C20] to-orange-600 hover:shadow-lg hover:shadow-[#F24C20]/20 text-white hover:-translate-y-0.5'
                              }`}>
                            {isFreelancer ? (isOngoing ? 'View Project' : 'View Details') : (isOngoing ? 'Manage' : 'View')}
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </AnimatePresence>
    </div>
  );
}
