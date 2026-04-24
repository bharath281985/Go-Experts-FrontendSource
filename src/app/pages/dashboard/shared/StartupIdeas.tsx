import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, 
  Rocket, 
  Lightbulb, 
  Users, 
  ShieldCheck, 
  ArrowRight, 
  Search, 
  Filter,
  CheckCircle2,
  ChevronRight,
  Plus,
  FileText,
  DollarSign,
  TrendingUp,
  Target,
  Download,
  Eye,
  ExternalLink,
  UploadCloud,
  Trash2,
  X,
  Clock
} from 'lucide-react';
import api, { getImgUrl } from '@/app/utils/api';
import { toast } from 'sonner';
import { useSiteSettings } from "@/app/context/SiteSettingsContext";

export default function StartupIdeas() {
  const navigate = useNavigate();
  const settings = useSiteSettings();
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);
  const [showSubmissionFlow, setShowSubmissionFlow] = useState(false);
  const [ideas, setIdeas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [recommendedPlan, setRecommendedPlan] = useState<any>(null);
  const [ndaAccepted, setNdaAccepted] = useState(false);
  const [categories, setCategories] = useState<string[]>([
    "Business Expansion",
    "Franchise Idea",
    "Service Concept",
    "Social Impact Idea",
    "Startup Idea",
    "Tech / App Idea",
  ]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    category: "Startup Idea",
    title: "",
    shortDescription: "",
    detailedDescription: "",
    problem: "",
    solution: "",
    uniqueness: "",
    targetAudience: "",
    marketSize: "",
    competitorAnalysis: "",
    fundingAmount: "",
    useOfFunds: "",
    milestones: "",
    ndaRequired: "No",
    signedNDAFile: null as File | null,
    pitchDeckFile: null as File | null,
    youtubeUrl: "",
    ideaImages: [] as File[],
  });

  useEffect(() => {
    fetchIdeas();
    fetchRecommendedPlan();
  }, [selectedCategory]);

  useEffect(() => {
    const fetchStartupCategories = async () => {
      try {
        const res = await api.get('/startup-categories');
        if (res.data.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          const sortedCategories = res.data.data
            .map((item: any) => item.name)
            .filter(Boolean)
            .sort((a: string, b: string) => a.localeCompare(b));
          setCategories(sortedCategories);
        }
      } catch (err) {
        console.error('Error fetching startup categories:', err);
      }
    };

    fetchStartupCategories();
  }, []);

  const fetchRecommendedPlan = async () => {
    try {
      const [plansRes, statusRes] = await Promise.all([
        api.get('/subscription-plans'),
        api.get('/subscription/my-status', { skipToast: true } as any).catch(() => null)
      ]);

      if (plansRes.data.success) {
        const subscription = statusRes?.data?.subscription;
        const currentPlanId = subscription?.plan_id?._id || subscription?.plan_id;
        const currentStartupLimit = Number(subscription?.plan_id?.startup_idea_post_limit || 0);
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const roles = currentUser?.roles || (currentUser?.role ? [currentUser.role] : []);

        const roleMatches = (plan: any) => {
          const targetRoles = Array.isArray(plan.target_role) ? plan.target_role : [plan.target_role].filter(Boolean);
          return targetRoles.includes('both') || targetRoles.some((role: string) => roles.includes(role)) || targetRoles.includes('startup_creator');
        };

        const activePlans = plansRes.data.data.filter((p: any) => p.status === 'enabled');
        const startupPlans = activePlans.filter((p: any) => {
          const planLimit = Number(p.startup_idea_post_limit || 0);
          const isCurrentPlan = String(p._id) === String(currentPlanId);
          return !isCurrentPlan && p.price > 0 && planLimit > currentStartupLimit && roleMatches(p);
        });

        if (startupPlans.length > 0) {
          const featured = startupPlans.find((p: any) => p.featured);
          setRecommendedPlan(featured || startupPlans.sort((a: any, b: any) => a.price - b.price)[0]);
        } else {
          const fallbackPaidPlan = activePlans
            .filter((p: any) => p.price > 0 && Number(p.startup_idea_post_limit || 0) > 0 && roleMatches(p))
            .sort((a: any, b: any) => a.price - b.price)[0];
          setRecommendedPlan(fallbackPaidPlan || null);
        }
      }
    } catch (err) {
      console.error('Error fetching plans:', err);
    }
  };

  const fetchIdeas = async () => {
    setLoading(true);
    try {
      const res = await api.get('/startup-ideas/my-ideas', {
        params: {
          category: selectedCategory === 'All' ? undefined : selectedCategory,
          search: searchQuery || undefined
        }
      });
      if (res.data.success) {
        setIdeas(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching ideas:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const nextStep = () => {
    if (step === 2) {
      if (!formData.title.trim()) return toast.error('Concept Title is required');
      if (!formData.shortDescription.trim()) return toast.error('Short Abstract is required');
      if (!formData.detailedDescription.trim()) return toast.error('Detailed Vision is required');
    }

    if (step === 3) {
      if (!formData.problem.trim()) return toast.error('Core Problem must be described');
      if (!formData.solution.trim()) return toast.error('Your Proposed Solution is required');
    }

    if (step === 6 && formData.ndaRequired === 'Yes') {
      if (!ndaAccepted) {
        toast.error('Please review and accept the NDA terms to continue');
        return;
      }
      if (!formData.signedNDAFile) {
        toast.error('Please upload the signed and stamped NDA document');
        return;
      }
    }
    setStep((prev) => Math.min(prev + 1, 7));
  };
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));
  
  const handleSubmitIdea = async () => {
    setSubmitting(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'signedNDAFile') {
            if (value) data.append('signednda', value as File);
        } else if (key === 'pitchDeckFile') {
            if (value) data.append('pitchDeck', value as File);
        } else if (key === 'ideaImages') {
            (value as File[]).forEach((file) => data.append('ideaImages', file));
        } else if (value !== null) {
            data.append(key, value as string);
        }
      });

      const res = await api.post('/startup-ideas', data);
      if (res.data.success) {
        toast.success('Your idea has been submitted for admin approval!');
        setShowSubmissionFlow(false);
        setStep(1);
        setNdaAccepted(false);
        setFormData({
            category: "Startup Idea",
            title: "",
            shortDescription: "",
            detailedDescription: "",
            problem: "",
            solution: "",
            uniqueness: "",
            targetAudience: "",
            marketSize: "",
            competitorAnalysis: "",
            fundingAmount: "",
            useOfFunds: "",
            milestones: "",
            ndaRequired: "No",
            signedNDAFile: null,
            pitchDeckFile: null,
            youtubeUrl: "",
            ideaImages: [],
        });
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || '';
      if (msg.includes('validation failed') || msg.includes('required')) {
        toast.error('Please ensure all mandatory fields (Title, Summaries, Problem & Solution) are correctly filled out.');
      } else {
        toast.error(msg || 'Failed to submit idea. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnlockContact = async (ideaId: string) => {
    try {
      const res = await api.post(`/startup-ideas/${ideaId}/unlock`);
      if (res.data.success) {
        toast.success('Contact details unlocked!');
        fetchIdeas(); // Refresh to show contact info
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to unlock contact');
    }
  };

  const handleStartSubmission = async () => {
    try {
      setLoading(true);
      const res = await api.get('/subscription/my-status');
      if (res.data.success && res.data.subscription) {
        if (res.data.subscription.remaining_startup_posts > 0) {
          setShowSubmissionFlow(true);
        } else {
          setShowUpgradePopup(true);
        }
      } else {
         toast.error('Active subscription required to submit startup ideas.');
      }
    } catch (err: any) {
      toast.error('Failed to verify subscription status.');
    } finally {
      setLoading(false);
    }
  };

  if (showSubmissionFlow) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-8">
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#F24C20] to-orange-600 bg-clip-text text-transparent">
                  Submit Your Innovation
                </h1>
                <p className="text-neutral-500 mt-1">Provide detailed insights to attract the right investors</p>
            </div>
            <button 
                onClick={() => setShowSubmissionFlow(false)}
                className="px-6 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
            >
                Cancel
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[300px,1fr] gap-8">
            {/* Sidebar Steps */}
            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 h-fit space-y-4">
                {[
                    { n: 1, t: "Category", icon: Filter },
                    { n: 2, t: "Overview", icon: FileText },
                    { n: 3, t: "Problem & Solution", icon: Lightbulb },
                    { n: 4, t: "Market", icon: Target },
                    { n: 5, t: "Investment", icon: DollarSign },
                    { n: 6, t: "Extras", icon: ShieldCheck },
                    { n: 7, t: "Confirm", icon: CheckCircle2 }
                ].map((s) => (
                    <div key={s.n} className={`flex items-center gap-4 transition-all ${step === s.n ? 'scale-105' : 'opacity-60'}`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${step === s.n ? 'bg-[#F24C20] text-white' : 'bg-neutral-100 dark:bg-neutral-800'}`}>
                            <s.icon className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xs text-neutral-500">Step {s.n}</div>
                            <div className={`font-semibold text-sm ${step === s.n ? 'text-[#F24C20]' : ''}`}>{s.t}</div>
                        </div>
                    </div>
                ))}

                <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800">
                    <div className="flex justify-between text-xs mb-2">
                        <span>Overall Progress</span>
                        <span>{Math.round((step/7)*100)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-[#F24C20] transition-all duration-500" 
                            style={{ width: `${(step/7)*100}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Form Content */}
            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 border border-neutral-200 dark:border-neutral-800 shadow-sm">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                            <h2 className="text-2xl font-bold">What's the core category of your idea?</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => updateField('category', cat)}
                                        className={`p-6 text-left rounded-2xl border transition-all ${formData.category === cat ? 'border-[#F24C20] bg-[#F24C20]/5' : 'border-neutral-100 dark:border-neutral-800 hover:border-orange-200'}`}
                                    >
                                        <div className="font-bold text-lg mb-1">{cat}</div>
                                        <p className="text-sm text-neutral-500">Standard criteria for {cat.toLowerCase()} submissions.</p>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                            <h2 className="text-2xl font-bold">Basic Overview</h2>
                            <div className="space-y-4">
                                <FormInput label="Idea Title" value={formData.title} onChange={(val: string) => updateField('title', val)} placeholder="e.g., AI-Driven Fleet Management" />
                                <FormInput label="Short Hook (1-2 sentences)" value={formData.shortDescription} onChange={(val: string) => updateField('shortDescription', val)} placeholder="The 'Elevator Pitch' for your idea" />
                                <FormTextarea label="Detailed Description" value={formData.detailedDescription} onChange={(val: string) => updateField('detailedDescription', val)} placeholder="Deep dive into your concept..." rows={6} />
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                            <h2 className="text-2xl font-bold">The Problem & Your Solution</h2>
                            <div className="space-y-4">
                                <FormTextarea label="What's the Problem?" value={formData.problem} onChange={(val: string) => updateField('problem', val)} placeholder="What specific pain point are you addressing?" />
                                <FormTextarea label="The Solution" value={formData.solution} onChange={(val: string) => updateField('solution', val)} placeholder="How does your idea uniquely solve this?" />
                                <FormTextarea label="Unique Selling Point (USP)" value={formData.uniqueness} onChange={(val: string) => updateField('uniqueness', val)} placeholder="What makes you stand out from incumbents?" />
                            </div>
                        </motion.div>
                    )}
                    
                    {step === 4 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                            <h2 className="text-2xl font-bold">Market & Target Audience</h2>
                            <div className="space-y-4">
                                <FormInput label="Target Audience" value={formData.targetAudience} onChange={(val: string) => updateField('targetAudience', val)} placeholder="e.g., Small business owners, Gen Z travellers" />
                                <FormTextarea label="Market Opportunity" value={formData.marketSize} onChange={(val: string) => updateField('marketSize', val)} placeholder="Market size, growth rates, etc." />
                                <FormTextarea label="Competition" value={formData.competitorAnalysis} onChange={(val: string) => updateField('competitorAnalysis', val)} placeholder="Who are you competing with?" />
                            </div>
                        </motion.div>
                    )}

                    {step === 5 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                            <h2 className="text-2xl font-bold">Investment Readiness</h2>
                            <div className="space-y-4">
                                <FormInput label="Requested Funding (Optional)" value={formData.fundingAmount} onChange={(val: string) => updateField('fundingAmount', val)} placeholder="e.g., ₹50L - ₹1Cr" />
                                <FormTextarea label="Utilization of Funds (*Describe How You Will Utilize The Funds)" value={formData.useOfFunds} onChange={(val: string) => updateField('useOfFunds', val)} placeholder="Where will you spend the money?" />
                                <FormTextarea label="Key Milestones" value={formData.milestones} onChange={(val: string) => updateField('milestones', val)} placeholder="Product launch, first 100 users, etc." />
                            </div>
                        </motion.div>
                    )}

                    {step === 6 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                            <h2 className="text-2xl font-bold">NDA & Verification</h2>
                            <div className="space-y-6">
                                <div className="p-6 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                                    <h3 className="font-bold flex items-center gap-2 mb-2">
                                        <ShieldCheck className="w-5 h-5 text-blue-500" />
                                        Requires Non-Disclosure Agreement (NDA)?
                                    </h3>
                                    <p className="text-sm text-neutral-500 mb-4">Should users sign an NDA before seeing the full details?</p>
                                    <div className="flex gap-4 mb-6">
                                        {['No', 'Yes'].map(opt => (
                                            <button 
                                                key={opt}
                                                onClick={() => {
                                                    updateField('ndaRequired', opt);
                                                    if (opt === 'No') setNdaAccepted(false);
                                                }}
                                                className={`px-8 py-3 rounded-xl border font-bold transition-all ${formData.ndaRequired === opt ? 'bg-blue-500 text-white border-blue-600' : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800'}`}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>

                                    {formData.ndaRequired === 'Yes' && (
                                        <motion.div 
                                            initial={{ height: 0, opacity: 0 }} 
                                            animate={{ height: 'auto', opacity: 1 }}
                                            className="space-y-4 pt-6 border-t border-neutral-200 dark:border-neutral-700 mt-6"
                                        >
                                            <div className="flex items-center justify-between p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg text-blue-600">
                                                        <FileText className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold">Standard Startup NDA</div>
                                                        <div className="text-xs text-neutral-500">Document Format: PDF</div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <a 
                                                        href={settings.startup_nda_template ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${settings.startup_nda_template}` : '#'} 
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:text-blue-600 transition-colors"
                                                        title="Preview NDA"
                                                    >
                                                        <Eye className="w-5 h-5" />
                                                    </a>
                                                    <a 
                                                        href={settings.startup_nda_template ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${settings.startup_nda_template}` : '#'} 
                                                        download
                                                        className="p-2 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:text-blue-600 transition-colors"
                                                        title="Download NDA"
                                                    >
                                                        <Download className="w-5 h-5" />
                                                    </a>
                                                </div>
                                            </div>
                                            
                                            <label className="flex items-start gap-3 p-2 cursor-pointer group">
                                                <div className="relative mt-1">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={ndaAccepted}
                                                        onChange={(e) => setNdaAccepted(e.target.checked)}
                                                        className="peer sr-only"
                                                    />
                                                    <div className="w-5 h-5 border-2 border-neutral-300 dark:border-neutral-700 rounded-md peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-all" />
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 transition-all" />
                                                </div>
                                                <span className="text-sm text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-900 transition-colors">
                                                    I have reviewed the official NDA and I agree to make it mandatory for anyone viewing my startup idea details.
                                                </span>
                                            </label>
                                         </motion.div>
                                    )}

                                    {formData.ndaRequired === 'Yes' && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }} 
                                            animate={{ opacity: 1, y: 0 }} 
                                            className="mt-8 pt-8 border-t border-neutral-100 dark:border-neutral-800"
                                        >
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                                                <h4 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">Final Step: Signed Document With Stamp On Your Document </h4>
                                            </div>
                                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6 font-medium leading-relaxed">
                                                Please upload the signed and stamped copy of the NDA you downloaded above. This is required for your protection.
                                            </p>
                                            
                                            <div className="relative group">
                                                <input 
                                                    type="file" 
                                                    id="signed-nda-upload" 
                                                    className="hidden" 
                                                    accept=".pdf" 
                                                    onChange={(e) => updateField('signedNDAFile', e.target.files?.[0])}
                                                />
                                                
                                                {!formData.signedNDAFile ? (
                                                    <button 
                                                        onClick={() => document.getElementById('signed-nda-upload')?.click()}
                                                        className="w-full flex flex-col items-center gap-3 p-10 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-[24px] hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-neutral-400 font-medium"
                                                    >
                                                        <UploadCloud className="w-12 h-12 text-neutral-300 dark:text-neutral-700" />
                                                        <span className="text-sm">Click here to upload the signed PDF</span>
                                                    </button>
                                                ) : (
                                                    <div className="flex items-center justify-between w-full px-5 py-4 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800 rounded-[20px]">
                                                        <div className="flex items-center gap-4">
                                                            <div className="p-3 bg-blue-500/10 rounded-xl">
                                                                <FileText className="w-6 h-6 text-blue-500" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-neutral-900 dark:text-white truncate max-w-[180px]">
                                                                    {formData.signedNDAFile.name}
                                                                </p>
                                                                <p className="text-xs text-neutral-500">{(formData.signedNDAFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                                            </div>
                                                        </div>
                                                        <button 
                                                            onClick={() => updateField('signedNDAFile', null)}
                                                            className="p-2.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}

                                    <div className="mt-8 pt-8 border-t border-neutral-100 dark:border-neutral-800 space-y-6">
                                        <div>
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="w-1.5 h-6 bg-[#F24C20] rounded-full" />
                                                <h4 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">Pitch Materials</h4>
                                            </div>
                                            <p className="text-sm text-neutral-500 mb-4">
                                                Upload only your pitch deck, add a separate YouTube video link, and include supporting images.
                                            </p>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold mb-2">Pitch Deck (PPT / PPTX / PDF)</label>
                                                <input
                                                    type="file"
                                                    id="pitch-deck-upload"
                                                    className="hidden"
                                                    accept=".ppt,.pptx,.pdf"
                                                    onChange={(e) => updateField('pitchDeckFile', e.target.files?.[0] || null)}
                                                />
                                                {!formData.pitchDeckFile ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => document.getElementById('pitch-deck-upload')?.click()}
                                                        className="w-full flex flex-col items-center gap-3 p-8 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-[24px] hover:border-[#F24C20]/50 hover:bg-[#F24C20]/5 transition-all text-neutral-400 font-medium"
                                                    >
                                                        <UploadCloud className="w-10 h-10 text-neutral-300 dark:text-neutral-700" />
                                                        <span className="text-sm">Upload pitch deck</span>
                                                    </button>
                                                ) : (
                                                    <div className="flex items-center justify-between w-full px-5 py-4 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800 rounded-[20px]">
                                                        <div>
                                                            <p className="text-sm font-bold text-neutral-900 dark:text-white truncate max-w-[220px]">{formData.pitchDeckFile.name}</p>
                                                            <p className="text-xs text-neutral-500">{(formData.pitchDeckFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                                        </div>
                                                        <button type="button" onClick={() => updateField('pitchDeckFile', null)} className="p-2.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all">
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            <FormInput
                                                label="YouTube Video URL"
                                                value={formData.youtubeUrl}
                                                onChange={(val: string) => updateField('youtubeUrl', val)}
                                                placeholder="https://www.youtube.com/watch?v=..."
                                            />

                                            <div>
                                                <label className="block text-sm font-semibold mb-2">Idea Images</label>
                                                <input
                                                    type="file"
                                                    id="idea-images-upload"
                                                    className="hidden"
                                                    accept="image/*"
                                                    multiple
                                                    onChange={(e) => updateField('ideaImages', Array.from(e.target.files || []))}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => document.getElementById('idea-images-upload')?.click()}
                                                    className="w-full flex flex-col items-center gap-3 p-8 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-[24px] hover:border-[#F24C20]/50 hover:bg-[#F24C20]/5 transition-all text-neutral-400 font-medium"
                                                >
                                                    <UploadCloud className="w-10 h-10 text-neutral-300 dark:text-neutral-700" />
                                                    <span className="text-sm">Upload idea images</span>
                                                </button>
                                                {formData.ideaImages.length > 0 && (
                                                    <div className="mt-3 space-y-2">
                                                        {formData.ideaImages.map((file, index) => (
                                                            <div key={`${file.name}-${index}`} className="flex items-center justify-between px-4 py-3 rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40">
                                                                <span className="text-sm font-medium truncate max-w-[220px]">{file.name}</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => updateField('ideaImages', formData.ideaImages.filter((_, fileIndex) => fileIndex !== index))}
                                                                    className="p-2 text-neutral-400 hover:text-red-500"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 7 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                            <h2 className="text-2xl font-bold">Confirm Your Submission</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <SummaryItem label="Title" value={formData.title} />
                                <SummaryItem label="Category" value={formData.category} />
                                <SummaryItem label="NDA Required" value={formData.ndaRequired} />
                                <SummaryItem label="Signed NDA" value={formData.signedNDAFile ? 'Uploaded' : (formData.ndaRequired === 'Yes' ? 'Pending' : 'Not Required')} />
                                <SummaryItem label="Pitch Deck" value={formData.pitchDeckFile ? 'Uploaded' : 'Not Added'} />
                                <SummaryItem label="YouTube URL" value={formData.youtubeUrl || 'Not Added'} />
                                <SummaryItem label="Images" value={formData.ideaImages.length ? `${formData.ideaImages.length} uploaded` : 'Not Added'} />
                                <SummaryItem label="Funding" value={formData.fundingAmount || 'N/A'} />
                            </div>
                            <div className="p-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800/30 rounded-xl text-sm text-orange-800 dark:text-orange-300">
                                Note: After submission, your idea will be reviewed by our moderation team. You'll be notified once it goes live.
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex justify-between mt-10 pt-6 border-t border-neutral-100 dark:border-neutral-800">
                    <button 
                        onClick={prevStep} 
                        disabled={step === 1}
                        className="px-6 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-30"
                    >
                        Previous
                    </button>
                    {step < 7 ? (
                        <button 
                            onClick={nextStep}
                            className="px-8 py-3 rounded-xl bg-[#F24C20] text-white font-bold hover:shadow-lg hover:shadow-[#F24C20]/20 transition-all flex items-center gap-2"
                        >
                            Next <ArrowRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button 
                            onClick={handleSubmitIdea}
                            disabled={submitting}
                            className="px-10 py-3 rounded-xl bg-green-600 text-white font-bold hover:shadow-lg hover:shadow-green-600/20 transition-all disabled:opacity-50"
                        >
                            {submitting ? 'Submitting...' : 'Submit Idea'}
                        </button>
                    )}
                </div>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-[32px] bg-[#044071] px-8 py-9 lg:px-12 lg:py-11 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(242,76,32,0.24),transparent_34%),linear-gradient(120deg,rgba(4,64,113,0),rgba(255,255,255,0.08))] pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-sm font-medium mb-5"
            >
                <Rocket className="w-4 h-4 text-orange-400" />
                Go Experts Startup Hub
            </motion.div>
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-4 max-w-2xl">
              Turn your startup idea into an <span className="text-orange-400">investable</span> opportunity.
            </h1>
            <p className="text-blue-100 text-base lg:text-lg mb-7 leading-relaxed max-w-2xl">
              Submit your project concepts through a structured workflow, showcase your vision with clarity, and connect with partners using smart matching.
            </p>
            <div className="flex flex-wrap items-center gap-3">
                <button 
                    onClick={handleStartSubmission}
                    className="px-7 py-3 bg-[#F24C20] rounded-2xl font-bold hover:scale-105 transition-all shadow-xl shadow-[#F24C20]/20"
                >
                    Submit Your Idea
                </button>
            </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between bg-white dark:bg-neutral-900 p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2 overflow-x-auto w-full pb-1 lg:pb-0 hide-scrollbar">
              {['All', ...categories].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${selectedCategory === cat ? 'bg-[#F24C20] text-white shadow-lg shadow-[#F24C20]/15' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700'}`}
                  >
                      {cat}
                  </button>
              ))}
          </div>
          <div className="relative w-full lg:w-72 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input 
                type="text" 
                placeholder="Search ideas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && fetchIdeas()}
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-xl border-none outline-none focus:ring-1 focus:ring-[#F24C20]"
              />
          </div>
      </div>

      {/* Ideas Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="h-56 rounded-3xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />)}
        </div>
      ) : ideas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ideas.map((idea) => (
                <motion.div 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={idea._id}
                    className="bg-white dark:bg-neutral-900 rounded-[32px] border border-neutral-200 dark:border-neutral-800 overflow-hidden hover:shadow-xl hover:shadow-orange-500/5 transition-all group"
                >
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-bold rounded-lg uppercase tracking-wider">
                                {idea.category}
                            </span>
                            <div className="flex items-center gap-1 text-neutral-400 text-xs">
                                <TrendingUp className="w-3 h-3" />
                                {idea.views} views
                            </div>
                        </div>
                        <h3 className="text-xl font-bold mb-2 group-hover:text-[#F24C20] transition-colors">{idea.title}</h3>
                        <p className="text-neutral-500 text-sm line-clamp-3 mb-6">
                            {idea.shortDescription}
                        </p>
                        
                        <div className="flex items-center gap-3 mb-6 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl">
                            <img src={getImgUrl(idea.creator?.profile_image) || 'https://via.placeholder.com/100'} className="w-10 h-10 rounded-full object-cover" />
                            <div className="flex-1 overflow-hidden">
                                <div className="text-xs text-neutral-400">Founded by</div>
                                <div className="font-bold text-sm truncate">{idea.creator?.full_name}</div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                            <div className="text-xs text-neutral-400">
                                Investment: <span className="text-neutral-900 dark:text-white font-bold">{idea.fundingAmount || 'NDA'}</span>
                            </div>
                            <Link 
                                to={window.location.pathname.includes('investor') ? `/dashboard-investor/explore-ideas/${idea._id}` : `/dashboard-startup/ideas/${idea._id}`}
                                className="px-5 py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-black text-sm font-bold hover:bg-[#F24C20] dark:hover:bg-[#F24C20] dark:hover:text-white transition-all flex items-center gap-2"
                            >
                                View Details
                            </Link>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
      ) : (
          <div className="py-20 text-center">
              <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lightbulb className="w-10 h-10 text-neutral-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">No ideas found</h3>
              <p className="text-neutral-500">Be the first to submit a revolutionary startup concept!</p>
          </div>
      )}

      {/* Upgrade Plan Popup */}
      <AnimatePresence>
        {showUpgradePopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-neutral-900 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-neutral-200 dark:border-neutral-800 relative"
            >
              <button 
                onClick={() => setShowUpgradePopup(false)}
                className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 rounded-full transition-colors flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mb-6">
                <Rocket className="w-8 h-8 text-[#F24C20]" />
              </div>
              
              <h3 className="text-2xl font-bold mb-2">Limit Reached</h3>
              <p className="text-neutral-500 mb-6 font-medium">
                You have reached your limit for submitting startup ideas. Upgrade your plan to unlock more submissions and connect with premium investors.
              </p>
              
              <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-800/50 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-700 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Recommended</span>
                  {recommendedPlan?.badge ? (
                      <span className="px-2.5 py-1 bg-[#F24C20] text-white text-[10px] font-bold rounded-lg tracking-wider uppercase">{recommendedPlan.badge}</span>
                  ) : recommendedPlan?.featured ? (
                      <span className="px-2.5 py-1 bg-[#F24C20] text-white text-[10px] font-bold rounded-lg tracking-wider uppercase">Most Popular</span>
                  ) : null}
                </div>
                <h4 className="text-lg font-bold mb-1">{recommendedPlan ? recommendedPlan.name : 'Premium Plan'}</h4>
                <p className="text-sm text-neutral-500 mb-4">{recommendedPlan?.description || 'Unlimited startup idea submissions, prioritized matching, and featured placements.'}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                      {recommendedPlan ? `₹${(recommendedPlan.price || 0).toLocaleString()}` : '$49'}
                  </span>
                  <span className="text-sm text-neutral-500">
                    /{recommendedPlan ? (recommendedPlan.billing_cycle === 'monthly' ? 'month' : (recommendedPlan.billing_cycle === 'yearly' ? 'year' : 'one-time')) : 'month'}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => {
                    setShowUpgradePopup(false);
                    navigate('/dashboard/subscription');
                  }}
                  className="w-full py-4 bg-[#F24C20] text-white rounded-xl font-bold hover:shadow-lg hover:shadow-[#F24C20]/20 transition-all flex items-center justify-center gap-2"
                >
                  View Subscription Plans <ArrowRight className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setShowUpgradePopup(false)}
                  className="w-full py-4 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white rounded-xl font-bold hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all"
                >
                  Maybe Later
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper Components
function FormInput({ label, value, onChange, placeholder, type = 'text' }: any) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 ml-1">{label}</label>
            <input 
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-5 py-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-transparent outline-none focus:border-[#F24C20] focus:ring-1 focus:ring-[#F24C20] transition-all"
            />
        </div>
    );
}

function FormTextarea({ label, value, onChange, placeholder, rows = 4 }: any) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 ml-1">{label}</label>
            <textarea 
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={rows}
                className="w-full px-5 py-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-transparent outline-none focus:border-[#F24C20] focus:ring-1 focus:ring-[#F24C20] transition-all resize-none"
            />
        </div>
    );
}

function SummaryItem({ label, value }: any) {
    return (
        <div className="p-4 bg-neutral-50 dark:bg-neutral-800/30 rounded-2xl border border-neutral-100 dark:border-neutral-800">
            <div className="text-xs text-neutral-400 font-bold uppercase tracking-wider mb-1">{label}</div>
            <div className="font-semibold text-neutral-900 dark:text-white">{value || 'N/A'}</div>
        </div>
    );
}
