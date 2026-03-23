import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle, CreditCard, Upload, Lock,
  Clock, Package, Shield, Sparkles, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import api from '@/app/utils/api';

export default function GigCheckout() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [gig, setGig] = useState<any>(null);
  const [formData, setFormData] = useState({
    package: (location.state as any)?.package || 'standard',
    requirements: '',
    files: [],
    paymentMethod: 'upi',
  });

  useEffect(() => {
    fetchGigDetails();
  }, [id]);

  const fetchGigDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/gigs/${id}`);
      if (res.data.success) {
        setGig(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching gig details:', error);
      toast.error('Failed to load gig details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-20">
        <Loader2 className="w-12 h-12 text-[#F24C20] animate-spin mb-4" />
        <p className="text-neutral-400">Loading checkout details...</p>
      </div>
    );
  }

  if (!gig) return null;

  const packageDetails = {
    basic: {
      name: 'Basic',
      price: Math.round(gig.investment_required * 0.8),
      deliveryDays: 5,
      revisions: 3,
      features: ['Single concept', '3 Revisions', 'Standard delivery', 'Support files'],
    },
    standard: {
      name: 'Standard',
      price: gig.investment_required,
      deliveryDays: 3,
      revisions: 'Unlimited',
      features: ['Multiple concepts', 'Unlimited revisions', 'Priority support', 'All source files', 'Commercial use'],
    },
    premium: {
      name: 'Premium',
      price: Math.round(gig.investment_required * 1.5),
      deliveryDays: 7,
      revisions: 'Unlimited',
      features: ['Full brand identity', 'Unlimited revisions', 'VIP priority support', 'All file formats', 'Marketing assets', 'Post-delivery support'],
    },
  }[formData.package as 'basic' | 'standard' | 'premium'] || {
    name: 'Standard',
    price: gig.investment_required,
    deliveryDays: 3,
    revisions: 'Unlimited',
    features: ['Multiple concepts', 'Unlimited revisions', 'Priority support', 'All source files', 'Commercial use'],
  };

  const handleComplete = async () => {
    try {
      setSubmitting(true);
      const orderData = {
        gig: id,
        package: formData.package,
        price: packageDetails.price,
        requirements: formData.requirements,
      };

      const res = await api.post('/gig-orders', orderData);

      if (res.data.success) {
        toast.success('Order placed successfully!');
        navigate(`/gigs/${id}/success`, { state: { order: res.data.data } });
      }
    } catch (error: any) {
      console.error('Error creating gig order:', error);
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-neutral-950 pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate(`/gigs/${id}`)}
              className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-[#F24C20] transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">Complete Your Order</h1>
              <p className="text-neutral-400">Step {step} of 3</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              {['Requirements', 'Review', 'Payment'].map((label, index) => (
                <div key={label} className="flex items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step > index + 1
                        ? 'bg-green-500 text-white'
                        : step === index + 1
                          ? 'bg-[#F24C20] text-white'
                          : 'bg-neutral-800 text-neutral-500'
                      }`}
                  >
                    {step > index + 1 ? <CheckCircle className="w-5 h-5" /> : index + 1}
                  </div>
                  <span
                    className={`text-sm font-medium ${step === index + 1 ? 'text-white' : 'text-neutral-500'
                      }`}
                  >
                    {label}
                  </span>
                  {index < 2 && (
                    <div className="w-24 h-1 mx-4 bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${step > index + 1 ? 'bg-green-500 w-full' : 'bg-neutral-800 w-0'
                          }`}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Step 1: Requirements */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800">
                    <h2 className="text-2xl font-bold text-white mb-6">Project Requirements</h2>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-white mb-3">
                        Describe your project in detail
                      </label>
                      <textarea
                        rows={6}
                        value={formData.requirements}
                        onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                        placeholder="Tell the seller about your project, vision, goals, and any other details..."
                        className="w-full px-4 py-4 bg-neutral-950 border-2 border-neutral-800 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#F24C20] transition-colors resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-3">
                        Upload reference files (optional)
                      </label>
                      <div className="border-2 border-dashed border-neutral-800 rounded-xl p-8 text-center hover:border-[#F24C20]/50 transition-colors cursor-pointer">
                        <Upload className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
                        <p className="text-neutral-400 mb-1">Click to upload or drag and drop</p>
                        <p className="text-sm text-neutral-600">PNG, JPG, PDF up to 10MB</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setStep(2)}
                    disabled={!formData.requirements}
                    className="w-full py-4 bg-[#044071] hover:bg-[#055a99] text-white rounded-xl font-semibold transition-all shadow-lg shadow-[#044071]/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue to Review
                  </button>
                </motion.div>
              )}

              {/* Step 2: Review */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800">
                    <h2 className="text-2xl font-bold text-white mb-6">Review Your Order</h2>

                    <div className="space-y-4 mb-6">
                      <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                        <span className="text-neutral-400">Package</span>
                        <span className="text-white font-semibold capitalize">{formData.package}</span>
                      </div>
                      <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                        <span className="text-neutral-400">Delivery Time</span>
                        <span className="text-white font-semibold">{packageDetails.deliveryDays} days</span>
                      </div>
                      <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                        <span className="text-neutral-400">Revisions</span>
                        <span className="text-white font-semibold">{packageDetails.revisions}</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-neutral-800/50 border border-neutral-700 mb-6">
                      <h3 className="font-semibold text-white mb-2">Your Requirements</h3>
                      <p className="text-neutral-300 text-sm">{formData.requirements}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 py-4 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white rounded-xl font-semibold transition-all"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      className="flex-1 py-4 bg-[#044071] hover:bg-[#055a99] text-white rounded-xl font-semibold transition-all shadow-lg shadow-[#044071]/30"
                    >
                      Proceed to Payment
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Payment */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800">
                    <h2 className="text-2xl font-bold text-white mb-6">Payment Method</h2>

                    <div className="space-y-3 mb-6">
                      {[
                        { value: 'upi', label: 'UPI', icon: '📱' },
                        { value: 'card', label: 'Credit/Debit Card', icon: '💳' },
                        { value: 'wallet', label: 'Digital Wallet', icon: '👛' },
                      ].map((method) => (
                        <label
                          key={method.value}
                          className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.paymentMethod === method.value
                              ? 'border-[#F24C20] bg-[#F24C20]/5'
                              : 'border-neutral-800 hover:border-neutral-700'
                            }`}
                        >
                          <input
                            type="radio"
                            name="payment"
                            value={method.value}
                            checked={formData.paymentMethod === method.value}
                            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                            className="w-4 h-4 text-[#F24C20]"
                          />
                          <span className="text-2xl">{method.icon}</span>
                          <span className="text-white font-medium">{method.label}</span>
                        </label>
                      ))}
                    </div>

                    <div className="p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/30 mb-6">
                      <div className="flex items-start gap-3">
                        <Shield className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                        <div>
                          <h3 className="font-semibold text-white mb-1">Secure Payment</h3>
                          <p className="text-sm text-neutral-300">
                            Your payment information is encrypted and secure. Money is held in escrow until you approve the work.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setStep(2)}
                      className="flex-1 py-4 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white rounded-xl font-semibold transition-all"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleComplete}
                      disabled={submitting}
                      className="flex-1 py-4 bg-[#044071] hover:bg-[#055a99] text-white rounded-xl font-semibold transition-all shadow-lg shadow-[#044071]/30 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {submitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Lock className="w-5 h-5" />
                          Pay ₹{packageDetails.price.toLocaleString()}
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800">
                <h3 className="text-xl font-bold text-white mb-6">Order Summary</h3>

                <div className="space-y-4 mb-6">
                  <div>
                    <div className="text-neutral-400 text-sm mb-1">Gig</div>
                    <div className="text-white font-semibold line-clamp-2 mb-2">{gig.title}</div>
                    <div className="text-neutral-400 text-sm mb-1">Package</div>
                    <div className="text-white font-semibold capitalize">{formData.package}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-neutral-800/50 border border-neutral-700">
                      <div className="flex items-center gap-2 text-neutral-400 text-xs mb-1">
                        <Clock className="w-3 h-3" />
                        Delivery
                      </div>
                      <div className="text-white font-semibold text-sm">{packageDetails.deliveryDays} days</div>
                    </div>
                    <div className="p-3 rounded-lg bg-neutral-800/50 border border-neutral-700">
                      <div className="flex items-center gap-2 text-neutral-400 text-xs mb-1">
                        <Package className="w-3 h-3" />
                        Revisions
                      </div>
                      <div className="text-white font-semibold text-sm">{packageDetails.revisions}</div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-neutral-800">
                    <h4 className="text-sm font-semibold text-white mb-3">Included:</h4>
                    <ul className="space-y-2">
                      {packageDetails.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-neutral-300">
                          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-6 border-t border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between text-neutral-400">
                    <span>Subtotal</span>
                    <span>₹{packageDetails.price.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-400">
                    <span>Service Fee</span>
                    <span>₹{Math.round(packageDetails.price * 0.05).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-xl font-bold text-white pt-3 border-t border-neutral-800">
                    <span>Total</span>
                    <span>₹{(packageDetails.price + Math.round(packageDetails.price * 0.05)).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
