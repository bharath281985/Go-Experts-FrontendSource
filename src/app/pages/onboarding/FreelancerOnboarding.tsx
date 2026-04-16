import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Upload, Plus, X, ArrowRight, IndianRupee, FileText, Link as LinkIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import api from '@/app/utils/api';
import { toast } from 'sonner';

export default function FreelancerOnboarding() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    profileImage: '',
    skills: [] as string[],
    hourlyRate: '',
    bio: '',
    portfolioLink: '',
  });

  const [dbSkills, setDbSkills] = useState<{ _id: string, name: string }[]>([]);
  const [customSkill, setCustomSkill] = useState('');

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [skillsRes, profileRes] = await Promise.all([
          api.get('/cms/skills'),
          api.get('/auth/me')
        ]);
        
        if (skillsRes.data.success) {
          setDbSkills(skillsRes.data.skills.filter((s: any) => s.is_active));
        }
        
        if (profileRes.data.success) {
          const user = profileRes.data.user;
          setFormData(prev => ({
            ...prev,
            skills: user.skills || [],
            hourlyRate: user.hourly_rate?.toString() || '',
            bio: user.bio || '',
            profileImage: user.profile_image || '',
          }));
        }
      } catch (error) {
        console.error('Failed to load initial data:', error);
      }
    };
    fetchInitialData();
  }, []);

  const toggleSkill = (skillId: string) => {
    if (formData.skills.includes(skillId)) {
      setFormData({ ...formData, skills: formData.skills.filter(s => s !== skillId) });
    } else {
      setFormData({ ...formData, skills: [...formData.skills, skillId] });
    }
  };

  const handleAddCustomSkill = () => {
    const trimmed = customSkill.trim();
    // Note: Custom skills might be filtered out by backend if they aren't valid IDs
    if (trimmed && !formData.skills.includes(trimmed)) {
      setFormData({ ...formData, skills: [...formData.skills, trimmed] });
    }
    setCustomSkill('');
  };

  const handleCustomSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustomSkill();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        skills: formData.skills,
        hourly_rate: Number(formData.hourlyRate.replace(/[^0-9.]/g, '')),
        bio: formData.bio,
      };

      const response = await api.put('/auth/update-profile', payload);

      if (response.data.success) {
        toast.success("Profile updated successfully!");
        localStorage.setItem('onboardingComplete', 'true');

        // Update local user data
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...storedUser, ...response.data.user }));
        localStorage.setItem('userType', 'freelancer');
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to complete profile');
      console.error('Freelancer profile update error:', error);
    }
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
              Complete Your Profile
            </h1>
            <p className="text-xl text-neutral-400">
              Let clients know what you're all about
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSubmit}
            className="space-y-8"
          >
            {/* Profile Image */}
            <div className="p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800">
              <label className="block text-lg font-semibold text-white mb-4">
                Profile Image
              </label>
              <div className="flex items-center gap-6">
                <div className="w-32 h-32 rounded-full bg-neutral-800 border-2 border-neutral-700 flex items-center justify-center overflow-hidden">
                  {formData.profileImage ? (
                    <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <Upload className="w-8 h-8 text-neutral-500" />
                  )}
                </div>
                <div>
                  <button
                    type="button"
                    className="px-6 py-3 rounded-lg bg-[#044071] hover:bg-[#055a99] text-white font-medium transition-all shadow-lg shadow-[#044071]/30 flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Photo
                  </button>
                  <p className="text-sm text-neutral-500 mt-2">JPG, PNG or GIF. Max size 5MB</p>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800">
              <label className="block text-lg font-semibold text-white mb-4">
                Your Skills
              </label>
              <p className="text-neutral-400 mb-4">Select all skills you have expertise in, or add your own.</p>

              <div className="flex flex-wrap gap-3 mb-6">
                {/* Dynamically render fetched skills */}
                {dbSkills.map((skill) => {
                  const isSelected = formData.skills.includes(skill._id);
                  return (
                    <motion.button
                      key={skill._id}
                      type="button"
                      onClick={() => toggleSkill(skill._id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-4 py-2 rounded-lg border-2 transition-all font-medium ${isSelected
                        ? 'border-[#F24C20] bg-[#F24C20]/10 text-[#F24C20]'
                        : 'border-neutral-800 bg-neutral-900/50 text-neutral-300 hover:border-neutral-700'
                        }`}
                    >
                      {skill.name}
                    </motion.button>
                  );
                })}

                {/* Render manually added custom skills that are not from the database (currently these will be filtered by backend) */}
                {formData.skills.filter(s => !dbSkills.some(dbS => dbS._id === s)).map((skillId) => {
                  // Try to find the skill name in dbSkills, though it should be filtered out by the filter above if it exists in db
                  const skillObj = dbSkills.find(s => s._id === skillId);
                  const displayText = skillObj ? skillObj.name : skillId; // Fallback if it's a raw custom string

                  return (
                    <motion.button
                      key={skillId}
                      type="button"
                      onClick={() => toggleSkill(skillId)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 rounded-lg border-2 transition-all font-medium border-[#F24C20] bg-[#F24C20]/10 text-[#F24C20] flex items-center gap-2"
                    >
                      <span>{displayText}</span>
                      <X className="w-3 h-3" />
                    </motion.button>
                  );
                })}
              </div>

              {/* Add Others field */}
              <div className="border-t border-neutral-800 pt-6">
                <label className="block text-sm font-medium text-white mb-2">
                  Other Skills
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={customSkill}
                    onChange={(e) => setCustomSkill(e.target.value)}
                    onKeyDown={handleCustomSkillKeyDown}
                    placeholder="E.g., GraphQL"
                    className="flex-1 px-4 py-3 bg-neutral-950 border-2 border-neutral-800 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#F24C20] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSkill}
                    className="px-6 py-3 bg-[#F24C20] hover:bg-orange-600 border border-transparent text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                    disabled={!customSkill.trim()}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Hourly Rate */}
            <div className="p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800">
              <label className="block text-lg font-semibold text-white mb-4">
                Hourly Rate
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <input
                  type="text"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                  placeholder="e.g., 1200"
                  className="w-full pl-12 pr-4 py-4 bg-neutral-950 border-2 border-neutral-800 rounded-xl text-white text-lg placeholder:text-neutral-500 focus:outline-none focus:border-[#F24C20] transition-colors"
                />
              </div>
            </div>

            {/* Bio */}
            <div className="p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800">
              <label className="block text-lg font-semibold text-white mb-4">
                Short Bio
              </label>
              <textarea
                rows={5}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value.slice(0, 500) })}
                maxLength={500}
                placeholder="Tell us about your experience, what you do, and what makes you unique..."
                className="w-full px-4 py-4 bg-neutral-950 border-2 border-neutral-800 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#F24C20] transition-colors resize-none"
              />
              <p className="mt-2 text-xs text-right text-neutral-500">
                {formData.bio.length}/500 characters
              </p>
            </div>

            {/* Portfolio Link */}
            <div className="p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800">
              <label className="block text-lg font-semibold text-white mb-4">
                Portfolio Link (Optional)
              </label>
              <div className="relative">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <input
                  type="url"
                  value={formData.portfolioLink}
                  onChange={(e) => setFormData({ ...formData, portfolioLink: e.target.value })}
                  placeholder="https://yourportfolio.com"
                  className="w-full pl-12 pr-4 py-4 bg-neutral-950 border-2 border-neutral-800 rounded-xl text-white text-lg placeholder:text-neutral-500 focus:outline-none focus:border-[#F24C20] transition-colors"
                />
              </div>
            </div>

            {/* Submit Button */}
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
                Complete Profile
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
