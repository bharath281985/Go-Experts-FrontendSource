import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Search, MessageCircle, HelpCircle } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../utils/api';

interface FAQData {
    _id: string;
    question: string;
    answer: string;
    category: string;
    is_active: boolean;
}

export default function FAQsPage() {
    const [faqs, setFaqs] = useState<FAQData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeId, setActiveId] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState('All');

    useEffect(() => {
        api.get('/cms/faqs')
            .then(res => {
                if (res.data.success) {
                    setFaqs(res.data.faqs.filter((f: FAQData) => f.is_active));
                }
            })
            .catch(err => console.error('Error fetching FAQs:', err))
            .finally(() => setLoading(false));
    }, []);

    const categories = ['All', ...new Set(faqs.map(f => f.category))];

    const filteredFaqs = faqs.filter(faq => {
        const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="bg-black min-h-screen text-white">
            <Header />
            
            <main className="pt-32 pb-20 px-6">
                <div className="max-w-4xl mx-auto">
                    {/* Header Section */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-16"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F24C20]/10 text-[#F24C20] mb-6 border border-[#F24C20]/20">
                            <HelpCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">FAQ Help Center</span>
                        </div>
                        <h1 className="text-5xl font-extrabold mb-6 bg-gradient-to-r from-white via-neutral-200 to-neutral-500 bg-clip-text text-transparent">
                            Frequently Asked Questions
                        </h1>
                        <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
                            Find answers to common questions about Go Experts, payments, and project management.
                        </p>
                    </motion.div>

                    {/* Search Bar */}
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="relative mb-12"
                    >
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-neutral-500" />
                        <input 
                            type="text" 
                            placeholder="Search questions..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-16 pr-6 py-5 bg-neutral-900 border border-neutral-800 rounded-2xl text-lg focus:outline-none focus:border-[#F24C20] transition-colors shadow-2xl"
                        />
                    </motion.div>

                    {/* Category Tabs */}
                    <div className="flex flex-wrap gap-3 justify-center mb-12">
                        {categories.map((cat, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-6 py-2 rounded-xl text-sm font-medium transition-all ${
                                    selectedCategory === cat 
                                    ? 'bg-[#F24C20] text-white shadow-lg shadow-[#F24C20]/20' 
                                    : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* FAQ List */}
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-20 bg-neutral-900 rounded-2xl animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredFaqs.length > 0 ? (
                                filteredFaqs.map((faq, index) => (
                                    <motion.div
                                        key={faq._id}
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`rounded-2xl border transition-all duration-300 ${
                                            activeId === faq._id 
                                            ? 'bg-neutral-900/80 border-[#F24C20]/30 shadow-xl' 
                                            : 'bg-neutral-900/40 border-neutral-800 hover:border-neutral-700'
                                        }`}
                                    >
                                        <button
                                            onClick={() => setActiveId(activeId === faq._id ? null : faq._id)}
                                            className="w-full px-8 py-6 text-left flex items-center justify-between group"
                                        >
                                            <span className={`text-lg font-bold transition-colors ${activeId === faq._id ? 'text-[#F24C20]' : 'text-white group-hover:text-white/90'}`}>
                                                {faq.question}
                                            </span>
                                            <ChevronDown className={`w-5 h-5 text-neutral-500 transition-transform duration-300 ${activeId === faq._id ? 'rotate-180 text-[#F24C20]' : ''}`} />
                                        </button>
                                        
                                        <AnimatePresence>
                                            {activeId === faq._id && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="px-8 pb-8 pt-2 text-neutral-400 leading-relaxed border-t border-neutral-800/50">
                                                        <div 
                                                            className="prose prose-invert prose-sm max-w-none text-neutral-300"
                                                            dangerouslySetInnerHTML={{ __html: faq.answer }} 
                                                        />
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="text-center py-20 bg-neutral-900/50 rounded-3xl border border-dashed border-neutral-800">
                                    <MessageCircle className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-neutral-300 mb-2">No results found</h3>
                                    <p className="text-neutral-500">We couldn't find any FAQs matching your search.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Support Callout */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="mt-20 p-10 rounded-3xl bg-gradient-to-br from-[#F24C20]/10 to-transparent border border-[#F24C20]/20 text-center"
                    >
                        <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
                        <p className="text-neutral-400 mb-8 max-w-lg mx-auto">
                            Can't find the answer you're looking for? Please chat with our friendly team.
                        </p>
                        <a 
                            href="/contact" 
                            className="inline-flex items-center gap-2 px-8 py-4 bg-[#F24C20] text-white rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg hover:shadow-[#F24C20]/30 hover:-translate-y-1"
                        >
                            Get in Touch
                        </a>
                    </motion.div>
                </div>
            </main>
            
            <Footer />
        </div>
    );
}
