import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Code, Palette, Smartphone, TrendingUp, Camera, FileText, Shield,
  Clock, Calendar, DollarSign, Award, MapPin, Globe, CheckCircle2,
  ArrowRight, ArrowLeft, Sparkles, X
} from 'lucide-react';

interface TalentFinderWizardProps {
  onClose: () => void;
  onComplete: (answers: QuestionaryAnswers) => void;
}

export interface QuestionaryAnswers {
  role: string;
  workType: string;
  budget: string;
  experience: string;
  location: string;
  availability: string;
  preferences: string[];
}

const roleOptions = [
  { value: 'ui-ux', label: 'UI/UX Designer', icon: Palette },
  { value: 'fullstack', label: 'Full Stack Developer', icon: Code },
  { value: 'mobile', label: 'Mobile App Developer', icon: Smartphone },
  { value: 'marketing', label: 'Digital Marketing', icon: TrendingUp },
  { value: 'graphic', label: 'Graphic Designer', icon: Camera },
  { value: 'video', label: 'Video Editor', icon: Camera },
  { value: 'writer', label: 'Content Writer', icon: FileText },
  { value: 'security', label: 'Cybersecurity Expert', icon: Shield },
];

const workTypeOptions = [
  { value: 'one-time', label: 'One-time project', description: 'Single project completion' },
  { value: 'part-time', label: 'Part-time', description: '20-30 hours/week' },
  { value: 'full-time', label: 'Full-time', description: '40+ hours/week' },
  { value: 'hourly', label: 'Hourly support', description: 'As needed basis' },
];

const budgetOptions = [
  { value: '500-1000', label: '₹500 - ₹1000/hr', range: 'Entry Level' },
  { value: '1000-2000', label: '₹1000 - ₹2000/hr', range: 'Intermediate' },
  { value: '2000+', label: '₹2000+/hr', range: 'Expert' },
  { value: 'fixed', label: 'Fixed Price', range: 'Project-based' },
];

const experienceOptions = [
  { value: 'beginner', label: 'Beginner', years: '0-2 years', icon: '🌱' },
  { value: 'intermediate', label: 'Intermediate', years: '2-5 years', icon: '⚡' },
  { value: 'expert', label: 'Expert', years: '5+ years', icon: '🏆' },
  { value: 'top-rated', label: 'Verified Top Rated', years: 'Best of the best', icon: '⭐' },
];

const locationOptions = [
  { value: 'remote', label: 'Remote only', icon: Globe },
  { value: 'hybrid', label: 'Hybrid', icon: MapPin },
  { value: 'onsite', label: 'Onsite', icon: MapPin },
];

const availabilityOptions = [
  { value: 'now', label: 'Available now', icon: '🟢' },
  { value: '7days', label: 'Within 7 days', icon: '🟡' },
  { value: '30days', label: 'Within 30 days', icon: '🟠' },
];

const preferenceOptions = [
  { value: 'english', label: 'English fluent' },
  { value: 'portfolio', label: 'Portfolio required' },
  { value: 'instant', label: 'Instant booking' },
  { value: 'verified-id', label: 'Verified ID' },
  { value: 'reviews', label: 'Best reviews' },
];

export default function TalentFinderWizard({ onClose, onComplete }: TalentFinderWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<QuestionaryAnswers>({
    role: '',
    workType: '',
    budget: '',
    experience: '',
    location: '',
    availability: '',
    preferences: [],
  });

  const totalSteps = 7;

  const updateAnswer = (field: keyof QuestionaryAnswers, value: any) => {
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
      case 1: return answers.role !== '';
      case 2: return answers.workType !== '';
      case 3: return answers.budget !== '';
      case 4: return answers.experience !== '';
      case 5: return answers.location !== '';
      case 6: return answers.availability !== '';
      case 7: return true; // Preferences are optional
      default: return false;
    }
  };

  const handleComplete = () => {
    onComplete(answers);
  };

  const steps = [
    { number: 1, label: 'Role', completed: currentStep > 1 },
    { number: 2, label: 'Work Type', completed: currentStep > 2 },
    { number: 3, label: 'Budget', completed: currentStep > 3 },
    { number: 4, label: 'Experience', completed: currentStep > 4 },
    { number: 5, label: 'Location', completed: currentStep > 5 },
    { number: 6, label: 'Availability', completed: currentStep > 6 },
    { number: 7, label: 'Preferences', completed: currentStep > 7 },
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
              <h2 className="text-3xl font-bold text-white mb-2">Find Your Perfect Talent</h2>
              <p className="text-neutral-400">Answer a few questions to get matched</p>
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
              {/* Step 1: Role Selection */}
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
                      What do you want to hire?
                    </h3>
                    <p className="text-xl text-neutral-400">
                      Choose the expertise you need
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {roleOptions.map((option) => {
                      const Icon = option.icon;
                      const isSelected = answers.role === option.value;
                      return (
                        <motion.button
                          key={option.value}
                          onClick={() => updateAnswer('role', option.value)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`relative p-6 rounded-2xl border-2 transition-all text-left group ${
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
                            className={`w-8 h-8 mb-3 ${
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

              {/* Step 2: Work Type */}
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
                      What type of work?
                    </h3>
                    <p className="text-xl text-neutral-400">
                      How do you want to engage?
                    </p>
                  </div>

                  <div className="space-y-4">
                    {workTypeOptions.map((option) => {
                      const isSelected = answers.workType === option.value;
                      return (
                        <motion.button
                          key={option.value}
                          onClick={() => updateAnswer('workType', option.value)}
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
                      What is your expected budget?
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

              {/* Step 4: Experience Level */}
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
                      Experience Level
                    </h3>
                    <p className="text-xl text-neutral-400">
                      Select the expertise level you need
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
                          <div className="font-bold text-xl text-white mb-1">
                            {option.label}
                          </div>
                          <div className="text-sm text-neutral-400">{option.years}</div>
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

              {/* Step 5: Location Preference */}
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
                      Location Preference
                    </h3>
                    <p className="text-xl text-neutral-400">
                      Where should they work from?
                    </p>
                  </div>

                  <div className="space-y-4">
                    {locationOptions.map((option) => {
                      const Icon = option.icon;
                      const isSelected = answers.location === option.value;
                      return (
                        <motion.button
                          key={option.value}
                          onClick={() => updateAnswer('location', option.value)}
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

              {/* Step 6: Availability */}
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
                      Availability
                    </h3>
                    <p className="text-xl text-neutral-400">
                      When do you need them to start?
                    </p>
                  </div>

                  <div className="space-y-4">
                    {availabilityOptions.map((option) => {
                      const isSelected = answers.availability === option.value;
                      return (
                        <motion.button
                          key={option.value}
                          onClick={() => updateAnswer('availability', option.value)}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className={`relative w-full p-6 rounded-2xl border-2 transition-all text-left group ${
                            isSelected
                              ? 'border-[#F24C20] bg-[#F24C20]/10'
                              : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="text-3xl">{option.icon}</div>
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

              {/* Step 7: Extra Preferences */}
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
                      Extra Preferences
                    </h3>
                    <p className="text-xl text-neutral-400">
                      Optional filters to refine your search
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {preferenceOptions.map((option) => {
                      const isSelected = answers.preferences.includes(option.value);
                      return (
                        <motion.button
                          key={option.value}
                          onClick={() => {
                            if (isSelected) {
                              updateAnswer(
                                'preferences',
                                answers.preferences.filter((p) => p !== option.value)
                              );
                            } else {
                              updateAnswer('preferences', [
                                ...answers.preferences,
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
                Show Talent Results
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
