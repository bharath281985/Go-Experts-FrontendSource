import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Lightbulb, 
  Target, 
  Rocket, 
  DollarSign, 
  ShieldCheck, 
  Upload, 
  X, 
  Plus, 
  ChevronRight, 
  ChevronLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  BrainCircuit,
  Users2,
  Briefcase
} from "lucide-react";
import api from "@/app/utils/api";
import { toast } from "sonner";
import { useTheme } from "@/app/components/ThemeProvider";

interface StartupIdeaFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function StartupIdeaForm({ onSuccess, onCancel }: StartupIdeaFormProps) {
  const { isDarkMode } = useTheme();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    category: "",
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
    tags: [] as string[]
  });

  const [tagInput, setTagInput] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get("/startup-categories");
        if (res.data.success) setCategories(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCats();
  }, []);

  const steps = [
    { id: 1, title: "The Vision", description: "Core identity and mission", icon: Lightbulb },
    { id: 2, title: "The Problem", description: "Pain points and solutions", icon: Target },
    { id: 3, title: "Market & Tech", description: "Audience and strategy", icon: BrainCircuit },
    { id: 4, title: "Capital & Growth", description: "Funding and milestones", icon: DollarSign },
    { id: 5, title: "Review", description: "Finalize your pitch", icon: ShieldCheck }
  ];

  const handleNext = () => {
    if (currentStep < 5) setCurrentStep(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handlePublish = async () => {
    try {
      setLoading(true);
      const data = new FormData();
      
      // Append all fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'tags') {
          data.append(key, JSON.stringify(value));
        } else {
          data.append(key, value as string);
        }
      });

      // Append files
      selectedFiles.forEach(file => {
        data.append('attachments', file);
      });

      const res = await api.post("/startup-ideas", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data.success) {
        toast.success("Launch Sequence Initiated! Your pitch is live.");
        onSuccess?.();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Launch failed. Check telemetry.");
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (tagInput && !formData.tags.includes(tagInput)) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput] });
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  const currentProgress = (currentStep / 5) * 100;

  return (
    <div className={`max-w-5xl mx-auto rounded-[3.5rem] border overflow-hidden transition-all duration-700 ${isDarkMode ? 'bg-neutral-950/80 border-neutral-800 backdrop-blur-3xl' : 'bg-white border-neutral-200'}`}>
      
      {/* Header with Progress */}
      <div className="relative p-6 md:p-14 pb-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div>
                <h2 className={`text-2xl md:text-4xl font-black italic tracking-tighter flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                    <Rocket className="w-8 h-8 md:w-10 md:h-10 text-[#F24C20]" />
                    New Pitch <span className="text-[#F24C20]">Submission</span>
                </h2>
                <p className="mt-2 text-[10px] font-bold text-neutral-500 uppercase tracking-[0.3em]">Igniting the future of innovation.</p>
            </div>
            <button onClick={onCancel} className="absolute top-6 right-6 p-2 md:p-3 rounded-2xl bg-neutral-900 text-neutral-500 hover:text-white transition-all">
                <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>
        </div>

        {/* Custom Stepper */}
        <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-4 scrollbar-hide">
            {steps.map((step) => {
                const active = currentStep === step.id;
                const completed = currentStep > step.id;
                const Icon = step.icon;
                return (
                    <div key={step.id} className="flex items-center gap-2 flex-shrink-0 group">
                        <div 
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-500 ${
                                active ? 'bg-[#F24C20] border-[#F24C20] shadow-2xl shadow-[#F24C20]/40 rotate-3' : 
                                completed ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 
                                'bg-neutral-900 border-neutral-800 text-neutral-600'
                            }`}
                        >
                            <Icon className={`w-5 h-5 ${active ? 'text-white' : ''}`} />
                        </div>
                        <div className={`text-[10px] font-black uppercase tracking-widest hidden lg:block transition-all ${active ? 'text-white opacity-100' : 'text-neutral-600 opacity-50'}`}>
                            {step.title}
                        </div>
                        {step.id < 5 && <div className="w-8 h-px bg-neutral-800 mx-2 hidden lg:block" />}
                    </div>
                );
            })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6 md:p-14 pt-0 min-h-[500px]">
        <AnimatePresence mode="wait">
            <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 md:y-10"
            >
                {/* --- STEP 1: THE VISION --- */}
                {currentStep === 1 && (
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="group">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#F24C20] mb-3 ml-1">Startup Title</label>
                                <input 
                                    type="text" 
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    placeholder="e.g., QuantumPay AI"
                                    className="w-full bg-neutral-900/50 border-2 border-neutral-900 rounded-3xl p-5 text-lg font-bold text-white outline-none focus:border-[#F24C20] transition-all placeholder:text-neutral-700"
                                />
                            </div>
                            <div className="group">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#F24C20] mb-3 ml-1">Industry Category</label>
                                <select 
                                    value={formData.category}
                                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                                    className="w-full bg-neutral-900/50 border-2 border-neutral-900 rounded-3xl p-5 text-lg font-bold text-white outline-none focus:border-[#F24C20] transition-all appearance-none"
                                >
                                    <option value="" className="bg-neutral-950">Select Industry</option>
                                    {categories.map(c => <option key={c._id} value={c.name} className="bg-neutral-950">{c.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="space-y-6">
                             <div className="group h-full flex flex-col">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#F24C20] mb-3 ml-1">The Elevator Pitch</label>
                                <textarea 
                                    value={formData.shortDescription}
                                    onChange={(e) => setFormData({...formData, shortDescription: e.target.value})}
                                    placeholder="Your startup in one sentence..."
                                    className="flex-1 w-full bg-neutral-900/50 border-2 border-neutral-900 rounded-3xl p-6 text-base font-bold text-white outline-none focus:border-[#F24C20] transition-all placeholder:text-neutral-700 resize-none"
                                />
                            </div>
                        </div>
                    </div>
                )}

                 {/* --- STEP 2: PROBLEM & SOLUTION --- */}
                 {currentStep === 2 && (
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="group">
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#F24C20] mb-3 ml-1">Core Pain Point</label>
                            <textarea 
                                value={formData.problem}
                                onChange={(e) => setFormData({...formData, problem: e.target.value})}
                                placeholder="What critical problem are you solving?"
                                className="w-full h-64 bg-neutral-900/50 border-2 border-neutral-900 rounded-3xl p-6 text-base font-bold text-white outline-none focus:border-[#F24C20] transition-all placeholder:text-neutral-700 resize-none"
                            />
                        </div>
                        <div className="group">
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#F24C20] mb-3 ml-1">The Innovation (Solution)</label>
                            <textarea 
                                value={formData.solution}
                                onChange={(e) => setFormData({...formData, solution: e.target.value})}
                                placeholder="How does your tech fix it?"
                                className="w-full h-64 bg-neutral-900/50 border-2 border-neutral-900 rounded-3xl p-6 text-base font-bold text-white outline-none focus:border-[#F24C20] transition-all placeholder:text-neutral-700 resize-none"
                            />
                        </div>
                    </div>
                )}

                 {/* --- STEP 3: MARKET & COMPETITION --- */}
                 {currentStep === 3 && (
                    <div className="space-y-8">
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="group">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#F24C20] mb-3 ml-1">Market Size (TAM/SAM)</label>
                                <input 
                                    type="text" 
                                    value={formData.marketSize}
                                    onChange={(e) => setFormData({...formData, marketSize: e.target.value})}
                                    placeholder="e.g., 50B Global Market"
                                    className="w-full bg-neutral-900/50 border-2 border-neutral-900 rounded-3xl p-5 text-sm font-bold text-white outline-none focus:border-[#F24C20] transition-all"
                                />
                            </div>
                             <div className="group">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#F24C20] mb-3 ml-1">Target Audience</label>
                                <input 
                                    type="text" 
                                    value={formData.targetAudience}
                                    onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}
                                    placeholder="e.g., Gen-Z Retail Investors"
                                    className="w-full bg-neutral-900/50 border-2 border-neutral-900 rounded-3xl p-5 text-sm font-bold text-white outline-none focus:border-[#F24C20] transition-all"
                                />
                            </div>
                             <div className="group">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#F24C20] mb-3 ml-1">Unique Edge</label>
                                <input 
                                    type="text" 
                                    value={formData.uniqueness}
                                    onChange={(e) => setFormData({...formData, uniqueness: e.target.value})}
                                    placeholder="e.g., Proprietary HFT Algorithm"
                                    className="w-full bg-neutral-900/50 border-2 border-neutral-900 rounded-3xl p-5 text-sm font-bold text-white outline-none focus:border-[#F24C20] transition-all"
                                />
                            </div>
                        </div>
                        <div className="group">
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#F24C20] mb-3 ml-1">Search Keywords / Tags</label>
                            <div className="flex flex-wrap gap-3 p-5 bg-neutral-900/50 border-2 border-neutral-900 rounded-[2.5rem] focus-within:border-[#F24C20] transition-all min-h-[100px] items-center">
                                {formData.tags.map(tag => (
                                    <span key={tag} className="px-4 py-2 bg-[#F24C20]/10 text-[#F24C20] border border-[#F24C20]/20 rounded-2xl text-xs font-black flex items-center gap-2">
                                        {tag}
                                        <X className="w-3 h-3 cursor-pointer hover:scale-125 transition-all" onClick={() => removeTag(tag)} />
                                    </span>
                                ))}
                                <input 
                                    type="text" 
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addTag()}
                                    placeholder="Type & Enter..."
                                    className="flex-1 bg-transparent border-none outline-none text-white min-w-[200px]"
                                />
                            </div>
                        </div>
                    </div>
                )}

                 {/* --- STEP 4: CAPITAL & GROWTH --- */}
                 {currentStep === 4 && (
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-8">
                            <div className="group">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#F24C20] mb-3 ml-1">Funding Requirement ($)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-[#F24C20]" />
                                    <input 
                                        type="text" 
                                        value={formData.fundingAmount}
                                        onChange={(e) => setFormData({...formData, fundingAmount: e.target.value})}
                                        placeholder="Enter Amount"
                                        className="w-full bg-neutral-900/50 border-2 border-neutral-900 rounded-3xl p-5 pl-14 text-lg font-bold text-white outline-none focus:border-[#F24C20] transition-all"
                                    />
                                </div>
                            </div>
                            <div className="group">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#F24C20] mb-3 ml-1">NDA Requirement</label>
                                <div className="grid grid-cols-2 gap-4">
                                    {['No', 'Yes'].map(opt => (
                                        <button 
                                            key={opt}
                                            onClick={() => setFormData({...formData, ndaRequired: opt})}
                                            className={`p-4 rounded-2xl border-2 transition-all font-black uppercase tracking-widest text-xs ${
                                                formData.ndaRequired === opt ? 'bg-[#F24C20] border-[#F24C20] text-white' : 'bg-neutral-900 border-neutral-800 text-neutral-600'
                                            }`}
                                        >
                                            {opt} NDA
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="group">
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#F24C20] mb-3 ml-1">Use of Funds & Growth Milestones</label>
                            <textarea 
                                value={formData.useOfFunds}
                                onChange={(e) => setFormData({...formData, useOfFunds: e.target.value})}
                                placeholder="Where will you invest the capital?"
                                className="w-full h-64 bg-neutral-900/50 border-2 border-neutral-900 rounded-3xl p-6 text-base font-bold text-white outline-none focus:border-[#F24C20] transition-all placeholder:text-neutral-700 resize-none"
                            />
                        </div>
                    </div>
                )}

                 {/* --- STEP 5: REVIEW & ATTACHMENTS --- */}
                 {currentStep === 5 && (
                    <div className="space-y-10">
                        <div className="grid lg:grid-cols-2 gap-10">
                            {/* Review Box */}
                            <div className="bg-neutral-900/50 border-2 border-dashed border-neutral-800 rounded-[3rem] p-10">
                                <h4 className="text-xl font-black text-white italic mb-6">Execution Check</h4>
                                <div className="space-y-4">
                                    {[
                                        { l: 'Project', v: formData.title },
                                        { l: 'Industry', v: formData.category },
                                        { l: 'Capital Ask', v: `$${formData.fundingAmount}` },
                                        { l: 'NDA Enforcement', v: formData.ndaRequired },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center justify-between border-b border-neutral-800/50 pb-3">
                                            <span className="text-[10px] font-black uppercase text-neutral-600">{item.l}</span>
                                            <span className="text-sm font-black text-white">{item.v || 'Incomplete'}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-8 p-5 rounded-2xl bg-orange-500/5 border border-orange-500/10 flex items-start gap-4">
                                    <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                                    <p className="text-[10px] font-bold text-neutral-500 uppercase leading-relaxed tracking-wider">
                                        Once launched, your pitch will be queued for algorithm verification. Approved pitches are broadcasted to matching investors.
                                    </p>
                                </div>
                            </div>

                            {/* Attachments Box */}
                            <div className="space-y-6">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#F24C20] mb-1">Deck & Media Uploads</label>
                                <div 
                                    className="relative h-64 border-4 border-dashed border-neutral-900 rounded-[3rem] flex flex-col items-center justify-center group hover:border-[#F24C20]/50 transition-all cursor-pointer bg-neutral-950/40"
                                    onClick={() => document.getElementById('pitch-media')?.click()}
                                >
                                    <input 
                                        type="file" 
                                        id="pitch-media" 
                                        className="hidden" 
                                        multiple 
                                        onChange={(e) => {
                                            if (e.target.files) setSelectedFiles([...selectedFiles, ...Array.from(e.target.files)]);
                                        }}
                                    />
                                    <div className="w-20 h-20 rounded-3xl bg-neutral-900 flex items-center justify-center mb-4 group-hover:bg-[#F24C20] group-hover:rotate-6 transition-all shadow-2xl">
                                        <Upload className={`w-10 h-10 ${isDarkMode ? 'text-neutral-600 group-hover:text-white' : ''}`} />
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-widest text-neutral-600">Drop Pitch Decks</span>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3">
                                    {selectedFiles.map((f, i) => (
                                        <div key={i} className="p-3 bg-neutral-900 rounded-xl flex items-center justify-between group">
                                            <span className="text-[10px] font-black text-white truncate max-w-[120px]">{f.name}</span>
                                            <X className="w-4 h-4 text-red-500 cursor-pointer" onClick={() => setSelectedFiles(selectedFiles.filter((_, idx) => idx !== i))} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Navigation */}
      <div className="p-10 md:p-14 pt-0 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-neutral-900/50 mt-10">
            <div className={`text-[10px] font-black uppercase tracking-[0.4em] ${isDarkMode ? 'text-neutral-700' : 'text-neutral-400'}`}>
                Step {currentStep} of 5 <span className="mx-2 text-neutral-800">/</span> {steps[currentStep-1].title}
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
                {currentStep > 1 && (
                    <button 
                        onClick={handlePrev} 
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-500 font-black uppercase tracking-widest text-[10px] hover:text-white transition-all shadow-xl shadow-black/40"
                    >
                        <ChevronLeft className="w-4 h-4" /> Back
                    </button>
                )}
                
                {currentStep < 5 ? (
                    <button 
                        onClick={handleNext} 
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-10 py-5 rounded-3xl bg-white text-black font-black uppercase tracking-widest text-[10px] hover:bg-[#F24C20] hover:text-white transition-all shadow-2xl shadow-orange-600/20 active:scale-95"
                    >
                        Proceed <ChevronRight className="w-4 h-4" />
                    </button>
                ) : (
                    <button 
                        onClick={handlePublish}
                        disabled={loading}
                        className="flex-1 md:flex-none flex items-center justify-center gap-4 px-12 py-6 rounded-[2rem] bg-gradient-to-r from-[#F24C20] to-orange-500 text-white font-black uppercase tracking-widest text-[10px] hover:shadow-2xl hover:shadow-[#F24C20]/40 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Rocket className="w-5 h-5" />}
                        Ignite Launch
                    </button>
                )}
            </div>
      </div>

    </div>
  );
}
