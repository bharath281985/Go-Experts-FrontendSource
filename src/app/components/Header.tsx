import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, User, Moon, Sun, Menu, X, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import logoFallback from '@/assets/0772c85ef8b5349a958c92c3b3261c8a881ce229.png';
import RegistrationWizard from '@/app/components/onboarding/RegistrationWizard';
import { useTheme } from '@/app/components/ThemeProvider';
import { useSiteSettings } from '@/app/context/SiteSettingsContext';
import api, { getImgUrl } from '@/app/utils/api';


export default function Header() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const { header_logo, site_logo, site_name } = useSiteSettings();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const logoUrl = getImgUrl(header_logo || site_logo) || logoFallback;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Check login status
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      setIsLoggedIn(true);
      try {
        const userData = JSON.parse(user);
        setUserName(userData.full_name || 'User');
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userType');
    localStorage.removeItem('userName');
    setIsLoggedIn(false);
    window.location.href = '/';
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    // Choose search target based on current path or default to talent
    if (location.pathname.startsWith('/projects')) {
      navigate(`/projects?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate(`/talent?search=${encodeURIComponent(searchTerm.trim())}`);
    }
    setSearchTerm('');
    setMobileMenuOpen(false);
  };

  const [navLinks, setNavLinks] = useState<{ path: string; label: string; open_in_new_tab?: boolean }[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Check login status and role
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      setIsLoggedIn(true);
      try {
        const userData = JSON.parse(user);
        setUserName(userData.full_name || 'User');
        setUserRole(userData.role || (userData.roles ? userData.roles[0] : 'freelancer'));
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const res = await api.get('/cms/menus');
        if (res.data.success && res.data.menus) {
          const headerMenus = res.data.menus
            .filter((m: any) => m.location === 'header' && m.is_active && !m.parent)
            .sort((a: any, b: any) => a.order - b.order)
            .map((m: any) => ({
              path: m.url,
              label: m.label,
              open_in_new_tab: m.open_in_new_tab
            }));
          if (headerMenus.length > 0) {
            setNavLinks(headerMenus);
            return;
          }
        }
      } catch (err) {
        console.warn('Failed to fetch header menus', err);
      }

      // Fallback Static Menus based on Role
      let links = [
        { path: '/', label: 'Home' }
      ];

      if (!isLoggedIn) {
        links.push(
          { path: '/projects', label: 'Go Projects' },
          { path: '/talent', label: 'Go Talent' }
        );
      } else if (userRole === 'freelancer') {
        links.push(
          { path: '/projects', label: 'Go Projects' },
          { path: '/dashboard/proposals', label: 'My Proposals' }
        );
      } else if (userRole === 'client') {
        links.push(
          { path: '/talent', label: 'Go Talent' },
          { path: '/dashboard/post-project', label: 'Post a Project' }
        );
      }

      links.push(
        { path: '/explore-ideas', label: 'Explore Ideas' },
        { path: '/plans', label: 'Plans' }
      );

      setNavLinks(links);
    };
    fetchMenus();
  }, [isLoggedIn, userRole]);

  return (
    <>
      <motion.header
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${scrolled
          ? 'w-[95%] max-w-7xl'
          : 'w-[95%] max-w-7xl'
          }`}
      >
        <div
          className={`relative overflow-hidden rounded-2xl border transition-all duration-500 ${isDarkMode
            ? scrolled
              ? 'bg-black/70 backdrop-blur-2xl shadow-2xl shadow-black/50 border-neutral-800/50'
              : 'bg-black/40 backdrop-blur-xl border-white/10'
            : scrolled
              ? 'bg-white/70 backdrop-blur-2xl shadow-2xl shadow-neutral-300/50 border-neutral-200/50'
              : 'bg-white/40 backdrop-blur-xl border-neutral-200/30'
            }`}
        >
          {/* Glassmorphism Glow Effect */}
          <div className={`absolute inset-0 pointer-events-none ${isDarkMode
            ? 'bg-gradient-to-r from-[#F24C20]/5 via-transparent to-[#F24C20]/5'
            : 'bg-gradient-to-r from-[#F24C20]/3 via-transparent to-[#F24C20]/3'
            }`} />

          <div className="relative px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-3 group">
                <div className="relative flex items-center">
                  <img
                    src={logoUrl}
                    alt={site_name || "Go Experts"}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src !== logoFallback) {
                        target.src = logoFallback;
                      }
                    }}
                    className={`h-11 md:h-12 w-auto object-contain transition-all duration-500 group-hover:scale-105 ${isDarkMode ? 'brightness-110' : ''}`}
                  />
                  <div className="absolute -inset-2 bg-[#F24C20]/20 blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-full" />
                </div>
              </Link>

              {/* Center Navigation - Desktop */}
              <nav className="hidden lg:flex items-center gap-1">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      target={link.open_in_new_tab ? '_blank' : '_self'}
                      rel={link.open_in_new_tab ? 'noopener noreferrer' : undefined}
                      className="relative px-4 py-2 text-neutral-300 hover:text-white transition-colors duration-300 font-medium group"
                    >
                      <span className="relative z-10">{link.label}</span>

                      {/* Hover Background */}
                      <motion.div
                        className="absolute inset-0 rounded-lg bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"
                      />

                      {/* Active Indicator */}
                      {isActive && (
                        <motion.div
                          layoutId="activeNav"
                          className="absolute inset-0 rounded-lg bg-[#F24C20]/10 border border-[#F24C20]/30"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}

                      {/* Hover Underline Glow */}
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 group-hover:w-3/4 h-0.5 bg-gradient-to-r from-transparent via-[#F24C20] to-transparent transition-all duration-300" />
                    </Link>
                  );
                })}
              </nav>

              {/* Right Actions - Desktop */}
              <div className="hidden lg:flex items-center gap-3">
                {/* Search Bar */}
                <form onSubmit={handleSearch} className="relative group">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search..."
                    className="pl-10 pr-4 py-2 w-48 focus:w-64 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[#F24C20]/50 transition-all duration-300 text-white placeholder:text-neutral-500 backdrop-blur-sm"
                  />
                  <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Search className="w-4 h-4 text-neutral-400 group-focus-within:text-[#F24C20] transition-colors" />
                  </button>
                </form>

                {/* Dark/Light Mode Toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#F24C20]/30 transition-all group relative overflow-hidden"
                >
                  <AnimatePresence mode="wait">
                    {isDarkMode ? (
                      <motion.div
                        key="dark"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Moon className="w-4 h-4 text-neutral-300 group-hover:text-[#F24C20] transition-colors" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="light"
                        initial={{ rotate: 90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Sun className="w-4 h-4 text-neutral-300 group-hover:text-[#F24C20] transition-colors" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>

                {/* Conditional Auth Buttons */}
                {isLoggedIn ? (
                  <div className="flex items-center gap-2">
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#044071] hover:bg-[#055a99] text-white border border-[#044071] hover:border-[#055a99] transition-all duration-300 font-medium group"
                    >
                      <User className="w-4 h-4" />
                      <span>{userName}</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 transition-all group"
                      title="Logout"
                    >
                      <LogOut className="w-4 h-4 text-neutral-300 group-hover:text-red-500 transition-colors" />
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Sign In */}
                    <Link
                      to="/signin"
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-neutral-300 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-300 font-medium group"
                    >
                      <User className="w-4 h-4 group-hover:text-[#F24C20] transition-colors" />
                      <span>Sign In</span>
                    </Link>

                    {/* Get Started CTA */}
                    <motion.button
                      onClick={() => setShowRegistration(true)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative px-6 py-2.5 bg-[#044071] hover:bg-[#055a99] text-white rounded-xl transition-all duration-300 font-semibold shadow-lg shadow-[#044071]/30 overflow-hidden group"
                    >
                      <span className="relative z-10">Get Started</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                    </motion.button>
                  </>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 text-white" />
                ) : (
                  <Menu className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden absolute top-full left-0 right-0 mt-2"
            >
              <div className="bg-black/90 backdrop-blur-2xl border border-neutral-800/50 rounded-2xl p-4 shadow-2xl">
                {/* Mobile Navigation */}
                <nav className="space-y-1 mb-4">
                  {navLinks.map((link) => {
                    const isActive = location.pathname === link.path;
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block px-4 py-3 rounded-xl font-medium transition-all ${isActive
                          ? 'bg-[#F24C20]/10 text-[#F24C20] border border-[#F24C20]/30'
                          : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                          }`}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </nav>

                {/* Mobile Search */}
                <form onSubmit={handleSearch} className="relative mb-4">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[#F24C20]/50 transition-all text-white placeholder:text-neutral-500"
                  />
                  <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Search className="w-4 h-4 text-neutral-400" />
                  </button>
                </form>

                {/* Mobile Actions */}
                <div className="space-y-2">
                  {isLoggedIn ? (
                    <div className="space-y-2">
                      <Link
                        to="/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-[#044071] hover:bg-[#055a99] text-white border border-[#044071] transition-all font-medium"
                      >
                        <User className="w-4 h-4" />
                        {userName}
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 border border-white/10 transition-all font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  ) : (
                    <>
                      <Link
                        to="/signin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-neutral-300 hover:text-white hover:bg-white/5 border border-white/10 transition-all font-medium"
                      >
                        <User className="w-4 h-4" />
                        Sign In
                      </Link>
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setShowRegistration(true);
                        }}
                        className="w-full px-6 py-3 bg-[#044071] hover:bg-[#055a99] text-white rounded-xl transition-all font-semibold shadow-lg shadow-[#044071]/30"
                      >
                        Get Started
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Registration Wizard Modal */}
      {showRegistration && (
        <RegistrationWizard onClose={() => setShowRegistration(false)} />
      )}
    </>
  );
}