import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle2, XCircle, ArrowRight, Loader2, CreditCard, ExternalLink } from 'lucide-react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { useEffect, useState } from 'react';
import api from '@/app/utils/api';

export default function PaymentStatus() {
  const [searchParams] = useSearchParams();
  const txnid = searchParams.get('txnid');
  const msg = searchParams.get('msg');
  const type = window.location.pathname.includes('success') ? 'success' : 'failure';

  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<any>(null);

  useEffect(() => {
    if (txnid) {
        // Here you could fetch additional transaction details from backend if needed
        // but for now we trust the redirect
        setLoading(false);
    }
  }, [txnid]);

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center pt-24 pb-12 px-6 relative">
          {/* Background effects */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#F24C20]/10 rounded-full blur-[120px] pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className={`w-full max-w-lg p-10 rounded-[3rem] border backdrop-blur-3xl relative overflow-hidden bg-neutral-900 shadow-2xl ${
                type === 'success' ? 'border-green-500/20 shadow-green-500/5' : 'border-red-500/20 shadow-red-500/5'
            }`}
          >
            {/* Decoration */}
            <div className={`absolute -top-16 -right-16 w-32 h-32 rounded-full blur-3xl opacity-20 ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />

            <div className="text-center relative">
              <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 ${
                 type === 'success' ? 'bg-green-500/10' : 'bg-red-500/10'
              }`}>
                {type === 'success' 
                  ? <CheckCircle2 className="w-12 h-12 text-green-500" /> 
                  : <XCircle className="w-12 h-12 text-red-500" />
                }
              </div>

              <h1 className="text-4xl font-black text-white mb-4 uppercase tracking-tighter">
                {type === 'success' ? 'Payment Success!' : 'Payment Failed'}
              </h1>
              <p className="text-neutral-400 mb-8 max-w-xs mx-auto text-lg leading-relaxed">
                {type === 'success' 
                  ? 'Your subscription is now active. Welcome to the elite tier of GoExperts!' 
                  : (msg || 'Something went wrong while processing your payment with Easebuzz.')
                }
              </p>

              {txnid && (
                <div className="bg-white/5 border border-white/5 rounded-2xl p-4 mb-8 inline-flex flex-col gap-1 w-full max-w-sm">
                   <p className="text-[10px] uppercase tracking-widest font-black text-neutral-500">Transaction ID</p>
                   <p className="text-sm font-mono text-neutral-200">{txnid}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                {type === 'success' ? (
                  <Link
                    to="/dashboard"
                    className="flex-1 py-4 bg-[#F24C20] hover:bg-[#d9431b] text-white rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-xl shadow-[#F24C20]/25 hover:-translate-y-1"
                  >
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/subscription"
                      className="flex-1 py-4 bg-[#F24C20] hover:bg-[#d9431b] text-white rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-xl shadow-[#F24C20]/25"
                    >
                      Try Again
                    </Link>
                    <Link
                      to="/contact"
                      className="flex-1 py-4 bg-transparent border border-neutral-700 hover:border-neutral-500 text-white rounded-2xl font-black flex items-center justify-center gap-2 transition-all"
                    >
                      Contact Support
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
      </main>

      <Footer />
    </div>
  );
}
