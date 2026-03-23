import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useTheme } from '@/app/components/ThemeProvider';
import { FileText, Plus, Clock, Users, DollarSign, CheckCircle, XCircle, AlertCircle, MessageSquare, Star, Loader2 } from 'lucide-react';
import RadialProgress from '@/app/components/dashboard/charts/RadialProgress';
import { Link } from 'react-router-dom';
import api from '@/app/utils/api';

export default function MyProjects() {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState<'all' | 'ongoing' | 'completed' | 'cancelled'>('all');
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userType = localStorage.getItem('userType') || (user?.role === 'client' ? 'client' : 'freelancer');
  const isFreelancer = userType === 'freelancer';

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get('/projects/my');
        if (res.data.success) {
          setProjects(res.data.data);
        }
      } catch (error) {
        console.error('Error fetching my projects:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(project => {
    if (activeTab === 'all') return true;
    const currentStatus = isFreelancer ? (project.proposal_status || project.status) : project.status;
    const normalizedStatus = currentStatus === 'live' ? 'ongoing' : currentStatus;
    return normalizedStatus === activeTab;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing':
      case 'live':
      case 'pending': return 'text-blue-500 bg-blue-500/10';
      case 'completed':
      case 'accepted': return 'text-green-500 bg-green-500/10';
      case 'cancelled':
      case 'rejected': return 'text-red-500 bg-red-500/10';
      default: return 'text-neutral-500 bg-neutral-500/10';
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
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
            {isFreelancer ? 'My Proposals' : 'My Projects'}
          </h1>
          <p className={`mt-2 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
            {isFreelancer ? 'Track and manage your project proposals' : 'Manage all your posted projects'}
          </p>
        </div>
        <Link
          to={isFreelancer ? "/dashboard/projects/explore" : "/dashboard/projects/create"}
          className="px-6 py-3 bg-[#F24C20] hover:bg-orange-600 text-white rounded-lg font-medium transition-all flex items-center gap-2"
        >
          {isFreelancer ? (
            <>
              <Users className="w-5 h-5" />
              Find Projects
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              Create Project
            </>
          )}
        </Link>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-2xl border backdrop-blur-sm ${isDarkMode ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white/50 border-neutral-200'
            }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-[#F24C20]/10">
              <FileText className="w-5 h-5 text-[#F24C20]" />
            </div>
            <span className={`text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
              {isFreelancer ? 'Total Bids' : 'Total Posted'}
            </span>
          </div>
          <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
            {projects.length}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`p-6 rounded-2xl border backdrop-blur-sm ${isDarkMode ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white/50 border-neutral-200'
            }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <span className={`text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
              Ongoing
            </span>
          </div>
          <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
            {projects.filter(p => p.status === 'ongoing').length}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`p-6 rounded-2xl border backdrop-blur-sm ${isDarkMode ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white/50 border-neutral-200'
            }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-green-500/10">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <span className={`text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
              Completed
            </span>
          </div>
          <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
            {projects.filter(p => p.status === 'completed').length}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`p-6 rounded-2xl border backdrop-blur-sm ${isDarkMode ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white/50 border-neutral-200'
            }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <DollarSign className="w-5 h-5 text-purple-500" />
            </div>
            <span className={`text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
              {isFreelancer ? 'Total Bid Value' : 'Total Spent'}
            </span>
          </div>
          <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
            ₹{isFreelancer 
              ? projects.reduce((sum, p) => sum + (p.my_bid || 0), 0).toLocaleString()
              : projects.reduce((sum, p) => sum + (p.paid || 0), 0).toLocaleString()}
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`flex gap-2 p-2 rounded-xl ${isDarkMode ? 'bg-neutral-900/50' : 'bg-neutral-50'
          }`}
      >
        {(['all', 'ongoing', 'completed', 'cancelled'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-2 rounded-lg font-medium capitalize transition-all ${activeTab === tab
              ? 'bg-[#F24C20] text-white shadow-lg'
              : isDarkMode
                ? 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-white'
              }`}
          >
            {tab}
          </button>
        ))}
      </motion.div>

      {/* Projects List */}
      <div className="space-y-4">
        {filteredProjects.map((project, index) => {
          const currentStatus = isFreelancer ? (project.proposal_status || project.status) : project.status;
          const normalizedStatus = currentStatus === 'live' ? 'ongoing' : currentStatus;
          return (
            <motion.div
              key={project._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-6 rounded-2xl border backdrop-blur-sm hover:scale-[1.01] transition-all ${isDarkMode
                ? 'bg-neutral-900/50 border-neutral-800 hover:border-neutral-700'
                : 'bg-white/50 border-neutral-200 hover:border-neutral-300'
                }`}
            >
              <div className="flex flex-col md:flex-row gap-6">
                {/* Project Image */}
                <div className="flex-shrink-0">
                  <img
                    src={project.image || `https://images.unsplash.com/photo-1603985585179-3d71c35a537c?w=400&q=80`}
                    alt={project.title}
                    className="w-full md:w-48 h-32 object-cover rounded-xl shadow-lg border border-neutral-800/50"
                  />
                </div>

                {/* Project Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                        {project.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        {project.category && (
                          <span className="px-3 py-1 bg-[#F24C20]/10 text-[#F24C20] text-xs font-medium rounded-full">
                            {project.category}
                          </span>
                        )}
                        <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${getStatusColor(currentStatus)}`}>
                          {isFreelancer ? `Proposal: ${currentStatus}` : normalizedStatus}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      {isFreelancer ? (
                        <div className="text-right">
                          <div className={`text-xs ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'} mb-1`}>
                            Client
                          </div>
                          <div className={`font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                            {project.client_id?.full_name || 'Anonymous'}
                          </div>
                        </div>
                      ) : (
                        normalizedStatus === 'ongoing' && (
                          <RadialProgress value={project.progress || 0} size={80} color="#F24C20" />
                        )
                      )}
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    {isFreelancer ? (
                      <div className="p-3 rounded-xl bg-[#F24C20]/10 border border-[#F24C20]/20">
                        <div className="text-xs text-[#F24C20] mb-1">Your Bid</div>
                        <div className="text-xl font-bold text-[#F24C20]">₹{(project.my_bid || 0).toLocaleString()}</div>
                      </div>
                    ) : (
                      <>
                        <div className="p-3 rounded-xl bg-neutral-800/20 border border-neutral-800/30">
                          <div className={`text-xs ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'} mb-1`}>
                            Proposals
                          </div>
                          <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                            {project.proposals || 0}
                          </div>
                        </div>
                        <div className="p-3 rounded-xl bg-neutral-800/20 border border-neutral-800/30">
                          <div className={`text-xs ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'} mb-1`}>
                            Hired
                          </div>
                          <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                            {project.hired ? 'Yes' : 'No'}
                          </div>
                        </div>
                      </>
                    )}
                    <div className="p-3 rounded-xl bg-neutral-800/20 border border-neutral-800/30">
                      <div className={`text-xs ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'} mb-1`}>
                        Project Budget
                      </div>
                      <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                        ₹{project.budget_range || 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Progressive Actions */}
                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-neutral-800/30">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-800/40 text-sm">
                        <Clock className="w-4 h-4 text-[#F24C20]" />
                        <span className={isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}>
                          {project.deadline || 'Flexible'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button className={`p-3 rounded-xl border transition-all ${isDarkMode
                        ? 'bg-neutral-800/50 border-neutral-700 hover:border-[#F24C20] text-neutral-400 hover:text-[#F24C20]'
                        : 'bg-neutral-50 border-neutral-200 hover:border-[#F24C20] text-neutral-600 hover:text-[#F24C20]'
                        }`}>
                        <MessageSquare className="w-5 h-5" />
                      </button>
                      <Link 
                        to={`/dashboard/projects/${project._id}`}
                        className="px-6 py-2.5 bg-gradient-to-r from-[#F24C20] to-orange-600 hover:shadow-lg hover:shadow-[#F24C20]/20 text-white rounded-xl font-bold transition-all transform hover:-translate-y-0.5"
                      >
                        Manage Project
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredProjects.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-12 rounded-2xl border backdrop-blur-sm text-center ${isDarkMode ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white/50 border-neutral-200'
            }`}
        >
          <FileText className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-neutral-700' : 'text-neutral-300'}`} />
          <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
            No {activeTab} projects
          </h3>
          <p className={`mb-6 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
            You don't have any {activeTab} projects at the moment
          </p>
        </motion.div>
      )}
    </div>
  );
}
