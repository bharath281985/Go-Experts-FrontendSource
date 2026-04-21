import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Mail, Smartphone, Facebook, Instagram, Youtube } from 'lucide-react';
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

  const socialLinks = [
    { Icon: Github, url: settings.social_github },
    { Icon: XIcon, url: settings.social_twitter },
    { Icon: Linkedin, url: settings.social_linkedin },
    { Icon: Facebook, url: settings.social_facebook },
    { Icon: Instagram, url: settings.social_instagram },
    { Icon: Youtube, url: settings.social_youtube },
    { Icon: Mail, url: settings.contact_email ? `mailto:${settings.contact_email}` : '' }
  ].filter(link => link.url);

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {}
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
        { label: 'Service Gigs', path: '/gigs' },
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

    const defaultCols = user?.role === 'freelancer' 
      ? [freelancerCol, clientCol, companyCol]
      : [clientCol, freelancerCol, companyCol];
    
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
            setFooterColumns(cols);
          } else {
            setFooterColumns(defaultCols);
          }
        } else {
          setFooterColumns(defaultCols);
        }
      } catch (err) {
        console.warn('Failed to fetch footer menus', err);
        setFooterColumns(defaultCols);
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

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
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
                  className="w-10 h-10 rounded-xl bg-neutral-900 hover:bg-[#F24C20]/20 border border-neutral-800 hover:border-[#F24C20]/50 flex items-center justify-center transition-all duration-300"
                >
                  <Icon className="w-5 h-5 text-neutral-400 hover:text-[#F24C20] transition-colors duration-300" />
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
              <p className="text-neutral-500 text-sm">Available on iOS and Android</p>
            </div>
            <div className="flex gap-4">
              <motion.a
                href="#"
                whileHover={{ scale: 1.05, y: -2 }}
                className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-[#F24C20]/50 rounded-xl flex items-center gap-3 transition-all duration-300"
              >
                <Smartphone className="w-6 h-6 text-[#F24C20]" />
                <div>
                  <div className="text-xs text-neutral-500">Download on</div>
                  <div className="font-semibold text-white">App Store</div>
                </div>
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.05, y: -2 }}
                className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-[#F24C20]/50 rounded-xl flex items-center gap-3 transition-all duration-300"
              >
                <Smartphone className="w-6 h-6 text-[#F24C20]" />
                <div>
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
