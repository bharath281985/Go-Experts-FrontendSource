import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  FolderKanban,
  Briefcase,
  Users,
  AlertCircle,
  FileText,
  Bookmark,
  MessageSquare,
  Wallet,
  LogOut,
  Search,
  Bell,
  Moon,
  Sun,
  Menu,
  X,
  ChevronRight,
  Settings,
  User as UserIcon,
  Mail,
  UserCircle2,
  Calendar
} from 'lucide-react';
import { useTheme } from '@/app/components/ThemeProvider';
import { useSiteSettings } from '@/app/context/SiteSettingsContext';
import api from '@/app/utils/api';
import { getImgUrl } from '@/app/utils/api';
import { formatDistanceToNow } from 'date-fns';
import logoFallback from '@/assets/0772c85ef8b5349a958c92c3b3261c8a881ce229.png';

interface NavItem {
  label: string;
  icon: any;
  path: string;
  badge?: number;
  submenu?: { label: string; path: string }[];
}

interface PremiumDashboardLayoutProps {
  children: React.ReactNode;
  userType: 'client' | 'freelancer' | 'investor' | 'startup_creator' | 'admin';
}

export default function PremiumDashboardLayout({ children, userType }: PremiumDashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const { header_logo, site_logo, site_name } = useSiteSettings();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['Dashboard']);
  const [walletBalance, setWalletBalance] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [disputeCount, setDisputeCount] = useState(0);
  const [subscriptionSummary, setSubscriptionSummary] = useState<{ planName: string; daysLeft: number | null } | null>(null);
  
  const getDashboardBase = () => {
    if (userType === 'investor') return '/dashboard-investor';
    if (userType === 'startup_creator') return '/dashboard-startup';
    return '/dashboard';
  };
  
  const dashboardBase = getDashboardBase();
  const useHoverProfileMenu = userType === 'client' || userType === 'freelancer';
  const logoUrl = getImgUrl(header_logo || site_logo) || logoFallback;

  useEffect(() => {
    fetchHeaderData();
  }, [userType]);

  const fetchHeaderData = async () => {
    try {
      const authRes = await api.get('/auth/me');
      if (authRes.data.success) {
        setWalletBalance(authRes.data.user.wallet_balance || 0);
      }

      const newNotifs: any[] = [];

      const msgRes = await api.get('/messages/conversations');
      if (msgRes.data.success) {
        const totalUnread = msgRes.data.data.reduce((sum: number, c: any) => sum + (c.unreadCount || 0), 0);
        setUnreadMessageCount(totalUnread);

        const unreadMsgs = msgRes.data.data.filter((c: any) => c.unreadCount > 0);
        newNotifs.push(...unreadMsgs.map((c: any) => ({
          id: `msg-${c.user._id}`,
          title: `New message from ${c.user.full_name}`,
          time: new Date(c.lastMessage.createdAt),
          path: `${dashboardBase}/messages`
        })));
      }

      if (userType === 'freelancer') {
        const subRes = await api.get('/subscription/my-status', { skipToast: true } as any).catch(() => null);
        if (subRes?.data?.success && subRes.data.subscription) {
          const subscription = subRes.data.subscription;
          const endDate = subscription.end_date ? new Date(subscription.end_date) : null;
          const daysLeft = endDate
            ? Math.max(Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)), 0)
            : null;

          setSubscriptionSummary({
            planName: subscription.plan_name || subscription.plan_id?.name || 'Active Plan',
            daysLeft
          });
        } else {
          setSubscriptionSummary(null);
        }

        const invRes = await api.get('/invitations');
        if (invRes.data.success) {
          const pendingInvs = invRes.data.data.filter((i: any) => i.status === 'pending');
          newNotifs.push(...pendingInvs.map((i: any) => ({
            id: `inv-${i._id}`,
            title: `New project invitation`,
            time: new Date(i.createdAt),
            path: '/dashboard/clients'
          })));
        }
      }

      // Fetch Disputes for Badge
      const dispRes = await api.get('/users/my-disputes');
      if (dispRes.data.success) {
        const activeDisputesCount = dispRes.data.data.filter((d: any) => d.status === 'open' || d.status === 'under_review').length;
        setDisputeCount(activeDisputesCount);
      }

      newNotifs.sort((a, b) => b.time.getTime() - a.time.getTime());
      setNotifications(newNotifs);
    } catch (e) {
      console.log('Error fetching header data', e);
    }
  };

  // Navigation items for Client
  const clientNavItems: NavItem[] = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    {
      label: 'Manage Projects',
      icon: FolderKanban,
      path: '/dashboard/projects/my-projects',
      submenu: [
        { label: 'Create Project', path: '/dashboard/projects/create' },
        { label: 'My Projects', path: '/dashboard/projects/my-projects' }
      ]
    },
    {
      label: 'My Startup Pitches',
      icon: Briefcase,
      path: '/dashboard/startup-ideas',
      submenu: [
        { label: 'Submit New Idea', path: '/dashboard/startup-ideas' },
        { label: 'My Submissions', path: '/dashboard/startup-ideas' }
      ]
    },
    { label: 'Disputes', icon: AlertCircle, path: '/dashboard/disputes', badge: disputeCount > 0 ? disputeCount : undefined },
    { label: 'Saved Items', icon: Bookmark, path: '/dashboard/saved' },
    { label: 'Messages', icon: MessageSquare, path: '/dashboard/messages', badge: unreadMessageCount > 0 ? unreadMessageCount : undefined },
    { label: 'Earnings & Referrals', icon: Wallet, path: '/dashboard/wallet' },
    { label: 'Subscription', icon: UserCircle2, path: '/dashboard/subscription' },
    { label: 'Settings', icon: Settings, path: '/dashboard/settings' }
  ];

  // Navigation items for Freelancer
  const freelancerNavItems: NavItem[] = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    {
      label: 'Find Experts',
      icon: Users,
      path: '/dashboard/talent'
    },
    {
      label: 'Manage Projects',
      icon: FolderKanban,
      path: '/dashboard/projects/my-projects',
      submenu: [
        { label: 'My Projects', path: '/dashboard/projects/my-projects' }
      ]
    },
    {
      label: 'My Startup Pitches',
      icon: Briefcase,
      path: '/dashboard/startup-ideas',
      submenu: [
        { label: 'Submit New Idea', path: '/dashboard/startup-ideas' },
        { label: 'My Submissions', path: '/dashboard/startup-ideas' }
      ]
    },
    { label: 'Disputes', icon: AlertCircle, path: '/dashboard/disputes', badge: disputeCount > 0 ? disputeCount : undefined },
    { label: 'Saved Items', icon: Bookmark, path: '/dashboard/saved' },
    { label: 'Messages', icon: MessageSquare, path: '/dashboard/messages', badge: unreadMessageCount > 0 ? unreadMessageCount : undefined },
    { label: 'Earnings & Referrals', icon: Wallet, path: '/dashboard/wallet' },
    { label: 'Subscription', icon: UserCircle2, path: '/dashboard/subscription' },
    { label: 'Settings', icon: Settings, path: '/dashboard/settings' }
  ];

  // Navigation items for Investor
  const investorNavItems: NavItem[] = [
    { label: 'Overview', icon: LayoutDashboard, path: '/dashboard-investor' },
    {
      label: 'Startup Marketplace',
      icon: Briefcase,
      path: '/dashboard-investor/explore-ideas',
      submenu: [
        { label: 'Explore All Ideas', path: '/dashboard-investor/explore-ideas' },
        { label: 'Saved & Pipeline', path: '/dashboard-investor/pipeline' }
      ]
    },
    { 
      label: 'Hire Freelancers', 
      icon: Users, 
      path: '/dashboard-investor/talent' 
    },
    { label: 'Meetings', icon: Calendar, path: '/dashboard-investor/meetings' },
    { label: 'Messages', icon: MessageSquare, path: '/dashboard-investor/messages', badge: unreadMessageCount > 0 ? unreadMessageCount : undefined },
    { label: 'Earnings & Referrals', icon: Wallet, path: '/dashboard-investor/wallet' },
    { label: 'Subscription', icon: UserCircle2, path: '/dashboard-investor/subscription' },
    { label: 'Settings', icon: Settings, path: '/dashboard-investor/settings' }
  ];

  // Navigation items for Startup Creator
  const startupCreatorNavItems: NavItem[] = [
    { label: 'Overview', icon: LayoutDashboard, path: '/dashboard-startup' },
    {
      label: 'My Portals',
      icon: Briefcase,
      path: '/dashboard-startup/ideas'
    },
    { label: 'Analytics', icon: Search, path: '/dashboard-startup/analytics' },
    { label: 'NDA Requests', icon: FileText, path: '/dashboard-startup/nda' },
    { label: 'Messages', icon: MessageSquare, path: '/dashboard-startup/messages', badge: unreadMessageCount > 0 ? unreadMessageCount : undefined },
    { label: 'Subscription', icon: UserCircle2, path: '/dashboard-startup/subscription' },
    { label: 'Settings', icon: Settings, path: '/dashboard-startup/settings' }
  ];

  const adminNavItems: NavItem[] = [
    { label: 'Admin Panel', icon: LayoutDashboard, path: '/admin' }
  ];

  const navItems =
    userType === 'client' ? clientNavItems :
      userType === 'freelancer' ? freelancerNavItems :
        userType === 'investor' ? investorNavItems :
          userType === 'admin' ? adminNavItems :
            startupCreatorNavItems;

  const toggleSubmenu = (label: string) => {
    setExpandedMenus(prev =>
      prev.includes(label) ? prev.filter(item => item !== label) : [...prev, label]
    );
  };

  const isActiveRoute = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userType');
    localStorage.removeItem('userName');
    navigate('/');
    window.location.reload();
  };

  const getProfileImage = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.profile_image) return "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80";
      let imgPath = user.profile_image;
      if (imgPath.startsWith('http')) return imgPath;
      if (!imgPath.startsWith('/')) imgPath = '/' + imgPath;
      imgPath = imgPath.replace(/\\/g, '/');
      return `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${imgPath}`;
    } catch {
      return "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80";
    }
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  // Handle resize for reactivity
  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      if (desktop) setIsMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-neutral-950 text-white' : 'bg-neutral-50 text-neutral-900'}`}>
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 h-16 z-40 border-b backdrop-blur-xl ${isDarkMode
          ? 'bg-neutral-900/50 border-neutral-800'
          : 'bg-white/50 border-neutral-200'
          }`}
      >
        <div className="h-full px-4 lg:px-6 flex items-center justify-between">
          <div className="flex items-center gap-4 lg:gap-6">
            <button
              onClick={() => {
                if (!isDesktop) {
                  setIsMobileMenuOpen(true);
                } else {
                  setSidebarCollapsed(!sidebarCollapsed);
                }
              }}
              className={`p-2 rounded-lg transition-colors ${isDarkMode
                ? 'hover:bg-neutral-800 text-neutral-400'
                : 'hover:bg-neutral-100 text-neutral-600'
                }`}
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link to="/" className="flex items-center gap-2">
              <img
                src={logoUrl}
                alt={site_name || 'Go Experts'}
                className="h-7 lg:h-8 w-auto object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src !== logoFallback) target.src = logoFallback;
                }}
              />
            </Link>
            <div className="hidden lg:flex items-center gap-2 w-96">
              <div className={`relative flex-1 rounded-lg overflow-hidden ${isDarkMode ? 'bg-neutral-800/50' : 'bg-neutral-100'}`}>
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-neutral-500' : 'text-neutral-400'}`} />
                <input
                  type="text"
                  placeholder="Search projects, ventures, talents..."
                  className={`w-full pl-10 pr-4 py-2 bg-transparent text-sm outline-none ${isDarkMode ? 'text-white placeholder:text-neutral-500' : 'text-neutral-900 placeholder:text-neutral-400'}`}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 lg:gap-3">

            <button onClick={toggleTheme} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-neutral-100 text-neutral-600'}`}>
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-neutral-100 text-neutral-600'}`}
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-[#F24C20] rounded-full" />}
              </button>
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={`absolute right-0 top-12 w-80 rounded-xl border overflow-hidden shadow-xl ${isDarkMode ? 'bg-neutral-900/95 border-neutral-800' : 'bg-white border-neutral-200'}`}
                  >
                    <div className="p-4 border-b border-neutral-800"><h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>Notifications</h3></div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? notifications.map((notif) => (
                        <Link key={notif.id} to={notif.path} onClick={() => setShowNotifications(false)} className={`block p-4 border-b hover:bg-neutral-800/50 cursor-pointer transition-colors ${isDarkMode ? 'border-neutral-800' : 'border-neutral-100'}`}>
                          <div className={`text-sm ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>{notif.title}</div>
                          <div className={`text-xs mt-1 ${isDarkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>{formatDistanceToNow(notif.time, { addSuffix: true })}</div>
                        </Link>
                      )) : <div className={`p-6 text-center text-sm ${isDarkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>No new notifications</div>}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="relative" onMouseEnter={useHoverProfileMenu ? () => setShowProfileMenu(true) : undefined} onMouseLeave={useHoverProfileMenu ? () => setShowProfileMenu(false) : undefined}>
              <button onClick={useHoverProfileMenu ? undefined : () => setShowProfileMenu(!showProfileMenu)} className={`flex items-center gap-2 p-1.5 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-neutral-800' : 'hover:bg-neutral-100'}`}>
                <img src={getProfileImage()} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
              </button>
              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={`absolute right-0 top-12 w-64 rounded-xl border overflow-hidden shadow-xl ${isDarkMode ? 'bg-neutral-900/95 border-neutral-800' : 'bg-white border-neutral-200'}`}
                  >
                    <div className="p-4 border-b border-neutral-800">
                      <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                        {(() => {
                          const user = JSON.parse(localStorage.getItem('user') || '{}');
                          const name = user.full_name || 'User';
                          if (name.includes('@')) {
                            const part = name.split('@')[0];
                            return part.charAt(0).toUpperCase() + part.slice(1);
                          }
                          return name;
                        })()}
                      </div>
                      <div className={`text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>{JSON.parse(localStorage.getItem('user') || '{}').email || ''}</div>
                    </div>
                    <div className="p-2">
                      <Link to={`${dashboardBase}/settings`} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-neutral-800 text-neutral-300' : 'hover:bg-neutral-100 text-neutral-700'}`}>
                        <UserIcon className="w-4 h-4" /> <span className="text-sm">My Profile</span>
                      </Link>
                      <button onClick={handleLogout} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-red-500/10 text-red-400' : 'hover:bg-red-50 text-red-600'}`}>
                        <LogOut className="w-4 h-4" /> <span className="text-sm">Logout</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Sidebar - Desktop and Mobile */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ 
          x: (isDesktop || isMobileMenuOpen) ? 0 : -280,
          width: (sidebarCollapsed && isDesktop) ? 80 : 280 
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 40 }}
        className={`fixed left-0 top-0 lg:top-16 bottom-0 z-[60] border-r backdrop-blur-xl ${isDarkMode ? 'bg-neutral-900/95 border-neutral-800' : 'bg-white/95 border-neutral-200 shadow-2xl lg:shadow-none'}`}
      >
        <div className="h-full overflow-y-auto py-6 px-3">
          {/* Mobile Header Logo */}
          <div className="flex lg:hidden items-center justify-between mb-8 px-2">
            <img src={logoUrl} alt="Logo" className="h-7 w-auto object-contain" />
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsMobileMenuOpen(false);
              }} 
              className="p-2 rounded-lg bg-neutral-800/50 text-neutral-400 active:scale-95 transition-all"
            >
               <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.path);
              const hasSubmenu = item.submenu && item.submenu.length > 0;
              const isExpanded = expandedMenus.includes(item.label);
              const collapsed = sidebarCollapsed && isDesktop;

              return (
                <div key={item.label}>
                  <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
                    {hasSubmenu ? (
                      <button
                        onClick={() => toggleSubmenu(item.label)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive ? 'bg-[#F24C20]/10 text-[#F24C20]' : isDarkMode ? 'text-neutral-400 hover:bg-neutral-800 hover:text-white' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'}`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        {!collapsed && (
                          <><span className="flex-1 text-left text-sm font-medium">{item.label}</span><ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} /></>
                        )}
                        {item.badge && !collapsed && <span className="px-2 py-0.5 bg-[#F24C20] text-white text-xs rounded-full">{item.badge}</span>}
                      </button>
                    ) : (
                      <Link
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive ? 'bg-[#F24C20]/10 text-[#F24C20]' : isDarkMode ? 'text-neutral-400 hover:bg-neutral-800 hover:text-white' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'}`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        {!collapsed && <span className="flex-1 text-sm font-medium">{item.label}</span>}
                        {item.badge && !collapsed && <span className="px-2 py-0.5 bg-[#F24C20] text-white text-xs rounded-full">{item.badge}</span>}
                      </Link>
                    )}
                  </motion.div>
                  <AnimatePresence>
                    {hasSubmenu && isExpanded && !collapsed && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="ml-8 mt-1 space-y-1 overflow-hidden">
                        {item.submenu?.map((subItem) => (
                          <Link key={subItem.path} to={subItem.path} onClick={() => setIsMobileMenuOpen(false)} className={`block px-3 py-2 rounded-lg text-sm transition-colors ${location.pathname === subItem.path ? 'text-[#F24C20] bg-[#F24C20]/5' : isDarkMode ? 'text-neutral-500 hover:text-white hover:bg-neutral-800' : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'}`}>
                            {subItem.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
            <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }} className="pt-4">
              <button onClick={handleLogout} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isDarkMode ? 'text-red-400 hover:bg-red-500/10' : 'text-red-600 hover:bg-red-50'}`}>
                <LogOut className="w-5 h-5 flex-shrink-0" /> {!(sidebarCollapsed && isDesktop) && <span className="text-sm font-medium">Logout</span>}
              </button>
            </motion.div>
          </nav>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className={`pt-16 transition-all duration-300 min-h-screen ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-[280px]'} ml-0`}>
        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
}
