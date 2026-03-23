import { motion } from 'motion/react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Download, MessageCircle, ArrowRight, Calendar, Package } from 'lucide-react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

export default function GigOrderSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const order = (location.state as any)?.order;

  if (!order) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-20 text-center">
        <h1 className="text-3xl font-bold text-white mb-4">No order details found</h1>
        <button
          onClick={() => navigate('/gigs')}
          className="px-8 py-3 bg-[#044071] text-white rounded-xl font-semibold"
        >
          Back to Gigs
        </button>
      </div>
    );
  }

  const orderDetails = {
    orderId: order.orderID || 'GE-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    package: order.package,
    price: order.price,
    deliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }),
    seller: {
      name: order.gig?.freelancer_id?.full_name || 'Expert Freelancer',
      avatar: order.gig?.freelancer_id?.profile_image
        ? (order.gig.freelancer_id.profile_image.startsWith('http') ? order.gig.freelancer_id.profile_image : `${import.meta.env.VITE_API_URL}${order.gig.freelancer_id.profile_image}`)
        : `https://ui-avatars.com/api/?name=${order.gig?.freelancer_id?.full_name || 'Expert'}`,
    },
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-neutral-950 pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mb-12"
          >
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
              className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 mb-8 relative"
            >
              <CheckCircle className="w-12 h-12 text-white" />
              <div className="absolute inset-0 rounded-full bg-green-500 blur-2xl opacity-50 animate-pulse" />
            </motion.div>

            {/* Success Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="text-5xl font-bold text-white mb-4">
                Order Placed Successfully! 🎉
              </h1>
              <p className="text-xl text-neutral-400 mb-2">
                Your order has been confirmed and the seller has been notified
              </p>
              <p className="text-lg text-neutral-500">
                Order ID: <span className="text-[#F24C20] font-mono font-semibold">{orderDetails.orderId}</span>
              </p>
            </motion.div>
          </motion.div>

          {/* Order Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800 mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Order Summary</h2>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-neutral-800/50 border border-neutral-700 mb-6">
              <img
                src={orderDetails.seller.avatar}
                alt={orderDetails.seller.name}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-[#F24C20]/30"
              />
              <div className="flex-1">
                <div className="text-sm text-neutral-400 mb-1">Seller</div>
                <div className="text-white font-semibold text-lg">{orderDetails.seller.name}</div>
              </div>
              <button className="px-4 py-2 bg-[#044071] hover:bg-[#055a99] text-white rounded-lg font-medium transition-all flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Message
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-neutral-800/50 border border-neutral-700">
                <div className="flex items-center gap-3 mb-2">
                  <Package className="w-5 h-5 text-[#F24C20]" />
                  <span className="text-sm text-neutral-400">Package</span>
                </div>
                <div className="text-white font-semibold capitalize">{orderDetails.package}</div>
              </div>
              <div className="p-4 rounded-xl bg-neutral-800/50 border border-neutral-700">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-5 h-5 text-[#F24C20]" />
                  <span className="text-sm text-neutral-400">Expected Delivery</span>
                </div>
                <div className="text-white font-semibold">{orderDetails.deliveryDate}</div>
              </div>
            </div>

            <div className="pt-6 border-t border-neutral-800">
              <div className="flex items-center justify-between text-xl">
                <span className="text-neutral-400">Total Paid</span>
                <span className="text-white font-bold">₹{orderDetails.price.toLocaleString()}</span>
              </div>
            </div>
          </motion.div>

          {/* What's Next */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-8 rounded-2xl bg-gradient-to-br from-[#F24C20]/10 to-transparent border border-[#F24C20]/30 mb-8"
          >
            <h3 className="text-xl font-bold text-white mb-4">What happens next?</h3>
            <ol className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#F24C20] text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <div className="text-white font-semibold mb-1">Seller reviews your requirements</div>
                  <div className="text-neutral-400 text-sm">The seller will confirm your order and may ask additional questions</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#F24C20] text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <div className="text-white font-semibold mb-1">Work begins on your project</div>
                  <div className="text-neutral-400 text-sm">You'll receive updates throughout the process</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#F24C20] text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <div className="text-white font-semibold mb-1">Review and request revisions</div>
                  <div className="text-neutral-400 text-sm">Request changes until you're completely satisfied</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#F24C20] text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  4
                </div>
                <div>
                  <div className="text-white font-semibold mb-1">Receive your final delivery</div>
                  <div className="text-neutral-400 text-sm">Download all files and approve the order</div>
                </div>
              </li>
            </ol>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-[#F24C20] text-white rounded-xl font-semibold transition-all"
            >
              Go to Dashboard
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/gigs')}
              className="flex-1 px-8 py-4 bg-[#044071] hover:bg-[#055a99] text-white rounded-xl font-semibold transition-all shadow-lg shadow-[#044071]/30"
            >
              Browse More Gigs
            </button>
          </motion.div>

          {/* Email Confirmation Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 text-center text-sm text-neutral-500"
          >
            📧 A confirmation email has been sent to your registered email address
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  );
}