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

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, Smartphone, Palette, TrendingUp, FileText, Video, Shield, Briefcase,
  DollarSign, Clock, Award, MapPin, CheckCircle2, ArrowRight, ArrowLeft, 
  Sparkles, X, Database, MousePointerClick, ListChecks, Type, CircleDashed, 
  UserPlus, Tag, Search, CheckCircle, Info
} from 'lucide-react';
import api from '@/app/utils/api';

interface ProjectFinderWizardProps {
  onClose: () => void;
  onComplete: (answers: any) => void;
}

export default function ProjectFinderWizard({ onClose, onComplete }: ProjectFinderWizardProps) {
  const [steps, setSteps] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stepsRes, categoriesRes, skillsRes] = await Promise.all([
          api.get('/cms/registration-steps?module=project_finder'),
          api.get('/cms/categories'),
          api.get('/cms/skills')
        ]);
        setSteps(stepsRes.data.data || []);
        setCategories(categoriesRes.data.data || categoriesRes.data.categories || []);
        setSkills(skillsRes.data.data || []);
      } catch (error) {
        console.error('Failed to fetch wizard data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalSteps = steps.length;
  const currentStepData = steps[currentStep - 1];

  // Reset search when step changes
  useEffect(() => {
    setSearchQuery('');
  }, [currentStep]);

  const updateAnswer = (field: string, value: any) => {
    setAnswers((prev: any) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const canProceed = () => {
    if (!currentStepData) return false;
    const val = answers[currentStepData.field];
    if (currentStepData.type === 'multi-selection') {
        return Array.isArray(val) && val.length > 0;
    }
    return !!val;
  };

  const handleComplete = () => {
    onComplete(answers);
  };

  const getIcon = (iconName: string) => {
    const icons: any = {
      Globe, Smartphone, Palette, TrendingUp, FileText, Video, Shield, Briefcase,
      DollarSign, Clock, Award, MapPin, Sparkles, Database, MousePointerClick, 
      ListChecks, Type, CircleDashed, UserPlus, Tag
    };
    return icons[iconName] || Globe;
  };

  const selectedCategoryId = useMemo(() => {
    const type = answers['projectType'];
    if (!type) return null;
    const matched = categories.find(c => c.name.toLowerCase() === type.toLowerCase());
    return matched?._id || null;
  }, [answers.projectType, categories]);

  const filteredOptions = useMemo(() => {
    if (!currentStepData) return [];
    
    let options = [];
    if (currentStepData.field === 'projectType') {
      options = categories.map(c => ({
        value: c.name.toLowerCase(),
        label: c.name,
        icon: c.icon
      }));
    } else if (currentStepData.field === 'skills') {
      // Filter skills by category ID
      const skillOptions = skills
        .filter(s => !selectedCategoryId || s.category === selectedCategoryId)
        .map(s => ({
          value: s.name,
          label: s.name
        }));
      
      // Fallback: if no skills for this category, but we have seeded options, maybe show those or all?
      // For now, let's show all active skills if we can't find specific ones but search handles focus.
      options = skillOptions.length > 0 ? skillOptions : (skills.length > 0 ? skills.map(s => ({
          value: s.name,
          label: s.name
      })) : currentStepData.options || []);
    } else {
      options = currentStepData.options || [];
    }

    if (!searchQuery) return options;
    return options.filter((opt: any) => 
      opt.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [currentStepData, categories, skills, searchQuery, selectedCategoryId]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[45] flex items-center justify-center bg-black/90 backdrop-blur-xl">
        <div className="text-white text-xl font-bold flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#F24C20] border-t-transparent rounded-full animate-spin" />
          <p className="animate-pulse">Loading Your Journey...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[45] flex items-center justify-center bg-black/80 backdrop-blur-md pt-24">
      <div className="relative w-full max-w-7xl h-full mx-auto px-6 overflow-hidden flex gap-8">
        
        {/* Sidebar - Left Section */}
        <div className="w-80 flex-shrink-0 py-12 flex flex-col h-full border-r border-neutral-800/50 pr-8">
          <div className="mb-12">
            <h2 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-[#F24C20]" />
              Project Finder
            </h2>
            <p className="text-neutral-400 text-lg">Personalizing your search</p>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto pr-2 scrollbar-hide">
            {steps.map((step, index) => {
              const isActive = currentStep === index + 1;
              const isCompleted = currentStep > index + 1;
              return (
                <motion.div
                  key={step._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-4 p-3 rounded-2xl transition-all duration-300 ${
                    isActive ? 'bg-[#F24C20]/10 border border-[#F24C20]/20' : ''
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-all duration-500 ${
                    isCompleted 
                      ? 'bg-green-500 text-white' 
                      : isActive 
                        ? 'bg-[#F24C20] text-white shadow-lg shadow-[#F24C20]/30' 
                        : 'bg-neutral-800 text-neutral-500'
                  }`}>
                    {isCompleted ? <CheckCircle className="w-5 h-5" /> : index + 1}
                  </div>
                  <div className={`font-semibold text-sm transition-colors ${
                    isActive ? 'text-white' : isCompleted ? 'text-green-500' : 'text-neutral-500'
                  }`}>
                    {step.label}
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-8 pt-8 border-t border-neutral-800">
             <div className="flex justify-between items-end mb-2">
                <span className="text-neutral-500 text-xs font-bold uppercase tracking-wider">Completion</span>
                <span className="text-white text-lg font-black">{Math.round((currentStep/totalSteps)*100)}%</span>
             </div>
             <div className="h-2 bg-neutral-900 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentStep/totalSteps)*100}%` }}
                    className="h-full bg-gradient-to-r from-[#F24C20] to-orange-500" 
                />
             </div>
          </div>
        </div>

        {/* content Area - Right Section */}
        <div className="flex-1 flex flex-col py-12 h-full">
           <div className="flex justify-end mb-4">
              <button
                onClick={onClose}
                className="p-3 hover:bg-neutral-900 rounded-full text-neutral-400 hover:text-white transition-all group border border-transparent hover:border-neutral-800 shadow-xl"
              >
                <X className="w-7 h-7 group-hover:rotate-90 transition-transform duration-300" />
              </button>
           </div>

           <div className="flex-1 relative overflow-y-auto pr-6 custom-scrollbar pb-32">
              <AnimatePresence mode="wait">
                 {currentStepData && (
                   <motion.div
                     key={currentStepData._id}
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -20 }}
                     className="space-y-8"
                   >
                     <div className="max-w-3xl">
                        <h3 className="text-5xl font-black text-white mb-4 leading-tight italic tracking-tighter">
                          {currentStepData.title}
                        </h3>
                        <p className="text-2xl text-neutral-400 font-medium">
                          {currentStepData.description}
                        </p>
                     </div>

                     {/* Search Bar for complex steps */}
                     {(currentStepData.field === 'projectType' || currentStepData.field === 'skills') && (
                       <div className="relative max-w-xl group">
                          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-neutral-500 group-focus-within:text-[#F24C20] transition-colors" />
                          <input 
                            type="text"
                            placeholder={`Search ${currentStepData.field === 'skills' ? 'skills' : 'categories'}...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-16 pr-6 py-5 bg-neutral-900 border-2 border-neutral-800 rounded-[2rem] text-xl text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#F24C20] transition-all shadow-xl"
                          />
                       </div>
                     )}

                     {/* Selected Category Info (Visual Feedback) */}
                     {currentStepData.field === 'skills' && selectedCategoryId && (
                       <div className="flex items-center gap-2 text-[#F24C20] bg-[#F24C20]/10 px-4 py-2 rounded-lg w-fit text-sm font-bold border border-[#F24C20]/20">
                          <Tag className="w-4 h-4" />
                          Filtered by: {answers['projectType']}
                       </div>
                     )}

                     {/* Main Options Grid */}
                     {currentStepData.type === 'single-selection' && (
                       <div className={`grid ${currentStepData.field === 'projectType' || filteredOptions.length > 4 ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'} gap-4`}>
                          {filteredOptions.length > 0 ? filteredOptions.map((option: any) => {
                            const Icon = option.icon ? getIcon(option.icon) : null;
                            const isSelected = answers[currentStepData.field] === option.value;
                            return (
                              <motion.button
                                key={option.value || option.label}
                                onClick={() => {
                                    updateAnswer(currentStepData.field, option.value);
                                    if (currentStepData.field !== 'skills') setTimeout(nextStep, 300);
                                }}
                                whileHover={{ scale: 1.02, y: -5 }}
                                whileTap={{ scale: 0.98 }}
                                className={`relative p-8 rounded-[2.5rem] border-2 transition-all text-left flex flex-col justify-between min-h-[180px] group ${
                                  isSelected
                                    ? 'border-[#F24C20] bg-gradient-to-br from-[#F24C20]/20 to-transparent'
                                    : 'border-neutral-800 bg-neutral-900/30 hover:border-neutral-700 hover:bg-neutral-900/50'
                                }`}
                              >
                                <div>
                                    {option.emoji ? (
                                        <div className="text-5xl mb-4 leading-none">{option.emoji}</div>
                                    ) : Icon ? (
                                        <Icon className={`w-12 h-12 mb-4 transition-transform duration-500 group-hover:scale-110 ${isSelected ? 'text-[#F24C20]' : 'text-neutral-500'}`} />
                                    ) : (
                                        <Database className={`w-12 h-12 mb-4 ${isSelected ? 'text-[#F24C20]' : 'text-neutral-500'}`} />
                                    )}
                                    <div className="font-black text-2xl text-white mb-2 group-hover:text-[#F24C20] transition-colors leading-none">
                                      {option.label}
                                    </div>
                                    {option.subtitle && <div className="text-sm text-neutral-500 font-medium">{option.subtitle}</div>}
                                </div>
                                
                                {isSelected && (
                                  <motion.div
                                    initial={{ scale: 0, rotate: -20 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    className="absolute top-6 right-6"
                                  >
                                    <CheckCircle2 className="w-8 h-8 text-[#F24C20] fill-[#F24C20]/10" />
                                  </motion.div>
                                )}
                              </motion.button>
                            );
                          }) : (
                            <div className="col-span-full py-12 text-center text-neutral-500 space-y-4">
                                <Search className="w-12 h-12 mx-auto opacity-20" />
                                <p className="text-xl">No results found matching your search.</p>
                            </div>
                          )}
                       </div>
                     )}

                     {currentStepData.type === 'multi-selection' && (
                       <div className="space-y-6">
                           <div className="flex flex-wrap gap-4">
                            {(() => {
                                const currentChoices = answers[currentStepData.field] || [];
                                const optionsToDisplay = searchQuery || currentStepData.field !== 'skills'
                                  ? filteredOptions
                                  : [
                                      ...filteredOptions.filter((opt: any) => currentChoices.includes(opt.value)),
                                      ...filteredOptions.filter((opt: any) => !currentChoices.includes(opt.value)).slice(0, 5)
                                    ];
                                
                                // Unique options just in case
                                const uniqueOptions = Array.from(new Map(optionsToDisplay.map((item: any) => [item.value, item])).values());
                                
                                return uniqueOptions.map((option: any) => {
                                  const isSelected = currentChoices.includes(option.value);
                                  return (
                                    <motion.button
                                      key={option.value}
                                      onClick={() => {
                                        if (isSelected) {
                                          updateAnswer(
                                            currentStepData.field,
                                            currentChoices.filter((s: string) => s !== option.value)
                                          );
                                        } else {
                                          updateAnswer(currentStepData.field, [...currentChoices, option.value]);
                                        }
                                      }}
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      className={`px-8 py-4 rounded-2xl border-2 transition-all font-bold text-lg flex items-center gap-3 ${
                                        isSelected
                                          ? 'border-[#F24C20] bg-gradient-to-r from-[#F24C20] to-orange-600 text-white'
                                          : 'border-neutral-800 bg-neutral-900/50 text-neutral-400 hover:border-neutral-700 hover:text-white'
                                      }`}
                                    >
                                      {option.label}
                                      {isSelected ? <CheckCircle2 className="w-5 h-5 fill-white/20" /> : <div className="w-5 h-5 rounded-full border-2 border-neutral-800 group-hover:border-neutral-700" />}
                                    </motion.button>
                                  );
                                });
                            })()}
                           </div>
                           {currentStepData.field === 'skills' && (
                               <div className="flex items-center gap-2 text-neutral-500 bg-neutral-900/50 p-4 rounded-xl max-w-fit">
                                  <Info className="w-5 h-5" />
                                  <span className="text-sm font-medium">Select as many skills as you need. Use the search bar for specific requirements.</span>
                               </div>
                           )}
                       </div>
                     )}

                     {currentStepData.type === 'input' && (
                       <div className="max-w-2xl">
                           <input 
                               type="text"
                               value={answers[currentStepData.field] || ''}
                               onChange={(e) => updateAnswer(currentStepData.field, e.target.value)}
                               placeholder={`Type your response here...`}
                               className="w-full bg-neutral-900 border-4 border-neutral-800 rounded-3xl p-8 text-3xl font-black text-white focus:outline-none focus:border-[#F24C20] transition-all shadow-2xl placeholder:text-neutral-800"
                           />
                       </div>
                     )}
                   </motion.div>
                 )}
              </AnimatePresence>
           </div>

           {/* Navigation Controls */}
           <div className="pt-8 border-t border-neutral-800/50 flex items-center justify-between mt-auto bg-neutral-950/80 backdrop-blur-md sticky bottom-0 z-[10]">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed group border border-neutral-800 hover:border-neutral-700 shadow-xl"
              >
                <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                Back
              </button>

              <div className="flex gap-4">
                 {currentStep < totalSteps ? (
                   <button
                     onClick={nextStep}
                     disabled={!canProceed()}
                     className="flex items-center gap-3 px-12 py-4 rounded-2xl bg-[#044071] hover:bg-[#055a99] text-white font-black text-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl shadow-[#044071]/40 group"
                   >
                     Continue
                     <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                   </button>
                 ) : (
                   <button
                     onClick={handleComplete}
                     disabled={!canProceed()}
                     className="flex items-center gap-3 px-12 py-4 rounded-2xl bg-gradient-to-r from-[#F24C20] to-orange-600 hover:from-orange-600 hover:to-[#F24C20] text-white font-black text-xl transition-all shadow-2xl shadow-[#F24C20]/40 group"
                   >
                     <Sparkles className="w-6 h-6 animate-pulse" />
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
