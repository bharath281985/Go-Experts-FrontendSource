import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../utils/api';

interface StaticPageData {
    title: string;
    content: string;
    meta_title?: string;
    meta_description?: string;
    slug: string;
    updatedAt: string;
}

// Fallback content for core pages
const FALLBACKS: Record<string, StaticPageData> = {
    about: {
        title: 'About Go Experts',
        slug: 'about',
        updatedAt: new Date().toISOString(),
        content: `<h2>Who We Are</h2>
<p>Go Experts is India's leading freelance marketplace connecting businesses with top-rated professionals. Founded with a mission to democratize work, we empower talented individuals to build careers on their own terms while helping businesses find the expertise they need.</p>
<h2>Our Mission</h2>
<p>We believe work should be rewarding, flexible, and accessible to everyone. Go Experts breaks geographic barriers and connects the right talent with the right opportunity.</p>
<h2>Why Go Experts?</h2>
<ul>
  <li>✅ Verified & vetted professionals</li>
  <li>✅ Secure escrow payments</li>
  <li>✅ 24/7 support</li>
  <li>✅ AI-powered matching</li>
</ul>`,
    },
    terms: {
        title: 'Terms of Service',
        slug: 'terms',
        updatedAt: new Date().toISOString(),
        content: `<h2>1. Acceptance of Terms</h2>
<p>By using Go Experts, you agree to these Terms of Service. Please read them carefully before using our platform.</p>
<h2>2. User Accounts</h2>
<p>You are responsible for maintaining the security of your account. Go Experts reserves the right to terminate accounts that violate our policies.</p>
<h2>3. Platform Fees</h2>
<p>Go Experts charges a service fee on completed transactions. Fees are displayed before purchase confirmation.</p>
<h2>4. Dispute Resolution</h2>
<p>Disputes between clients and freelancers must be submitted through our resolution center within 30 days.</p>`,
    },
    privacy: {
        title: 'Privacy Policy',
        slug: 'privacy',
        updatedAt: new Date().toISOString(),
        content: `<h2>Information We Collect</h2>
<p>We collect information you provide when creating an account, posting projects, or communicating through our platform.</p>
<h2>How We Use Your Information</h2>
<p>Your information is used to provide and improve our services, process payments, and communicate with you about your account.</p>
<h2>Data Security</h2>
<p>We implement industry-standard encryption and security practices to protect your personal information.</p>
<h2>Your Rights</h2>
<p>You have the right to access, update, or delete your personal information at any time through your account settings.</p>`,
    },
    cookies: {
        title: 'Cookie Policy',
        slug: 'cookies',
        updatedAt: new Date().toISOString(),
        content: `<h2>What are Cookies?</h2>
<p>Cookies are small text files that are stored on your device to help us provide a better experience. They allow us to remember your preferences and understand how you use our platform.</p>
<h2>How We Use Cookies</h2>
<ul>
  <li><strong>Essential Cookies:</strong> Required for the platform to function properly.</li>
  <li><strong>Analytical Cookies:</strong> Help us improve our services by understanding user behavior.</li>
  <li><strong>Preference Cookies:</strong> Remember your settings and choices.</li>
</ul>
<h2>Your Choices</h2>
<p>Most browsers allow you to manage or disable cookies. However, disabling certain cookies may affect your ability to use our services.</p>`,
    },
};

export default function StaticPageView() {
    const { slug } = useParams<{ slug: string }>();
    // For direct routes like /about, /terms, /privacy, derive from pathname when slug param not set
    const resolvedSlug = slug || window.location.pathname.replace(/^\//, '') || 'about';

    const [page, setPage] = useState<StaticPageData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        api.get(`/cms/pages/${resolvedSlug}`, { skipToast: true } as any)
            .then(res => {
                setPage(res.data.page);
            })
            .catch(() => {
                // Use fallback content if API fails or page not created yet
                setPage(FALLBACKS[resolvedSlug] || null);
            })
            .finally(() => setLoading(false));
    }, [resolvedSlug]);

    return (
        <>
            <Header />
            <main className="min-h-screen bg-neutral-950 pt-24 pb-20">
                {loading ? (
                    <div className="max-w-4xl mx-auto px-6 py-24 text-center">
                        <div className="animate-spin w-10 h-10 border-2 border-[#F24C20] border-t-transparent rounded-full mx-auto mb-4" />
                        <p className="text-neutral-400">Loading...</p>
                    </div>
                ) : !page ? (
                    <div className="max-w-4xl mx-auto px-6 py-24 text-center">
                        <h1 className="text-4xl font-bold text-white mb-4">Page not found</h1>
                        <p className="text-neutral-400">This page hasn't been created yet in the CMS.</p>
                    </div>
                ) : (
                    <motion.article
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="max-w-4xl mx-auto px-6"
                    >
                        {/* Page Header */}
                        <div className="text-center py-16 border-b border-neutral-800 mb-12">
                            <h1 className="text-5xl font-bold text-white mb-4">{page.title}</h1>
                            <p className="text-neutral-500 text-sm">
                                Last updated: {new Date(page.updatedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>

                        {/* Page Content */}
                        <div
                            className="prose prose-invert prose-lg max-w-none
                prose-headings:text-white prose-headings:font-bold prose-headings:mb-4 prose-headings:mt-8
                prose-h2:text-2xl prose-h3:text-xl
                prose-p:text-neutral-300 prose-p:leading-relaxed prose-p:mb-4
                prose-li:text-neutral-300 prose-ul:space-y-2
                prose-strong:text-white"
                            dangerouslySetInnerHTML={{ __html: page.content }}
                        />
                    </motion.article>
                )}
            </main>
            <Footer />
        </>
    );
}
