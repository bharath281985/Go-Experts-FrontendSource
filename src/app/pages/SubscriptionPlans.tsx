import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Check, 
  MessageCircle, 
  Mail, 
  Briefcase, 
  Rocket, 
  Users, 
  Building2, 
  Star, 
  ShieldCheck, 
  BadgeCheck, 
  Loader2,
  ArrowRight,
  ChevronRight,
  TrendingUp
} from "lucide-react";
import api from '@/app/utils/api';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { toast } from 'sonner';

function SectionTitle({ eyebrow, title, description }: any) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <div className="inline-flex items-center rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-orange-300">
        {eyebrow}
      </div>
      <h2 className="mt-4 text-3xl font-bold sm:text-4xl text-white tracking-tight">{title}</h2>
      <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">{description}</p>
    </div>
  );
}

function PlanCard({ plan, buying, onChoose }: any) {
  return (
    <div
      className={`relative rounded-[40px] border p-8 shadow-2xl transition-all duration-500 flex flex-col h-full ${
        plan.featured
          ? "border-orange-500/50 bg-gradient-to-b from-orange-500/20 via-[#0b0d14] to-[#0b0d14] scale-[1.02] shadow-orange-500/10"
          : "border-white/10 bg-[#0b0d14] hover:border-white/20"
      }`}
    >
      {plan.featured && (
         <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg">
            Featured
         </div>
      )}

      {plan.badge ? (
        <div className="absolute right-6 top-6 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#F24C20]">
          {plan.badge}
        </div>
      ) : null}

      <div className="mb-8">
        <h3 className="text-xl font-bold text-white">{plan.name}</h3>
        <p className="text-slate-400 text-sm mt-2 line-clamp-2 min-h-[40px]">{plan.description || 'Professional features for your growth.'}</p>
      </div>

      <div className="flex items-end gap-1 mb-8">
        <span className="text-4xl font-black text-white">₹{plan.price.toLocaleString()}</span>
        <span className="pb-1 text-sm font-medium text-slate-500 capitalize">/{plan.billing_cycle || 'year'}</span>
      </div>

      <div className="flex-1 space-y-4 mb-8">
        {plan.features?.map((feature: string, idx: number) => (
          <div key={idx} className="flex items-start gap-3 group">
            <div className="mt-1 p-0.5 rounded-full bg-orange-500/10 text-orange-500 group-hover:scale-110 transition-transform">
                <Check className="h-3 w-3 shrink-0" />
            </div>
            <span className="text-sm leading-6 text-slate-300 group-hover:text-white transition-colors">{feature}</span>
          </div>
        ))}
        <div className="flex items-start gap-3 text-sm text-slate-400">
            <div className="mt-1 p-0.5 rounded-full bg-blue-500/10 text-blue-400">
                <BadgeCheck className="h-3 w-3 shrink-0" />
            </div>
            <span>{plan.project_visit_limit} Premium Visits</span>
        </div>
      </div>

      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={buying === plan._id}
        onClick={() => onChoose(plan._id)}
        className={`w-full rounded-[20px] px-5 py-4 text-sm font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
            plan.featured 
            ? "bg-[#F24C20] text-white hover:bg-[#d4431b] shadow-xl shadow-[#F24C20]/20" 
            : "border border-white/15 bg-white/5 text-white hover:bg-white/10"
        }`}
      >
        {buying === plan._id ? (
            <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
            <>
                {plan.cta || 'Choose Plan'}
                <ArrowRight className="w-4 h-4 ml-1" />
            </>
        )}
      </motion.button>
    </div>
  );
}

export default function SubscriptionPlansPricingPage() {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [buying, setBuying] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [plansRes, settingsRes] = await Promise.all([
        api.get('/subscription-plans'), 
        api.get('/cms/settings')
      ]);

      if (plansRes.data.success) {
        setPlans(plansRes.data.data.filter((p: any) => p.status === 'enabled'));
      }
      if (settingsRes.data.success) {
        setSettings(settingsRes.data.settings);
      }
    } catch (err) {
      console.error('Error fetching pricing data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChoosePlan = async (planId: string) => {
    try {
      setBuying(planId);
      const res = await api.post('/payment/initiate', { planId });
      if (res.data.success && res.data.checkout_url) {
        window.location.href = res.data.checkout_url;
      } else {
        toast.error('Failed to initiate payment. Please try again.');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Payment initiation failed');
    } finally {
      setBuying(null);
    }
  };

  const groups = [
    { title: "Freelancer Plans", icon: Briefcase, color: "#f24c20" },
    { title: "Client Plans", icon: Building2, color: "#3b82f6" },
    { title: "Start-Up Idea Creator Plans", icon: Rocket, color: "#f59e0b" },
    { title: "Investor Plans", icon: Users, color: "#10b981" },
    { title: "Combo Plan", icon: Star, color: "#7c3aed" }
  ];

  const highlights = settings?.subscription_highlights?.filter((h: any) => h.enabled) || [
    { label: "No bidding system" },
    { label: "No commission charges" },
    { label: "Direct hiring and direct investor contact" },
    { label: "Yearly subscription model" },
    { label: "Admin email support included" },
    { label: "Private chat support" }
  ];

  if (loading) return (
     <div className="min-h-screen bg-[#05060a] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#F24C20] animate-spin" />
     </div>
  );

  return (
    <div className="min-h-screen bg-[#05060a] text-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(242,76,32,0.15),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.1),transparent_35%)] pointer-events-none" />
        
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-16 lg:grid-cols-[1.2fr,0.8fr] lg:items-center">
            <div>
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center rounded-full border border-[#F24C20]/30 bg-[#F24C20]/10 px-5 py-2 text-xs font-black uppercase tracking-widest text-orange-400 mb-8"
              >
                Subscription-Based Platform
              </motion.div>
              <h1 className="text-4xl font-black leading-tight sm:text-6xl lg:text-7xl uppercase tracking-tighter mb-8 italic">
                The New Standard of <span className="text-[#F24C20]">Direct Networking.</span>
              </h1>
              <p className="text-lg leading-8 text-slate-400 max-w-2xl mb-12">
                GoExperts runs on a clean yearly subscription model. No bidding, no commissions, just direct access to the world's best talent, founders, and investors.
              </p>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {highlights.map((item: any, i: number) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 rounded-[20px] border border-white/5 bg-white/5 p-4 backdrop-blur-xl group hover:border-white/10 transition-all"
                  >
                    <div className="flex-shrink-0 p-1 rounded-full bg-emerald-500/10 text-emerald-400">
                      <BadgeCheck className="h-5 w-5" />
                    </div>
                    <p className="text-xs font-bold leading-tight text-slate-300 group-hover:text-white transition-colors">{item.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-[48px] border border-white/10 bg-[#0b0d14] p-2 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            >
              <div className="rounded-[42px] border border-white/5 bg-gradient-to-br from-white/10 to-transparent p-8">
                <div className="flex items-center justify-between gap-4 mb-10">
                  <div>
                    <div className="text-xs font-black uppercase tracking-[0.2em] text-[#F24C20] mb-1">Base Annual Entry</div>
                    <div className="text-4xl font-black text-white italic">₹3,650</div>
                  </div>
                  <div className="rounded-2xl bg-emerald-500/10 px-4 py-2 text-xs font-black text-emerald-400 border border-emerald-500/20 uppercase tracking-widest">
                    ₹10 / day
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { icon: Mail, title: "Email Support", desc: "Admin assistance included." },
                    { icon: MessageCircle, title: "Built-in Chat", desc: "Direct communication access." },
                    { icon: ShieldCheck, title: "No Fees", desc: "Keep 100% of your value." },
                    { icon: TrendingUp, title: "Scale Up", desc: "Upgrade as your needs grow." }
                  ].map((feat, i) => (
                    <div key={i} className="rounded-3xl border border-white/5 bg-black/40 p-5 group hover:bg-black/60 transition-all">
                      <feat.icon className="h-6 w-6 text-orange-400 mb-3 group-hover:scale-110 transition-transform" />
                      <div className="font-bold text-white text-sm mb-1">{feat.title}</div>
                      <p className="text-[11px] text-slate-500 leading-normal">{feat.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Plan Categories */}
      {groups.map((group, gIdx) => {
        const groupPlans = plans.filter(p => p.group === group.title);
        if (groupPlans.length === 0) return null;

        const Icon = group.icon;
        return (
          <section key={group.title} className="relative z-10 border-b border-white/5 py-24">
            <div className="mx-auto max-w-7xl px-6">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between mb-16">
                <div className="max-w-3xl">
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#F24C20]"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {group.title}
                  </motion.div>
                  <h2 className="mt-6 text-3xl font-black italic uppercase tracking-tighter sm:text-5xl text-white">
                    {group.title}
                  </h2>
                </div>
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-2 text-xs font-bold text-emerald-400 uppercase tracking-widest">
                  Annual Plans Available
                </div>
              </div>

              <div className="grid gap-8 lg:grid-cols-3">
                {groupPlans.sort((a, b) => a.price - b.price).map((plan, pIdx) => (
                  <PlanCard 
                    key={plan._id} 
                    plan={plan} 
                    buying={buying} 
                    onChoose={handleChoosePlan} 
                  />
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* Feature Comparison Link / CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/5 to-blue-500/5 pointer-events-none" />
        <div className="relative mx-auto max-w-5xl px-6 text-center">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter sm:text-5xl mb-8">Need a Custom Enterprise Solution?</h2>
            <p className="text-slate-400 text-lg mb-12 max-w-2xl mx-auto">Our team can design a bespoke plan for large teams, investment firms, or specialized hiring needs.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white text-black px-10 py-5 rounded-[24px] font-black uppercase tracking-widest text-sm"
                >
                    Contact Sales
                </motion.button>
                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-transparent border border-white/20 hover:bg-white/5 px-10 py-5 rounded-[24px] font-black uppercase tracking-widest text-sm"
                >
                    Book a Demo
                </motion.button>
            </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
