import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, ArrowLeft, ArrowRight, CheckCircle, Sparkles,
  Palette, Code, Smartphone, TrendingUp, FileText, Video,
  Shield, Layout, DollarSign, Clock, Award, Star,
  RefreshCw, File, Phone, Zap, Target, ShieldCheck,
  LucideIcon
} from 'lucide-react';
import * as Icons from 'lucide-react';
import api from '../../utils/api';

interface GigFinderWizardProps {
  onClose: () => void;
  onComplete: (preferences: GigPreferences) => void;
}

export interface GigPreferences {
  category: string;
  goal: string;
  budgetRange: string;
  deliveryTime: string;
  experienceLevel: string;
  extras: string[];
}

const defaultCategories = [
  { value: 'logo', label: 'Logo Design', icon: '🎨' },
  { value: 'uiux', label: 'UI/UX Design', icon: '🎨' },
  { value: 'webdev', label: 'Website Development', icon: '💻' },
  { value: 'mobileapp', label: 'Mobile App', icon: '📱' },
  { value: 'video', label: 'Video Editing', icon: '🎬' },
  { value: 'marketing', label: 'Social Media Marketing', icon: '📢' },
  { value: 'seo', label: 'SEO', icon: '📈' },
  { value: 'writing', label: 'Content Writing', icon: '✍️' },
  { value: 'security', label: 'Cybersecurity', icon: '🛡️' },
];

const goals = [
  { value: 'quick', label: 'Quick Delivery', emoji: '⚡', description: 'Get it done fast' },
  { value: 'quality', label: 'Premium Quality', emoji: '✨', description: 'Top-tier results' },
  { value: 'budget', label: 'Budget-Friendly', emoji: '💰', description: 'Cost-effective' },
  { value: 'support', label: 'Long-term Support', emoji: '🤝', description: 'Ongoing help' },
];

const budgetRanges = [
  { value: '499-999', label: '₹499 - ₹999', subtitle: 'Starter' },
  { value: '999-2999', label: '₹999 - ₹2,999', subtitle: 'Standard' },
  { value: '2999-9999', label: '₹2,999 - ₹9,999', subtitle: 'Premium' },
  { value: '10000+', label: '₹10K+', subtitle: 'Enterprise' },
];

const deliveryTimes = [
  { value: '24h', label: '24 hours', icon: Clock },
  { value: '2-3days', label: '2–3 days', icon: Clock },
  { value: '1week', label: '1 week', icon: Clock },
  { value: 'flexible', label: 'Flexible', icon: Clock },
];

const experienceLevels = [
  { value: 'new', label: 'New Sellers', emoji: '🌱' },
  { value: 'rising', label: 'Rising Talent', emoji: '⚡' },
  { value: 'toprated', label: 'Top Rated', emoji: '⭐' },
  { value: 'verified', label: 'Verified Only', emoji: '✅' },
];

const extras = [
  { value: 'revisions', label: 'With Revisions', icon: RefreshCw },
  { value: 'sourcefiles', label: 'Source Files', icon: File },
  { value: 'support', label: 'Support Included', icon: Phone },
  { value: 'consultation', label: 'Consultation Call', icon: Phone },
];

export default function GigFinderWizard({ onClose, onComplete }: GigFinderWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [dynamicSteps, setDynamicSteps] = useState<any>({});
  const [categories, setCategories] = useState<any[]>([]);

  // Icon Resolver Utility
  const getIcon = (iconName: string): LucideIcon | string => {
    if (!iconName) return '📁';
    if (/[\uD800-\uDBFF][\uDC00-\uDFFF]/.test(iconName) || iconName.length <= 2) return iconName;
    const IconComponent = (Icons as any)[iconName];
    return IconComponent || '📁';
  };

  const [preferences, setPreferences] = useState<GigPreferences>({
    category: '',
    goal: '',
    budgetRange: '',
    deliveryTime: '',
    experienceLevel: '',
    extras: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [catRes, stepsRes] = await Promise.all([
          api.get('/cms/categories'),
          api.get('/cms/registration-steps')
        ]);

        if (catRes.data.success) {
          const activeTop = catRes.data.categories.filter((c: any) => c.is_active && !c.parent);
          setCategories(activeTop.map((c: any) => ({
            value: c.slug,
            label: c.name,
            icon: c.icon,
            image: c.image
          })));
        }

        if (stepsRes.data.success) {
          const steps = stepsRes.data.data;
          const mapped: any = {};
          
          const stepsToSync = [
            { key: 'goal', field: 'goal' },
            { key: 'budgetRange', field: 'budgetRange' },
            { key: 'deliveryTime', field: 'deliveryTime' },
            { key: 'experienceLevel', field: 'experienceLevel' },
            { key: 'extras', field: 'extras' }
          ];

          stepsToSync.forEach(s => {
            const stepData = steps.find((sd: any) => sd.field === s.field);
            if (stepData) mapped[s.key] = stepData.options || [];
          });

          setDynamicSteps(mapped);
        }
      } catch (err) {
        console.error('Fetch wizard data failed', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalSteps = 6;

  const updatePreference = <K extends keyof GigPreferences>(
    field: K,
    value: GigPreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
  };

  const toggleExtra = (extra: string) => {
    if (preferences.extras.includes(extra)) {
      updatePreference('extras', preferences.extras.filter(e => e !== extra));
    } else {
      updatePreference('extras', [...preferences.extras, extra]);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return preferences.category !== '';
      case 2: return preferences.goal !== '';
      case 3: return preferences.budgetRange !== '';
      case 4: return preferences.deliveryTime !== '';
      case 5: return preferences.experienceLevel !== '';
      case 6: return true;
      default: return false;
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps && canProceed()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    onComplete(preferences);
  };

  const steps = [
    { number: 1, label: 'Service Type' },
    { number: 2, label: 'Your Goal' },
    { number: 3, label: 'Budget' },
    { number: 4, label: 'Delivery' },
    { number: 5, label: 'Experience' },
    { number: 6, label: 'Extras' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-3 rounded-full bg-neutral-900/50 hover:bg-neutral-800 border border-neutral-800 hover:border-[#F24C20] transition-all group z-10"
      >
        <X className="w-6 h-6 text-neutral-400 group-hover:text-[#F24C20]" />
      </button>

      <div className="w-full max-w-7xl h-[95vh] mx-auto px-6 flex gap-12">
        <div className="w-96 flex-shrink-0 py-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="sticky top-12 space-y-8"
          >
            <div>
              <h2 className="text-4xl font-bold text-white mb-3">Find Perfect Gigs</h2>
              <p className="text-xl text-neutral-400">Answer a few questions to get personalized matches</p>
            </div>

            <div className="space-y-3">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center gap-4">
                  <div className="relative">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${currentStep > step.number
                        ? 'bg-green-500 text-white'
                        : currentStep === step.number
                          ? 'bg-[#F24C20] text-white shadow-lg shadow-[#F24C20]/50'
                          : 'bg-neutral-800 text-neutral-500'
                        }`}
                    >
                      {currentStep > step.number ? <CheckCircle className="w-5 h-5" /> : step.number}
                    </div>
                  </div>
                  <div className={`font-medium transition-colors text-sm ${currentStep === step.number ? 'text-white' : currentStep > step.number ? 'text-green-400' : 'text-neutral-500'}`}>
                    {step.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <div className="flex justify-between text-sm text-neutral-400 mb-2">
                <span>Progress</span>
                <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
              </div>
              <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#F24C20] to-orange-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>
            </div>

            <div className="mt-12 p-6 rounded-2xl bg-gradient-to-br from-[#F24C20]/10 to-transparent border border-[#F24C20]/30">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-[#F24C20]" />
                <h3 className="font-bold text-white">Smart Matching</h3>
              </div>
              <ul className="space-y-3 text-sm text-neutral-300">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>AI-powered gig recommendations</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Filter by budget & timeline</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>

        <div className="flex-1 flex flex-col py-12">
          <div className="flex-1 overflow-y-auto pr-4">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-8">
                  <div>
                    <h3 className="text-5xl font-bold text-white mb-4">What do you want done?</h3>
                    <p className="text-xl text-neutral-400">Choose the service you need</p>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((category) => {
                      const isSelected = preferences.category === category.value;
                      return (
                        <button
                          key={category.value}
                          onClick={() => updatePreference('category', category.value)}
                          className={`relative p-6 rounded-2xl border-2 transition-all text-center group ${isSelected ? 'border-[#F24C20] bg-[#F24C20]/10' : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700'}`}
                        >
                          <div className="mb-3 h-12 flex items-center justify-center">
                            {category.image ? (
                              <img src={category.image.startsWith('http') ? category.image : `${import.meta.env.VITE_API_URL}${category.image}`} alt={category.label} className="w-12 h-12 object-contain" />
                            ) : typeof getIcon(category.icon) === 'string' ? (
                              <div className="text-4xl">{getIcon(category.icon)}</div>
                            ) : (
                                (() => {
                                  const IconCom = getIcon(category.icon);
                                  return typeof IconCom !== 'string' ? <IconCom className={`w-10 h-10 ${isSelected ? 'text-[#F24C20]' : 'text-neutral-400'}`} /> : <div className="text-4xl">📁</div>;
                                })()
                            )}
                          </div>
                          <div className="font-semibold text-white text-sm line-clamp-1">{category.label}</div>
                          {isSelected && <CheckCircle className="absolute top-4 right-4 w-5 h-5 text-[#F24C20]" />}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-8">
                  <div>
                    <h3 className="text-5xl font-bold text-white mb-4">What's your goal?</h3>
                    <p className="text-xl text-neutral-400">Help us understand what matters most</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(dynamicSteps.goal?.length > 0 ? dynamicSteps.goal : goals).map((goal: any) => {
                      const isSelected = preferences.goal === goal.value;
                      return (
                        <button key={goal.value} onClick={() => updatePreference('goal', goal.value)} className={`relative p-8 rounded-2xl border-2 transition-all text-left group ${isSelected ? 'border-[#F24C20] bg-[#F24C20]/10' : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700'}`}>
                          <div className="flex items-start gap-4">
                            <div className="text-5xl">{goal.emoji || '🎯'}</div>
                            <div className="flex-1">
                              <div className="font-bold text-xl text-white mb-1">{goal.label}</div>
                              <p className="text-neutral-400">{goal.description}</p>
                            </div>
                            {isSelected && <CheckCircle className="w-6 h-6 text-[#F24C20] flex-shrink-0" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-8">
                  <div>
                    <h3 className="text-5xl font-bold text-white mb-4">Your budget?</h3>
                    <p className="text-xl text-neutral-400">Select your price range</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(dynamicSteps.budgetRange?.length > 0 ? dynamicSteps.budgetRange : budgetRanges).map((budget: any) => {
                      const isSelected = preferences.budgetRange === budget.value;
                      return (
                        <button key={budget.value} onClick={() => updatePreference('budgetRange', budget.value)} className={`relative p-8 rounded-2xl border-2 transition-all text-center group ${isSelected ? 'border-[#F24C20] bg-[#F24C20]/10' : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700'}`}>
                          <DollarSign className={`w-12 h-12 mx-auto mb-3 ${isSelected ? 'text-[#F24C20]' : 'text-neutral-400'}`} />
                          <div className="font-bold text-2xl text-white mb-1">{budget.label}</div>
                          <div className="text-sm text-neutral-400">{budget.subtitle}</div>
                          {isSelected && <CheckCircle className="absolute top-4 right-4 w-6 h-6 text-[#F24C20]" />}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {currentStep === 4 && (
                <motion.div key="step4" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-8">
                  <div>
                    <h3 className="text-5xl font-bold text-white mb-4">Delivery time?</h3>
                    <p className="text-xl text-neutral-400">When do you need it?</p>
                  </div>
                  <div className="space-y-4">
                    {(dynamicSteps.deliveryTime?.length > 0 ? dynamicSteps.deliveryTime : deliveryTimes).map((time: any) => {
                      const IconCom = getIcon(time.icon) as LucideIcon;
                      const isSelected = preferences.deliveryTime === time.value;
                      return (
                        <button key={time.value} onClick={() => updatePreference('deliveryTime', time.value)} className={`relative w-full p-6 rounded-2xl border-2 transition-all text-left group ${isSelected ? 'border-[#F24C20] bg-[#F24C20]/10' : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700'}`}>
                          <div className="flex items-center gap-4">
                            {typeof getIcon(time.icon) === 'string' ? <span className="text-2xl">{getIcon(time.icon)}</span> : <IconCom className={`w-8 h-8 ${isSelected ? 'text-[#F24C20]' : 'text-neutral-400'}`} />}
                            <div className="font-semibold text-xl text-white">{time.label}</div>
                            {isSelected && <CheckCircle className="w-6 h-6 text-[#F24C20] ml-auto" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {currentStep === 5 && (
                <motion.div key="step5" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-8">
                  <div>
                    <h3 className="text-5xl font-bold text-white mb-4">Experience level</h3>
                    <p className="text-xl text-neutral-400">Choose seller expertise</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {(dynamicSteps.experienceLevel?.length > 0 ? dynamicSteps.experienceLevel : experienceLevels).map((level: any) => {
                      const isSelected = preferences.experienceLevel === level.value;
                      return (
                        <button key={level.value} onClick={() => updatePreference('experienceLevel', level.value)} className={`relative p-8 rounded-2xl border-2 transition-all text-center group ${isSelected ? 'border-[#F24C20] bg-[#F24C20]/10' : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700'}`}>
                          <div className="text-6xl mb-3">{level.emoji || '⭐'}</div>
                          <div className="font-bold text-xl text-white">{level.label}</div>
                          {isSelected && <CheckCircle className="absolute top-4 right-4 w-6 h-6 text-[#F24C20]" />}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {currentStep === 6 && (
                <motion.div key="step6" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-8">
                  <div>
                    <h3 className="text-5xl font-bold text-white mb-4">Extras</h3>
                    <p className="text-xl text-neutral-400">What additional features do you need? (Optional)</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {(dynamicSteps.extras?.length > 0 ? dynamicSteps.extras : extras).map((extra: any) => {
                      const isSelected = preferences.extras.includes(extra.value);
                      const IconCom = getIcon(extra.icon) as LucideIcon;
                      return (
                        <button key={extra.value} onClick={() => toggleExtra(extra.value)} className={`relative p-6 rounded-2xl border-2 transition-all text-center group ${isSelected ? 'border-[#F24C20] bg-[#F24C20]/10' : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700'}`}>
                          {typeof getIcon(extra.icon) === 'string' ? <span className="text-4xl block mb-3">{getIcon(extra.icon)}</span> : <IconCom className={`w-10 h-10 mx-auto mb-3 ${isSelected ? 'text-[#F24C20]' : 'text-neutral-400'}`} />}
                          <div className="font-semibold text-white">{extra.label}</div>
                          {isSelected && <CheckCircle className="absolute top-4 right-4 w-5 h-5 text-[#F24C20]" />}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-neutral-800 mt-6">
            <button onClick={prevStep} disabled={currentStep === 1} className="flex items-center gap-2 px-6 py-3 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div className="flex items-center gap-3">
              {currentStep < 6 && <button onClick={() => setCurrentStep(6)} className="px-6 py-3 text-neutral-400 hover:text-white transition-colors">Skip</button>}
              {currentStep < totalSteps ? (
                <button onClick={nextStep} disabled={!canProceed()} className="flex items-center gap-2 px-8 py-3 rounded-lg bg-[#044071] hover:bg-[#055a99] text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#044071]/30">
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={handleComplete} className="flex items-center gap-2 px-8 py-3 rounded-lg bg-[#044071] hover:bg-[#055a99] text-white font-semibold transition-all shadow-lg shadow-[#044071]/30">
                  <Sparkles className="w-4 h-4" />
                  Show Results
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
