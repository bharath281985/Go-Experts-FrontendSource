import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '@/app/components/ThemeProvider';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Camera,
  IndianRupee,
  X,
  MapPin,
  Clock,
  Briefcase,
  AlertTriangle,
  Trash2,
  Mail,
  Search,
  Plus,
  ShieldCheck,
  FileText,
  Link as LinkIcon,
  Upload,
  ExternalLink,
  Trash,
  CheckCircle,
  Users
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import api from '@/app/utils/api';
import { toast } from 'sonner';

type TabType = 'profile' | 'portfolio' | 'verification' | 'security' | 'privacy';

export default function Settings() {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    bio: '',
    profile_image: '',
    categories: [] as string[],
    skills: [] as string[],
    hourly_rate: 0,
    location: '',
    experience_level: '',
    availability: '',
    work_preference: '',
    portfolio: [] as any[],
    kyc_details: {
      pan_card: '',
      aadhar_card: '',
      is_verified: false
    },
    documents: {
      educational: [] as string[],
      experience_letter: ''
    },
    work_images: [] as string[],
    roles: [] as string[],
    kyc_status: 'unverified'
  });

  const [dbSkills, setDbSkills] = useState<any[]>([]);
  const [dbCategories, setDbCategories] = useState<{ _id: string, name: string }[]>([]);
  const [customSkill, setCustomSkill] = useState('');
  const [skillSearchQuery, setSkillSearchQuery] = useState('');
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const [catSearchQuery, setCatSearchQuery] = useState('');
  const [showCatDropdown, setShowCatDropdown] = useState(false);

  /* passwordData removed as we now use email reset links */

  useEffect(() => {
    fetchProfile();
    fetchSkills();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/cms/categories');
      if (response.data.success) {
        setDbCategories(response.data.categories.filter((c: any) => c.is_active));
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const fetchSkills = async () => {
    try {
      const response = await api.get('/cms/skills');
      if (response.data.success) {
        setDbSkills(response.data.skills.filter((s: any) => s.is_active));
      }
    } catch (error) {
      console.error('Failed to load skills:', error);
    }
  };

  const toggleCategory = (catId: string) => {
    if (formData.categories.includes(catId)) {
      setFormData({ ...formData, categories: formData.categories.filter(c => c !== catId) });
    } else {
      if (formData.categories.length >= 4) {
        toast.error('You can only select up to 4 categories');
        return;
      }
      setFormData({ ...formData, categories: [...formData.categories, catId] });
    }
  };

  const toggleSkill = (skillId: string) => {
    if (formData.skills.includes(skillId)) {
      setFormData({ ...formData, skills: formData.skills.filter(s => s !== skillId) });
    } else {
      setFormData({ ...formData, skills: [...formData.skills, skillId] });
    }
  };

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/auth/me');
      if (response.data.success) {
        const user = response.data.user;
        setFormData({
          full_name: user.full_name || '',
          email: user.email || '',
          phone_number: user.phone_number || '',
          bio: user.bio || '',
          profile_image: user.profile_image || '',
          categories: user.categories || [],
          skills: user.skills || [],
          hourly_rate: user.hourly_rate || 0,
          location: user.location || '',
          experience_level: user.experience_level || '',
          availability: user.availability || '',
          work_preference: user.work_preference || '',
          portfolio: user.portfolio || [],
          kyc_details: user.kyc_details || { pan_card: '', aadhar_card: '', is_verified: false },
          documents: user.documents || { educational: [], experience_letter: '' },
          work_images: user.work_images || [],
          roles: user.roles || [],
          kyc_status: user.kyc_status || 'unverified'
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await api.put('/auth/update-profile', formData);
      if (response.data.success) {
        toast.success('Profile updated successfully!');
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...storedUser, ...response.data.user }));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error updating profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append('profile', file);

    setIsSaving(true);
    try {
      const response = await api.put('/auth/update-profile', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.success) {
        setFormData(prev => ({ ...prev, profile_image: response.data.user.profile_image }));
        toast.success('Profile photo updated!');
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...storedUser, profile_image: response.data.user.profile_image }));
      }
    } catch (error) {
      toast.error('Error uploading photo');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendResetLink = async () => {
    setIsSaving(true);
    try {
      const response = await api.post('/auth/forgot-password', { email: formData.email });
      if (response.data.success) {
        toast.success('Security link sent to your email!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error sending link');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddProject = () => {
    setFormData({
      ...formData,
      portfolio: [
        ...formData.portfolio,
        { title: '', description: '', links: [''], duration_days: 0, image: '' }
      ]
    });
  };

  const handleRemoveProject = (index: number) => {
    const newPortfolio = [...formData.portfolio];
    newPortfolio.splice(index, 1);
    setFormData({ ...formData, portfolio: newPortfolio });
  };

  const handleProjectLinkChange = (pIndex: number, lIndex: number, value: string) => {
    const newPortfolio = [...formData.portfolio];
    newPortfolio[pIndex].links[lIndex] = value;
    setFormData({ ...formData, portfolio: newPortfolio });
  };

  const handleAddProjectLink = (pIndex: number) => {
    const newPortfolio = [...formData.portfolio];
    newPortfolio[pIndex].links.push('');
    setFormData({ ...formData, portfolio: newPortfolio });
  };

  // Replace your handleFileUpload function with this:
  const handleFileUpload = async (field: 'pan_card' | 'aadhar_card' | 'educational' | 'experience_letter' | 'work_images', file: File) => {
    const formDataUpload = new FormData();

    // Append the file with the correct field name
    if (field === 'educational') {
      // For educational documents, we need to append multiple files
      formDataUpload.append('educational', file);
    } else {
      formDataUpload.append(field, file);
    }

    setIsSaving(true);
    try {
      const response = await api.put('/auth/update-profile', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        toast.success('Document uploaded successfully!');

        // Fetch the updated profile to get the new data
        await fetchProfile();

        // Force a re-render by updating a state that triggers UI refresh
        setFormData(prev => ({ ...prev }));
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload document');
    } finally {
      setIsSaving(false);
    }
  };

  // Fix the handleRemoveFile function
  const handleRemoveFile = async (field: 'pan_card' | 'aadhar_card' | 'educational' | 'experience_letter', index?: number) => {
    setIsSaving(true);
    try {
      let updateData: any = {};

      if (field === 'pan_card') {
        updateData.kyc_details = { ...formData.kyc_details, pan_card: '' };
      } else if (field === 'aadhar_card') {
        updateData.kyc_details = { ...formData.kyc_details, aadhar_card: '' };
      } else if (field === 'experience_letter') {
        updateData.documents = { ...formData.documents, experience_letter: '' };
      } else if (field === 'educational' && index !== undefined) {
        const newEdu = [...(formData.documents?.educational || [])];
        newEdu.splice(index, 1);
        updateData.documents = { ...formData.documents, educational: newEdu };
      }

      const response = await api.put('/auth/update-profile', updateData);
      if (response.data.success) {
        toast.success('Document removed successfully');
        await fetchProfile(); // Refresh the profile data
      }
    } catch (error: any) {
      console.error('Remove error:', error);
      toast.error(error.response?.data?.message || 'Failed to remove document');
    } finally {
      setIsSaving(false);
    }
  };

  // Fix the handlePhotoChange function
  // const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (!file) return;

  //   // Validate file type
  //   if (!file.type.startsWith('image/')) {
  //     toast.error('Please upload an image file');
  //     return;
  //   }

  //   // Validate file size (max 5MB)
  //   if (file.size > 5 * 1024 * 1024) {
  //     toast.error('Image size should be less than 5MB');
  //     return;
  //   }

  //   const formDataUpload = new FormData();
  //   formDataUpload.append('profile', file);

  //   setIsSaving(true);
  //   try {
  //     const response = await api.put('/auth/update-profile', formDataUpload, {
  //       headers: { 'Content-Type': 'multipart/form-data' }
  //     });

  //     if (response.data.success) {
  //       setFormData(prev => ({ ...prev, profile_image: response.data.user.profile_image }));
  //       toast.success('Profile photo updated!');

  //       // Update local storage
  //       const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  //       localStorage.setItem('user', JSON.stringify({ ...storedUser, profile_image: response.data.user.profile_image }));

  //       // Force re-render
  //       await fetchProfile();
  //     }
  //   } catch (error: any) {
  //     console.error('Photo upload error:', error);
  //     toast.error(error.response?.data?.message || 'Error uploading photo');
  //   } finally {
  //     setIsSaving(false);
  //   }
  // };

  // const handleRemoveFile = async (field: 'pan_card' | 'aadhar_card' | 'educational' | 'experience_letter', index?: number) => {
  //   setIsSaving(true);
  //   try {
  //     let updateData: any = {};

  //     if (field === 'pan_card' || field === 'aadhar_card') {
  //       updateData.kyc_details = { ...formData.kyc_details, [field]: '' };
  //     } else if (field === 'experience_letter') {
  //       updateData.documents = { ...formData.documents, experience_letter: '' };
  //     } else if (field === 'educational' && index !== undefined) {
  //       const newEdu = [...formData.documents.educational];
  //       newEdu.splice(index, 1);
  //       updateData.documents = { ...formData.documents, educational: newEdu };
  //     }

  //     const response = await api.put('/auth/update-profile', updateData);
  //     if (response.data.success) {
  //       toast.success('Document removed');
  //       fetchProfile();
  //     }
  //   } catch (error) {
  //     toast.error('Failed to remove document');
  //   } finally {
  //     setIsSaving(false);
  //   }
  // };

  const handleDeleteAccount = async () => {
    setIsSaving(true);
    try {
      const response = await api.delete('/auth/delete-account');
      if (response.data.success) {
        toast.success('Account deleted successfully');
        localStorage.clear();
        window.location.href = '/';
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error deleting account');
    } finally {
      setIsSaving(false);
      setShowDeleteModal(false);
    }
  };

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'profile', label: 'Profile Settings', icon: User },
    { id: 'portfolio', label: 'My Portfolio', icon: Briefcase },
    { id: 'verification', label: 'Verification (KYC)', icon: ShieldCheck },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'privacy', label: 'Delete Account', icon: Trash2 },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#F24C20] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>Settings</h1>
        <p className={`mt-2 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>Manage your account settings and preferences</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <motion.div
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          className={`lg:col-span-1 p-4 rounded-2xl border backdrop-blur-sm h-fit ${isDarkMode ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white/50 border-neutral-200'}`}
        >
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === tab.id
                    ? 'bg-[#F24C20]/10 text-[#F24C20] border border-[#F24C20]/30'
                    : isDarkMode ? 'text-neutral-400 hover:bg-neutral-800 hover:text-white' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </motion.div>

        {/* Content Area */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          className={`lg:col-span-3 p-8 rounded-2xl border backdrop-blur-sm ${isDarkMode ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white/50 border-neutral-200'}`}
        >
          {activeTab === 'portfolio' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>My Portfolio Projects</h2>
                  <p className="text-sm text-neutral-500 mt-1">Showcase your best work and completed projects.</p>
                </div>
                <button
                  onClick={handleAddProject}
                  className="flex items-center gap-2 px-4 py-2 bg-[#F24C20] text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Add Project
                </button>
              </div>

              {formData.portfolio.length === 0 ? (
                <div className={`p-12 text-center rounded-2xl border-2 border-dashed ${isDarkMode ? 'border-neutral-800 bg-neutral-900/20' : 'border-neutral-200 bg-neutral-50'}`}>
                  <Briefcase className="w-12 h-12 text-neutral-500 mx-auto mb-4 opacity-50" />
                  <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>No projects added yet</h3>
                  <p className="text-sm text-neutral-500 mt-2 max-w-xs mx-auto mb-6">Adding projects helps build confidence with potential clients.</p>
                  <button onClick={handleAddProject} className="px-6 py-2 bg-[#044071] text-white rounded-lg hover:bg-[#055a99]">Add Your First Project</button>
                </div>
              ) : (
                <div className="space-y-6">
                  {formData.portfolio.map((project, pIndex) => (
                    <div key={pIndex} className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-neutral-800/30 border-neutral-700' : 'bg-white border-neutral-200'}`}>
                      <div className="flex justify-between items-start mb-6">
                        <h3 className="font-bold flex items-center gap-2">Project #{pIndex + 1}</h3>
                        <button onClick={() => handleRemoveProject(pIndex)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                          <Trash className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-1">
                          <label className="block text-sm font-medium mb-2">Project Title</label>
                          <input
                            type="text"
                            value={project.title}
                            onChange={(e) => {
                              const newPortfolio = [...formData.portfolio];
                              newPortfolio[pIndex].title = e.target.value;
                              setFormData({ ...formData, portfolio: newPortfolio });
                            }}
                            placeholder="e.g. E-commerce Platform"
                            className={`w-full px-4 py-3 rounded-xl border ${isDarkMode ? 'bg-neutral-800/50 border-neutral-700 text-white' : 'bg-white border-neutral-300 text-neutral-900'} outline-none focus:border-[#F24C20]`}
                          />
                        </div>

                        <div className="md:col-span-1">
                          <label className="block text-sm font-medium mb-2">Completion Duration (in Days)</label>
                          <div className="relative">
                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                            <input
                              type="number"
                              value={project.duration_days || ''}
                              onChange={(e) => {
                                const newPortfolio = [...formData.portfolio];
                                newPortfolio[pIndex].duration_days = Number(e.target.value);
                                setFormData({ ...formData, portfolio: newPortfolio });
                              }}
                              className={`w-full pl-12 pr-4 py-3 rounded-xl border ${isDarkMode ? 'bg-neutral-800/50 border-neutral-700 text-white' : 'bg-white border-neutral-300 text-neutral-900'} outline-none focus:border-[#F24C20]`}
                            />
                          </div>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium mb-2">Description</label>
                          <textarea
                            rows={3}
                            value={project.description}
                            onChange={(e) => {
                              const newPortfolio = [...formData.portfolio];
                              newPortfolio[pIndex].description = e.target.value;
                              setFormData({ ...formData, portfolio: newPortfolio });
                            }}
                            className={`w-full px-4 py-3 rounded-xl border ${isDarkMode ? 'bg-neutral-800/50 border-neutral-700 text-white' : 'bg-white border-neutral-300 text-neutral-900'} outline-none focus:border-[#F24C20] resize-none`}
                          />
                        </div>

                        <div className="md:col-span-2">
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium">Project Links</label>
                            <button
                              onClick={() => handleAddProjectLink(pIndex)}
                              className="text-xs font-bold text-[#F24C20] hover:underline"
                            >
                              + Add URL
                            </button>
                          </div>
                          <div className="space-y-3">
                            {project.links && project.links.map((link: string, lIndex: number) => (
                              <div key={lIndex} className="relative flex gap-2">
                                <LinkIcon className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500`} />
                                <input
                                  type="url"
                                  value={link}
                                  onChange={(e) => handleProjectLinkChange(pIndex, lIndex, e.target.value)}
                                  placeholder="e.g. https://github.com/project"
                                  className={`w-full pl-12 pr-10 py-3 rounded-xl border ${isDarkMode ? 'bg-neutral-950 border-neutral-700 text-white font-mono text-xs' : 'bg-neutral-50 border-neutral-300 text-neutral-900 font-mono text-xs'} outline-none focus:border-[#F24C20]`}
                                />
                                {project.links.length > 1 && (
                                  <button
                                    onClick={() => {
                                      const newPortfolio = [...formData.portfolio];
                                      newPortfolio[pIndex].links.splice(lIndex, 1);
                                      setFormData({ ...formData, portfolio: newPortfolio });
                                    }}
                                    className="p-3 text-red-500"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="pt-4">
                    <button
                      onClick={handleUpdateProfile}
                      disabled={isSaving}
                      className="px-10 py-4 bg-[#044071] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#055a99] disabled:opacity-50 min-w-[180px]"
                    >
                      {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Portfolio'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'verification' && (
            <div className="space-y-8">
              <div>
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>Verification & KYC</h2>
                <p className="text-sm text-neutral-500 mt-1">Verify your identity to earn the "Verified Expert" badge.</p>
              </div>

              {formData.kyc_details.is_verified && (
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-green-500" />
                  <div className="text-sm">
                    <p className="font-bold text-green-500">Account Verified</p>
                    <p className="text-green-600/70">Your documents have been approved by our team.</p>
                  </div>
                </div>
              )}

              {!formData.kyc_details.is_verified && formData.kyc_status === 'pending' && (
                <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center gap-3">
                  <Clock className="w-6 h-6 text-orange-500" />
                  <div className="text-sm">
                    <p className="font-bold text-orange-500">Verification in Progress</p>
                    <p className="text-orange-600/70">Our team is currently reviewing your documents. This usually takes 24-48 hours.</p>
                  </div>
                </div>
              )}

              {!formData.kyc_details.is_verified && formData.kyc_status === 'rejected' && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                  <div className="text-sm">
                    <p className="font-bold text-red-500">Verification Declined</p>
                    <p className="text-red-600/70">Please check your email for the reason and re-upload the documents.</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* ID Verification */}
                <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-neutral-800/30 border-neutral-700' : 'bg-white border-neutral-200'}`}>
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-[#F24C20]" />
                    Identity Proof
                  </h3>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-neutral-400">PAN Card (PDF or Image)</label>
                      <div className={`relative p-4 rounded-xl border-2 border-dashed ${isDarkMode ? 'border-neutral-700 hover:border-neutral-600' : 'border-neutral-200 hover:border-neutral-300'} transition-colors`}>
                        {formData.kyc_details.pan_card ? (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileText className="w-5 h-5 text-[#F24C20]" />
                              <span className="text-xs truncate max-w-[120px]">PAN card uploaded</span>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${formData.kyc_details.pan_card}`, '_blank')} className="text-xs text-blue-500 hover:underline">View</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center py-2">
                            <Upload className="w-6 h-6 text-neutral-500 mb-2" />
                            <input
                              type="file"
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              accept=".pdf,image/*"
                              onChange={(e) => e.target.files?.[0] && handleFileUpload('pan_card', e.target.files[0])}
                            />
                            <p className="text-xs text-neutral-500">Click to upload PAN</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-neutral-400">Aadhar Card (PDF or Image)</label>
                      <div className={`relative p-4 rounded-xl border-2 border-dashed ${isDarkMode ? 'border-neutral-700 hover:border-neutral-600' : 'border-neutral-200 hover:border-neutral-300'} transition-colors`}>
                        {formData.kyc_details.aadhar_card ? (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileText className="w-5 h-5 text-[#F24C20]" />
                              <span className="text-xs truncate max-w-[120px]">Aadhar uploaded</span>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${formData.kyc_details.aadhar_card}`, '_blank')} className="text-xs text-blue-500 hover:underline">View</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center py-2">
                            <Upload className="w-6 h-6 text-neutral-500 mb-2" />
                            <input
                              type="file"
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              accept=".pdf,image/*"
                              onChange={(e) => e.target.files?.[0] && handleFileUpload('aadhar_card', e.target.files[0])}
                            />
                            <p className="text-xs text-neutral-500">Click to upload Aadhar</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Professional Documents */}
                <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-neutral-800/30 border-neutral-700' : 'bg-white border-neutral-200'}`}>
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-[#F24C20]" />
                    Professional Proof
                  </h3>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-neutral-400">Educational Certificates</label>
                      <div className="space-y-3">
                        {formData.documents.educational.map((file, idx) => (
                          <div key={idx} className={`flex items-center justify-between p-3 rounded-xl border ${isDarkMode ? 'bg-neutral-900 border-neutral-700' : 'bg-neutral-50 border-neutral-200'}`}>
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-[#F24C20]" />
                              <span className="text-[10px] truncate max-w-[150px]">Certificate {idx + 1}</span>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${file}`, '_blank')} className="text-[10px] text-blue-500 hover:underline">View</button>
                            </div>
                          </div>
                        ))}

                        {!formData.kyc_details.is_verified && (
                          <div className={`relative p-4 rounded-xl border-2 border-dashed ${isDarkMode ? 'border-neutral-700 hover:border-neutral-600' : 'border-neutral-200 hover:border-neutral-300'} transition-colors`}>
                            <div className="flex flex-col items-center py-2 text-center">
                              <Plus className="w-6 h-6 text-neutral-500 mb-2" />
                              <input
                                type="file"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                accept=".pdf,image/*"
                                onChange={(e) => e.target.files?.[0] && handleFileUpload('educational', e.target.files[0])}
                              />
                              <p className="text-xs text-neutral-500">Upload degree or diploma</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-neutral-400">Experience Letter (Optional)</label>
                      <div className={`relative p-4 rounded-xl border-2 border-dashed ${isDarkMode ? 'border-neutral-700 hover:border-neutral-600' : 'border-neutral-200 hover:border-neutral-300'} transition-colors`}>
                        {formData.documents.experience_letter ? (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileText className="w-5 h-5 text-[#F24C20]" />
                              <span className="text-xs truncate max-w-[120px]">Exp Letter uploaded</span>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${formData.documents.experience_letter}`, '_blank')} className="text-xs text-blue-500 hover:underline">View</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center py-2">
                            <Upload className="w-6 h-6 text-neutral-500 mb-2" />
                            <input
                              type="file"
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              accept=".pdf,image/*"
                              onChange={(e) => e.target.files?.[0] && handleFileUpload('experience_letter', e.target.files[0])}
                            />
                            <p className="text-xs text-neutral-500">Click to upload letter</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`p-6 rounded-2xl bg-[#044071]/5 border border-[#044071]/20`}>
                <div className="flex gap-4">
                  <div className="p-3 rounded-xl bg-[#044071]/10 h-fit">
                    <ShieldCheck className="w-6 h-6 text-[#044071]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#044071]">Why we need this?</h4>
                    <p className="text-sm text-neutral-600 mt-1 leading-relaxed">
                      Verification helps maintain the quality of GoExperts and prevents fraud. Verified experts are more likely to be hired and can command higher rates. Your data is stored securely and only accessible by authorized staff.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>Profile Settings</h2>

              <div>
                <label className="block text-sm font-medium mb-3">Profile Photo</label>
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <img
                      src={formData.profile_image ? (formData.profile_image.startsWith('http') ? formData.profile_image : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${formData.profile_image.startsWith('/') ? '' : '/'}${formData.profile_image.replace(/\\/g, '/')}`) : "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80"}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-2 border-[#F24C20]/30"
                    />
                    <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-6 h-6 text-white" />
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoChange} />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => fileInputRef.current?.click()} className="px-6 py-2 bg-[#044071] text-white rounded-lg font-medium hover:bg-[#044071]/90">Change Photo</button>
                    <button onClick={async () => {
                      setIsSaving(true);
                      try {
                        const response = await api.put('/auth/update-profile', { profile_image: '' });
                        if (response.data.success) {
                          setFormData(prev => ({ ...prev, profile_image: '' }));
                          toast.success('Photo removed');
                        }
                      } catch (err) { } finally { setIsSaving(false); }
                    }} className={`px-6 py-2 rounded-lg font-medium transition-colors ${isDarkMode ? 'border border-neutral-700 text-neutral-300 hover:bg-neutral-800' : 'border border-neutral-300 text-neutral-700 hover:bg-neutral-50'}`}>Remove</button>
                  </div>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                {/* Account Roles Section */}
                <div className={`p-6 rounded-2xl border mb-6 ${isDarkMode ? 'bg-neutral-800/30 border-neutral-700' : 'bg-neutral-50 border-neutral-200'}`}>
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#F24C20]" />
                    Account Roles
                  </h3>
                  <p className="text-sm text-neutral-500 mb-6">Your currently registered roles on Go Experts.</p>

                  <div className="flex flex-wrap gap-4">
                    {formData.roles.map((role) => {
                      const isSelected = formData.roles.includes(role);
                      const Icon = role === 'client' ? Users : (role === 'freelancer' ? Briefcase : (role === 'admin' ? ShieldCheck : User));

                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() => {
                            if (isSelected && formData.roles.length === 1) {
                              toast.error('You must have at least one role.');
                              return;
                            }
                            const newRoles = isSelected
                              ? formData.roles.filter(r => r !== role)
                              : [...formData.roles, role];
                            setFormData({ ...formData, roles: newRoles });
                          }}
                          className={`flex-1 flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${isSelected
                            ? 'border-[#F24C20] bg-[#F24C20]/10 text-[#F24C20]'
                            : 'border-neutral-800 bg-neutral-900/50 text-neutral-500 hover:border-neutral-700'
                            }`}
                        >
                          <div className={`p-2 rounded-lg ${isSelected ? 'bg-[#F24C20] text-white' : 'bg-neutral-800 text-neutral-500'}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="text-left">
                            <div className="font-bold capitalize">{role}</div>
                            <div className="text-[10px] opacity-70">
                              {role === 'client' ? 'I want to hire others' : (role === 'freelancer' ? 'I want to work as an expert' : `Manage your ${role} role`)}
                            </div>
                          </div>
                          {isSelected && <CheckCircle className="w-5 h-5 ml-auto" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <input type="text" value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} className={`w-full px-4 py-3 rounded-xl border ${isDarkMode ? 'bg-neutral-800/50 border-neutral-700 text-white' : 'bg-white border-neutral-300 text-neutral-900'} outline-none focus:border-[#F24C20] transition-colors`} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address</label>
                    <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className={`w-full px-4 py-3 rounded-xl border ${isDarkMode ? 'bg-neutral-800/50 border-neutral-700 text-white' : 'bg-white border-neutral-300 text-neutral-900'} outline-none focus:border-[#F24C20] transition-colors`} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number</label>
                    <input type="tel" value={formData.phone_number} onChange={e => setFormData({ ...formData, phone_number: e.target.value })} className={`w-full px-4 py-3 rounded-xl border ${isDarkMode ? 'bg-neutral-800/50 border-neutral-700 text-white' : 'bg-white border-neutral-300 text-neutral-900'} outline-none focus:border-[#F24C20] transition-colors`} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                      <input type="text" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} className={`w-full pl-12 pr-4 py-3 rounded-xl border ${isDarkMode ? 'bg-neutral-800/50 border-neutral-700 text-white' : 'bg-white border-neutral-300 text-neutral-900'} outline-none focus:border-[#F24C20] transition-colors`} placeholder="e.g. Mumbai, India" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Bio</label>
                  <textarea rows={4} value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} className={`w-full px-4 py-3 rounded-xl border ${isDarkMode ? 'bg-neutral-800/50 border-neutral-700 text-white' : 'bg-white border-neutral-300 text-neutral-900'} outline-none focus:border-[#F24C20] transition-colors resize-none`} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Experience Level</label>
                    <div className="relative">
                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                      <select value={formData.experience_level} onChange={e => setFormData({ ...formData, experience_level: e.target.value })} className={`w-full pl-12 pr-4 py-3 rounded-xl border ${isDarkMode ? 'bg-neutral-800/50 border-neutral-700 text-white' : 'bg-white border-neutral-300 text-neutral-900'} outline-none focus:border-[#F24C20] appearance-none`}>
                        <option value="">Select Level</option>
                        <option value="entry">Entry Level</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="expert">Expert</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Hourly Rate</label>
                    <div className="relative">
                      <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                      <input type="number" value={formData.hourly_rate || ''} onChange={e => setFormData({ ...formData, hourly_rate: Number(e.target.value) })} className={`w-full pl-12 pr-4 py-3 rounded-xl border ${isDarkMode ? 'bg-neutral-800/50 border-neutral-700 text-white' : 'bg-white border-neutral-300 text-neutral-900'} outline-none focus:border-[#F24C20] transition-colors`} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Availability</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                      <select value={formData.availability} onChange={e => setFormData({ ...formData, availability: e.target.value })} className={`w-full pl-12 pr-4 py-3 rounded-xl border ${isDarkMode ? 'bg-neutral-800/50 border-neutral-700 text-white' : 'bg-white border-neutral-300 text-neutral-900'} outline-none focus:border-[#F24C20] appearance-none`}>
                        <option value="">Select Availability</option>
                        <option value="full-time">Full Time</option>
                        <option value="part-time">Part Time</option>
                        <option value="freelance">Freelance</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Work Preference</label>
                    <div className="relative">
                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                      <select value={formData.work_preference} onChange={e => setFormData({ ...formData, work_preference: e.target.value })} className={`w-full pl-12 pr-4 py-3 rounded-xl border ${isDarkMode ? 'bg-neutral-800/50 border-neutral-700 text-white' : 'bg-white border-neutral-300 text-neutral-900'} outline-none focus:border-[#F24C20] appearance-none`}>
                        <option value="">Select Preference</option>
                        <option value="remote">Remote</option>
                        <option value="on-site">On-site</option>
                        <option value="hybrid">Hybrid</option>
                      </select>
                    </div>
                  </div>
                </div>

                {formData.roles.includes('freelancer') && (
                  <div>
                    <label className="block text-sm font-medium mb-4">Your Expert Categories</label>
                    <p className="text-xs text-neutral-500 mb-4 -mt-2">Select up to 4 domains to filter relevant skills automatically</p>
  
                    <div className="relative mb-6">
                      <div className={`p-1 rounded-xl border ${isDarkMode ? 'bg-neutral-800/50 border-neutral-700' : 'bg-white border-neutral-300'} flex items-center gap-2`}>
                        <Search className="w-5 h-5 ml-3 text-neutral-500" />
                        <input
                          type="text"
                          placeholder="Search more categories..."
                          value={catSearchQuery}
                          onChange={(e) => {
                            setCatSearchQuery(e.target.value);
                            setShowCatDropdown(true);
                          }}
                          onFocus={() => setShowCatDropdown(true)}
                          className="flex-1 bg-transparent py-2.5 px-2 outline-none text-sm"
                        />
                      </div>
  
                      <AnimatePresence>
                        {showCatDropdown && catSearchQuery && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowCatDropdown(false)} />
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              className={`absolute top-full left-0 right-0 mt-2 p-2 rounded-xl border shadow-2xl z-20 max-h-60 overflow-y-auto ${isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'}`}
                            >
                              {dbCategories
                                .filter(c => c.name.toLowerCase().includes(catSearchQuery.toLowerCase()))
                                .map(cat => (
                                  <button
                                    key={cat._id}
                                    type="button"
                                    onClick={() => {
                                      toggleCategory(cat._id);
                                      setCatSearchQuery('');
                                      setShowCatDropdown(false);
                                    }}
                                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm flex items-center justify-between group transition-colors ${formData.categories.includes(cat._id)
                                      ? 'bg-[#F24C20]/10 text-[#F24C20]'
                                      : isDarkMode ? 'hover:bg-neutral-800 text-neutral-300' : 'hover:bg-neutral-50 text-neutral-700'
                                      }`}
                                  >
                                    <span>{cat.name}</span>
                                    {formData.categories.includes(cat._id) ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100" />}
                                  </button>
                                ))}
                              {dbCategories.filter(c => c.name.toLowerCase().includes(catSearchQuery.toLowerCase())).length === 0 && (
                                <div className="p-4 text-center text-sm text-neutral-500">No categories found</div>
                              )}
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
  
                    <div className="flex flex-wrap gap-3 mb-6">
                      {/* Render top 5 defaults */}
                      {dbCategories.slice(0, 5).map((cat) => {
                        const isSelected = formData.categories.includes(cat._id);
                        return (
                          <button key={cat._id} type="button" onClick={() => toggleCategory(cat._id)} className={`px-4 py-2 rounded-lg border-2 transition-all font-medium ${isSelected ? 'border-[#F24C20] bg-[#F24C20]/10 text-[#F24C20]' : isDarkMode ? 'border-neutral-700 bg-neutral-800/50 text-neutral-300 hover:border-neutral-600' : 'border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400'}`}>
                            {cat.name}
                          </button>
                        );
                      })}
                      {/* Render other selected categories not in top 5 */}
                      {dbCategories
                        .filter(cat => formData.categories.includes(cat._id) && !dbCategories.slice(0, 5).find(c => c._id === cat._id))
                        .map((cat) => (
                          <button key={cat._id} type="button" onClick={() => toggleCategory(cat._id)} className={`px-4 py-2 rounded-lg border-2 transition-all font-medium border-[#F24C20] bg-[#F24C20]/10 text-[#F24C20]`}>
                            {cat.name}
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {formData.roles.includes('freelancer') && (
                  <div>
                    <label className="block text-sm font-medium mb-4">Select Your Skills</label>
                    <div className="relative mb-6">
                      <div className={`p-1 rounded-xl border ${isDarkMode ? 'bg-neutral-800/50 border-neutral-700' : 'bg-white border-neutral-300'} flex items-center gap-2`}>
                        <Search className="w-5 h-5 ml-3 text-neutral-500" />
                        <input
                          type="text"
                          placeholder="Search skills (e.g. React, Node.js...)"
                          value={skillSearchQuery}
                          onChange={(e) => {
                            setSkillSearchQuery(e.target.value);
                            setShowSkillDropdown(true);
                          }}
                          onFocus={() => setShowSkillDropdown(true)}
                          className="flex-1 bg-transparent py-2.5 px-2 outline-none text-sm"
                        />
                      </div>
  
                      <AnimatePresence>
                        {showSkillDropdown && skillSearchQuery && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowSkillDropdown(false)} />
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              className={`absolute top-full left-0 right-0 mt-2 p-2 rounded-xl border shadow-2xl z-20 max-h-60 overflow-y-auto ${isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'}`}
                            >
                              {dbSkills
                                .filter(s => {
                                  const matchesQuery = s.name.toLowerCase().includes(skillSearchQuery.toLowerCase());
                                  const inCategory = formData.categories.length === 0 || !s.category?._id || formData.categories.includes(s.category._id);
                                  return matchesQuery && inCategory;
                                })
                                .map(skill => (
                                  <button
                                    key={skill._id}
                                    type="button"
                                    onClick={() => {
                                      toggleSkill(skill._id);
                                      setSkillSearchQuery('');
                                      setShowSkillDropdown(false);
                                    }}
                                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm flex items-center justify-between group transition-colors ${formData.skills.includes(skill._id)
                                      ? 'bg-[#F24C20]/10 text-[#F24C20]'
                                      : isDarkMode ? 'hover:bg-neutral-800 text-neutral-300' : 'hover:bg-neutral-50 text-neutral-700'
                                      }`}
                                  >
                                    <span>{skill.name}</span>
                                    {formData.skills.includes(skill._id) ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100" />}
                                  </button>
                                ))
                              }
                              {dbSkills.filter(s => {
                                const matchesQuery = s.name.toLowerCase().includes(skillSearchQuery.toLowerCase());
                                const inCategory = formData.categories.length === 0 || !s.category?._id || formData.categories.includes(s.category._id);
                                return matchesQuery && inCategory;
                              }).length === 0 && (
                                  <div className="p-4 text-center text-sm text-neutral-500">No matching skills found in selected categories</div>
                                )}
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
  
                    <div className="flex flex-wrap gap-3 mb-6 min-h-[44px]">
                      {formData.skills.map((skillId) => {
                        const skillObj = dbSkills.find(s => s._id === skillId);
                        return (
                          <button
                            key={skillId}
                            type="button"
                            onClick={() => toggleSkill(skillId)}
                            className="px-4 py-2 rounded-lg border-2 border-[#F24C20] bg-[#F24C20]/10 text-[#F24C20] hover:bg-[#F24C20] hover:text-white transition-colors flex items-center gap-2 font-medium"
                          >
                            <span>{skillObj ? skillObj.name : 'Unknown Skill'}</span>
                            <X className="w-3 h-3" />
                          </button>
                        )
                      })}
                      {formData.skills.length === 0 && (
                        <p className="text-sm text-neutral-500 italic">No skills selected yet. Use the search bar above to add skills.</p>
                      )}
                    </div>
                  </div>
                )}

                <button type="submit" disabled={isSaving} className="px-8 py-3 bg-[#044071] text-white rounded-xl font-medium hover:bg-[#044071]/90 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[160px]">
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Security Settings</h2>
                <p className="text-sm text-neutral-500">Manage your password and account security</p>
              </div>

              <div className={`p-8 rounded-2xl border backdrop-blur-sm ${isDarkMode ? 'bg-neutral-800/20 border-neutral-700' : 'bg-orange-50/50 border-orange-100'}`}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-[#F24C20]/10 flex items-center justify-center">
                    <Lock className="w-6 h-6 text-[#F24C20]" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>Change Password</h3>
                    <p className="text-sm text-neutral-500">Securely update your account access</p>
                  </div>
                </div>

                <p className={`text-sm mb-8 leading-relaxed ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                  For your security, we use an email-based verification process.
                  Click the button below and we'll send a secure password reset link to your registered email address <strong>{formData.email}</strong>.
                </p>

                <button
                  onClick={handleSendResetLink}
                  disabled={isSaving}
                  className="w-full sm:w-auto px-10 py-4 bg-[#044071] text-white rounded-xl font-bold hover:bg-[#055a99] transition-all shadow-lg shadow-[#044071]/20 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5" />}
                  Send Link to Inbox
                </button>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2 text-red-600">Danger Zone</h2>
                <p className="text-sm text-neutral-500">Permanently delete your account and all associated data</p>
              </div>

              <div className={`p-6 rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/30`}>
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-red-900 dark:text-red-100 mb-1">Delete Account</h3>
                    <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                      This will remove all your projects, gigs, and wallet balance.
                    </p>
                    <button onClick={() => setShowDeleteModal(true)} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">
                      Delete My Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`w-full max-w-md p-8 rounded-3xl border shadow-2xl overflow-hidden relative ${isDarkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-900'}`}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600" />
              
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                
                <h3 className="text-2xl font-bold mb-3">Terminate Account?</h3>
                <p className="text-neutral-500 mb-8 font-medium leading-relaxed">
                  This action is irreversible. All your projects, wallet balance, and expert profile data will be permanently wiped from our systems.
                </p>
                
                <div className="flex w-full gap-4">
                  <button 
                    onClick={() => setShowDeleteModal(false)} 
                    className={`flex-1 px-6 py-4 rounded-xl font-bold border transition-all ${isDarkMode ? 'border-neutral-700 hover:bg-neutral-800' : 'border-neutral-200 hover:bg-neutral-100'}`}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleDeleteAccount} 
                    disabled={isSaving} 
                    className="flex-1 px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-red-600/20 disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Confirm Delete'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
