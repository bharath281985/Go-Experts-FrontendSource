import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Mail, Facebook, Instagram, Youtube } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { useSiteSettings } from '@/app/context/SiteSettingsContext';
import api, { getImgUrl } from '@/app/utils/api';
import logoFallback from '@/assets/0772c85ef8b5349a958c92c3b3261c8a881ce229.png';

export default function Footer() {
  const settings = useSiteSettings();
  const { footer_logo, site_logo, site_name } = settings;
  const logoUrl = getImgUrl(footer_logo || site_logo) || logoFallback;

  const XIcon = (props: any) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.292 19.49h2.039L6.486 3.24H4.298l13.311 17.403z" />
    </svg>
  );

  const AppleStoreIcon = (props: any) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M15.77 12.95c.02 2.24 1.96 2.99 1.98 3-.02.05-.31 1.07-1.02 2.12-.61.91-1.25 1.81-2.25 1.83-.98.02-1.29-.58-2.41-.58-1.12 0-1.47.56-2.39.6-.97.04-1.71-.98-2.33-1.88-1.26-1.83-2.22-5.16-.93-7.4.64-1.11 1.78-1.81 3.02-1.83.94-.02 1.82.63 2.39.63.57 0 1.64-.78 2.77-.66.47.02 1.79.19 2.64 1.44-.07.04-1.57.92-1.55 2.73ZM14 4.5c.51-.62.86-1.48.77-2.34-.73.03-1.61.48-2.13 1.09-.47.54-.88 1.41-.77 2.24.81.06 1.63-.42 2.13-.99Z" />
    </svg>
  );

  const PlayStoreIcon = (props: any) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M4.7 3.8c-.29.3-.45.73-.45 1.28v13.84c0 .55.16.98.45 1.28l.07.06 7.78-7.78v-.19L4.77 3.74l-.07.06Z" />
      <path d="M15.14 14.97 12.55 12.38v-.19l2.59-2.59.06.03 3.07 1.74c.88.5.88 1.31 0 1.81l-3.07 1.74-.06.05Z" />
      <path d="M15.2 14.92 12.55 12.27 4.7 20.12c.46.47 1.18.53 1.99.08l8.5-4.83" />
      <path d="M15.2 9.56 6.69 4.73c-.81-.46-1.53-.39-1.99.08l7.85 7.85 2.65-2.65Z" />
    </svg>
  );

  const socialLinks = [
    { Icon: Github, url: settings.social_github },
    { Icon: XIcon, url: settings.social_twitter },
    { Icon: Linkedin, url: settings.social_linkedin },
    { Icon: Facebook, url: settings.social_facebook },
    { Icon: Instagram, url: settings.social_instagram },
    { Icon: Youtube, url: settings.social_youtube },
    { Icon: Mail, url: settings.contact_email ? `mailto:${settings.contact_email}` : '' }
  ].filter(link => link.url);

  const orderFooterColumns = (cols: any[]) => {
    const company = cols.find((col: any) => col.title?.toLowerCase().includes('company'));
    const investors = cols.find((col: any) => col.title?.toLowerCase().includes('investor'));
    const others = cols.filter((col: any) => col !== company && col !== investors);
    return [...others, ...(investors ? [investors] : []), ...(company ? [company] : [])];
  };

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) { }
    }
  }, []);

  const [footerColumns, setFooterColumns] = useState<any[]>([]);

  useEffect(() => {
    const clientCol = {
      title: 'For Clients',
      links: [
        { label: 'Post a Project', path: user?.role === 'client' ? '/dashboard/create-project' : '/projects' },
        { label: 'Go Talent', path: '/talent' },
        { label: 'Client Dashboard', path: user ? '/dashboard' : '/signin' },
      ]
    };

    const freelancerCol = {
      title: 'For Freelancers',
      links: [
        { label: 'Go Projects', path: '/projects' },
        { label: 'Freelancer Dashboard', path: user ? '/dashboard' : '/signin' },
        // { label: 'Service Gigs', path: '/gigs' },
      ]
    };






    const companyCol = {
      title: 'Company',
      links: [
        { label: 'About Us', path: '/about-us' },
        { label: 'Contact Us', path: '/contact-us' },
        { label: 'FAQs', path: '/faqs' },
      ]
    };



    const investorCol = {
      title: 'For Investors',
      links: [
        { label: 'Invest in Projects', path: '/investments' },
        { label: 'Investor Dashboard', path: user ? '/dashboard' : '/signin' },
        // { label: 'Service Gigs', path: '/gigs' },
      ]
    };

    const defaultCols = user?.role === 'freelancer'
      ? [freelancerCol, clientCol, investorCol, companyCol]
      : [clientCol, freelancerCol, investorCol, companyCol];

    const fetchMenus = async () => {
      try {
        const res = await api.get('/cms/menus');
        if (res.data.success && res.data.menus) {
          const allFooter = res.data.menus.filter((m: any) => m.location === 'footer' && m.is_active);
          const topLevel = allFooter.filter((m: any) => !m.parent).sort((a: any, b: any) => a.order - b.order);

          if (topLevel.length > 0) {
            const cols = topLevel.map((parent: any) => {
              const subs = allFooter
                .filter((m: any) => {
                  const pId = typeof m.parent === 'object' ? m.parent?._id : m.parent;
                  return pId === parent._id;
                })
                .sort((a: any, b: any) => a.order - b.order);

              return {
                title: parent.label,
                links: subs.map((sub: any) => ({
                  label: sub.label,
                  path: sub.url,
                  open_in_new_tab: sub.open_in_new_tab
                }))
              };
            });

            const hasInvestor = cols.some((col: any) => col.title?.toLowerCase().includes('investor'));
            setFooterColumns(orderFooterColumns(hasInvestor ? cols : [...cols, investorCol]));
          } else {
            setFooterColumns(orderFooterColumns(defaultCols));
          }
        } else {
          setFooterColumns(orderFooterColumns(defaultCols));
        }
      } catch (err) {
        console.warn('Failed to fetch footer menus', err);
        setFooterColumns(orderFooterColumns(defaultCols));
      }
    };
    fetchMenus();
  }, [user]);

  return (
    <footer
      className="relative pt-20 pb-8 overflow-hidden border-t border-neutral-800"
      style={{
        background: 'linear-gradient(180deg, #000000 0%, #0a0505 100%)',
      }}
    >
      {/* Background Glow */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-[#F24C20]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full px-6 md:px-10 xl:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <img
                src={logoUrl}
                alt={site_name || "Go Experts"}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src !== logoFallback) {
                    target.src = logoFallback;
                  }
                }}
                className="h-12 w-auto opacity-90 hover:opacity-100 transition-opacity duration-300"
              />
            </div>
            <p className="text-neutral-400 mb-6 leading-relaxed">
              {settings.site_tagline || 'Find verified experts. Get work done faster. The future of freelancing is here.'}
            </p>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map(({ Icon, url }, index) => (
                <motion.a
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="w-9 h-9 rounded-xl bg-neutral-900 hover:bg-[#F24C20]/20 border border-neutral-800 hover:border-[#F24C20]/50 flex items-center justify-center transition-all duration-300"
                >
                  <Icon className="w-4 h-4 text-neutral-400 hover:text-[#F24C20] transition-colors duration-300" />
                </motion.a>
              ))}
            </div>
          </div>

          {footerColumns.map((col, idx) => (
            <div key={idx}>
              <h3 className="font-bold mb-6 text-white text-lg">{col.title}</h3>
              <ul className="space-y-3">
                {col.links.map((item: any) => (
                  <li key={item.label}>
                    <Link
                      to={item.path}
                      target={item.open_in_new_tab ? '_blank' : '_self'}
                      rel={item.open_in_new_tab ? 'noopener noreferrer' : undefined}
                      className="text-neutral-400 hover:text-[#F24C20] transition-colors duration-300 flex items-center gap-2 group"
                    >
                      <span className="w-0 h-px bg-[#F24C20] group-hover:w-4 transition-all duration-300" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* App Download Section */}
        <div className="border-t border-neutral-800 pt-10 pb-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="text-white font-semibold mb-2">Get the Go Experts App</h4>
              <p className="text-neutral-500 text-sm">Available Shortly on Android and iOS Platform</p>
            </div>
            <div className="flex gap-4">
              <motion.a
                href="#"
                whileHover={{ scale: 1.05, y: -2 }}
                className="px-4 py-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-[#F24C20]/50 rounded-xl flex items-center gap-3.5 transition-all duration-300"
              >
                <AppleStoreIcon className="w-6 h-6 shrink-0 text-[#F24C20]" />
                <div className="min-w-[144px] leading-tight">
                  <div className="text-xs text-neutral-500">Download on</div>
                  <div className="font-semibold text-white">App Store</div>
                </div>
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.05, y: -2 }}
                className="px-4 py-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-[#F24C20]/50 rounded-xl flex items-center gap-3.5 transition-all duration-300"
              >
                <PlayStoreIcon className="w-6 h-6 shrink-0 text-[#F24C20]" />
                <div className="min-w-[144px] leading-tight">
                  <div className="text-xs text-neutral-500">Get it on</div>
                  <div className="font-semibold text-white">Google Play</div>
                </div>
              </motion.a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-neutral-800 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-neutral-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#F24C20] animate-pulse" />
              <span>{settings.footer_copyright || `© ${new Date().getFullYear()} Go Experts. All rights reserved.`}</span>
            </div>
            <div className="flex gap-8">
              <Link to="/privacy" className="hover:text-[#F24C20] transition-colors duration-300">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-[#F24C20] transition-colors duration-300">
                Terms of Service
              </Link>
              <Link to="/cookies" className="hover:text-[#F24C20] transition-colors duration-300">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
