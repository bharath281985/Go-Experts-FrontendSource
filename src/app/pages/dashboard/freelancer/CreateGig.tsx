import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useTheme } from '@/app/components/ThemeProvider';
import { 
  Plus, 
  Image as ImageIcon, 
  Loader2, 
  CheckCircle,
  AlertCircle,
  X,
  IndianRupee,
  Layout,
  Type,
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '@/app/utils/api';
import { toast } from 'sonner';

export default function CreateGig() {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    investment_required: '',
    category: '',
    tags: [] as string[],
  });
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');

  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get('/cms/categories');
        if (res.data.success) {
          setCategories(res.data.categories || res.data.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCats();
  }, []);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnail(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tagToRemove) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.investment_required || !formData.category) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('investment_required', formData.investment_required);
      data.append('category', formData.category);
      if (thumbnail) {
        data.append('thumbnail', thumbnail);
      }

      const res = await api.post('/gigs', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        toast.success('Gig created successfully! Pending admin approval.');
        navigate('/dashboard/gigs/my-gigs');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create gig');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
          Create New Gig
        </h1>
        <p className={`mt-2 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
          Offer your professional services to clients world-wide
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-8 rounded-2xl border ${isDarkMode ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white border-neutral-200'}`}
        >
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2 text-[#F24C20]">
              <Type className="w-5 h-5" />
              <h2 className="text-xl font-bold">Gig Overview</h2>
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                Gig Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. I will design a high-converting landing page"
                className={`w-full px-4 py-3 rounded-xl border ${isDarkMode ? 'bg-neutral-800/50 border-neutral-700 text-white' : 'bg-white border-neutral-300 text-neutral-900'} outline-none focus:border-[#F24C20] transition-colors`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border ${isDarkMode ? 'bg-neutral-800/50 border-neutral-700 text-white' : 'bg-white border-neutral-300 text-neutral-900'} outline-none focus:border-[#F24C20] transition-colors`}
                >
                  <option value="">Select a category</option>
                  {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                  Investment / Price (₹)
                </label>
                <div className="relative">
                  <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input
                    type="number"
                    value={formData.investment_required}
                    onChange={(e) => setFormData({ ...formData, investment_required: e.target.value })}
                    placeholder="5000"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border ${isDarkMode ? 'bg-neutral-800/50 border-neutral-700 text-white' : 'bg-white border-neutral-300 text-neutral-900'} outline-none focus:border-[#F24C20] transition-colors`}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                Description
              </label>
              <textarea
                rows={6}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your service in detail..."
                className={`w-full px-4 py-3 rounded-xl border ${isDarkMode ? 'bg-neutral-800/50 border-neutral-700 text-white' : 'bg-white border-neutral-300 text-neutral-900'} outline-none focus:border-[#F24C20] transition-colors`}
              />
            </div>
          </div>
        </motion.div>

        {/* Media & Tags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`p-8 rounded-2xl border ${isDarkMode ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white border-neutral-200'}`}
          >
            <div className="flex items-center gap-2 mb-6 text-[#F24C20]">
              <ImageIcon className="w-5 h-5" />
              <h2 className="text-xl font-bold">Thumbnail</h2>
            </div>
            
            <div 
              onClick={() => document.getElementById('thumbnailInput')?.click()}
              className={`relative h-48 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
                isDarkMode ? 'border-neutral-700 hover:border-[#F24C20] bg-neutral-800/20' : 'border-neutral-300 hover:border-[#F24C20] bg-neutral-50'
              }`}
            >
              {thumbnailPreview ? (
                <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
              ) : (
                <>
                  <Plus className="w-8 h-8 text-neutral-500 mb-2" />
                  <span className="text-sm text-neutral-500">Upload high-quality image</span>
                </>
              )}
              <input 
                id="thumbnailInput"
                type="file" 
                accept="image/*" 
                onChange={handleThumbnailChange} 
                className="hidden" 
              />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`p-8 rounded-2xl border ${isDarkMode ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white border-neutral-200'}`}
          >
            <div className="flex items-center gap-2 mb-6 text-[#F24C20]">
              <Layout className="w-5 h-5" />
              <h2 className="text-xl font-bold">Search Tags</h2>
            </div>
            
            <div className="space-y-4">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Press Enter to add tags"
                className={`w-full px-4 py-3 rounded-xl border ${isDarkMode ? 'bg-neutral-800/50 border-neutral-700 text-white' : 'bg-white border-neutral-300 text-neutral-900'} outline-none focus:border-[#F24C20] transition-colors`}
              />
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <span key={tag} className="flex items-center gap-1 px-3 py-1.5 bg-[#F24C20]/10 text-[#F24C20] rounded-lg text-sm font-medium border border-[#F24C20]/30">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
              <p className="text-xs text-neutral-500">Add up to 5 tags to help buyers find your gig.</p>
            </div>
          </motion.div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-neutral-800/30">
          <button
            type="button"
            onClick={() => navigate('/dashboard/gigs/my-gigs')}
            className={`px-8 py-3 rounded-xl font-medium transition-colors ${isDarkMode ? 'bg-neutral-800 text-white hover:bg-neutral-700' : 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'}`}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-10 py-3 bg-[#044071] text-white rounded-xl font-bold hover:bg-[#044071]/90 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
            Publish Gig
          </button>
        </div>
      </form>
    </div>
  );
}
