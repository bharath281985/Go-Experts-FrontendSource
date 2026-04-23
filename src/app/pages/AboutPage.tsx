import { useEffect, useState } from 'react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import api, { getImgUrl } from '../utils/api';
import { motion } from 'motion/react';
import * as Icons from 'lucide-react';
import { Sparkles, Target, ShieldCheck, Cpu, HelpCircle } from 'lucide-react';

interface AboutData {
    title: string;
    content: string;
    meta_title?: string;
    meta_description?: string;
    vision?: string;
    vision_icon?: string;
    mission?: string;
    mission_icon?: string;
    mission_points?: string[];
    differentiators?: { label: string; description: string; icon?: string }[];
    responsibilities?: string;
    image1?: string;
    image2?: string;
    updatedAt: string;
}

const DynamicIcon = ({ name, className }: { name: string; className?: string }) => {
    const IconComponent = (Icons as any)[name] || HelpCircle;
    return <IconComponent className={className} />;
};

export default function AboutPage() {
    const [page, setPage] = useState<AboutData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (page?.meta_title) {
            document.title = page.meta_title;
        }
        if (page?.meta_description) {
            const meta = document.querySelector('meta[name="description"]');
            if (meta) {
                meta.setAttribute('content', page.meta_description);
            }
        }
    }, [page]);

    useEffect(() => {
        const fetchAbout = async () => {
            try {
                // Use the live CMS slug first to avoid noisy 404s in the network panel.
                let res = await api.get('/cms/pages/about-us');
                if (res.data.success) {
                    setPage(res.data.page);
                    return;
                }
            } catch (err) {
                try {
                    // Fallback to alternate slug if needed.
                    let res = await api.get('/cms/pages/aboutus');
                    if (res.data.success) {
                        setPage(res.data.page);
                        return;
                    }
                } catch (err2) {
                    try {
                        // Try alternative slug "about"
                        let res = await api.get('/cms/pages/about');
                        if (res.data.success) {
                            setPage(res.data.page);
                            return;
                        }
                    } catch (err3) {
                        // Fallback / Defaults
                        setPage({
                            title: 'About Go Experts',
                            content: 'Go Experts is India’s fastest-growing freelance marketplace.',
                            vision: 'To create a commission-free freelancing environment where talent and opportunity meet directly.',
                            mission: 'To empower freelancers with full control over their earnings and help clients hire talent without hidden fees.',
                            updatedAt: new Date().toISOString()
                        });
                    }
                }
            } finally {
                setLoading(false);
            }
        };
        fetchAbout();
    }, []);

    const coreFeatures = [
        {
            title: "Our Vision",
            icon: page?.vision_icon || "Target",
            content: page?.vision || "To create a commission-free freelancing environment where talent and opportunity meet directly.",
            color: "from-purple-500/20 to-blue-500/20"
        },
        {
            title: "Our Mission",
            icon: page?.mission_icon || "Sparkles",
            content: page?.mission || "To empower freelancers with full control over their earnings and help clients hire talent without hidden fees.",
            color: "from-[#F24C20]/20 to-orange-500/20"
        }
    ];

    const differentiators = page?.differentiators?.length
        ? page.differentiators.map(d => ({ label: d.label, desc: d.description, icon: d.icon || 'ShieldCheck' }))
        : [
            { label: '100% Subscription-Based', desc: 'With an annual fee of ₹3650, both freelancers and clients get full access—no extra costs.', icon: 'ShieldCheck' },
            { label: 'Zero Commission Model', desc: 'Freelancers keep 100% of earnings; clients pay only what they agree upon.', icon: 'ShieldCheck' }
        ];

    return (
        <div className="bg-black min-h-screen text-white selection:bg-[#F24C20]">
            <Header />

            <main className="pt-24 pb-12">
                <div className="max-w-7xl mx-auto px-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-40 gap-4 text-center">
                            <div className="w-12 h-12 border-4 border-[#F24C20] border-t-transparent rounded-full animate-spin" />
                            <p className="text-neutral-500 font-medium">Loading Go Experts Story...</p>
                        </div>
                    ) : (
                        <>
                            {/* Hero Section */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center mb-20"
                            >
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F24C20]/10 text-[#F24C20] mb-8 border border-[#F24C20]/20">
                                    <Sparkles className="w-4 h-4" />
                                    <span className="text-sm font-medium">About Go Experts</span>
                                </div>
                                <h1 className="text-6xl lg:text-6xl font-black mb-8 leading-tight tracking-tight px-4">
                                    Fair Work. <br />
                                    <span className="bg-gradient-to-r from-[#F24C20] via-orange-500 to-yellow-500 bg-clip-text text-transparent">
                                        No Commissions.
                                    </span>
                                </h1>
                                <div
                                    className="cms-content mx-auto w-full max-w-[96rem] px-8 md:px-12 lg:px-16 text-left text-lg leading-9 text-neutral-400 md:text-xl md:leading-[2.2rem] lg:max-w-6xl [&_p]:mx-auto [&_p]:w-full [&_p]:max-w-6xl [&_p]:mb-5 [&_p]:leading-9 md:[&_p]:leading-[2.2rem]"
                                    style={{ textAlign: 'justify', textJustify: 'inter-word' }}
                                    dangerouslySetInnerHTML={{ __html: page?.content || 'Go Experts is India’s fastest-growing freelance marketplace, built to empower talent and simplify hiring.' }}
                                />
                            </motion.div>

                            {/* Vision & Mission Grid */}
                            <div className="grid md:grid-cols-2 gap-8 mb-20">
                                {coreFeatures.map((feature, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: idx === 0 ? -20 : 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        className={`p-8 md:p-9 rounded-[36px] bg-gradient-to-br ${feature.color} border border-white/5 relative overflow-hidden group min-h-[300px]`}
                                    >
                                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                            <DynamicIcon name={feature.icon} className="w-32 h-32" />
                                        </div>
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-5 mb-6">
                                                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                                                    <DynamicIcon name={feature.icon} className="w-8 h-8 text-white" />
                                                </div>
                                                <h2 className="text-3xl font-bold italic leading-none">{feature.title}</h2>
                                            </div>
                                            <p className="text-xl text-neutral-300 leading-relaxed font-medium">
                                                {feature.content}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>





                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                className="text-center px-10 py-10 md:px-14 md:py-9 rounded-[56px] border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_24px_80px_rgba(0,0,0,0.35)] relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-[#F24C20]/[0.06]" />
                                <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
                                <div className="absolute top-1/2 left-1/2 h-[220px] w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F24C20]/12 blur-[110px]" />
                                <h2 className="text-4xl md:text-5xl font-black mb-6 relative z-10 italic">Our Promise</h2>
                                <p className="text-xl md:text-2xl text-neutral-300 max-w-5xl mx-auto leading-relaxed md:leading-[1.9] relative z-10">
                                    {page?.responsibilities || "Simple. Transparent. Fair. Growth-focused. We’re not just a platform—we’re a community where talent meets opportunity without barriers."}
                                </p>
                            </motion.div>

                            {/* Differentiators */}
                            <div className="mb-20 mt-20">
                                <div className="text-center mb-10">
                                    <h2 className="text-4xl md:text-5xl font-bold mb-4">What Makes Us Different?</h2>
                                    <p className="text-neutral-500 text-lg">Breaking the traditional barriers of freelancing.</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5">
                                    {differentiators.map((item, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="p-6 rounded-[28px] bg-neutral-900/50 border border-neutral-800 hover:border-[#F24C20]/30 transition-all hover:bg-neutral-800/50 min-h-[250px]"
                                        >
                                            <div className="text-[#F24C20] mb-3">
                                                <DynamicIcon name={item.icon} className="w-7 h-7" />
                                            </div>
                                            <h3 className="text-lg font-bold mb-3 leading-snug">{item.label}</h3>
                                            <p className="text-neutral-500 text-sm font-medium leading-7">{item.desc}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Responsibilities Section */}
                            <div className="grid lg:grid-cols-2 gap-12 items-center mb-20 bg-neutral-900/30 rounded-[60px] p-10 md:p-14 border border-white/5">
                                <div>
                                    <h2 className="text-4xl font-bold mb-8">Direct Collaboration & Responsibility</h2>
                                    <p className="text-neutral-400 text-lg leading-relaxed mb-8">
                                        We provide a platform to connect—you manage your own negotiations, payments, and agreements.
                                        This ensures complete freedom and control for both parties.
                                    </p>
                                    <div className="space-y-4">
                                        {(page?.mission_points?.length ? page.mission_points : ['No Payment Handling', '100% Commission Free', 'Full Autonomy', 'Zero Disputes Responsibility']).map((text, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-[#F24C20]" />
                                                <span className="text-neutral-300 font-medium">{text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="pt-2 space-y-4">
                                        {page?.image1 ? (
                                            <div className="h-64 rounded-[32px] overflow-hidden border border-white/5 shadow-2xl">
                                                <img src={getImgUrl(page.image1) || page.image1} className="block h-full w-full object-cover object-center" alt="About 1" />
                                            </div>
                                        ) : (
                                            <div className="h-64 rounded-[32px] bg-neutral-800/50 flex items-center justify-center border border-white/5 italic text-neutral-600 text-xs">
                                                Image 1 Placeholder
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-30 space-y-4">
                                        {page?.image2 ? (
                                            <div className="h-64 rounded-[32px] overflow-hidden border border-white/5 shadow-2xl">
                                                <img src={getImgUrl(page.image2) || page.image2} className="block h-full w-full object-cover object-center" alt="About 2" />
                                            </div>
                                        ) : (
                                            <div className="h-64 rounded-[32px] bg-neutral-800/80 border border-white/5 flex flex-col items-center justify-center space-y-3">
                                                <Cpu className="w-12 h-12 text-neutral-600" />
                                                <span className="text-neutral-700 font-bold uppercase tracking-widest text-xs">System</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Promise CTA */}

                        </>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
