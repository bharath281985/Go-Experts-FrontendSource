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
import api from '@/app/utils/api';
import { formatDistanceToNow } from 'date-fns';

interface PremiumDashboardLayoutProps {
  children: React.ReactNode;
  userType: 'client' | 'freelancer' | 'investor' | 'startup_creator' | 'admin';
}

interface NavItem {
  label: string;
  icon: any;
  path: string;
  badge?: number;
  submenu?: { label: string; path: string }[];
}

export default function PremiumDashboardLayout({ children, userType }: PremiumDashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['Dashboard']);
  const [walletBalance, setWalletBalance] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const useHoverProfileMenu = userType === 'client' || userType === 'freelancer';

  useEffect(() => {
    fetchHeaderData();
  }, []);

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
          path: '/dashboard/messages'
        })));
      }

      if (userType === 'freelancer') {
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
        // { label: 'Explore All Projects', path: '/dashboard/projects/explore' },
        { label: 'My Projects', path: '/dashboard/projects/my-projects' }
      ]
    },
    /* {
      label: 'Explore Ideas',
      icon: Briefcase,
      path: '/dashboard/gigs',
      submenu: [
        { label: 'Gig Orders', path: '/dashboard/gigs/orders' },
        { label: 'Find Gigs', path: '/dashboard/gigs/find' }
      ]
    }, -- Commented as requested */
    {
      label: 'Startup Ideas',
      icon: Briefcase,
      path: '/dashboard/startup-ideas'
    },
    // { label: 'Find Talent', icon: Users, path: '/dashboard/talent' },
    { label: 'Disputes', icon: AlertCircle, path: '/dashboard/disputes', badge: 2 },
    // { label: 'Invoices', icon: FileText, path: '/dashboard/invoices' },
    { label: 'Saved Items', icon: Bookmark, path: '/dashboard/saved' },
    { label: 'Messages', icon: MessageSquare, path: '/dashboard/messages', badge: unreadMessageCount > 0 ? unreadMessageCount : undefined },
    // { label: 'Account Balance', icon: Wallet, path: '/dashboard/balance' },
    { label: 'Subscription', icon: Settings, path: '/dashboard/subscription' },
    { label: 'Settings', icon: Settings, path: '/dashboard/settings' }
  ];

  // Navigation items for Freelancer
  const freelancerNavItems: NavItem[] = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    {
      label: 'Manage Projects',
      icon: FolderKanban,
      path: '/dashboard/projects/my-projects',
      submenu: [
        // { label: 'Explore All Projects', path: '/dashboard/projects/explore' },
        { label: 'My Projects', path: '/dashboard/projects/my-projects' }
      ]
    },
    /* {
      label: 'Startup Ideas!',
      icon: Briefcase,
      path: '/dashboard/gigs',
      submenu: [
        { label: 'My Gigs', path: '/dashboard/gigs/my-gigs' },
        { label: 'Gig Orders', path: '/dashboard/gigs/orders' },
        { label: 'Find Gigs', path: '/dashboard/gigs/find' }
      ]
    }, -- Commented as requested */
    {
      label: 'Startup Ideas',
      icon: Briefcase,
      path: '/dashboard/startup-ideas'
    },
    // { label: 'Find Clients', icon: Users, path: '/dashboard/clients' },
    { label: 'Disputes', icon: AlertCircle, path: '/dashboard/disputes' },
    // { label: 'Invoices', icon: FileText, path: '/dashboard/invoices' },
    { label: 'Saved Items', icon: Bookmark, path: '/dashboard/saved' },
    { label: 'Messages', icon: MessageSquare, path: '/dashboard/messages', badge: unreadMessageCount > 0 ? unreadMessageCount : undefined },
    // { label: 'Wallet & Withdraw', icon: Wallet, path: '/dashboard/wallet' },
    { label: 'Subscription', icon: Settings, path: '/dashboard/subscription' },
    { label: 'Settings', icon: Settings, path: '/dashboard/settings' }
  ];

  // Navigation items for Investor
  const investorNavItems: NavItem[] = [
    { label: 'Overview', icon: LayoutDashboard, path: '/dashboard-investor' },
    {
      label: 'Startup Ideas',
      icon: Briefcase,
      path: '/dashboard-investor/explore-ideas',
      submenu: [
        { label: 'Explore All', path: '/dashboard-investor/explore-ideas' },
        { label: 'Saved Content', path: '/dashboard-investor/pipeline' }
      ]
    },
    { label: 'Meetings', icon: Calendar, path: '/dashboard-investor/meetings' },
    { label: 'Messages', icon: MessageSquare, path: '/dashboard-investor/messages', badge: 2 },
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
    { label: 'Messages', icon: MessageSquare, path: '/dashboard-startup/messages' },
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
    // Clear all authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userType');
    localStorage.removeItem('userName');

    // Redirect to home page
    navigate('/');

    // Show success message
    window.location.reload(); // Reload to update header state
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

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-neutral-950' : 'bg-neutral-50'}`}>
      {/* Top Bar */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 h-16 z-40 border-b backdrop-blur-xl ${isDarkMode
          ? 'bg-neutral-900/50 border-neutral-800'
          : 'bg-white/50 border-neutral-200'
          }`}
      >
        <div className="h-full px-6 flex items-center justify-between">
          {/* Left: Logo + Search */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`p-2 rounded-lg transition-colors ${isDarkMode
                ? 'hover:bg-neutral-800 text-neutral-400'
                : 'hover:bg-neutral-100 text-neutral-600'
                }`}
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link to="/" className="flex items-center gap-2">
              <div className="text-2xl font-bold bg-gradient-to-r from-[#F24C20] to-orange-600 bg-clip-text text-transparent">
                Go Experts
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-2 w-96">
              <div className={`relative flex-1 rounded-lg overflow-hidden ${isDarkMode ? 'bg-neutral-800/50' : 'bg-neutral-100'
                }`}>
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-neutral-500' : 'text-neutral-400'
                  }`} />
                <input
                  type="text"
                  placeholder="Search projects, ventures, talents..."
                  className={`w-full pl-10 pr-4 py-2 bg-transparent text-sm outline-none ${isDarkMode
                    ? 'text-white placeholder:text-neutral-500'
                    : 'text-neutral-900 placeholder:text-neutral-400'
                    }`}
                />
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* Wallet Balance */}
            {/* Wallet Balance (Hidden as platform is a bridge)
            <div className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg ${isDarkMode ? 'bg-neutral-800/50' : 'bg-neutral-100'
              }`}>
              <Wallet className={`w-4 h-4 ${isDarkMode ? 'text-[#F24C20]' : 'text-[#F24C20]'}`} />
              <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-neutral-900'
                }`}>
                ₹{walletBalance.toLocaleString()}
              </span>
            </div>
            */}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${isDarkMode
                ? 'hover:bg-neutral-800 text-neutral-400'
                : 'hover:bg-neutral-100 text-neutral-600'
                }`}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2 rounded-lg transition-colors ${isDarkMode
                  ? 'hover:bg-neutral-800 text-neutral-400'
                  : 'hover:bg-neutral-100 text-neutral-600'
                  }`}
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-[#F24C20] rounded-full" />
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={`absolute right-0 top-12 w-80 rounded-xl border overflow-hidden shadow-xl ${isDarkMode
                      ? 'bg-neutral-900/95 border-neutral-800'
                      : 'bg-white border-neutral-200'
                      }`}
                  >
                    <div className="p-4 border-b border-neutral-800">
                      <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                        Notifications
                      </h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? notifications.map((notif) => (
                        <Link
                          key={notif.id}
                          to={notif.path}
                          onClick={() => setShowNotifications(false)}
                          className={`block p-4 border-b hover:bg-neutral-800/50 cursor-pointer transition-colors ${isDarkMode ? 'border-neutral-800' : 'border-neutral-100'
                            }`}
                        >
                          <div className={`text-sm ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                            {notif.title}
                          </div>
                          <div className={`text-xs mt-1 ${isDarkMode ? 'text-neutral-500' : 'text-neutral-400'
                            }`}>
                            {formatDistanceToNow(notif.time, { addSuffix: true })}
                          </div>
                        </Link>
                      )) : (
                        <div className={`p-6 text-center text-sm ${isDarkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                          No new notifications
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Menu */}
            <div
              className="relative"
              onMouseEnter={useHoverProfileMenu ? () => setShowProfileMenu(true) : undefined}
              onMouseLeave={useHoverProfileMenu ? () => setShowProfileMenu(false) : undefined}
            >
              <button
                onClick={useHoverProfileMenu ? undefined : () => setShowProfileMenu(!showProfileMenu)}
                onFocus={useHoverProfileMenu ? () => setShowProfileMenu(true) : undefined}
                onBlur={useHoverProfileMenu ? () => setShowProfileMenu(false) : undefined}
                className={`flex items-center gap-2 p-1.5 rounded-lg transition-colors ${isDarkMode
                  ? 'hover:bg-neutral-800'
                  : 'hover:bg-neutral-100'
                  }`}
              >
                <img
                  src={getProfileImage()}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover"
                />
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={`absolute right-0 top-12 w-64 rounded-xl border overflow-hidden shadow-xl ${isDarkMode
                      ? 'bg-neutral-900/95 border-neutral-800'
                      : 'bg-white border-neutral-200'
                      }`}
                  >
                    <div className="p-4 border-b border-neutral-800">
                      <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                        {JSON.parse(localStorage.getItem('user') || '{}').full_name || 'User'}
                      </div>
                      <div className={`text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                        {JSON.parse(localStorage.getItem('user') || '{}').email || ''}
                      </div>
                    </div>
                    <div className="p-2">
                      <Link
                        to="/dashboard/settings"
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isDarkMode
                          ? 'hover:bg-neutral-800 text-neutral-300'
                          : 'hover:bg-neutral-100 text-neutral-700'
                          }`}
                      >
                        <UserIcon className="w-4 h-4" />
                        <span className="text-sm">My Profile</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isDarkMode
                          ? 'hover:bg-red-500/10 text-red-400'
                          : 'hover:bg-red-50 text-red-600'
                          }`}
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm">Logout</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0, width: sidebarCollapsed ? 80 : 280 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`fixed left-0 top-16 bottom-0 z-30 border-r backdrop-blur-xl ${isDarkMode
          ? 'bg-neutral-900/80 border-neutral-800'
          : 'bg-white/80 border-neutral-200'
          }`}
      >
        <div className="h-full overflow-y-auto py-6 px-3">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.path);
              const hasSubmenu = item.submenu && item.submenu.length > 0;
              const isExpanded = expandedMenus.includes(item.label);

              return (
                <div key={item.label}>
                  <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
                    {hasSubmenu ? (
                      <button
                        onClick={() => toggleSubmenu(item.label)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive
                          ? isDarkMode
                            ? 'bg-[#F24C20]/10 text-[#F24C20]'
                            : 'bg-[#F24C20]/10 text-[#F24C20]'
                          : isDarkMode
                            ? 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                            : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                          }`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        {!sidebarCollapsed && (
                          <>
                            <span className="flex-1 text-left text-sm font-medium">
                              {item.label}
                            </span>
                            <ChevronRight
                              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''
                                }`}
                            />
                          </>
                        )}
                        {item.badge && !sidebarCollapsed && (
                          <span className="px-2 py-0.5 bg-[#F24C20] text-white text-xs rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    ) : (
                      <Link
                        to={item.path}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive
                          ? isDarkMode
                            ? 'bg-[#F24C20]/10 text-[#F24C20]'
                            : 'bg-[#F24C20]/10 text-[#F24C20]'
                          : isDarkMode
                            ? 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                            : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                          }`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        {!sidebarCollapsed && (
                          <span className="flex-1 text-sm font-medium">{item.label}</span>
                        )}
                        {item.badge && !sidebarCollapsed && (
                          <span className="px-2 py-0.5 bg-[#F24C20] text-white text-xs rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    )}
                  </motion.div>

                  {/* Submenu */}
                  <AnimatePresence>
                    {hasSubmenu && isExpanded && !sidebarCollapsed && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="ml-8 mt-1 space-y-1 overflow-hidden"
                      >
                        {item.submenu?.map((subItem) => (
                          <Link
                            key={subItem.path}
                            to={subItem.path}
                            className={`block px-3 py-2 rounded-lg text-sm transition-colors ${location.pathname === subItem.path
                              ? isDarkMode
                                ? 'text-[#F24C20] bg-[#F24C20]/5'
                                : 'text-[#F24C20] bg-[#F24C20]/5'
                              : isDarkMode
                                ? 'text-neutral-500 hover:text-white hover:bg-neutral-800'
                                : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
                              }`}
                          >
                            {subItem.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            {/* Logout Button */}
            <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }} className="pt-4">
              <button
                onClick={handleLogout}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isDarkMode
                  ? 'text-red-400 hover:bg-red-500/10'
                  : 'text-red-600 hover:bg-red-50'
                  }`}
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && <span className="text-sm font-medium">Logout</span>}
              </button>
            </motion.div>
          </nav>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main
        className={`pt-16 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-[280px]'
          }`}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
