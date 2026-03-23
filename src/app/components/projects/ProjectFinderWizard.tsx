import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, Smartphone, Palette, TrendingUp, FileText, Video, Shield, Briefcase,
  DollarSign, Clock, Award, MapPin, CheckCircle2, ArrowRight, ArrowLeft, 
  Sparkles, X, Tag
} from 'lucide-react';

interface ProjectFinderWizardProps {
  onClose: () => void;
  onComplete: (answers: ProjectAnswers) => void;
}

export interface ProjectAnswers {
  projectType: string;
  priceType: string;
  budget: string;
  timeline: string;
  experience: string;
  workPreference: string;
  skills: string[];
  extraFilters: string[];
}

const projectTypeOptions = [
  { value: 'website', label: 'Website Design', icon: Globe },
  { value: 'mobile', label: 'Mobile App', icon: Smartphone },
  { value: 'uiux', label: 'UI/UX Design', icon: Palette },
  { value: 'branding', label: 'Branding', icon: Sparkles },
  { value: 'marketing', label: 'Digital Marketing', icon: TrendingUp },
  { value: 'writing', label: 'Content Writing', icon: FileText },
  { value: 'video', label: 'Video Editing', icon: Video },
  { value: 'security', label: 'Cybersecurity', icon: Shield },
  { value: 'consulting', label: 'Business Consulting', icon: Briefcase },
];

const priceTypeOptions = [
  { value: 'fixed', label: 'Fixed Price Project', description: 'One-time payment for complete project' },
  { value: 'hourly', label: 'Hourly Project', description: 'Pay by the hour' },
  { value: 'contract', label: 'Long-term Contract', description: 'Ongoing relationship' },
];

const budgetOptions = [
  { value: '5k-15k', label: '₹5K - ₹15K', range: 'Starter' },
  { value: '15k-50k', label: '₹15K - ₹50K', range: 'Standard' },
  { value: '50k-1l', label: '₹50K - ₹1L', range: 'Premium' },
  { value: '1l+', label: '₹1L+', range: 'Enterprise' },
];

const timelineOptions = [
  { value: 'urgent', label: 'Urgent (1-3 days)', icon: '🔥' },
  { value: '1week', label: '1 week', icon: '⚡' },
  { value: '2-4weeks', label: '2-4 weeks', icon: '📅' },
  { value: 'flexible', label: 'Flexible', icon: '🕐' },
];

const experienceOptions = [
  { value: 'beginner', label: 'Beginner friendly', icon: '🌱' },
  { value: 'intermediate', label: 'Intermediate', icon: '⚡' },
  { value: 'expert', label: 'Expert only', icon: '🏆' },
  { value: 'verified', label: 'Verified experts only', icon: '⭐' },
];

const workPreferenceOptions = [
  { value: 'remote', label: 'Remote', icon: Globe },
  { value: 'onsite', label: 'Onsite', icon: MapPin },
  { value: 'hybrid', label: 'Hybrid', icon: MapPin },
];

const skillsOptions = [
  'Figma', 'React', 'Flutter', 'WordPress', 'Node.js', 'SEO', 'AWS', 
  'Python', 'JavaScript', 'TypeScript', 'Vue.js', 'Angular', 'MongoDB',
  'PostgreSQL', 'Docker', 'Kubernetes', 'UI Design', 'UX Research',
  'Adobe Creative Suite', 'Video Editing', 'Content Writing', 'Social Media'
];

const extraFilterOptions = [
  { value: 'nda', label: 'NDA required' },
  { value: 'startup', label: 'Startup-friendly' },
  { value: 'communication', label: 'Quick communication' },
  { value: 'updates', label: 'Daily updates' },
  { value: 'portfolio', label: 'Portfolio required' },
];

export default function ProjectFinderWizard({ onClose, onComplete }: ProjectFinderWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<ProjectAnswers>({
    projectType: '',
    priceType: '',
    budget: '',
    timeline: '',
    experience: '',
    workPreference: '',
    skills: [],
    extraFilters: [],
  });

  const totalSteps = 8;

  const updateAnswer = (field: keyof ProjectAnswers, value: any) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return answers.projectType !== '';
      case 2: return answers.priceType !== '';
      case 3: return answers.budget !== '';
      case 4: return answers.timeline !== '';
      case 5: return answers.experience !== '';
      case 6: return answers.workPreference !== '';
      case 7: return true; // Skills are optional
      case 8: return true; // Extra filters are optional
      default: return false;
    }
  };

  const handleComplete = () => {
    onComplete(answers);
  };

  const steps = [
    { number: 1, label: 'Project Type', completed: currentStep > 1 },
    { number: 2, label: 'Pricing', completed: currentStep > 2 },
    { number: 3, label: 'Budget', completed: currentStep > 3 },
    { number: 4, label: 'Timeline', completed: currentStep > 4 },
    { number: 5, label: 'Experience', completed: currentStep > 5 },
    { number: 6, label: 'Location', completed: currentStep > 6 },
    { number: 7, label: 'Skills', completed: currentStep > 7 },
    { number: 8, label: 'Filters', completed: currentStep > 8 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-2 rounded-full bg-neutral-900/50 hover:bg-neutral-800 border border-neutral-800 hover:border-[#F24C20] transition-all group"
      >
        <X className="w-5 h-5 text-neutral-400 group-hover:text-[#F24C20]" />
      </button>

      <div className="w-full max-w-6xl h-[90vh] mx-auto px-6 flex gap-12">
        {/* Left Side - Progress Steps */}
        <div className="w-80 flex-shrink-0">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="sticky top-0"
          >
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Find Your Perfect Project</h2>
              <p className="text-neutral-400">Quick brief builder to match you with projects</p>
            </div>

            <div className="space-y-4">
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4"
                >
                  <div className="relative">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                        step.completed
                          ? 'bg-green-500 text-white'
                          : currentStep === step.number
                          ? 'bg-[#F24C20] text-white shadow-lg shadow-[#F24C20]/50'
                          : 'bg-neutral-800 text-neutral-500'
                      }`}
                    >
                      {step.completed ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : (
                        step.number
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`absolute top-12 left-1/2 -translate-x-1/2 w-0.5 h-8 transition-all duration-300 ${
                          step.completed ? 'bg-green-500' : 'bg-neutral-800'
                        }`}
                      />
                    )}
                  </div>
                  <div>
                    <div
                      className={`font-medium transition-colors ${
                        currentStep === step.number
                          ? 'text-white'
                          : step.completed
                          ? 'text-green-400'
                          : 'text-neutral-500'
                      }`}
                    >
                      {step.label}
                    </div>
                    {currentStep === step.number && (
                      <div className="text-xs text-neutral-500">Current step</div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Progress Bar */}
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
                  transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Side - Question Content */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              {/* Step 1: Project Type */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-4xl font-bold text-white mb-3">
                      What kind of project are you looking for?
                    </h3>
                    <p className="text-xl text-neutral-400">
                      Choose your area of expertise
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {projectTypeOptions.map((option) => {
                      const Icon = option.icon;
                      const isSelected = answers.projectType === option.value;
                      return (
                        <motion.button
                          key={option.value}
                          onClick={() => updateAnswer('projectType', option.value)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`relative p-6 rounded-2xl border-2 transition-all text-center group ${
                            isSelected
                              ? 'border-[#F24C20] bg-[#F24C20]/10'
                              : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700'
                          }`}
                        >
                          <div
                            className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity ${
                              !isSelected && 'bg-gradient-to-br from-[#F24C20]/5 to-transparent'
                            }`}
                          />
                          <Icon
                            className={`w-8 h-8 mx-auto mb-3 ${
                              isSelected ? 'text-[#F24C20]' : 'text-neutral-400'
                            }`}
                          />
                          <div className="font-semibold text-white">{option.label}</div>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute top-4 right-4"
                            >
                              <CheckCircle2 className="w-6 h-6 text-[#F24C20]" />
                            </motion.div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Price Type */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-4xl font-bold text-white mb-3">
                      Project Type
                    </h3>
                    <p className="text-xl text-neutral-400">
                      How do you prefer to work?
                    </p>
                  </div>

                  <div className="space-y-4">
                    {priceTypeOptions.map((option) => {
                      const isSelected = answers.priceType === option.value;
                      return (
                        <motion.button
                          key={option.value}
                          onClick={() => updateAnswer('priceType', option.value)}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className={`relative w-full p-6 rounded-2xl border-2 transition-all text-left group ${
                            isSelected
                              ? 'border-[#F24C20] bg-[#F24C20]/10'
                              : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-lg text-white mb-1">
                                {option.label}
                              </div>
                              <div className="text-neutral-400">{option.description}</div>
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="w-6 h-6 text-[#F24C20]" />
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Step 3: Budget Range */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-4xl font-bold text-white mb-3">
                      Budget Range
                    </h3>
                    <p className="text-xl text-neutral-400">
                      Select your expected budget
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {budgetOptions.map((option) => {
                      const isSelected = answers.budget === option.value;
                      return (
                        <motion.button
                          key={option.value}
                          onClick={() => updateAnswer('budget', option.value)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`relative p-8 rounded-2xl border-2 transition-all text-center group ${
                            isSelected
                              ? 'border-[#F24C20] bg-[#F24C20]/10'
                              : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700'
                          }`}
                        >
                          <DollarSign
                            className={`w-10 h-10 mx-auto mb-3 ${
                              isSelected ? 'text-[#F24C20]' : 'text-neutral-400'
                            }`}
                          />
                          <div className="font-bold text-xl text-white mb-1">
                            {option.label}
                          </div>
                          <div className="text-sm text-neutral-400">{option.range}</div>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute top-4 right-4"
                            >
                              <CheckCircle2 className="w-6 h-6 text-[#F24C20]" />
                            </motion.div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Step 4: Timeline */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-4xl font-bold text-white mb-3">
                      Timeline
                    </h3>
                    <p className="text-xl text-neutral-400">
                      When can you start?
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {timelineOptions.map((option) => {
                      const isSelected = answers.timeline === option.value;
                      return (
                        <motion.button
                          key={option.value}
                          onClick={() => updateAnswer('timeline', option.value)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`relative p-8 rounded-2xl border-2 transition-all text-center group ${
                            isSelected
                              ? 'border-[#F24C20] bg-[#F24C20]/10'
                              : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700'
                          }`}
                        >
                          <div className="text-5xl mb-3">{option.icon}</div>
                          <div className="font-bold text-lg text-white">
                            {option.label}
                          </div>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute top-4 right-4"
                            >
                              <CheckCircle2 className="w-6 h-6 text-[#F24C20]" />
                            </motion.div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Step 5: Experience Needed */}
              {currentStep === 5 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-4xl font-bold text-white mb-3">
                      Experience Needed
                    </h3>
                    <p className="text-xl text-neutral-400">
                      What level of projects are you looking for?
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {experienceOptions.map((option) => {
                      const isSelected = answers.experience === option.value;
                      return (
                        <motion.button
                          key={option.value}
                          onClick={() => updateAnswer('experience', option.value)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`relative p-8 rounded-2xl border-2 transition-all text-center group ${
                            isSelected
                              ? 'border-[#F24C20] bg-[#F24C20]/10'
                              : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700'
                          }`}
                        >
                          <div className="text-5xl mb-3">{option.icon}</div>
                          <div className="font-bold text-lg text-white">
                            {option.label}
                          </div>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute top-4 right-4"
                            >
                              <CheckCircle2 className="w-6 h-6 text-[#F24C20]" />
                            </motion.div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Step 6: Work Preference */}
              {currentStep === 6 && (
                <motion.div
                  key="step6"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-4xl font-bold text-white mb-3">
                      Work Preference
                    </h3>
                    <p className="text-xl text-neutral-400">
                      Where do you prefer to work?
                    </p>
                  </div>

                  <div className="space-y-4">
                    {workPreferenceOptions.map((option) => {
                      const Icon = option.icon;
                      const isSelected = answers.workPreference === option.value;
                      return (
                        <motion.button
                          key={option.value}
                          onClick={() => updateAnswer('workPreference', option.value)}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className={`relative w-full p-6 rounded-2xl border-2 transition-all text-left group ${
                            isSelected
                              ? 'border-[#F24C20] bg-[#F24C20]/10'
                              : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <Icon
                              className={`w-8 h-8 ${
                                isSelected ? 'text-[#F24C20]' : 'text-neutral-400'
                              }`}
                            />
                            <div className="font-semibold text-lg text-white">
                              {option.label}
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="w-6 h-6 text-[#F24C20] ml-auto" />
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Step 7: Skills Required */}
              {currentStep === 7 && (
                <motion.div
                  key="step7"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-4xl font-bold text-white mb-3">
                      Skills Required
                    </h3>
                    <p className="text-xl text-neutral-400">
                      Select skills you have (optional)
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {skillsOptions.map((skill) => {
                      const isSelected = answers.skills.includes(skill);
                      return (
                        <motion.button
                          key={skill}
                          onClick={() => {
                            if (isSelected) {
                              updateAnswer(
                                'skills',
                                answers.skills.filter((s) => s !== skill)
                              );
                            } else {
                              updateAnswer('skills', [...answers.skills, skill]);
                            }
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`px-4 py-2 rounded-lg border-2 transition-all font-medium ${
                            isSelected
                              ? 'border-[#F24C20] bg-[#F24C20]/10 text-[#F24C20]'
                              : 'border-neutral-800 bg-neutral-900/50 text-neutral-300 hover:border-neutral-700'
                          }`}
                        >
                          {skill}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Step 8: Extra Filters */}
              {currentStep === 8 && (
                <motion.div
                  key="step8"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-4xl font-bold text-white mb-3">
                      Extra Filters
                    </h3>
                    <p className="text-xl text-neutral-400">
                      Optional preferences to refine your search
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {extraFilterOptions.map((option) => {
                      const isSelected = answers.extraFilters.includes(option.value);
                      return (
                        <motion.button
                          key={option.value}
                          onClick={() => {
                            if (isSelected) {
                              updateAnswer(
                                'extraFilters',
                                answers.extraFilters.filter((f) => f !== option.value)
                              );
                            } else {
                              updateAnswer('extraFilters', [
                                ...answers.extraFilters,
                                option.value,
                              ]);
                            }
                          }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`relative p-6 rounded-2xl border-2 transition-all text-center group ${
                            isSelected
                              ? 'border-[#F24C20] bg-[#F24C20]/10'
                              : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700'
                          }`}
                        >
                          <div className="font-semibold text-white">{option.label}</div>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute top-4 right-4"
                            >
                              <CheckCircle2 className="w-6 h-6 text-[#F24C20]" />
                            </motion.div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-neutral-800 mt-6">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            {currentStep < totalSteps ? (
              <button
                onClick={nextStep}
                disabled={!canProceed()}
                className="flex items-center gap-2 px-8 py-3 rounded-lg bg-[#044071] hover:bg-[#055a99] text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#044071]/30"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                className="flex items-center gap-2 px-8 py-3 rounded-lg bg-[#044071] hover:bg-[#055a99] text-white font-semibold transition-all shadow-lg shadow-[#044071]/30"
              >
                <Sparkles className="w-4 h-4" />
                Show Projects
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
