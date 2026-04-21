import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import api, { getImgUrl } from '../utils/api';
import { SiteSettingsContext, defaultSiteSettings, type SiteSettings } from '../context/SiteSettingsContext';

interface Props {
    children: React.ReactNode;
}

export default function SiteSettingsProvider({ children }: Props) {
    const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
    const [maintenance, setMaintenance] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get('/cms/settings');
                if (res.data.success && res.data.settings) {
                    const s: SiteSettings = { ...defaultSiteSettings, ...res.data.settings };
                    setSettings(s);

                    // ── 1. Page Title ──────────────────────────────────────
                    document.title = s.meta_title || s.site_name || 'Go Experts';

                    // ── 2. Favicon ─────────────────────────────────────────
                    if (s.site_favicon) {
                        let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
                        if (!link) {
                            link = document.createElement('link');
                            link.rel = 'icon';
                            document.head.appendChild(link);
                        }
                        link.href = getImgUrl(s.site_favicon);
                    }

                    // ── 3. Meta Description ────────────────────────────────
                    if (s.meta_description) {
                        let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
                        if (!meta) {
                            meta = document.createElement('meta');
                            meta.name = 'description';
                            document.head.appendChild(meta);
                        }
                        meta.content = s.meta_description;
                    }

                    // ── 4. Meta Keywords ───────────────────────────────────
                    if (s.meta_keywords) {
                        let meta = document.querySelector<HTMLMetaElement>('meta[name="keywords"]');
                        if (!meta) {
                            meta = document.createElement('meta');
                            meta.name = 'keywords';
                            document.head.appendChild(meta);
                        }
                        meta.content = s.meta_keywords;
                    }

                    // ── 5. OG Tags ────────────────────────────────────────
                    const setOgTag = (property: string, content: string) => {
                        let meta = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
                        if (!meta) {
                            meta = document.createElement('meta');
                            meta.setAttribute('property', property);
                            document.head.appendChild(meta);
                        }
                        meta.content = content;
                    };

                    setOgTag('og:title', s.meta_title || s.site_name || 'Go Experts');
                    setOgTag('og:description', s.meta_description || 'Hire the best freelancers.');
                    if (s.site_logo || s.site_favicon) {
                        setOgTag('og:image', getImgUrl(s.site_logo || s.site_favicon));
                    }
                    setOgTag('og:url', window.location.href);

                    // ── 6. Maintenance Mode ────────────────────────────────
                    if (s.maintenance_mode) {
                        setMaintenance(true);
                    }
                }
            } catch (err) {
                console.warn('SiteSettingsLoader: Could not fetch settings, using defaults.', err);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    // While fetching — fast skeleton (max ~800ms usually)
    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="flex flex-col items-center gap-4"
                >
                    <div className="w-10 h-10 rounded-full border-2 border-[#F24C20] border-t-transparent animate-spin" />
                    <p className="text-neutral-500 text-sm">Loading Go Experts...</p>
                </motion.div>
            </div>
        );
    }

    // Maintenance Mode screen
    if (maintenance) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-md"
                >
                    {/* Icon */}
                    <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                        className="text-6xl mb-6"
                    >
                        🔧
                    </motion.div>
                    <h1 className="text-4xl font-bold mb-3">
                        We'll be back soon!
                    </h1>
                    <p className="text-neutral-400 text-lg mb-2">
                        {settings.site_name} is currently undergoing scheduled maintenance.
                    </p>
                    <p className="text-neutral-500 text-sm mb-8">
                        We're working hard to improve the experience for you. Please check back later.
                    </p>
                    {settings.contact_email && (
                        <a
                            href={`mailto:${settings.contact_email}`}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#F24C20] hover:bg-[#d43a12] rounded-xl font-medium transition-colors"
                        >
                            Contact Us
                        </a>
                    )}
                    <div className="mt-10 flex items-center justify-center gap-2 text-neutral-600 text-xs">
                        <div className="w-2 h-2 rounded-full bg-[#F24C20] animate-pulse" />
                        Maintenance in progress
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <SiteSettingsContext.Provider value={settings}>
            {children}
        </SiteSettingsContext.Provider>
    );
}
