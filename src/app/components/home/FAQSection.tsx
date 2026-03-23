import { motion, useInView, AnimatePresence } from 'motion/react';
import { useRef, useState, useEffect, useMemo } from 'react';
import { ChevronDown, HelpCircle, User, Briefcase } from 'lucide-react';
import api from '../../utils/api';

interface FAQ {
  _id: string;
  question: string;
  answer: string;
  category: string;
  is_active: boolean;
  sort_order?: number;
}

export default function FAQSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [openId, setOpenId] = useState<string | null>(null);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('General');

  useEffect(() => {
    setIsLoading(true);
    api.get('/cms/faqs')
      .then(res => {
        const active = (res.data.faqs || []).filter((f: FAQ) => f.is_active);
        setFaqs(active);
      })
      .catch((err) => console.error('FAQ load error:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(faqs.map(f => f.category)));
    // Order them specifically if possible
    const order = ['General', 'Freelancers', 'Clients'];
    return order.filter(o => cats.includes(o)).concat(cats.filter(c => !order.includes(c)));
  }, [faqs]);

  // If initial active tab is missing, pick first available
  useEffect(() => {
    if (categories.length > 0 && !categories.includes(activeTab)) {
      setActiveTab(categories[0]);
    }
  }, [categories, activeTab]);

  const filteredFaqs = useMemo(() => {
    return faqs.filter(f => f.category === activeTab).sort((a,b) => (a.sort_order || 0) - (b.sort_order || 0));
  }, [faqs, activeTab]);

  // Divide into 2 columns
  const firstCol = filteredFaqs.filter((_, i) => i % 2 === 0);
  const secondCol = filteredFaqs.filter((_, i) => i % 2 !== 0);

  const getTabIcon = (cat: string) => {
    switch(cat) {
      case 'General': return <HelpCircle className="w-5 h-5" />;
      case 'Freelancers': return <Briefcase className="w-5 h-5" />;
      case 'Clients': return <User className="w-5 h-5" />;
      default: return <HelpCircle className="w-5 h-5" />;
    }
  };

  return (
    <section
      ref={ref}
      className="relative py-32 overflow-hidden bg-black"
    >
      {/* Decorative background atoms */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#F24C20]/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-[#044071]/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F24C20]/10 border border-[#F24C20]/20 text-[#F24C20] mb-8">
            <HelpCircle className="w-4 h-4" />
            <span className="text-sm font-bold tracking-wider uppercase">Quick Help</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6">
            <span className="text-white">Questions? </span>
            <span className="bg-gradient-to-r from-[#F24C20] to-orange-500 bg-clip-text text-transparent italic">
              Answered.
            </span>
          </h2>
        </motion.div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => { setActiveTab(cat); setOpenId(null); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all border-2 ${
                activeTab === cat 
                ? 'bg-[#F24C20] border-[#F24C20] text-white shadow-lg' 
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white'
              }`}
            >
              {getTabIcon(cat)}
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ Grid - 2 Sections */}
        <div className="grid lg:grid-cols-2 gap-6 items-start">
          {/* Column 1 */}
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {firstCol.map((faq, idx) => (
                <FAQItem 
                  key={faq._id} 
                  faq={faq} 
                  isOpen={openId === faq._id} 
                  onToggle={() => setOpenId(openId === faq._id ? null : faq._id)}
                  index={idx}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Column 2 */}
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {secondCol.map((faq, idx) => (
                <FAQItem 
                  key={faq._id} 
                  faq={faq} 
                  isOpen={openId === faq._id} 
                  onToggle={() => setOpenId(openId === faq._id ? null : faq._id)}
                  index={idx}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {!isLoading && filteredFaqs.length === 0 && (
          <div className="text-center py-20 bg-neutral-900/50 rounded-[40px] border border-neutral-800">
             <p className="text-neutral-500 font-medium text-lg italic">No questions in this section yet.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function FAQItem({ faq, isOpen, onToggle, index }: { faq: FAQ, isOpen: boolean, onToggle: () => void, index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      className={`rounded-[32px] border transition-all overflow-hidden ${
        isOpen ? 'bg-neutral-900 border-[#F24C20]/50 shadow-2xl' : 'bg-neutral-900/40 border-neutral-800 hover:border-neutral-700'
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full p-8 text-left group"
      >
        <div className="flex items-center justify-between gap-6">
          <h3 className={`text-xl font-bold transition-colors ${isOpen ? 'text-[#F24C20]' : 'text-white'}`}>
            {faq.question}
          </h3>
          <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-all border ${
            isOpen ? 'bg-[#F24C20] border-[#F24C20] text-white rotate-180' : 'bg-neutral-800 border-neutral-700 text-neutral-400'
          }`}>
            <ChevronDown className="w-6 h-6" />
          </div>
        </div>

        <motion.div
          initial={false}
          animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
          className="overflow-hidden"
        >
          <div className="pt-8 text-neutral-400 text-lg leading-relaxed whitespace-pre-wrap">
            <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
          </div>
        </motion.div>
      </button>
    </motion.div>
  );
}