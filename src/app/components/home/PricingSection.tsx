import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import { 
  Rocket, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  Briefcase, 
  Building2,
  Users,
  Target,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSiteSettings } from '@/app/context/SiteSettingsContext';
import { useState, useEffect } from 'react';
import api from '@/app/utils/api';

const defaultHighlights = [
  "No bidding system",
  "No commission charges",
  "Direct hiring & contacts",
  "Yearly subscription model",
  "Admin email support",
  "Private chat access",
];

export default function PricingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const navigate = useNavigate();
  const settings = useSiteSettings();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await api.get('/subscription-plans');
        if (res.data.success) {
          setPlans(res.data.data.filter((p: any) => p.status === 'enabled'));
        }
      } catch (err) {
        console.error('Failed to fetch plans for home section:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const highlights = settings.subscription_highlights && settings.subscription_highlights.length > 0
    ? settings.subscription_highlights.filter((h: any) => h.enabled).map((h: any) => h.label)
    : defaultHighlights;

  const title = settings.subscription_title || 'Fuel your growth with Pro Access.';
  const subtitle = settings.subscription_subtitle || 'Subscription Model';
  const description = settings.subscription_description || "GoExperts runs on a clean, commission-free subscription model. No middleman, no bidding wars—just direct access to excellence.";
  const buttonText = settings.subscription_button_text || 'Explore All Plans';

  const getStartingPrice = (groupName: string) => {
    const groupPlans = plans.filter(p => p.group === groupName);
    if (groupPlans.length === 0) return null;
    const minPrice = Math.min(...groupPlans.map(p => p.price));
    return `₹${minPrice.toLocaleString()}`;
  };

  const categories = [
    {
      role: "For Freelancers",
      group: "Freelancer Plans",
      icon: Briefcase,
      desc: "Land high-ticket projects and scale your business without losing 20% to commissions.",
      color: "border-orange-500/20 bg-orange-500/5",
      iconBg: "bg-orange-500/10 text-orange-500"
    },
    {
      role: "For Clients",
      group: "Client Plans",
      icon: Building2,
      desc: "Hire verified experts directly. Access the world's best talent with zero recruitment fees.",
      color: "border-blue-500/20 bg-blue-500/5",
      iconBg: "bg-blue-500/10 text-blue-500"
    },
    {
      role: "For Investors & Creators",
      group: "Investor Plans",
      icon: Target,
      desc: "The ultimate hub for startup founders and angel investors to meet and close deals.",
      color: "border-emerald-500/20 bg-emerald-500/5",
      iconBg: "bg-emerald-500/10 text-emerald-500"
    }
  ];

  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserRole(user.role || (user.roles ? user.roles[0] : null));
      } catch (e) {}
    }
  }, []);

  const filteredCategories = categories.filter(c => {
    if (!userRole) return true;
    if (userRole === 'freelancer' && c.group === 'Freelancer Plans') return true;
    if (userRole === 'client' && c.group === 'Client Plans') return true;
    if ((userRole === 'investor' || userRole === 'startup_creator') && c.group === 'Investor Plans') return true;
    return false;
  });

  const handleNavigate = () => {
    navigate('/subscription');
    window.scrollTo(0, 0);
  };

  return (
    <section ref={ref} className="relative py-24 overflow-hidden bg-black">
      {/* Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-[#F24C20]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Side: Content & Highlights */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F24C20]/10 border border-[#F24C20]/20 text-[#F24C20] text-xs font-black uppercase tracking-widest mb-6">
              <Zap className="w-3.5 h-3.5" />
              {subtitle}
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-8 italic uppercase tracking-tighter leading-tight">
              {title}
            </h2>
            
            <p className="text-lg text-neutral-400 mb-10 leading-relaxed max-w-xl">
              {description}
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-12">
              {highlights.map((item: string, i: number) => (
                <div key={i} className="flex items-center gap-3 text-neutral-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNavigate}
              className="group flex items-center gap-3 px-8 py-4 bg-white text-black font-black uppercase tracking-widest rounded-2xl transition-all"
            >
              {buttonText}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>

          {/* Right Side: Role Previews */}
          <div className="grid gap-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-12 bg-neutral-900/50 rounded-[32px] border border-neutral-800">
                <Loader2 className="w-10 h-10 animate-spin text-[#F24C20] mb-4" />
                <p className="text-neutral-500 text-sm">Syncing latest plans...</p>
              </div>
            ) : (
              filteredCategories.map((item, idx) => {
                const startPrice = getStartingPrice(item.group);
                
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: idx * 0.15 }}
                    className={`flex gap-4 sm:gap-6 p-4 sm:p-6 rounded-[2rem] sm:rounded-[32px] border ${item.color} backdrop-blur-sm group hover:scale-[1.02] transition-all cursor-pointer`}
                    onClick={handleNavigate}
                  >
                    <div className={`w-14 h-14 rounded-2xl ${item.iconBg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                      <item.icon className="w-7 h-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-1 sm:gap-4">
                        <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight italic truncate sm:whitespace-normal">
                          {item.role}
                        </h3>
                        <span className="text-[#F24C20] font-black text-[10px] sm:text-xs uppercase shrink-0 whitespace-nowrap bg-[#F24C20]/10 px-2 py-0.5 rounded-full border border-[#F24C20]/20 sm:bg-transparent sm:px-0 sm:py-0 sm:border-0 w-fit">
                          Starts at {startPrice || "Custom"}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed line-clamp-2 md:line-clamp-none">
                        {item.desc}
                      </p>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
