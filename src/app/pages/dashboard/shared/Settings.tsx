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
  Award,
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
  Users,
  Layout,
  Twitter,
  Facebook,
  Linkedin,
  Instagram,
  Github,
  Youtube,
  Dribbble,
  Share2
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import api, { getImgUrl } from '@/app/utils/api';
import { toast } from 'sonner';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const monthInputToLabel = (value: string) => {
  if (!value) return '';
  const [year, month] = value.split('-');
  const monthIndex = Number(month) - 1;
  if (!year || monthIndex < 0 || monthIndex > 11) return '';
  return `${MONTH_NAMES[monthIndex]} ${year}`;
};

const labelToMonthInput = (value: string) => {
  if (!value || value === 'Present') return '';
  const [monthName, year] = value.trim().split(/\s+/);
  const monthIndex = MONTH_NAMES.findIndex((m) => m.toLowerCase() === monthName?.toLowerCase());
  if (!year || monthIndex === -1) return '';
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
};

const parseYearRange = (yearRange?: string) => {
  const [rawStart = '', rawEnd = ''] = (yearRange || '').split(' - ');
  const start = rawStart.trim();
  const end = rawEnd.trim();
  return { start, end, isCurrent: end === 'Present' };
};

const buildYearRange = (start: string, end: string, isCurrent = false) => {
  if (!start && !end && !isCurrent) return '';
  if (isCurrent) return `${start} - Present`;
  return `${start} - ${end}`;
};

type TabType = 'profile' | 'portfolio' | 'resume' | 'verification' | 'security' | 'privacy' | 'landing';

export default function Settings() {
  const { isDarkMode } = useTheme();
  const monthInputClassName = `w-full px-4 py-2 rounded-xl border text-sm ${isDarkMode
    ? 'bg-neutral-700 border-neutral-500 text-white [color-scheme:dark]'
    : 'bg-neutral-100 border-neutral-300 text-neutral-900 [color-scheme:light]'
    } outline-none focus:border-[#F24C20] disabled:opacity-60 disabled:cursor-not-allowed`;
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<{ url: string; title: string } | null>(null);
  const [landingImagePreview, setLandingImagePreview] = useState('');
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
    kyc_status: 'unverified',
    experience_details: [] as any[],
    education_details: [] as any[],
    languages: [] as string[],
    completed_projects: 0,
    happy_customers: 0,
    review_score: 0,
    role_title: '',
    social_links: {
      facebook: '',
      twitter: '',
      linkedin: '',
      instagram: '',
      github: '',
      behance: '',
      dribbble: '',
      youtube: ''
    },
    landing_page_image: ''
  });

  const [dbSkills, setDbSkills] = useState<any[]>([]);
  const [dbCategories, setDbCategories] = useState<{ _id: string, name: string }[]>([]);
  const [skillSearchQuery, setSkillSearchQuery] = useState('');
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const [catSearchQuery, setCatSearchQuery] = useState('');
  const [showCatDropdown, setShowCatDropdown] = useState(false);

  const getDocumentUrl = (path: string) => `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${path}`;
  const isPdfDocument = (url: string) => url.toLowerCase().includes('.pdf');

  useEffect(() => {
    fetchProfile();
    fetchSkills();
    fetchCategories();
  }, []);

  useEffect(() => {
    return () => {
      if (landingImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(landingImagePreview);
      }
    };
  }, [landingImagePreview]);

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
          kyc_status: user.kyc_status || 'unverified',
          experience_details: user.experience_details || [],
          education_details: user.education_details || [],
          languages: user.languages || [],
          completed_projects: user.completed_projects || 0,
          happy_customers: user.happy_customers || 0,
          review_score: user.review_score || 0,
          role_title: user.role_title || '',
          social_links: user.social_links || {
            facebook: '', twitter: '', linkedin: '', instagram: '',
            github: '', behance: '', dribbble: '', youtube: ''
          },
          landing_page_image: user.landing_page_image || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

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
        await fetchProfile();
      }
    } catch (error) {
      toast.error('Error uploading photo');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setIsSaving(true);
    try {
      const updateData = new FormData();

      const sanitizedPortfolio = formData.portfolio.map(project => {
        const { previews, newFiles, ...rest } = project;
        return {
          ...rest,
          image: rest.image?.startsWith('blob:') ? '' : rest.image,
          images: (rest.images || []).filter((img: string) => !img.startsWith('blob:'))
        };
      });

      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'portfolio') {
          updateData.append(key, JSON.stringify(sanitizedPortfolio));
        } else if (key === 'kyc_details' || key === 'documents' || key === 'social_links' || Array.isArray(value)) {
          updateData.append(key, JSON.stringify(value));
        } else {
          updateData.append(key, String(value));
        }
      });

      formData.portfolio.forEach((project, index) => {
        if (project.newFiles && project.newFiles.length > 0) {
          project.newFiles.forEach((file: File) => {
            updateData.append(`portfolio_images_${index}`, file);
          });
        }
      });

      const response = await api.put('/auth/update-profile', updateData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        const updatedUser = response.data.user;
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...storedUser, ...updatedUser }));

        formData.portfolio.forEach(p => {
          if (p.previews) p.previews.forEach((url: string) => URL.revokeObjectURL(url));
        });
        await fetchProfile();
        toast.success('Profile updated successfully!');
      }

    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error updating profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleProjectImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (files.length > 5) {
      toast.error('You can upload up to 5 images per project');
      return;
    }

    const newPortfolio = [...formData.portfolio];
    if (newPortfolio[index].previews) {
      newPortfolio[index].previews.forEach((u: string) => URL.revokeObjectURL(u));
    }

    newPortfolio[index].newFiles = files;
    newPortfolio[index].previews = files.map(file => URL.createObjectURL(file));

    setFormData({ ...formData, portfolio: newPortfolio });
  };

  const handleLandingImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      toast.error('Image size should be less than 8MB');
      return;
    }

    const formDataUpload = new FormData();
    formDataUpload.append('landing_image', file);
    const localPreviewUrl = URL.createObjectURL(file);
    setLandingImagePreview((prev) => {
      if (prev.startsWith('blob:')) {
        URL.revokeObjectURL(prev);
      }
      return localPreviewUrl;
    });

    setIsSaving(true);
    try {
      const response = await api.put('/auth/update-profile', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.success) {
        const updatedUser = response.data.user;
        setFormData(prev => ({ ...prev, landing_page_image: updatedUser.landing_page_image }));
        setLandingImagePreview(getImgUrl(updatedUser.landing_page_image));
        toast.success('Landing page image updated!');

        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...storedUser, ...updatedUser }));

        await fetchProfile();
      }
    } catch (error) {
      setLandingImagePreview(prev => {
        if (prev.startsWith('blob:')) {
          URL.revokeObjectURL(prev);
        }
        return '';
      });
      toast.error('Error uploading landing image');
    } finally {
      setIsSaving(false);
      e.target.value = '';
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

  const handleAddExperience = () => {
    setFormData({
      ...formData,
      experience_details: [
        ...formData.experience_details,
        { year_range: '', title: '', company: '', description: '' }
      ]
    });
  };

  const handleRemoveExperience = (index: number) => {
    const newExp = [...formData.experience_details];
    newExp.splice(index, 1);
    setFormData({ ...formData, experience_details: newExp });
  };

  const handleAddEducation = () => {
    setFormData({
      ...formData,
      education_details: [
        ...formData.education_details,
        { year_range: '', title: '', institution: '', description: '' }
      ]
    });
  };

  const handleRemoveEducation = (index: number) => {
    const newEdu = [...formData.education_details];
    newEdu.splice(index, 1);
    setFormData({ ...formData, education_details: newEdu });
  };

  const handleFileUpload = async (field: 'pan_card' | 'aadhar_card' | 'educational' | 'experience_letter' | 'work_images', file: File) => {
    const formDataUpload = new FormData();
    if (field === 'educational') {
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
        await fetchProfile();
        setFormData(prev => ({ ...prev }));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload document');
    } finally {
      setIsSaving(false);
    }
  };

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
        await fetchProfile();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove document');
    } finally {
      setIsSaving(false);
    }
  };

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

  const isFreelancer = formData.roles.includes('freelancer');

  const allTabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'profile', label: 'Profile Settings', icon: User },
    { id: 'landing', label: 'Landing Page', icon: Layout },
    { id: 'portfolio', label: 'My Portfolio', icon: Briefcase },
    { id: 'resume', label: 'Experience & Education', icon: FileText },
    { id: 'verification', label: 'Verification (KYC)', icon: ShieldCheck },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'privacy', label: 'Delete Account', icon: Trash2 },
  ];

  const tabs = allTabs.filter(tab => {
    if (tab.id === 'portfolio' || tab.id === 'resume' || tab.id === 'landing') return isFreelancer;
    return true;
  });

  useEffect(() => {
    if (!tabs.find(t => t.id === activeTab)) {
      setActiveTab('profile');
    }
  }, [tabs, activeTab]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#F24C20] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="px-1 md:px-0">
        <h1 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>Settings</h1>
        <p className={`mt-1 md:mt-2 text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>Manage your account settings and preferences</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <motion.div
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          className={`lg:col-span-1 p-2 md:p-4 rounded-2xl border backdrop-blur-sm h-fit ${isDarkMode ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white/50 border-neutral-200'} overflow-x-auto lg:overflow-visible`}
        >
          <nav className="flex lg:flex-col gap-1 min-w-max lg:min-w-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap lg:w-full ${activeTab === tab.id
                    ? 'bg-[#F24C20]/10 text-[#F24C20] border border-[#F24C20]/30'
                    : isDarkMode ? 'text-neutral-400 hover:bg-neutral-800 hover:text-white' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                    }`}
                >
                  <Icon className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-xs md:text-sm font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </motion.div>

        {/* Content Area */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          className={`lg:col-span-3 p-4 md:p-8 rounded-2xl border backdrop-blur-sm ${isDarkMode ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white/50 border-neutral-200'}`}
        >
          {activeTab === 'portfolio' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className={`text-xl md:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>My Portfolio Projects</h2>
                  <p className="text-xs md:text-sm text-neutral-500 mt-1">Showcase your best work and completed projects.</p>
                </div>
                <button onClick={handleAddProject} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-[#F24C20] text-white rounded-lg hover:bg-orange-600 transition-colors">
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
                          <input type="text" value={project.title} onChange={(e) => {
                            const newPortfolio = [...formData.portfolio];
                            newPortfolio[pIndex].title = e.target.value;
                            setFormData({ ...formData, portfolio: newPortfolio });
                          }} placeholder="e.g. E-commerce Platform" className={`w-full px-4 py-3 rounded-xl border ${isDarkMode ? 'bg-neutral-800/50 border-neutral-700 text-white' : 'bg-white border-neutral-300 text-neutral-900'} outline-none focus:border-[#F24C20]`} />
                        </div>
                        <div className="md:col-span-1">
                          <label className="block text-sm font-medium mb-2">Completion Duration (in Days)</label>
                          <div className="relative">
                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                            <input type="number" value={project.duration_days || ''} onChange={(e) => {
                              const newPortfolio = [...formData.portfolio];
                              newPortfolio[pIndex].duration_days = Number(e.target.value);
                              setFormData({ ...formData, portfolio: newPortfolio });
                            }} className={`w-full pl-12 pr-4 py-3 rounded-xl border ${isDarkMode ? 'bg-neutral-800/50 border-neutral-700 text-white' : 'bg-white border-neutral-300 text-neutral-900'} outline-none focus:border-[#F24C20]`} />
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium mb-2">Description</label>
                          <textarea rows={3} value={project.description} onChange={(e) => {
                            const newPortfolio = [...formData.portfolio];
                            newPortfolio[pIndex].description = e.target.value;
                            setFormData({ ...formData, portfolio: newPortfolio });
                          }} className={`w-full px-4 py-3 rounded-xl border ${isDarkMode ? 'bg-neutral-800/50 border-neutral-700 text-white' : 'bg-white border-neutral-300 text-neutral-900'} outline-none focus:border-[#F24C20] resize-none`} />
                        </div>
                        <div className="md:col-span-2">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <label className="text-xs font-bold uppercase tracking-wider opacity-60">Source Links</label>
                                <button type="button" onClick={() => handleAddProjectLink(pIndex)} className="text-[10px] font-bold text-[#F24C20] hover:underline uppercase">+ Link URL</button>
                              </div>
                              <div className="space-y-3">
                                {project.links && project.links.map((link: string, lIndex: number) => (
                                  <div key={lIndex} className="relative flex gap-2">
                                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                                    <input type="url" value={link} onChange={(e) => handleProjectLinkChange(pIndex, lIndex, e.target.value)} placeholder="https://..." className={`w-full pl-11 pr-10 py-2.5 rounded-xl border text-sm ${isDarkMode ? 'bg-neutral-950 border-neutral-700 text-white font-mono' : 'bg-neutral-50 border-neutral-300 text-neutral-900 font-mono'} outline-none focus:border-[#F24C20]`} />
                                    {project.links.length > 1 && (
                                      <button type="button" onClick={() => {
                                        const newPortfolio = [...formData.portfolio];
                                        newPortfolio[pIndex].links.splice(lIndex, 1);
                                        setFormData({ ...formData, portfolio: newPortfolio });
                                      }} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"><X className="w-4 h-4" /></button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-bold mb-3 uppercase tracking-wider opacity-60">Project Media (Up to 5)</label>
                              <div className="flex flex-wrap gap-3">
                                {project.images && project.images.map((img: string, iIndex: number) => (
                                  <div key={iIndex} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-neutral-700/50 bg-neutral-800 shadow-sm">
                                    <img src={getImgUrl(img)} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    <button type="button" onClick={() => {
                                      const newPortfolio = [...formData.portfolio];
                                      newPortfolio[pIndex].images.splice(iIndex, 1);
                                      setFormData({ ...formData, portfolio: newPortfolio });
                                    }} className="absolute top-1 right-1 p-1 bg-black/60 backdrop-blur-sm text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                                  </div>
                                ))}
                                {project.previews && project.previews.map((url: string, iIndex: number) => (
                                  <div key={`preview-${iIndex}`} className="relative group w-20 h-20 rounded-xl overflow-hidden border-2 border-dashed border-[#F24C20]/50 bg-[#F24C20]/5 shadow-sm">
                                    <img src={url} alt="" className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => {
                                      const newPortfolio = [...formData.portfolio];
                                      newPortfolio[pIndex].newFiles.splice(iIndex, 1);
                                      newPortfolio[pIndex].previews.splice(iIndex, 1);
                                      URL.revokeObjectURL(url);
                                      setFormData({ ...formData, portfolio: newPortfolio });
                                    }} className="absolute top-1 right-1 p-1 bg-black/60 backdrop-blur-sm text-white rounded-full"><X className="w-3 h-3" /></button>
                                  </div>
                                ))}
                                {((project.images?.length || 0) + (project.newFiles?.length || 0)) < 5 && (
                                  <label className="w-20 h-20 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-700/50 hover:border-[#F24C20]/50 hover:bg-[#F24C20]/5 cursor-pointer transition-all group shadow-sm">
                                    <Plus className="w-5 h-5 text-neutral-500 group-hover:text-[#F24C20] transition-colors" />
                                    <span className="text-[9px] font-bold text-neutral-500 mt-1 uppercase">Add</span>
                                    <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleProjectImageUpload(pIndex, e)} />
                                  </label>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="pt-4 flex justify-end sm:justify-start">
                    <button onClick={handleUpdateProfile} disabled={isSaving} className="w-full sm:w-auto px-10 py-4 bg-[#044071] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#055a99] disabled:opacity-50 sm:min-w-[180px] shadow-lg shadow-[#044071]/20">
                      {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Portfolio'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'resume' && (
            <div className="space-y-12">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>Work Experience</h2>
                    <p className="text-sm text-neutral-500 mt-1">Add your professional career history.</p>
                  </div>
                  <button onClick={handleAddExperience} className="flex items-center gap-2 px-4 py-2 bg-[#F24C20] text-white rounded-lg hover:bg-orange-600 transition-colors">
                    <Plus className="w-5 h-5" />
                    Add Experience
                  </button>
                </div>
                <div className="space-y-4">
                  {formData.experience_details?.map((exp, idx) => (
                    <div key={idx} className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-neutral-800/30 border-neutral-700' : 'bg-white border-neutral-200'}`}>
                      {(() => {
                        const { start, end, isCurrent } = parseYearRange(exp.year_range);
                        return (
                          <>
                            <div className="flex justify-between items-start mb-4">
                              <h3 className="font-bold text-sm uppercase tracking-wider text-[#F24C20]">Position #{idx + 1}</h3>
                              <button onClick={() => handleRemoveExperience(idx)} className="text-red-500 hover:text-red-700 p-1"><Trash2 className="w-4 h-4" /></button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="md:col-span-2 grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-bold mb-1 uppercase opacity-50">From (Month & Year)</label>
                                  <input type="month" value={labelToMonthInput(start)} onChange={(e) => {
                                    const newExp = [...formData.experience_details];
                                    const currentRange = parseYearRange(newExp[idx].year_range);
                                    newExp[idx].year_range = buildYearRange(monthInputToLabel(e.target.value), currentRange.end, currentRange.isCurrent);
                                    setFormData({ ...formData, experience_details: newExp });
                                  }} className={monthInputClassName} />
                                </div>
                                <div>
                                  <label className="block text-xs font-bold mb-1 uppercase opacity-50">To (Month & Year)</label>
                                  <div className="flex flex-col gap-2">
                                    <input type="month" value={isCurrent ? '' : labelToMonthInput(end)} disabled={isCurrent} onChange={(e) => {
                                      const newExp = [...formData.experience_details];
                                      const currentRange = parseYearRange(newExp[idx].year_range);
                                      newExp[idx].year_range = buildYearRange(currentRange.start, monthInputToLabel(e.target.value), false);
                                      setFormData({ ...formData, experience_details: newExp });
                                    }} className={monthInputClassName} />
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input type="checkbox" checked={isCurrent} onChange={(e) => {
                                        const newExp = [...formData.experience_details];
                                        const currentRange = parseYearRange(newExp[idx].year_range);
                                        newExp[idx].year_range = buildYearRange(currentRange.start, currentRange.end, e.target.checked);
                                        setFormData({ ...formData, experience_details: newExp });
                                      }} />
                                      <span className="text-[10px] uppercase font-bold opacity-70">Current Work</span>
                                    </label>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-bold mb-1 uppercase opacity-50">Job Title</label>
                                <input type="text" placeholder="e.g. Senior Developer" value={exp.title} onChange={(e) => {
                                  const newExp = [...formData.experience_details];
                                  newExp[idx].title = e.target.value;
                                  setFormData({ ...formData, experience_details: newExp });
                                }} className={`w-full px-4 py-2 rounded-xl border ${isDarkMode ? 'bg-neutral-900 border-neutral-700' : 'bg-white border-neutral-200'} outline-none focus:border-[#F24C20]`} />
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-xs font-bold mb-1 uppercase opacity-50">Company Name</label>
                                <input type="text" value={exp.company} onChange={(e) => {
                                  const newExp = [...formData.experience_details];
                                  newExp[idx].company = e.target.value;
                                  setFormData({ ...formData, experience_details: newExp });
                                }} className={`w-full px-4 py-2 rounded-xl border ${isDarkMode ? 'bg-neutral-900 border-neutral-700' : 'bg-white border-neutral-200'} outline-none focus:border-[#F24C20]`} />
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  ))}
                </div>
              </div>

              {/* Education Section */}
              <div className="space-y-6 pt-12 border-t border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>Education</h2>
                    <p className="text-sm text-neutral-500 mt-1">Add your academic background.</p>
                  </div>
                  <button onClick={handleAddEducation} className="flex items-center gap-2 px-4 py-2 bg-[#F24C20] text-white rounded-lg hover:bg-orange-600 transition-colors">
                    <Plus className="w-5 h-5" />
                    Add Education
                  </button>
                </div>
                <div className="space-y-4">
                  {formData.education_details?.map((edu: any, idx: number) => {
                    const { start, end, isCurrent } = parseYearRange(edu.year_range);
                    return (
                      <div key={idx} className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-neutral-800/30 border-neutral-700' : 'bg-white border-neutral-200'}`}>
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="font-bold text-sm uppercase tracking-wider text-[#F24C20]">Education #{idx + 1}</h3>
                          <button onClick={() => handleRemoveEducation(idx)} className="text-red-500 hover:text-red-700 p-1"><Trash2 className="w-4 h-4" /></button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2 grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold mb-1 uppercase opacity-50">From (Month & Year)</label>
                              <input type="month" value={labelToMonthInput(start)} onChange={(e) => {
                                const newEdu = [...formData.education_details];
                                const currentRange = parseYearRange(newEdu[idx].year_range);
                                newEdu[idx].year_range = buildYearRange(monthInputToLabel(e.target.value), currentRange.end, currentRange.isCurrent);
                                setFormData({ ...formData, education_details: newEdu });
                              }} className={monthInputClassName} />
                            </div>
                            <div>
                              <label className="block text-xs font-bold mb-1 uppercase opacity-50">To (Month & Year)</label>
                              <div className="flex flex-col gap-2">
                                <input type="month" value={isCurrent ? '' : labelToMonthInput(end)} disabled={isCurrent} onChange={(e) => {
                                  const newEdu = [...formData.education_details];
                                  const currentRange = parseYearRange(newEdu[idx].year_range);
                                  newEdu[idx].year_range = buildYearRange(currentRange.start, monthInputToLabel(e.target.value), false);
                                  setFormData({ ...formData, education_details: newEdu });
                                }} className={monthInputClassName} />
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input type="checkbox" checked={isCurrent} onChange={(e) => {
                                    const newEdu = [...formData.education_details];
                                    const currentRange = parseYearRange(newEdu[idx].year_range);
                                    newEdu[idx].year_range = buildYearRange(currentRange.start, currentRange.end, e.target.checked);
                                    setFormData({ ...formData, education_details: newEdu });
                                  }} />
                                  <span className="text-[10px] uppercase font-bold opacity-70">Currently Studying</span>
                                </label>
                              </div>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-bold mb-1 uppercase opacity-50">Degree / Qualification</label>
                            <input type="text" placeholder="e.g. B.Tech in Computer Science" value={edu.title} onChange={(e) => {
                              const newEdu = [...formData.education_details];
                              newEdu[idx].title = e.target.value;
                              setFormData({ ...formData, education_details: newEdu });
                            }} className={`w-full px-4 py-2 rounded-xl border ${isDarkMode ? 'bg-neutral-900 border-neutral-700' : 'bg-white border-neutral-200'} outline-none focus:border-[#F24C20]`} />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-xs font-bold mb-1 uppercase opacity-50">Institution Name</label>
                            <input type="text" value={edu.institution} onChange={(e) => {
                              const newEdu = [...formData.education_details];
                              newEdu[idx].institution = e.target.value;
                              setFormData({ ...formData, education_details: newEdu });
                            }} className={`w-full px-4 py-2 rounded-xl border ${isDarkMode ? 'bg-neutral-900 border-neutral-700' : 'bg-white border-neutral-200'} outline-none focus:border-[#F24C20]`} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800">
                <button onClick={handleUpdateProfile} disabled={isSaving} className="w-full sm:w-auto px-10 py-4 bg-[#044071] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#055a99] disabled:opacity-50 shadow-lg shadow-[#044071]/20">
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Details'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'landing' && (
            <div className="space-y-8">
              <div>
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>Landing Page Branding</h2>
                <p className="text-sm text-neutral-500 mt-1">Customize your public profile page's appearance.</p>
              </div>

              <div className={`p-8 rounded-2xl border ${isDarkMode ? 'bg-neutral-800/30 border-neutral-700' : 'bg-white border-neutral-200'}`}>
                <label className="block text-sm font-bold mb-4 uppercase opacity-50 tracking-wider">Cover / Hero Image</label>
                <div className="relative group aspect-[21/9] w-full rounded-2xl overflow-hidden border-2 border-dashed border-neutral-700/30 bg-neutral-900/50">
                  <img src={landingImagePreview || getImgUrl(formData.landing_page_image) || 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&q=80'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Landing Cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <label className="px-6 py-3 bg-white text-black rounded-xl font-bold cursor-pointer hover:bg-neutral-100 transition-colors flex items-center gap-2">
                      <Camera className="w-5 h-5" />
                      Change Hero Image
                      <input type="file" className="hidden" accept="image/*" onChange={handleLandingImageChange} />
                    </label>
                  </div>
                </div>
                <p className="mt-4 text-xs text-neutral-500">Recommended size: 1920x800px. Maximum size: 8MB.</p>
              </div>

              <div className={`p-8 rounded-2xl border ${isDarkMode ? 'bg-neutral-800/30 border-neutral-700' : 'bg-white border-neutral-200'}`}>
                <h3 className="font-bold mb-6 flex items-center gap-2"><Share2 className="w-5 h-5 text-[#F24C20]" /> Social Connections</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(formData.social_links).map(([platform, value]) => (
                    <div key={platform}>
                      <label className="block text-xs font-bold mb-2 uppercase opacity-50 capitalize">{platform}</label>
                      <input type="url" placeholder={`https://${platform}.com/username`} value={value} onChange={(e) => setFormData({ ...formData, social_links: { ...formData.social_links, [platform]: e.target.value } })} className={`w-full px-4 py-3 rounded-xl border ${isDarkMode ? 'bg-neutral-900 border-neutral-700' : 'bg-white border-neutral-200'} outline-none focus:border-[#F24C20]`} />
                    </div>
                  ))}
                </div>
                <div className="mt-8">
                  <button onClick={handleUpdateProfile} disabled={isSaving} className="w-full sm:w-auto px-10 py-4 bg-[#044071] text-white rounded-xl font-bold hover:bg-[#055a99] disabled:opacity-50 shadow-lg shadow-[#044071]/20">
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Landing Settings'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'verification' && (
            <div className="space-y-8">
              <div>
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>Verification & KYC</h2>
                <p className="text-sm text-neutral-500 mt-1">Verify your identity to earn the "Verified Expert" badge.</p>
              </div>
              {formData.kyc_details.is_verified ? (
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-green-500" />
                  <div className="text-sm"><p className="font-bold text-green-500">Account Verified</p></div>
                </div>
              ) : formData.kyc_status === 'pending' ? (
                <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center gap-3">
                  <Clock className="w-6 h-6 text-orange-500" /><p className="text-sm font-bold text-orange-500">Review in Progress</p>
                </div>
              ) : null}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-neutral-800/30 border-neutral-700' : 'bg-white border-neutral-200'}`}>
                  <h3 className="font-bold mb-6 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-[#F24C20]" /> Identity Verification</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold mb-2 uppercase opacity-50">PAN Card</label>
                      <div className="relative p-4 rounded-xl border-2 border-dashed border-neutral-700/30 bg-neutral-900/20">
                        {formData.kyc_details.pan_card ? (
                          <div className="flex justify-between items-center"><span className="text-xs font-medium">Document Uploaded</span><button type="button" onClick={() => setPreviewDocument({ url: getDocumentUrl(formData.kyc_details.pan_card), title: 'PAN Card' })} className="text-blue-500 text-xs font-bold hover:underline">View</button></div>
                        ) : (
                          <div className="flex flex-col items-center py-4 text-center"><Upload className="w-8 h-8 text-neutral-500 mb-2" /><input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => e.target.files?.[0] && handleFileUpload('pan_card', e.target.files[0])} /><p className="text-xs text-neutral-500">Upload PAN Card Image/PDF</p></div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-2 uppercase opacity-50">Aadhar Card</label>
                      <div className="relative p-4 rounded-xl border-2 border-dashed border-neutral-700/30 bg-neutral-900/20">
                        {formData.kyc_details.aadhar_card ? (
                          <div className="flex justify-between items-center"><span className="text-xs font-medium">Document Uploaded</span><button type="button" onClick={() => setPreviewDocument({ url: getDocumentUrl(formData.kyc_details.aadhar_card), title: 'Aadhar Card' })} className="text-blue-500 text-xs font-bold hover:underline">View</button></div>
                        ) : (
                          <div className="flex flex-col items-center py-4 text-center"><Upload className="w-8 h-8 text-neutral-500 mb-2" /><input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => e.target.files?.[0] && handleFileUpload('aadhar_card', e.target.files[0])} /><p className="text-xs text-neutral-500">Upload Aadhar Card Image/PDF</p></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-neutral-800/30 border-neutral-700' : 'bg-white border-neutral-200'}`}>
                  <h3 className="font-bold mb-6 flex items-center gap-2"><Briefcase className="w-5 h-5 text-[#F24C20]" /> Professional Proof</h3>
                  <div>
                    <label className="block text-xs font-bold mb-2 uppercase opacity-50">Experience Letter / Relieving Letter</label>
                    <div className="relative p-4 rounded-xl border-2 border-dashed border-neutral-700/30 bg-neutral-900/20">
                      {formData.documents.experience_letter ? (
                        <div className="flex justify-between items-center"><span className="text-xs font-medium">Letter Uploaded</span><button type="button" onClick={() => setPreviewDocument({ url: getDocumentUrl(formData.documents.experience_letter), title: 'Experience Letter' })} className="text-blue-500 text-xs font-bold hover:underline">View</button></div>
                      ) : (
                        <div className="flex flex-col items-center py-4 text-center"><Upload className="w-8 h-8 text-neutral-500 mb-2" /><input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => e.target.files?.[0] && handleFileUpload('experience_letter', e.target.files[0])} /><p className="text-xs text-neutral-500">Upload Professional Proof</p></div>
                      )}
                    </div>
                  </div>
                </div>

                <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-neutral-800/30 border-neutral-700' : 'bg-white border-neutral-200'} md:col-span-2`}>
                  <h3 className="font-bold mb-6 flex items-center gap-2"><Award className="w-5 h-5 text-[#F24C20]" /> Academic Certificates</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {formData.documents.educational?.map((doc: string, idx: number) => (
                      <div key={idx} className="relative group p-4 rounded-xl border border-neutral-700 bg-neutral-950 flex flex-col items-center gap-2 transition-all hover:border-[#F24C20]/50">
                        <div className="w-10 h-10 rounded-lg bg-[#F24C20]/10 flex items-center justify-center"><FileText className="w-6 h-6 text-[#F24C20]" /></div>
                        <span className="text-[10px] font-bold text-neutral-400 truncate w-full text-center uppercase">Degree #{idx + 1}</span>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => setPreviewDocument({ url: getDocumentUrl(doc), title: `Academic Doc #${idx + 1}` })} className="text-[10px] text-blue-500 font-bold uppercase hover:underline">View</button>
                          <button type="button" onClick={() => handleRemoveFile('educational', idx)} className="text-[10px] text-red-500 font-bold uppercase hover:underline">Remove</button>
                        </div>
                      </div>
                    ))}
                    <label className="border-2 border-dashed border-neutral-700 rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-neutral-800/50 hover:border-[#F24C20]/50 transition-all cursor-pointer min-h-[120px] group">
                      <Plus className="w-6 h-6 text-neutral-500 group-hover:text-[#F24C20] transition-colors" />
                      <span className="text-[10px] text-neutral-500 font-bold uppercase group-hover:text-neutral-300">Add Academic Doc</span>
                      <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUpload('educational', e.target.files[0])} />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Security Settings</h2>
                <p className="text-sm text-neutral-500">Manage your password and account protection</p>
              </div>
              <div className={`p-8 rounded-2xl border backdrop-blur-sm ${isDarkMode ? 'bg-neutral-800/20 border-neutral-700' : 'bg-neutral-50 border-neutral-200'}`}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-[#F24C20]/10 flex items-center justify-center"><Lock className="w-6 h-6 text-[#F24C20]" /></div>
                  <div>
                    <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>Update Password</h3>
                    <p className="text-sm text-neutral-500">Email-based secure verification</p>
                  </div>
                </div>
                <p className="text-sm mb-8 text-neutral-500 leading-relaxed">Click below to receive a secure link at <strong>{formData.email}</strong> to change your password.</p>
                <button onClick={handleSendResetLink} disabled={isSaving} className="w-full sm:w-auto px-10 py-4 bg-[#044071] text-white rounded-xl font-bold hover:bg-[#055a99] transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg shadow-[#044071]/20">
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5" />}
                  Send Security Link
                </button>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2 text-red-600">Danger Zone</h2>
                <p className="text-sm text-neutral-500">Handle sensitive account data</p>
              </div>
              <div className="p-6 rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/30 flex items-start gap-4">
                <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30"><AlertTriangle className="w-6 h-6 text-red-600" /></div>
                <div className="flex-1">
                  <h3 className="font-bold text-red-900 dark:text-red-100 mb-1">Delete Account</h3>
                  <p className="text-sm text-red-700 dark:text-red-300 mb-4">Permanent action. Wipes all project history and wallet balance.</p>
                  <button onClick={() => setShowDeleteModal(true)} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium">Terminate Forever</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>Profile Settings</h2>
              <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
                <div className="relative group">
                  <img src={getImgUrl(formData.profile_image) || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80"} className="w-24 h-24 rounded-full object-cover border-2 border-[#F24C20]/30" alt="Profile" />
                  <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Camera className="w-6 h-6 text-white" /></button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoChange} />
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  <button onClick={() => fileInputRef.current?.click()} className="px-6 py-2 bg-[#044071] text-white rounded-lg text-sm font-medium hover:bg-[#044071]/90">Change Photo</button>
                  <button onClick={async () => {
                    setIsSaving(true);
                    try {
                      const response = await api.put('/auth/update-profile', { profile_image: '' });
                      if (response.data.success) { setFormData(prev => ({ ...prev, profile_image: '' })); toast.success('Photo removed'); }
                    } catch (err) { } finally { setIsSaving(false); }
                  }} className={`px-6 py-2 rounded-lg text-sm font-medium border ${isDarkMode ? 'border-neutral-700 text-neutral-300 hover:bg-neutral-800' : 'border-neutral-300 text-neutral-700 hover:bg-neutral-50'}`}>Remove</button>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {isFreelancer && (
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold mb-2 uppercase opacity-50">Professional Title</label>
                      <input type="text" placeholder="e.g. Senior Full Stack Developer" value={formData.role_title} onChange={e => setFormData({ ...formData, role_title: e.target.value })} className={`w-full px-4 py-3 rounded-xl border ${isDarkMode ? 'bg-neutral-900 border-neutral-700' : 'bg-white border-neutral-200'} outline-none focus:border-[#F24C20]`} />
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-bold mb-2 uppercase opacity-50">Full Name</label>
                    <input type="text" value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} className={`w-full px-4 py-3 rounded-xl border ${isDarkMode ? 'bg-neutral-900 border-neutral-700' : 'bg-white border-neutral-200'} outline-none focus:border-[#F24C20]`} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-2 uppercase opacity-50">Email Address</label>
                    <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className={`w-full px-4 py-3 rounded-xl border ${isDarkMode ? 'bg-neutral-900 border-neutral-700 font-mono opacity-50 cursor-not-allowed' : 'bg-white border-neutral-200'} outline-none`} disabled />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-2 uppercase opacity-50">Location</label>
                    <div className="relative"><MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" /><input type="text" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="City, Country" className="w-full pl-11 pr-4 py-3 rounded-xl border border-neutral-700/30 bg-transparent outline-none focus:border-[#F24C20]" /></div>
                  </div>
                </div>

                {isFreelancer && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl border border-neutral-700/30 bg-neutral-900/20">
                    <div className="md:col-span-2"><h3 className="font-bold text-sm uppercase text-[#F24C20] mb-4">Work Preferences</h3></div>
                    <div><label className="block text-xs font-bold mb-2 uppercase opacity-50">Service Price Starts From (₹)</label><input type="number" value={formData.hourly_rate || ''} onChange={e => setFormData({ ...formData, hourly_rate: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl border border-neutral-700/30 bg-transparent outline-none" /></div>
                    <div><label className="block text-xs font-bold mb-2 uppercase opacity-50">Availability</label><select value={formData.availability} onChange={e => setFormData({ ...formData, availability: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-neutral-700/30 bg-neutral-950 outline-none"><option value="">Select</option><option value="full-time">Full Time</option><option value="part-time">Part Time</option></select></div>
                  </div>
                )}

                <button type="submit" disabled={isSaving} className="w-full sm:w-auto px-10 py-4 bg-[#044071] text-white rounded-xl font-bold hover:bg-[#055a99] disabled:opacity-50 transition-all shadow-lg shadow-[#044071]/20">
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Profile Changes'}
                </button>
              </form>
            </div>
          )}

          <AnimatePresence>
            {previewDocument && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4" onClick={() => setPreviewDocument(null)}>
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className={`relative w-full max-w-5xl h-[80vh] rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'}`} onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-between p-4 border-b border-neutral-800"><h3 className="font-bold">{previewDocument.title}</h3><button onClick={() => setPreviewDocument(null)}><X /></button></div>
                  {isPdfDocument(previewDocument.url) ? <iframe src={previewDocument.url} className="w-full h-full" /> : <img src={previewDocument.url} className="w-full h-full object-contain" />}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-md p-8 rounded-2xl border ${isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'}`}
            >
              <h3 className="text-xl font-bold mb-2">Delete Account?</h3>
              <p className="text-neutral-500 mb-6">This will wipe your Entire history and profile. This cannot be undone.</p>
              <div className="flex gap-4">
                <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-6 py-3 rounded-xl border">Cancel</button>
                <button onClick={handleDeleteAccount} disabled={isSaving} className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-bold">Confirm</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
