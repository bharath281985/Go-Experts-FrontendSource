import { motion } from 'motion/react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '@/app/components/ThemeProvider';
import {
  Clock,
  IndianRupee,
  MapPin,
  Bookmark,
  Share2,
  CheckCircle,
  Calendar,
  FileText,
  Star,
  MessageCircle,
  Shield,
  TrendingUp,
  X,
  Loader2,
  AlertCircle,
  Lock
} from 'lucide-react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { useState, useEffect } from 'react';
import api, { getImgUrl } from '@/app/utils/api';
import { toast } from 'sonner';
import { CreditUnlockModal } from '@/app/components/subscription/CreditUnlockModal';

export default function ProjectDetails() {
  const { isDarkMode } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [proposal, setProposal] = useState({
    coverLetter: '',
    bidAmount: '',
    deliveryTime: '',
    portfolioLink: '',
  });

  useEffect(() => {
    if (id) {
      fetchProjectDetails();
      checkIfUnlocked();
    }
  }, [id]);

  const checkIfUnlocked = async () => {
    try {
      const res = await api.get(`/subscription/is-unlocked/${id}`);
      if (res.data.success && res.data.isUnlocked) {
        setIsUnlocked(true);
      }
    } catch (err) {
      console.error('Error checking unlock status:', err);
    }
  };

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/projects/${id}`);
      if (res.data.success) {
        setProject(res.data.data);
      } else {
        setError('Project not found');
      }
    } catch (err: any) {
      console.error('Error fetching project:', err);
      setError(err.response?.data?.message || 'Failed to fetch project details');
      toast.error('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    try {
      const res = await api.post(`/projects/${id}/interest`, {
        message: proposal.coverLetter,
        bid_amount: proposal.bidAmount,
        delivery_time: proposal.deliveryTime
      });
      if (res.data.success) {
        toast.success('Interest expressed successfully!');
        setShowApplyModal(false);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit proposal');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-20">
        <Loader2 className="w-12 h-12 text-[#F24C20] animate-spin mb-4" />
        <p className="text-neutral-400">Loading project details...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-20 text-center">
        <AlertCircle className="w-16 h-16 text-neutral-800 mb-6" />
        <h2 className="text-2xl font-bold text-white mb-2">{error || 'Project not found'}</h2>
        <Link to="/projects" className="text-[#F24C20] hover:underline">Back to Projects</Link>
      </div>
    );
  }

  const similarProjects: any[] = []; // Would normally fetch from API

  return (
    <div className="min-h-screen bg-neutral-950 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-neutral-400">
              <Link to="/projects" className="hover:text-[#F24C20]">Projects</Link>
              <span>/</span>
              <Link to={`/projects?category=${project.category}`} className="hover:text-[#F24C20]">{project.category}</Link>
              <span>/</span>
              <span className="text-white">Project Details</span>
            </div>

            {/* Header Section */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 bg-[#F24C20]/10 text-[#F24C20] text-sm font-medium rounded-lg border border-[#F24C20]/30">
                      {project.category}
                    </span>
                    <span className="text-sm text-neutral-400">{project.postedTime}</span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    {project.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-neutral-400">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">Remote</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">Posted {new Date(project.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Budget Section */}
            <div className="p-6 bg-gradient-to-br from-neutral-900 to-neutral-900/50 border border-neutral-800 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-neutral-400 mb-1">Project Budget</div>
                  <div className="flex items-center gap-2">
                    <IndianRupee className="w-5 h-5 text-[#F24C20]" />
                    <span className="text-2xl font-bold text-white">
                      ₹{project.budget_range}
                    </span>
                  </div>
                  <div className="text-sm text-neutral-400 mt-1">Fixed Price</div>
                </div>
              </div>
            </div>

            {/* Project Description */}
            <div className="p-8 bg-neutral-900/50 border border-neutral-800 rounded-2xl relative overflow-hidden">
              <h2 className="text-2xl font-bold mb-4 text-white">Project Description</h2>
              
              {!isUnlocked ? (
                <div className="relative">
                  <div className="prose max-w-none text-neutral-300 blur-md select-none">
                    {project.description.substring(0, 100)}...
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 rounded-xl">
                     <Lock className="w-12 h-12 text-[#F24C20] mb-4" />
                     <button 
                       onClick={() => setShowUnlockModal(true)}
                       className="px-8 py-3 bg-[#F24C20] text-white rounded-xl font-bold shadow-xl shadow-[#F24C20]/20 hover:scale-105 transition-transform"
                     >
                       Unlock Project Details
                     </button>
                     <p className="text-xs text-neutral-500 mt-4">1 Credit will be deducted</p>
                  </div>
                </div>
              ) : (
                <div className="prose max-w-none text-neutral-300 whitespace-pre-line">
                  {project.description}
                </div>
              )}
            </div>

            {/* Project Attachments */}
            {isUnlocked && project.attachments && project.attachments.length > 0 && (
              <div className="p-8 bg-neutral-900/50 border border-neutral-800 rounded-2xl">
                <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
                  <FileText className="w-6 h-6 text-[#F24C20]" />
                  Project Attachments
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.attachments.map((file: string, index: number) => {
                    const fileName = file.split('/').pop() || `Attachment ${index + 1}`;
                    const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(file);
                    
                    return (
                      <a 
                        key={index}
                        href={getImgUrl(file)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`group flex items-center gap-4 p-4 rounded-xl border transition-all ${
                          isDarkMode 
                            ? 'bg-neutral-800/50 border-neutral-700 hover:border-[#F24C20]/50 hover:bg-neutral-800' 
                            : 'bg-white border-neutral-200 hover:border-[#F24C20]/50 hover:bg-neutral-50'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isDarkMode ? 'bg-neutral-900' : 'bg-neutral-100'
                        }`}>
                          <FileText className={`w-6 h-6 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-bold truncate ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                            {fileName}
                          </div>
                          <div className="text-xs text-neutral-500 uppercase font-medium">
                            {file.split('.').pop()} Document
                          </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Share2 className="w-4 h-4 text-white" />
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Skills Required */}
            <div className="p-8 bg-neutral-900/50 border border-neutral-800 rounded-2xl">
              <h2 className="text-2xl font-bold mb-4 text-white">Skills Required</h2>
              <div className="flex flex-wrap gap-2">
                {project.skills_required?.map((skill: string) => (
                  <span
                    key={skill}
                    className="px-4 py-2 bg-[#F24C20]/10 text-[#F24C20] rounded-lg font-medium border border-[#F24C20]/30 hover:bg-[#F24C20]/20 transition-colors cursor-pointer"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>


            {/* Similar Projects */}
            <div>
              <h2 className="text-2xl font-bold mb-6 text-white">Similar Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {similarProjects.map((similar) => (
                  <Link
                    key={similar.id}
                    to={`/projects/${similar.id}`}
                    className="group bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden hover:border-[#F24C20]/50 hover:shadow-xl hover:shadow-[#F24C20]/10 transition-all duration-300"
                  >
                    <div className="h-40 overflow-hidden">
                      <ImageWithFallback
                        src={similar.image}
                        alt={similar.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-white mb-2 line-clamp-2 group-hover:text-[#F24C20] transition-colors">
                        {similar.title}
                      </h3>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-400">{similar.budget}</span>
                        <span className="text-neutral-500">{similar.proposals} proposals</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Apply Card */}
              <div className="p-6 bg-neutral-900/50 border-2 border-[#F24C20] rounded-2xl shadow-xl shadow-[#F24C20]/10">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-white mb-2">
                    ₹{project.budget_range}
                  </div>
                  <div className="text-sm text-neutral-400">Fixed Price</div>
                </div>

                <div className="space-y-3 mb-6">
                  <button
                    onClick={() => setShowApplyModal(true)}
                    className="w-full py-3 bg-[#044071] hover:bg-[#055a99] text-white rounded-lg font-medium transition-all duration-300 shadow-lg shadow-[#044071]/30"
                  >
                    Apply Now
                  </button>
                  <button
                    onClick={() => setSaved(!saved)}
                    className={`w-full py-3 rounded-lg font-medium transition-all duration-300 border-2 ${saved
                      ? 'bg-[#F24C20]/10 border-[#F24C20] text-[#F24C20]'
                      : 'bg-neutral-900 border-neutral-700 text-white hover:border-[#F24C20]'
                      }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
                      {saved ? 'Saved' : 'Save Project'}
                    </div>
                  </button>
                  <button className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 border-2 border-neutral-700 rounded-lg font-medium text-white transition-all duration-300 flex items-center justify-center gap-2">
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>
              </div>

              {/* Client Profile Card */}
              <div className="p-6 bg-neutral-900/50 border border-neutral-800 rounded-2xl relative overflow-hidden">
                <h3 className="font-bold mb-4 text-white">About the Client</h3>

                {!isUnlocked ? (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 bg-neutral-800 rounded-full mx-auto mb-4 flex items-center justify-center">
                       <Lock className="w-6 h-6 text-neutral-600" />
                    </div>
                    <p className="text-sm text-neutral-500 mb-4 px-4">Client identity is hidden. Unlock the project to see profile and ratings.</p>
                    <button 
                      onClick={() => setShowUnlockModal(true)}
                      className="text-[#F24C20] font-bold text-sm hover:underline"
                    >
                      Unlock Now
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-4">
                      <ImageWithFallback
                        src={project.client_id?.profile_image || `https://ui-avatars.com/api/?name=${project.client_id?.full_name}`}
                        alt={project.client_id?.full_name}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{project.client_id?.full_name}</span>
                          <CheckCircle className="w-4 h-4 text-blue-500" />
                        </div>
                        <div className="text-sm text-neutral-400">Remote</div>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-400">Rating</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium text-white">4.8</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg mb-4">
                      <Shield className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-green-400 font-medium">Payment Verified</span>
                    </div>

                    <div className="text-xs text-neutral-500">
                      Member since {new Date(project.client_id?.createdAt).toLocaleDateString()}
                    </div>
                  </>
                )}
              </div>

              {/* Project Stats */}
              <div className="p-6 bg-gradient-to-br from-neutral-900 to-neutral-900/50 border border-neutral-800 rounded-2xl">
                <h3 className="font-bold mb-4 text-white">Project Activity</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-neutral-400">
                      <FileText className="w-4 h-4" />
                      <span>Proposals</span>
                    </div>
                    <span className="font-bold text-white">5-10</span>
                  </div>
                </div>
              </div>

              {/* Quick Questions */}
              <div className="p-6 bg-neutral-900/50 border border-neutral-800 rounded-2xl">
                <h3 className="font-bold mb-4 text-white">Quick Questions</h3>
                <div className="space-y-3">
                  <details className="group">
                    <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-neutral-300 hover:text-[#F24C20] transition-colors">
                      Is this fixed or hourly?
                    </summary>
                    <p className="mt-2 text-sm text-neutral-400">
                      This is a {project.budget_range ? 'Fixed/Negotiable' : 'N/A'} project.
                    </p>
                  </details>
                  <details className="group">
                    <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-neutral-300 hover:text-[#F24C20] transition-colors">
                      Can I submit a sample?
                    </summary>
                    <p className="mt-2 text-sm text-neutral-400">
                      Yes, you can include relevant portfolio samples in your proposal.
                    </p>
                  </details>
                  <details className="group">
                    <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-neutral-300 hover:text-[#F24C20] transition-colors">
                      What's the selection process?
                    </summary>
                    <p className="mt-2 text-sm text-neutral-400">
                      Client reviews proposals, shortlists candidates, and conducts interviews before hiring.
                    </p>
                  </details>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl p-8 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Submit Proposal</h2>
              <button
                onClick={() => setShowApplyModal(false)}
                className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Cover Letter
                </label>
                <textarea
                  rows={6}
                  value={proposal.coverLetter}
                  onChange={(e) => setProposal({ ...proposal, coverLetter: e.target.value })}
                  placeholder="Introduce yourself and explain why you're the best fit for this project..."
                  className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#F24C20] transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Your Bid Amount
                  </label>
                  <input
                    type="text"
                    value={proposal.bidAmount}
                    onChange={(e) => setProposal({ ...proposal, bidAmount: e.target.value })}
                    placeholder="₹5,000"
                    className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#F24C20] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Delivery Time
                  </label>
                  <input
                    type="text"
                    value={proposal.deliveryTime}
                    onChange={(e) => setProposal({ ...proposal, deliveryTime: e.target.value })}
                    placeholder="6 weeks"
                    className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#F24C20] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Portfolio Link (Optional)
                </label>
                <input
                  type="url"
                  value={proposal.portfolioLink}
                  onChange={(e) => setProposal({ ...proposal, portfolioLink: e.target.value })}
                  placeholder="https://yourportfolio.com"
                  className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#F24C20] transition-colors"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowApplyModal(false)}
                  className="flex-1 px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  className="flex-1 px-6 py-3 bg-[#044071] hover:bg-[#055a99] text-white rounded-lg font-medium transition-colors shadow-lg shadow-[#044071]/30"
                >
                  Submit Proposal
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      <CreditUnlockModal 
        isOpen={showUnlockModal}
        onClose={() => setShowUnlockModal(false)}
        targetId={id!}
        targetType="project"
        onUnlocked={() => setIsUnlocked(true)}
      />
    </div>
  );
}