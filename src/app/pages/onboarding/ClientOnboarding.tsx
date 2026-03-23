import { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight, IndianRupee, Clock, FileText,
  Palette, Code, Smartphone, TrendingUp, Video,
  Shield, Building, Tag
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

const categories = [
  { value: 'uiux', label: 'UI/UX Design', icon: Palette },
  { value: 'webdev', label: 'Web Development', icon: Code },
  { value: 'mobiledev', label: 'Mobile Apps', icon: Smartphone },
  { value: 'marketing', label: 'Digital Marketing', icon: TrendingUp },
  { value: 'writing', label: 'Content Writing', icon: FileText },
  { value: 'video', label: 'Video Editing', icon: Video },
  { value: 'security', label: 'Cybersecurity', icon: Shield },
  { value: 'consulting', label: 'Business Consulting', icon: Building },
];

const budgetRanges = [
  { value: '5k-15k', label: '₹5K - ₹15K' },
  { value: '15k-50k', label: '₹15K - ₹50K' },
  { value: '50k-1l', label: '₹50K - ₹1L' },
  { value: '1l+', label: '₹1L+' },
];

const timelines = [
  { value: 'urgent', label: 'Urgent (1-3 days)' },
  { value: '1week', label: '1 week' },
  { value: '2-4weeks', label: '2-4 weeks' },
  { value: 'flexible', label: 'Flexible' },
];

export default function ClientOnboarding() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    category: '',
    budget: '',
    timeline: '',
    description: '',
    skills: [] as string[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Project data:', formData);
    // Mark onboarding as complete
    localStorage.setItem('onboardingComplete', 'true');
    // Redirect to client dashboard
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-neutral-950">
      <Header />

      <main className="pt-32 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold text-white mb-4">
              Post Your First Project
            </h1>
            <p className="text-xl text-neutral-400">
              Find the perfect freelancer for your needs
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSubmit}
            className="space-y-8"
          >
            {/* Category Selection */}
            <div className="p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800">
              <label className="block text-lg font-semibold text-white mb-4">
                Project Category
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {categories.map((category) => {
                  const Icon = category.icon;
                  const isSelected = formData.category === category.value;
                  return (
                    <motion.button
                      key={category.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: category.value })}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`relative p-4 rounded-xl border-2 transition-all text-center ${isSelected
                          ? 'border-[#F24C20] bg-[#F24C20]/10'
                          : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700'
                        }`}
                    >
                      <Icon
                        className={`w-6 h-6 mx-auto mb-2 ${isSelected ? 'text-[#F24C20]' : 'text-neutral-400'
                          }`}
                      />
                      <div className="text-sm font-medium text-white">{category.label}</div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Budget */}
            <div className="p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800">
              <label className="block text-lg font-semibold text-white mb-4">
                Project Budget
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {budgetRanges.map((budget) => {
                  const isSelected = formData.budget === budget.value;
                  return (
                    <motion.button
                      key={budget.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, budget: budget.value })}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`relative p-4 rounded-xl border-2 transition-all text-center ${isSelected
                          ? 'border-[#F24C20] bg-[#F24C20]/10'
                          : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700'
                        }`}
                    >
                      <IndianRupee
                        className={`w-6 h-6 mx-auto mb-2 ${isSelected ? 'text-[#F24C20]' : 'text-neutral-400'
                          }`}
                      />
                      <div className="text-sm font-medium text-white">{budget.label}</div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Timeline */}
            <div className="p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800">
              <label className="block text-lg font-semibold text-white mb-4">
                Project Timeline
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {timelines.map((timeline) => {
                  const isSelected = formData.timeline === timeline.value;
                  return (
                    <motion.button
                      key={timeline.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, timeline: timeline.value })}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`relative p-4 rounded-xl border-2 transition-all text-center ${isSelected
                          ? 'border-[#F24C20] bg-[#F24C20]/10'
                          : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700'
                        }`}
                    >
                      <Clock
                        className={`w-6 h-6 mx-auto mb-2 ${isSelected ? 'text-[#F24C20]' : 'text-neutral-400'
                          }`}
                      />
                      <div className="text-sm font-medium text-white">{timeline.label}</div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div className="p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800">
              <label className="block text-lg font-semibold text-white mb-4">
                Project Description
              </label>
              <textarea
                rows={6}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your project requirements, goals, and any specific details..."
                className="w-full px-4 py-4 bg-neutral-950 border-2 border-neutral-800 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#F24C20] transition-colors resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex-1 px-8 py-4 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-[#F24C20] text-white font-medium transition-all"
              >
                Skip for Now
              </button>
              <button
                type="submit"
                className="flex-1 px-8 py-4 rounded-lg bg-[#044071] hover:bg-[#055a99] text-white font-semibold transition-all shadow-lg shadow-[#044071]/30 flex items-center justify-center gap-2"
              >
                Post Project
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.form>
        </div>
      </main>

      <Footer />
    </div>
  );
}