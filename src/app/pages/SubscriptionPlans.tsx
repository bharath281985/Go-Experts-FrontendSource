import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Check, Zap, Crown, Rocket, Loader2, ArrowRight } from 'lucide-react';
import api from '@/app/utils/api';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { toast } from 'sonner';

export default function SubscriptionPlans() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<string | null>(null);
  const [activeRole, setActiveRole] = useState<'freelancer' | 'client'>('freelancer');

  useEffect(() => {
    fetchPlans();
  }, [activeRole]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/subscription-plans?role=${activeRole}`);
      if (res.data.success) {
        setPlans(res.data.data.filter((p: any) => p.price > 0 && p.status === 'enabled'));
      }
    } catch (err) {
      console.error('Error fetching plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChoosePlan = async (planId: string) => {
    try {
      setBuying(planId);
      const res = await api.post('/payment/initiate', { planId });
      
      console.log('Payment Initiation Response:', res.data);

      if (res.data.success) {
        if (res.data.checkout_url) {
          // Open the secure Easebuzz Hosted Checkout
          window.location.href = res.data.checkout_url;
        } else if (res.data.data && res.data.data.hash) {
          // Fallback for older backend API that returns raw payment data for form submission
          const paymentData = res.data.data;
          const actionUrl = paymentData.env === 'prod' 
            ? 'https://pay.easebuzz.in/payment/initiateLink' 
            : 'https://testpay.easebuzz.in/payment/initiateLink';

          const form = document.createElement('form');
          form.setAttribute('method', 'POST');
          form.setAttribute('action', actionUrl);

          // Add all fields returned by backend
          Object.keys(paymentData).forEach(key => {
            if (key !== 'env') { // env is not a valid easebuzz param
              const hiddenField = document.createElement('input');
              hiddenField.setAttribute('type', 'hidden');
              hiddenField.setAttribute('name', key);
              
              // Handle undefined/api... bug temporarily by replacing it on the fly if needed
              let value = paymentData[key];
              if ((key === 'surl' || key === 'furl') && typeof value === 'string' && value.startsWith('undefined')) {
                  value = value.replace('undefined', import.meta.env.VITE_API_URL || 'http://localhost:5000');
              }
              
              hiddenField.setAttribute('value', value);
              form.appendChild(hiddenField);
            }
          });

          // Easebuzz requires specific fields, add empty ones for UDFs if missing
          for (let i = 1; i <= 10; i++) {
            if (!paymentData[`udf${i}`]) {
              const u = document.createElement('input');
              u.type = 'hidden'; u.name = `udf${i}`; u.value = '';
              form.appendChild(u);
            }
          }

          document.body.appendChild(form);
          form.submit();
        } else {
          toast.error('Invalid payment response from server');
        }
      } else {
        toast.error('Failed to get payment link');
      }
    } catch (err: any) {
      console.error('Payment Error:', err);
      toast.error(err.response?.data?.message || 'Failed to initiate payment');
    } finally {
      setBuying(null);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col">
      <Header />
      
      <main className="flex-1 pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#F24C20]/10 text-[#F24C20] rounded-full text-sm font-bold mb-6 border border-[#F24C20]/20"
          >
            <Crown className="w-4 h-4" />
            Pricing Plans
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase tracking-tighter">
            Fuel your growth with <span className="text-[#F24C20]">Pro Access</span>
          </h1>
          <p className="text-neutral-400 max-w-2xl mx-auto text-lg mb-10">
            Choose a plan that fits your needs. Reach out to more specialists and get your projects done faster with unlimited access.
          </p>

          <div className="flex justify-center mb-16">
            <div className="bg-neutral-900/50 p-1.5 rounded-2xl border border-neutral-800 flex gap-2">
              <button
                onClick={() => setActiveRole('freelancer')}
                className={`px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                  activeRole === 'freelancer'
                  ? 'bg-[#F24C20] text-white shadow-lg shadow-[#F24C20]/20'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                Freelancer Plans
              </button>
              <button
                onClick={() => setActiveRole('client')}
                className={`px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                  activeRole === 'client'
                  ? 'bg-[#F24C20] text-white shadow-lg shadow-[#F24C20]/20'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                Client Plans
              </button>
            </div>
          </div>
        </div>

        {loading ? (
            <div className="flex justify-center py-20">
                <Loader2 className="w-12 h-12 text-[#F24C20] animate-spin" />
            </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, idx) => (
              <motion.div
                key={plan._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`relative group rounded-[2.5rem] p-8 transition-all duration-500 border overflow-hidden ${
                   idx === 1 
                   ? 'bg-neutral-900 border-[#F24C20] shadow-2xl shadow-[#F24C20]/10 scale-105' 
                   : 'bg-neutral-900/50 border-neutral-800 hover:border-[#F24C20]/50'
                }`}
              >
                {idx === 1 && (
                    <div className="absolute top-0 right-0 px-6 py-2 bg-[#F24C20] text-white text-[10px] font-black uppercase tracking-widest rounded-bl-3xl">
                        Best Value
                    </div>
                )}
                
                <div className="mb-8">
                  <div className={`p-4 rounded-2xl w-fit mb-6 ${idx === 1 ? 'bg-[#F24C20]/20' : 'bg-neutral-800'}`}>
                     {idx === 0 ? <Zap className="w-8 h-8 text-neutral-400" /> : idx === 1 ? <Rocket className="w-8 h-8 text-[#F24C20]" /> : <Crown className="w-8 h-8 text-yellow-400" />}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-4xl font-black text-white">₹{plan.price}</span>
                    <span className="text-neutral-500 font-medium">/{plan.billing_cycle || 'plan'}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features?.map((feature: string, fIdx: number) => (
                     <li key={fIdx} className="flex items-start gap-3 text-neutral-400 group-hover:text-neutral-200 transition-colors">
                        <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-green-500" />
                        </div>
                        <span className="text-sm font-medium">{feature}</span>
                     </li>
                  ))}
                  <li className="flex items-start gap-3 text-neutral-400">
                     <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-blue-500" />
                     </div>
                     <span className="text-sm font-medium">{plan.project_visit_limit} Project Visits</span>
                  </li>
                  <li className="flex items-start gap-3 text-neutral-400">
                     <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-blue-500" />
                     </div>
                     <span className="text-sm font-medium">{plan.portfolio_visit_limit} Portfolio Visits</span>
                  </li>
                </ul>

                <button
                  disabled={buying !== null}
                  onClick={() => handleChoosePlan(plan._id)}
                  className={`w-full py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all ${
                     idx === 1 
                     ? 'bg-[#F24C20] text-white hover:bg-[#d9431b] shadow-xl shadow-[#F24C20]/25' 
                     : 'bg-white text-neutral-950 hover:bg-neutral-200'
                  }`}
                >
                  {buying === plan._id ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                      <>
                        Get Started
                        <ArrowRight className="w-4 h-4" />
                      </>
                  )}
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
