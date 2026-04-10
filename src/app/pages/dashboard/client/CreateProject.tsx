import { motion } from 'motion/react';
import { useTheme } from '@/app/components/ThemeProvider';
import {
  FileText,
  IndianRupee,
  Calendar,
  Tag,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Upload,
  X,
  Loader2,
  Search,
  ShieldAlert,
  Clock
} from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/app/utils/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function CreateProject() {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [kycStatus, setKycStatus] = useState<string>('unverified');
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [projectData, setProjectData] = useState({
    title: '',
    category: '',
    description: '',
    budget_range: '',
    duration: '',
    experienceLevel: '',
    location: '',
    skills: [] as string[],
    attachments: [] as string[]
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [skillSearchTerm, setSkillSearchTerm] = useState('');

  const steps = [
    { id: 1, title: 'Project Details', icon: FileText },
    { id: 2, title: 'Budget & Timeline', icon: IndianRupee },
    { id: 3, title: 'Skills Required', icon: Tag },
    { id: 4, title: 'Review & Publish', icon: CheckCircle }
  ];

  const [categories, setCategories] = useState<any[]>([]);
  const [availableSkills, setAvailableSkills] = useState<any[]>([]);
  const [budgetOptions, setBudgetOptions] = useState<any[]>([]);
  const [expOptions, setExpOptions] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, skillRes, stepsRes, userRes] = await Promise.all([
          api.get('/cms/categories'),
          api.get('/cms/skills'),
          api.get('/cms/registration-steps'),
          api.get('/auth/me')
        ]);
        if (catRes.data.success) setCategories(catRes.data.categories || []);
        if (skillRes.data.success) setAvailableSkills(skillRes.data.skills || []);
        if (stepsRes.data.success) {
          const steps = stepsRes.data.data;
          const budgetStep = steps.find((s: any) => s.field === 'budgetRange');
          if (budgetStep) setBudgetOptions(budgetStep.options || []);
          const expStep = steps.find((s: any) => s.field === 'experienceLevel');
          if (expStep) setExpOptions(expStep.options || []);
        }
        if (userRes.data.success) {
          setIsVerified(userRes.data.user.kyc_details?.is_verified || false);
          setKycStatus(userRes.data.user.kyc_status || 'unverified');
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };
    fetchData();
  }, []);

  const durations = [
    'Less than 1 month',
    '1-3 months',
    '3-6 months',
    'More than 6 months'
  ];

  const toggleSkill = (skillName: string) => {
    setProjectData(prev => ({
      ...prev,
      skills: prev.skills.includes(skillName)
        ? prev.skills.filter(s => s !== skillName)
        : [...prev.skills, skillName]
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (currentStep === 1 && (!projectData.title || !projectData.category || !projectData.description)) {
      toast.error('Please fill all required fields');
      return;
    }
    if (currentStep === 2 && (!projectData.budget_range || !projectData.duration)) {
      toast.error('Please provide budget range and duration');
      return;
    }
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handlePublish = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('title', projectData.title);
      formData.append('description', projectData.description);
      formData.append('category', projectData.category);
      formData.append('budget_range', projectData.budget_range);
      formData.append('skills_required', JSON.stringify(projectData.skills));
      formData.append('timeline', projectData.duration);
      formData.append('experience_level', projectData.experienceLevel);
      formData.append('location', projectData.location);

      selectedFiles.forEach(file => {
        formData.append('attachments', file);
      });

      const res = await api.post('/projects', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        toast.success('Project published successfully! It is now live for freelancers to see.');
        navigate('/dashboard/projects/my-projects');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to publish project');
    } finally {
      setLoading(false);
    }
  };

  if (isVerified === false && kycStatus !== 'pending') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center space-y-6">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center">
          <ShieldAlert className="w-10 h-10 text-orange-500" />
        </div>
        <div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>KYC Verification Required</h2>
          <p className={`mt-2 max-w-md ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
            To maintain a safe community, we require all clients to complete their KYC verification before posting projects.
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard/settings')}
          className="px-8 py-3 bg-[#F24C20] text-white rounded-xl font-bold shadow-xl shadow-[#F24C20]/20 hover:scale-105 transition-transform"
        >
          Complete Verification Now
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
          Create New Project
        </h1>
        <p className={`mt-2 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
          Post your project and find the perfect freelancer
        </p>
        {!isVerified && kycStatus === 'pending' && (
          <div className="mt-4 p-4 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center gap-3">
             <Clock className="w-5 h-5 text-orange-500" />
             <p className="text-sm font-medium text-orange-600">
               Your account verification is in progress. You can submit projects, but they will be reviewed only after your KYC is approved.
             </p>
          </div>
        )}
      </motion.div>

      {/* Stepper */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`p-6 rounded-2xl border backdrop-blur-sm ${isDarkMode
            ? 'bg-neutral-900/50 border-neutral-800'
            : 'bg-white/50 border-neutral-200'
          }`}
      >
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all ${isCompleted
                      ? 'bg-green-500 text-white'
                      : isActive
                        ? 'bg-[#F24C20] text-white'
                        : isDarkMode
                          ? 'bg-neutral-800 text-neutral-400'
                          : 'bg-neutral-200 text-neutral-500'
                    }`}>
                    {isCompleted ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                  </div>
                  <div className={`mt-2 text-sm font-medium ${isActive || isCompleted
                      ? isDarkMode ? 'text-white' : 'text-neutral-900'
                      : isDarkMode ? 'text-neutral-500' : 'text-neutral-400'
                    }`}>
                    {step.title}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-full h-1 mx-4 rounded-full ${isCompleted
                      ? 'bg-green-500'
                      : isDarkMode
                        ? 'bg-neutral-800'
                        : 'bg-neutral-200'
                    }`} />
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Form Content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className={`p-8 rounded-2xl border backdrop-blur-sm ${isDarkMode
            ? 'bg-neutral-900/50 border-neutral-800'
            : 'bg-white/50 border-neutral-200'
          }`}
      >
        {/* Step 1: Project Details */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                Project Title *
              </label>
              <input
                type="text"
                placeholder="e.g., Build a responsive e-commerce website"
                value={projectData.title}
                onChange={(e) => setProjectData({ ...projectData, title: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border ${isDarkMode
                    ? 'bg-neutral-800/50 border-neutral-700 text-white placeholder:text-neutral-500'
                    : 'bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400'
                  } outline-none focus:border-[#F24C20] transition-colors`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                Category *
              </label>
              <select
                value={projectData.category}
                onChange={(e) => setProjectData({ ...projectData, category: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border ${isDarkMode
                    ? 'bg-neutral-800/50 border-neutral-700 text-white'
                    : 'bg-white border-neutral-300 text-neutral-900'
                  } outline-none focus:border-[#F24C20] transition-colors`}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                Project Description *
              </label>
              <textarea
                rows={8}
                placeholder="Describe your project requirements in detail..."
                value={projectData.description}
                onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border ${isDarkMode
                    ? 'bg-neutral-800/50 border-neutral-700 text-white placeholder:text-neutral-500'
                    : 'bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400'
                  } outline-none focus:border-[#F24C20] transition-colors resize-none`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                Attachments (Optional)
              </label>
              <div 
                onClick={() => document.getElementById('project-attachments')?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${isDarkMode
                  ? 'border-neutral-700 hover:border-neutral-600'
                  : 'border-neutral-300 hover:border-neutral-400'
                }`}>
                <input 
                  id="project-attachments"
                  type="file" 
                  multiple 
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,image/*"
                  className="hidden"
                />
                <Upload className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-neutral-600' : 'text-neutral-400'}`} />
                <p className={`mb-2 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                  Click to upload or drag and drop
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-neutral-500' : 'text-neutral-500'}`}>
                  PDF, DOC, DOCX, or images up to 10MB
                </p>
              </div>

              {selectedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {selectedFiles.map((file, idx) => (
                    <div 
                      key={idx} 
                      className={`flex items-center justify-between p-3 rounded-xl border ${isDarkMode ? 'bg-neutral-800 border-neutral-700' : 'bg-neutral-50 border-neutral-200'}`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <FileText className="w-5 h-5 flex-shrink-0 text-blue-500" />
                        <span className={`text-sm font-medium truncate ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                          {file.name}
                        </span>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                        className="p-1 hover:bg-red-500/10 text-red-500 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Budget & Timeline */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Budget Range */}
              <div className="space-y-4">
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                  Budget Range *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    '₹1,000 - ₹5,000',
                    '₹5,000 - ₹20,000',
                    '₹20,000 - ₹50,000',
                    '₹50,000 - ₹1,00,000',
                    '₹1,00,000 - ₹5,00,000',
                    'Custom'
                  ].map((range) => (
                    <button
                      key={range}
                      type="button"
                      onClick={() => setProjectData({ ...projectData, budget_range: range === 'Custom' ? '' : range })}
                      className={`p-3 rounded-xl border-2 text-sm font-medium transition-all text-center ${
                        projectData.budget_range === range || (range === 'Custom' && !['₹1,00,000 - ₹5,00,000', '₹50,000 - ₹1,00,000', '₹20,000 - ₹50,000', '₹5,000 - ₹20,000', '₹1,00,000 - ₹5,00,000', '₹1,000 - ₹5,00,000'].includes(projectData.budget_range) && projectData.budget_range !== '')
                          ? 'border-[#F24C20] bg-[#F24C20]/10 text-[#F24C20]'
                          : isDarkMode
                            ? 'border-neutral-800 text-neutral-400 hover:border-neutral-700'
                            : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
                
                {/* Custom Budget Input */}
                {(![
                    '₹1,000 - ₹5,000',
                    '₹5,000 - ₹20,000',
                    '₹20,000 - ₹50,000',
                    '₹50,000 - ₹1,00,000',
                    '₹1,00,000 - ₹5,00,000'
                  ].includes(projectData.budget_range) || projectData.budget_range === '') && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative"
                  >
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <IndianRupee className="h-4 w-4 text-neutral-500" />
                    </div>
                    <input
                      type="text"
                      placeholder="Enter custom budget or range (e.g., ₹2.5L - ₹3L)"
                      value={projectData.budget_range}
                      onChange={(e) => setProjectData({ ...projectData, budget_range: e.target.value })}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border ${isDarkMode
                          ? 'bg-neutral-800/50 border-neutral-700 text-white placeholder:text-neutral-500'
                          : 'bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400'
                        } outline-none focus:border-[#F24C20] transition-colors`}
                    />
                  </motion.div>
                )}
              </div>

              {/* Experience Level */}
              <div className="space-y-4">
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                  Experience Level *
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { label: 'Entry Level', desc: 'Looking for cost-effective solutions', value: 'Entry' },
                    { label: 'Intermediate', desc: 'Seeking verified experience & quality', value: 'Intermediate' },
                    { label: 'Expert', desc: 'Highest quality for complex projects', value: 'Expert' }
                  ].map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => setProjectData({ ...projectData, experienceLevel: level.label })}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        projectData.experienceLevel === level.label
                          ? 'border-[#044071] bg-[#044071]/10'
                          : isDarkMode
                            ? 'border-neutral-800 text-neutral-400 hover:border-neutral-700'
                            : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                      }`}
                    >
                      <div className="font-bold flex items-center justify-between">
                         <span className={projectData.experienceLevel === level.label ? 'text-[#044071]' : isDarkMode ? 'text-white' : 'text-neutral-900'}>
                           {level.label}
                         </span>
                         {projectData.experienceLevel === level.label && <CheckCircle className="w-5 h-5 text-[#044071]" />}
                      </div>
                      <p className={`text-xs mt-1 ${isDarkMode ? 'text-neutral-500' : 'text-neutral-500'}`}>{level.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                Project Duration *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {durations.map((duration) => (
                  <button
                    key={duration}
                    onClick={() => setProjectData({ ...projectData, duration })}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${projectData.duration === duration
                        ? 'border-[#F24C20] bg-[#F24C20]/10'
                        : isDarkMode
                          ? 'border-neutral-700 hover:border-neutral-600'
                          : 'border-neutral-300 hover:border-neutral-400'
                      }`}
                  >
                    <div className={`font-medium ${projectData.duration === duration
                        ? 'text-[#F24C20]'
                        : isDarkMode ? 'text-white' : 'text-neutral-900'
                      }`}>
                      {duration}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-blue-500/10 border-blue-500/30' : 'bg-blue-50 border-blue-200'}`}>
              <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-900'}`}>
                Budget Tips
              </h4>
              <ul className={`text-sm space-y-1 ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                <li>• Research market rates for similar projects</li>
                <li>• Consider the complexity and scope of work</li>
                <li>• Be realistic and competitive with your budget</li>
                <li>• You can negotiate with freelancers later</li>
              </ul>
            </div>
          </div>
        )}

        {/* Step 3: Skills Required */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <label className={`block text-sm font-medium mb-4 ${isDarkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                Select Required Skills * (Choose at least 3)
              </label>
              
              {/* Skill Search Bar */}
              <div className="relative mb-6">
                <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${isDarkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                  <Search className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  placeholder="Search for skills (e.g. React, UI Design...)"
                  value={skillSearchTerm}
                  onChange={(e) => setSkillSearchTerm(e.target.value)}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-xl leading-5 outline-none transition-all duration-200 ${
                    isDarkMode 
                      ? 'bg-neutral-800/50 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-[#F24C20]' 
                      : 'bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus:border-[#F24C20]'
                  }`}
                />
              </div>

              <div className="space-y-4">
                <p className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                  {skillSearchTerm ? 'Search Results' : 'Suggested Skills'}
                </p>
                <div className="flex flex-wrap gap-3">
                  {(skillSearchTerm 
                    ? availableSkills.filter(s => s.name.toLowerCase().includes(skillSearchTerm.toLowerCase()))
                    : availableSkills.slice(0, 5)
                  ).map((skill) => (
                    <button
                      key={skill._id}
                      onClick={() => toggleSkill(skill.name)}
                      className={`px-4 py-2 rounded-full border-2 font-medium transition-all ${projectData.skills.includes(skill.name)
                          ? 'border-[#F24C20] bg-[#F24C20] text-white'
                          : isDarkMode
                            ? 'border-neutral-700 text-neutral-300 hover:border-neutral-600'
                            : 'border-neutral-300 text-neutral-700 hover:border-neutral-400'
                        }`}
                    >
                      {skill.name}
                      {projectData.skills.includes(skill.name) && (
                        <X className="w-4 h-4 inline-block ml-2" />
                      )}
                    </button>
                  ))}
                  {skillSearchTerm && availableSkills.filter(s => s.name.toLowerCase().includes(skillSearchTerm.toLowerCase())).length === 0 && (
                    <p className="text-sm text-neutral-500 italic">No matching skills found.</p>
                  )}
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-neutral-800/30 border-neutral-800' : 'bg-neutral-50 border-neutral-100'}`}>
              <div className="flex items-center justify-between mb-4">
                <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                  Selected Skills ({projectData.skills.length})
                </h4>
                {projectData.skills.length > 0 && (
                  <button 
                    onClick={() => setProjectData({ ...projectData, skills: [] })}
                    className="text-xs text-[#F24C20] hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>
              {projectData.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {projectData.skills.map((skill) => (
                    <motion.span
                      layout
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      key={skill}
                      className="group flex items-center gap-2 px-4 py-2 bg-[#F24C20]/10 text-[#F24C20] border border-[#F24C20]/20 rounded-full text-sm font-semibold"
                    >
                      {skill}
                      <button 
                        onClick={() => toggleSkill(skill)}
                        className="hover:bg-[#F24C20] hover:text-white rounded-full p-0.5 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.span>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                   <Tag className="w-8 h-8 mx-auto mb-2 text-neutral-500 opacity-20" />
                   <p className={`text-sm ${isDarkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                    Choose skills above that best describe your project
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Review & Publish */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-neutral-800/50 border-neutral-700' : 'bg-neutral-50 border-neutral-200'}`}>
              <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                Project Summary
              </h3>
              <div className="space-y-4">
                <div>
                  <label className={`text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>Title</label>
                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                    {projectData.title || 'Not provided'}
                  </p>
                </div>
                <div>
                  <label className={`text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>Category</label>
                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                    {projectData.category || 'Not selected'}
                  </p>
                </div>
                <div>
                  <label className={`text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>Budget</label>
                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                    {projectData.budget_range || 'Not selected'}
                  </p>
                </div>
                <div>
                  <label className={`text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>Duration</label>
                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                    {projectData.duration || 'Not selected'}
                  </p>
                </div>
                <div>
                  <label className={`text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>Skills ({projectData.skills.length})</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {projectData.skills.map((skill) => (
                      <span
                        key={skill}
                        className={`px-3 py-1 rounded-full text-sm ${isDarkMode
                            ? 'bg-[#F24C20]/10 text-[#F24C20]'
                            : 'bg-[#F24C20]/10 text-[#F24C20]'
                          }`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-green-500/10 border-green-500/30' : 'bg-green-50 border-green-200'}`}>
              <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-green-400' : 'text-green-900'}`}>
                Ready to Publish?
              </h4>
              <p className={`text-sm ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>
                Once published, your project will be visible to all freelancers. You'll start receiving proposals within 24 hours.
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-neutral-800">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${currentStep === 1
                ? isDarkMode
                  ? 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
                  : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                : isDarkMode
                  ? 'bg-neutral-800 text-white hover:bg-neutral-700'
                  : 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300'
              }`}
          >
            <ArrowLeft className="w-5 h-5" />
            Previous
          </button>

          {currentStep < 4 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 bg-[#044071] text-white rounded-xl font-medium hover:bg-[#044071]/90 transition-colors"
            >
              Next
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handlePublish}
              className="flex items-center gap-2 px-8 py-3 bg-[#F24C20] text-white rounded-xl font-medium hover:bg-[#F24C20]/90 transition-colors"
            >
              <CheckCircle className="w-5 h-5" />
              Publish Project
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
