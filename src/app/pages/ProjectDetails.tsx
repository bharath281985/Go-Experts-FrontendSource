import { motion, AnimatePresence } from 'motion/react';
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
  Lock,
  Briefcase,
  Users,
  Award,
  ThumbsUp,
  RotateCcw,
  Sparkles,
  Mail
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
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userVerified, setUserVerified] = useState<boolean | null>(null);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [clientProjects, setClientProjects] = useState<any[]>([]);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [proposals, setProposals] = useState<any[]>([]);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [awardingProposalId, setAwardingProposalId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProjectDetails();
      checkIfUnlocked();
      fetchUserStatus();
      checkIfSaved();
    }
  }, [id]);

  useEffect(() => {
    if (project && currentUser) {
      const isOwner = String(project.client_id?._id || project.client_id) === String(currentUser?._id || currentUser?.id);
      if (isOwner) {
        fetchProposals(project._id);
      }
    }
  }, [project, currentUser]);

  const checkIfSaved = async () => {
    try {
      const res = await api.get('/users/favorites');
      if (res.data.success) {
        const isSaved = res.data.data.some((p: any) => p._id === id);
        setSaved(isSaved);
      }
    } catch (err) {
      console.error('Error checking saved status:', err);
    }
  };

  const fetchUserStatus = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setCurrentUser(res.data.user);
        setUserVerified(res.data.user.kyc_details?.is_verified || false);
        setUserRole(res.data.user.roles[0]); // Primary role
      }
    } catch (err) {
      console.error('Error fetching user status:', err);
    }
  };

  const fetchProposals = async (projectId: string) => {
    try {
      setLoadingProposals(true);
      const res = await api.get(`/projects/${projectId}/proposals`);
      if (res.data.success) {
        setProposals(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching proposals:', err);
    } finally {
      setLoadingProposals(false);
    }
  };

  const handleAwardProject = async (projectId: string, proposalId: string) => {
    try {
      setAwardingProposalId(proposalId);
      const res = await api.put(`/projects/${projectId}/award/${proposalId}`);
      if (res.data.success) {
        toast.success(res.data.message || 'Project successfully awarded!');
        fetchProjectDetails(); // Refresh to show closed status
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to award project');
    } finally {
      setAwardingProposalId(null);
    }
  };

  const fetchClientProjects = async (clientId: string, currentProjectId: string) => {
    if (!clientId) return;
    try {
      setFetchingMore(true);
      const res = await api.get(`/projects?client_id=${clientId}`);
      if (res.data.success) {
        // Filter out current project and keep max 3
        const others = res.data.data.filter((p: any) => p._id !== currentProjectId).slice(0, 3);
        setClientProjects(others);
      }
    } catch (err) {
      console.error('Error fetching client projects:', err);
    } finally {
      setFetchingMore(false);
    }
  };


  const checkIfUnlocked = async () => {
    if (!id || id === 'undefined' || id.length < 12) return;
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
        fetchClientProjects(res.data.data.client_id?._id || res.data.data.client_id, res.data.data._id);
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

  const [showShareModal, setShowShareModal] = useState(false);

  const handleToggleSave = async () => {
    try {
      setFavoriteLoading(true);
      const res = await api.put(`/users/favorites/${id}`);
      if (res.data.success) {
        setSaved(res.data.isFavorited);
        toast.success(res.data.message);
      }
    } catch (err) {
      toast.error('Failed to update favorites');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleShare = (type: 'whatsapp' | 'email') => {
    const text = `Check out this project on Go Experts: ${project.title}`;
    const url = window.location.href;

    if (type === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
    } else {
      window.open(`mailto:?subject=${encodeURIComponent(project.title)}&body=${encodeURIComponent(text + '\n' + url)}`, '_blank');
    }
    setShowShareModal(false);
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
        fetchProjectDetails(); // Refresh to show "Applied" status
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
        <Link to="/dashboard/projects/my-projects" className="text-[#F24C20] hover:underline">Back to Projects</Link>
      </div>
    );
  }

  const similarProjects: any[] = []; // Would normally fetch from API

  const isOwner = project && currentUser && (
    String(project.client_id?._id || project.client_id) === String(currentUser?._id || currentUser?.id)
  );

  const isHired = project && currentUser && (
    String(project.hired_freelancer_id?._id || project.hired_freelancer_id) === String(currentUser?._id || currentUser?.id)
  );
  
  const canSeeFullDetails = isUnlocked || isOwner || isHired;

  return (
    <div className="min-h-screen bg-neutral-950 pt-36 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Breadcrumb + Back Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-[#F24C20] hover:text-[#F24C20] text-neutral-400 text-sm transition-all group"
              >
                <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Back
              </button>
              <div className="flex items-center gap-2 text-sm text-neutral-400">
                <button onClick={() => navigate(-1)} className="hover:text-[#F24C20] transition-colors">Projects</button>
                <span>/</span>
                <span className="text-neutral-500">{project.category}</span>
                <span>/</span>
                <span className="text-white">Project Details</span>
              </div>
            </div>

            {/* Project Completed Banner */}
            {project.status === 'completed' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-green-500/10 to-emerald-500/5 border border-green-500/30"
              >
                <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-green-500/30">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <div className="text-sm font-bold text-green-400">Project Successfully Completed</div>
                  <div className="text-xs text-neutral-400 mt-0.5">
                    Completed on {project.updatedAt ? new Date(project.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-green-400" />
                  <span className="text-xs font-semibold text-green-400">Delivered</span>
                </div>
              </motion.div>
            )}

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
                    {/* <IndianRupee className="w-5 h-5 text-[#F24C20]" /> */}
                    <span className="text-2xl font-bold text-white">
                      {project.budget_range}
                    </span>
                  </div>
                  <div className="text-sm text-neutral-400 mt-1">Fixed Price</div>
                </div>
              </div>
            </div>

            {/* Project Description */}
            <div className={`p-8 bg-neutral-900/50 border border-neutral-800 rounded-2xl relative overflow-hidden ${project.status === 'closed' ? 'grayscale opacity-80' : ''
              }`}>

              {/* Expired Ribbon for description */}
              {project.status === 'closed' && (
                <div className="absolute top-10 -right-12 bg-neutral-800 text-white border border-white/20 px-16 py-1 rotate-45 font-black text-sm shadow-2xl z-20 pointer-events-none">
                  EXPIRED
                </div>
              )}

            {/* Client Management Interface for Proposals */}
            {isOwner && (
              <div className="mb-12 border-b border-neutral-800 pb-12">
                <div className="flex items-center justify-between mb-8">
                    <div>
                         <h2 className="text-2xl font-bold text-white mb-2">
                           {project.status === 'live' ? 'Review Proposals' : 'Project Selection'}
                         </h2>
                         <p className="text-neutral-400">
                           {project.status === 'live' 
                             ? 'View and award your project to the best freelancer.' 
                             : 'You have selected a freelancer for this project.'}
                         </p>
                    </div>
                   <div className="flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl">
                        <Users className="w-5 h-5 text-[#F24C20]" />
                        <span className="font-bold text-white">{proposals.length}</span>
                        <span className="text-neutral-400">Applications</span>
                   </div>
                </div>

                {loadingProposals ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 text-[#F24C20] animate-spin" />
                  </div>
                ) : proposals.length > 0 ? (
                  <div className="space-y-4">
                    {proposals.map((prop) => (
                      <div 
                        key={prop._id}
                        className={`p-6 rounded-2xl border transition-all ${
                            prop.status === 'accepted' 
                            ? 'bg-green-500/10 border-green-500/30' 
                            : 'bg-neutral-900/40 border-neutral-800'
                        }`}
                      >
                         <div className="flex flex-col lg:flex-row justify-between gap-6">
                            <div className="flex gap-4">
                               <ImageWithFallback
                                  src={prop.freelancer_id?.profile_image ? (prop.freelancer_id.profile_image.startsWith('http') ? prop.freelancer_id.profile_image : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${prop.freelancer_id.profile_image}`) : `https://ui-avatars.com/api/?name=${prop.freelancer_id?.full_name}`}
                                  className="w-14 h-14 rounded-full object-cover border-2 border-neutral-800"
                                  alt={prop.freelancer_id?.full_name}
                               />
                               <div>
                                  <div className="flex items-center gap-2 mb-1">
                                     <h4 className="font-bold text-white">{prop.freelancer_id?.full_name}</h4>
                                     {prop.freelancer_id?.kyc_details?.is_verified && (
                                       <CheckCircle className="w-4 h-4 text-blue-500" />
                                     )}
                                     {prop.status === 'accepted' && (
                                       <span className="px-2 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded-full uppercase">Hired</span>
                                     )}
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-neutral-400">
                                     <div className="flex items-center gap-1">
                                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                        <span>4.9 (24)</span>
                                     </div>
                                     <div className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        <span>Delivery: {prop.delivery_time}</span>
                                     </div>
                                  </div>
                               </div>
                            </div>

                            <div className="flex flex-col items-end gap-2 text-right">
                               <div className="text-2xl font-bold text-white">₹{prop.bid_amount.toLocaleString()}</div>
                               <div className="flex gap-2">
                                  {project.status === 'live' && prop.status !== 'accepted' && (
                                     <button
                                        onClick={() => handleAwardProject(project._id, prop._id)}
                                        disabled={awardingProposalId !== null}
                                        className="px-6 py-2 bg-[#F24C20] hover:bg-orange-600 text-white rounded-lg text-sm font-bold transition-all flex items-center gap-2"
                                     >
                                        {awardingProposalId === prop._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                                        Award Project
                                     </button>
                                  )}
                                  <button 
                                     onClick={() => navigate(`/dashboard/messages?user=${prop.freelancer_id?._id || prop.freelancer_id}`)}
                                     className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-sm font-bold transition-all"
                                  >
                                     Message
                                  </button>
                               </div>
                            </div>
                         </div>
                         <div className="mt-4 p-4 bg-black/30 rounded-xl border border-neutral-800">
                            <h5 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Proposal Message</h5>
                            <p className="text-sm text-neutral-300 italic">"{prop.message}"</p>
                         </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-neutral-950 p-12 rounded-2xl border border-neutral-800 text-center border-dashed">
                      <Users className="w-12 h-12 text-neutral-800 mx-auto mb-4" />
                      <p className="text-neutral-500 font-medium">No proposals have been submitted for this project yet.</p>
                  </div>
                )}
              </div>
            )}

            <h2 className="text-2xl font-bold mb-4 text-white">Project Description</h2>

              {!canSeeFullDetails ? (
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
            {canSeeFullDetails && project.attachments && project.attachments.length > 0 && (
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
                        className={`group flex items-center gap-4 p-4 rounded-xl border transition-all ${isDarkMode
                          ? 'bg-neutral-800/50 border-neutral-700 hover:border-[#F24C20]/50 hover:bg-neutral-800'
                          : 'bg-white border-neutral-200 hover:border-[#F24C20]/50 hover:bg-neutral-50'
                          }`}
                      >
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${isDarkMode ? 'bg-neutral-900' : 'bg-neutral-100'
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


            {/* More Projects from this Client */}
            {clientProjects.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-6 text-white flex items-center justify-between">
                  <span>More Projects from this Client</span>
                  <Link 
                    to={`/dashboard/projects/explore?search=${project.client_id?.full_name}`} 
                    className="text-sm font-medium text-[#F24C20] hover:underline"
                  >
                    View All
                  </Link>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {clientProjects.map((similar) => (
                    <Link
                      key={similar._id}
                      to={`/dashboard/projects/${similar._id}`}
                      className="group bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden hover:border-[#F24C20]/50 hover:shadow-xl hover:shadow-[#F24C20]/10 transition-all duration-300 flex flex-col"
                    >
                      <div className="h-40 overflow-hidden relative">
                        <ImageWithFallback
                          src={similar.image || 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80'}
                          alt={similar.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3 px-2 py-1 bg-black/50 backdrop-blur-md rounded-lg text-[10px] font-bold text-white border border-white/10">
                          {similar.category}
                        </div>
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <h3 className="font-bold text-white mb-2 line-clamp-2 group-hover:text-[#F24C20] transition-colors leading-snug">
                          {similar.title}
                        </h3>
                        <div className="flex items-center justify-between text-xs pt-3 border-t border-neutral-800 mt-2">
                          <span className="text-neutral-400 font-medium">₹{similar.budget_range}</span>
                          <div className="flex items-center gap-1 text-neutral-500">
                             <Briefcase className="w-3 h-3" />
                             <span>{similar.proposals || 0} applications</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-5">

              {/* ─── COMPLETED PROJECT SIDEBAR ─── */}
              {project.status === 'completed' ? (
                <>
                  {/* Completion Summary Card */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-green-500/30 bg-gradient-to-br from-green-500/8 to-neutral-900/80 overflow-hidden"
                  >
                    <div className="px-6 py-4 border-b border-green-500/20 flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <Award className="w-4 h-4 text-green-400" />
                      </div>
                      <span className="font-bold text-white text-sm">Project Summary</span>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-400">Final Budget</span>
                        <span className="font-bold text-white">{project.budget_range}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-400">Posted</span>
                        <span className="text-sm font-medium text-neutral-300">
                          {new Date(project.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-400">Completed</span>
                        <span className="text-sm font-medium text-green-400">
                          {project.updatedAt ? new Date(project.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-400">Proposals</span>
                        <span className="text-sm font-medium text-neutral-300">{project.proposals || 0} received</span>
                      </div>
                      <div className="pt-3 border-t border-green-500/20 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span className="text-xs text-green-400 font-semibold">All deliverables accepted</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Hired Freelancer Card */}
                  {project.hired_freelancer_id && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      transition={{ delay: 0.1 }}
                      className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/60"
                    >
                      <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4">Work Delivered By</div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="relative">
                          <ImageWithFallback
                            src={project.hired_freelancer_id?.profile_image
                              ? (project.hired_freelancer_id.profile_image.startsWith('http') ? project.hired_freelancer_id.profile_image : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${project.hired_freelancer_id.profile_image}`)
                              : `https://ui-avatars.com/api/?name=${project.hired_freelancer_id?.full_name}&background=F24C20&color=fff`}
                            alt={project.hired_freelancer_id?.full_name || 'Freelancer'}
                            className="w-14 h-14 rounded-full object-cover border-2 border-green-500/40"
                          />
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-neutral-900">
                            <CheckCircle className="w-3 h-3 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-white truncate">{project.hired_freelancer_id?.full_name || 'Freelancer'}</div>
                          <div className="text-xs text-neutral-400 mt-0.5">{project.hired_freelancer_id?.location || 'Remote'}</div>
                          <div className="flex items-center gap-1 mt-1">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star key={s} className={`w-3 h-3 ${s <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-neutral-600'}`} />
                            ))}
                            <span className="text-xs text-neutral-400 ml-1">4.0</span>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => navigate(`/dashboard/messages?user=${project.hired_freelancer_id?._id || project.hired_freelancer_id}`)}
                          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-semibold transition-all border border-neutral-700"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Message
                        </button>
                        <button
                          onClick={() => navigate(`/dashboard/projects/create`)}
                          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#F24C20] hover:bg-orange-600 text-white text-sm font-semibold transition-all shadow-lg shadow-[#F24C20]/20"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Hire Again
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Leave a Review */}
                  {isOwner && !reviewSubmitted && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      transition={{ delay: 0.2 }}
                      className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/60"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <ThumbsUp className="w-4 h-4 text-[#F24C20]" />
                        <span className="font-bold text-white text-sm">Leave a Review</span>
                      </div>
                      <p className="text-xs text-neutral-400 mb-4">How was your experience working with this freelancer?</p>
                      <div className="flex items-center gap-1.5 mb-4">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button 
                            key={star}
                            onMouseEnter={() => setReviewHover(star)}
                            onMouseLeave={() => setReviewHover(0)}
                            onClick={() => setReviewRating(star)}
                            className="transition-transform hover:scale-110"
                          >
                            <Star className={`w-7 h-7 transition-colors ${
                              star <= (reviewHover || reviewRating) ? 'text-yellow-400 fill-yellow-400' : 'text-neutral-700'
                            }`} />
                          </button>
                        ))}
                        {reviewRating > 0 && (
                          <span className="ml-2 text-sm font-semibold text-neutral-300">
                            {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][reviewRating]}
                          </span>
                        )}
                      </div>
                      <textarea
                        rows={3}
                        value={reviewText}
                        onChange={e => setReviewText(e.target.value)}
                        placeholder="Share your experience... (optional)"
                        className="w-full px-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#F24C20] transition-colors resize-none mb-3"
                      />
                      <button
                        disabled={reviewRating === 0 || reviewSubmitting}
                        onClick={async () => {
                          if (reviewRating === 0) return;
                          setReviewSubmitting(true);
                          try {
                            await api.post(`/projects/${project._id}/review`, { rating: reviewRating, comment: reviewText });
                            toast.success('Review submitted! Thank you.');
                            setReviewSubmitted(true);
                          } catch {
                            toast.error('Failed to submit review. Please try again.');
                          } finally {
                            setReviewSubmitting(false);
                          }
                        }}
                        className="w-full py-2.5 rounded-xl bg-[#F24C20] hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold transition-all flex items-center justify-center gap-2"
                      >
                        {reviewSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
                        Submit Review
                      </button>
                    </motion.div>
                  )}

                  {reviewSubmitted && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }} 
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-5 rounded-2xl border border-green-500/30 bg-green-500/5 text-center"
                    >
                      <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                      <div className="font-bold text-white text-sm mb-1">Review Submitted!</div>
                      <div className="text-xs text-neutral-400">Thank you for your feedback</div>
                    </motion.div>
                  )}
                  {/* Share */}
                  <div 
                    className="relative group/share"
                    onMouseEnter={() => setShowShareModal(true)}
                    onMouseLeave={() => setShowShareModal(false)}
                  >
                    <button 
                      className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl font-medium text-neutral-300 hover:text-white transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <Share2 className="w-4 h-4" /> Share Project
                    </button>
                    <AnimatePresence>
                      {showShareModal && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                          animate={{ opacity: 1, y: 0, scale: 1 }} 
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute bottom-full mb-3 left-0 right-0 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-2 z-50 overflow-hidden ring-1 ring-white/10"
                        >
                          <div className="flex flex-col gap-1">
                            <button onClick={() => handleShare('whatsapp')} className="flex items-center justify-between gap-3 w-full p-3 hover:bg-emerald-500/10 rounded-lg transition-all group">
                              <span className="text-sm text-neutral-300 group-hover:text-emerald-400">Share on WhatsApp</span>
                              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                <MessageCircle className="w-4 h-4 text-emerald-500 group-hover:text-white" />
                              </div>
                            </button>
                            <button onClick={() => handleShare('email')} className="flex items-center justify-between gap-3 w-full p-3 hover:bg-[#F24C20]/10 rounded-lg transition-all group">
                              <span className="text-sm text-neutral-300 group-hover:text-[#F24C20]">Share via Email</span>
                              <div className="w-8 h-8 rounded-lg bg-[#F24C20]/10 flex items-center justify-center group-hover:bg-[#F24C20] group-hover:text-white transition-all">
                                <Mail className="w-4 h-4 text-[#F24C20] group-hover:text-white" />
                              </div>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <>
                  {/* ─── ACTIVE / OPEN PROJECT SIDEBAR ─── */}
                  <div className={`p-6 bg-neutral-900/50 border-2 rounded-2xl shadow-xl relative overflow-hidden transition-all duration-300 ${
                    project.status === 'closed' ? 'border-neutral-700 grayscale' : 'border-[#F24C20] shadow-[#F24C20]/10'
                  }`}>
                    {project.status === 'closed' && (
                      <div className="absolute top-4 -right-8 bg-neutral-700 text-white px-10 py-1 rotate-45 font-bold text-xs shadow-lg border border-white/10 z-10">
                        EXPIRED
                      </div>
                    )}

                    <div className="text-center mb-6">
                      <div className="text-3xl font-bold text-white mb-2">{project.budget_range}</div>
                      <div className="text-sm text-neutral-400">Fixed Price</div>
                    </div>

                    <div className="space-y-3 mb-6">
                      {!isOwner && userRole === 'freelancer' && (
                        <>
                          <button
                            disabled={project.status === 'closed' || project.isApplied}
                            onClick={() => {
                              if (userVerified === false) {
                                toast.error('KYC verification required to apply for projects. Please complete your profile in Settings.', {
                                  action: { label: 'Settings', onClick: () => navigate('/dashboard/settings') }
                                });
                                return;
                              }
                              setShowApplyModal(true);
                            }}
                            className={`w-full py-3 rounded-lg font-medium transition-all duration-300 shadow-lg ${
                              project.status === 'closed' 
                                ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed shadow-none' 
                                : project.isApplied
                                  ? 'bg-emerald-600/20 text-emerald-500 border border-emerald-500/30 cursor-default shadow-none'
                                  : 'bg-[#044071] hover:bg-[#055a99] text-white shadow-[#044071]/30'
                            }`}
                          >
                            {project.status === 'closed' ? 'Project Closed' : project.isApplied ? 'Applied' : 'Apply Now'}
                          </button>
                          {!project.isApplied && (
                            <button
                              onClick={handleToggleSave}
                              disabled={favoriteLoading}
                              className={`w-full py-3 rounded-lg font-medium transition-all duration-300 border-2 ${
                                saved ? 'bg-[#F24C20]/10 border-[#F24C20] text-[#F24C20]' : 'bg-neutral-900 border-neutral-700 text-white hover:border-[#F24C20]'
                              }`}
                            >
                              <div className="flex items-center justify-center gap-2">
                                {favoriteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />}
                                {saved ? 'Saved' : 'Save Project'}
                              </div>
                            </button>
                          )}
                        </>
                      )}

                      {isOwner && project.status !== 'closed' && (
                        <button
                          onClick={() => navigate(`/dashboard/projects/edit/${project._id}`)}
                          className="w-full py-3 bg-[#F24C20] hover:bg-orange-600 text-white rounded-lg font-bold transition-all shadow-lg shadow-[#F24C20]/20 flex items-center justify-center gap-2"
                        >
                          <FileText className="w-5 h-5" />
                          Edit Project
                        </button>
                      )}
                      
                      <div className="relative">
                      <div 
                        className="relative group/share"
                        onMouseEnter={() => setShowShareModal(true)}
                        onMouseLeave={() => setShowShareModal(false)}
                      >
                        <button
                          className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 border-2 border-neutral-700 rounded-lg font-medium text-white transition-all duration-300 flex items-center justify-center gap-2"
                        >
                          <Share2 className="w-4 h-4" /> Share
                        </button>
                        <AnimatePresence>
                          {showShareModal && (
                            <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.95 }}
                              className="absolute bottom-full mb-2 left-0 right-0 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-2 z-50 ring-1 ring-white/10"
                            >
                              <div className="flex flex-col gap-1">
                                <button onClick={() => handleShare('whatsapp')} className="flex items-center justify-between gap-3 p-3 hover:bg-emerald-500/10 rounded-lg transition-all group">
                                  <span className="text-sm font-medium text-neutral-300 group-hover:text-emerald-400">Share on WhatsApp</span>
                                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                    <MessageCircle className="w-4 h-4 text-emerald-500 group-hover:text-white" />
                                  </div>
                                </button>
                                <button onClick={() => handleShare('email')} className="flex items-center justify-between gap-3 p-3 hover:bg-[#F24C20]/10 rounded-lg transition-all group">
                                  <span className="text-sm font-medium text-neutral-300 group-hover:text-[#F24C20]">Share via Email</span>
                                  <div className="w-8 h-8 rounded-lg bg-[#F24C20]/10 flex items-center justify-center group-hover:bg-[#F24C20] group-hover:text-white transition-all">
                                    <Mail className="w-4 h-4 text-[#F24C20] group-hover:text-white" />
                                  </div>
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      </div>
                    </div>
                  </div>

                  {/* Client Profile Card */}
                  {!isOwner && (
                    <div className="p-6 bg-neutral-900/50 border border-neutral-800 rounded-2xl relative overflow-hidden">
                      <h3 className="font-bold mb-4 text-white">About the Client</h3>
                      {project.client_id ? (
                        <>
                          <div className="flex items-center gap-3 mb-4">
                            <ImageWithFallback
                              src={project.client_id?.profile_image ? (project.client_id.profile_image.startsWith('http') ? project.client_id.profile_image : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${project.client_id.profile_image}`) : `https://ui-avatars.com/api/?name=${project.client_id?.full_name}`}
                              alt={project.client_id?.full_name}
                              className="w-14 h-14 rounded-full object-cover"
                            />
                            <div>
                              <Link to={`/dashboard/projects/explore?search=${project.client_id?.full_name}`} className="font-bold text-white hover:text-[#F24C20] transition-colors">
                                {project.client_id?.full_name}
                              </Link>
                              {project.client_id?.kyc_details?.is_verified && <CheckCircle className="w-4 h-4 text-blue-500 ml-1 inline" />}
                              <div className="text-sm text-neutral-400">{project.location || 'Remote'}</div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm mb-4">
                            <span className="text text-neutral-400">Rating</span>
                            <div className="flex items-center gap-1 font-medium text-white">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /> 4.8
                            </div>
                          </div>
                          {!canSeeFullDetails && (
                            <div className="text-center py-2 border-t border-neutral-800 mt-4">
                              <button onClick={() => setShowUnlockModal(true)} className="text-[#F24C20] text-xs font-bold hover:underline flex items-center justify-center gap-1 mx-auto">
                                <Lock className="w-3 h-3" /> Unlock for Contact Info
                              </button>
                            </div>
                          )}
                          <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg mb-4 text-green-400 text-sm font-medium">
                            <Shield className="w-4 h-4" /> Payment Verified
                          </div>
                          <div className="text-xs text-neutral-500">
                            Member since {new Date(project.client_id?.createdAt || project.createdAt).toLocaleDateString()}
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-6">
                          <div className="w-16 h-16 bg-neutral-800 rounded-full mx-auto mb-4 flex items-center justify-center"><Lock className="w-6 h-6 text-neutral-600" /></div>
                          <p className="text-sm text-neutral-500 mb-4 px-4">Client identity is hidden. Unlock the project to see profile and ratings.</p>
                          <button onClick={() => setShowUnlockModal(true)} className="text-[#F24C20] font-bold text-sm hover:underline">Unlock Now</button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Project Activity */}
                  <div className="p-6 bg-gradient-to-br from-neutral-900 to-neutral-900/50 border border-neutral-800 rounded-2xl">
                    <h3 className="font-bold mb-4 text-white">Project Activity</h3>
                    <div className="flex items-center justify-between text-sm text-neutral-400">
                      <div className="flex items-center gap-2"><FileText className="w-4 h-4" /> Proposals</div>
                      <span className="font-bold text-white">
                        {project.proposals <= 5 ? 'Less than 5' : project.proposals <= 10 ? '5-10' : project.proposals <= 20 ? '10-20' : '20+'}
                      </span>
                    </div>
                  </div>

                  {/* Quick Questions */}
                  <div className="p-6 bg-neutral-900/50 border border-neutral-800 rounded-2xl">
                    <h3 className="font-bold mb-4 text-white">Quick Questions</h3>
                    <div className="space-y-3">
                      <details className="group">
                        <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-neutral-300 hover:text-[#F24C20] transition-colors">Is this fixed or hourly?</summary>
                        <p className="mt-2 text-sm text-neutral-400">This is a {project.budget_range ? 'Fixed/Negotiable' : 'N/A'} project.</p>
                      </details>
                      <details className="group">
                        <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-neutral-300 hover:text-[#F24C20] transition-colors">Can I submit a sample?</summary>
                        <p className="mt-2 text-sm text-neutral-400">Yes, you can include relevant portfolio samples in your proposal.</p>
                      </details>
                    </div>
                  </div>
                </>
              )}

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
