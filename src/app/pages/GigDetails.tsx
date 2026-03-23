import { motion } from 'motion/react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Star, Clock, Heart, Share2, CheckCircle, MessageCircle,
  ChevronDown, Award, Shield, RefreshCw, Package, ArrowLeft,
  Loader2, AlertCircle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import api, { getImgUrl } from '@/app/utils/api';
import { toast } from 'sonner';

export default function GigDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedPackage, setSelectedPackage] = useState('standard');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [gig, setGig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    fetchGigDetails();
  }, [id]);

  const fetchGigDetails = async () => {
    try {
      setLoading(true);
      const [res, savedRes] = await Promise.all([
        api.get(`/gigs/${id}`),
        api.get('/users/saved-gigs')
      ]);
      
      if (res.data.success) {
        setGig(res.data.data);
      } else {
        setError('Gig not found');
      }

      if (savedRes.data.success) {
        setIsSaved(savedRes.data.data.some((item: any) => (item.gig?._id || item.gig) === id));
      }
    } catch (error: any) {
      console.error('Error fetching gig details:', error);
      setError(error.response?.data?.message || 'Failed to fetch gig details');
    } finally {
      setLoading(false);
    }
  };

  const toggleSave = async () => {
    try {
      const res = await api.post(`/users/saved-gigs/${id}`);
      if (res.data.success) {
        setIsSaved(!isSaved);
        toast.success(res.data.message);
      }
    } catch (err) {
      toast.error('Failed to update saved status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-20">
        <Loader2 className="w-12 h-12 text-[#F24C20] animate-spin mb-4" />
        <p className="text-neutral-400">Loading gig details...</p>
      </div>
    );
  }

  if (error || !gig) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-20 text-center">
        <AlertCircle className="w-16 h-16 text-neutral-800 mb-6" />
        <h2 className="text-2xl font-bold text-white mb-2">{error || 'Gig not found'}</h2>
        <Link to="/dashboard/gigs/my-gigs" className="text-[#F24C20] hover:underline">Back to My Gigs</Link>
      </div>
    );
  }

  // Mocking packages based on gig investment_required
  const packages = {
    basic: {
      name: 'Basic',
      price: Math.round(gig.investment_required * 0.8),
      deliveryDays: 5,
      revisions: 3,
      features: [
        'Single concept',
        '3 Revisions',
        'Standard delivery',
        'Support files',
      ],
    },
    standard: {
      name: 'Standard',
      price: gig.investment_required,
      deliveryDays: 3,
      revisions: 'Unlimited',
      features: [
        'Multiple concepts',
        'Unlimited revisions',
        'Priority support',
        'All source files',
        'Commercial use',
      ],
      recommended: true,
    },
    premium: {
      name: 'Premium',
      price: Math.round(gig.investment_required * 1.5),
      deliveryDays: 7,
      revisions: 'Unlimited',
      features: [
        'Full brand identity',
        'Unlimited revisions',
        'VIP priority support',
        'All file formats',
        'Marketing assets',
        'Post-delivery support',
      ],
    },
  } as const;

  const faqs = [
    {
      q: 'What do I need to provide?',
      a: 'Tell me about your project, your vision, preferred goals, and any reference ideas you like. The more details, the better!',
    },
    {
      q: 'What deliverables will I receive?',
      a: 'You\'ll get all necessary documents, strategy plans, and source files as specified in the selected package.',
    },
  ];

  const sellerName = gig.freelancer_id?.full_name || 'Expert Freelancer';
  const sellerAvatar = getImgUrl(gig.freelancer_id?.profile_image)
    || `https://ui-avatars.com/api/?name=${encodeURIComponent(sellerName)}`;

  const thumbnailUrl = getImgUrl(gig.thumbnail)
    || 'https://images.unsplash.com/photo-1618761714954-0b8cd0026356?w=800&q=80';

  const gigImages = [thumbnailUrl];

  return (
    <div className="min-h-screen bg-neutral-950 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-neutral-400 mb-8">
          <button onClick={() => navigate('/gigs')} className="hover:text-[#F24C20] transition-colors flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Gigs
          </button>
          <span>/</span>
          <span className="text-neutral-600 capitalize">{gig.category}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                {gig.title}
              </h1>

              {/* Seller Quick Info */}
              <div className="flex items-center gap-4 mb-6">
                <ImageWithFallback
                  src={sellerAvatar}
                  alt={sellerName}
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-[#F24C20]/30"
                />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-white text-lg">{sellerName}</span>
                    <div className="px-2 py-1 bg-[#F24C20]/10 border border-[#F24C20]/30 text-[#F24C20] text-xs font-bold rounded flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      Pro Verified
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-neutral-400">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium text-white">4.9</span>
                      <span>({Math.floor(Math.random() * 50) + 1} reviews)</span>
                    </div>
                    <span>•</span>
                    <span>{gig.orders_count || 0} orders</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="relative"
            >
              <div className="rounded-2xl overflow-hidden mb-4 group">
                <div className="relative h-[500px]">
                  <ImageWithFallback
                    src={gigImages[currentImageIndex]}
                    alt="Gig preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {gigImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`rounded-xl overflow-hidden transition-all ${currentImageIndex === index
                        ? 'ring-2 ring-[#F24C20] scale-105'
                        : 'opacity-60 hover:opacity-100'
                      }`}
                  >
                    <ImageWithFallback
                      src={image}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover"
                    />
                  </button>
                ))}
              </div>
            </motion.div>

            {/* About This Gig */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800"
            >
              <h2 className="text-2xl font-bold text-white mb-4">About This Gig</h2>
              <p className="text-neutral-300 whitespace-pre-line mb-6 leading-relaxed">
                {gig.description}
              </p>

              <h3 className="text-xl font-bold text-white mb-4">What You'll Get</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  'Professional and high-quality results',
                  'Clear and constant communication',
                  'Timely delivery of all assets',
                  'Post-project support and guidance',
                  '100% satisfaction guarantee'
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-300">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Package Comparison */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Compare Packages</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(packages).map(([key, pkg]) => (
                  <div
                    key={key}
                    className={`relative p-6 rounded-2xl border-2 transition-all ${selectedPackage === key
                        ? 'border-[#F24C20] bg-[#F24C20]/5 scale-105'
                        : 'border-neutral-800 bg-neutral-900/30 hover:border-neutral-700'
                      } ${(pkg as any).recommended ? 'ring-2 ring-[#F24C20]/30' : ''}`}
                  >
                    {(pkg as any).recommended && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#F24C20] text-white text-xs font-bold rounded-full">
                        Recommended
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-white mb-2">{pkg.name}</h3>
                    <div className="text-3xl font-bold text-white mb-4">₹{pkg.price.toLocaleString()}</div>
                    <div className="flex items-center gap-2 text-sm text-neutral-400 mb-4 pb-4 border-b border-neutral-800">
                      <Clock className="w-4 h-4" />
                      <span>{pkg.deliveryDays} days delivery</span>
                    </div>
                    <ul className="space-y-3 mb-6">
                      {pkg.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-neutral-300">
                          <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => setSelectedPackage(key)}
                      className={`w-full py-3 rounded-xl font-semibold transition-all ${selectedPackage === key
                          ? 'bg-[#044071] hover:bg-[#055a99] text-white shadow-lg shadow-[#044071]/30'
                          : 'bg-neutral-800 hover:bg-neutral-700 text-white'
                        }`}
                    >
                      Select
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Tools & Technologies */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800"
            >
              <h3 className="text-xl font-bold text-white mb-4">Tools & Technologies</h3>
              <div className="flex flex-wrap gap-3">
                {(gig.tags?.length > 0 ? gig.tags : (gig.freelancer_id?.skills?.length > 0 ? gig.freelancer_id.skills : ['Industry Standards', 'AI Enhanced', 'Cloud Based', 'Real-time Tracking'])).map((tool: string) => (
                  <span
                    key={tool}
                    className="px-4 py-2 bg-neutral-800 border border-neutral-700 text-neutral-300 rounded-lg text-sm font-medium hover:border-[#F24C20]/50 transition-colors"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* FAQ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {faqs.map((item, index) => (
                  <div key={index} className="p-6 rounded-xl bg-neutral-900/50 border border-neutral-800">
                    <h3 className="font-bold text-white mb-2">{item.q}</h3>
                    <p className="text-neutral-400">{item.a}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Sticky Purchase Card */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="sticky top-28 space-y-6"
            >
              {/* Order Card */}
              <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 backdrop-blur-sm">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-neutral-400">Package</div>
                    <div className="px-3 py-1 rounded-lg bg-neutral-800 text-neutral-300 text-sm font-medium capitalize">
                      {selectedPackage}
                    </div>
                  </div>

                  <div className="text-4xl font-bold text-white mb-6">
                    ₹{packages[selectedPackage as keyof typeof packages].price.toLocaleString()}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-3 rounded-lg bg-neutral-800/50 border border-neutral-700">
                      <div className="flex items-center gap-2 text-neutral-400 text-xs mb-1">
                        <Clock className="w-3 h-3" />
                        Delivery
                      </div>
                      <div className="text-white font-semibold">{packages[selectedPackage as keyof typeof packages].deliveryDays} days</div>
                    </div>
                    <div className="p-3 rounded-lg bg-neutral-800/50 border border-neutral-700">
                      <div className="flex items-center gap-2 text-neutral-400 text-xs mb-1">
                        <RefreshCw className="w-3 h-3" />
                        Revisions
                      </div>
                      <div className="text-white font-semibold">{packages[selectedPackage as keyof typeof packages].revisions}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <button
                    onClick={() => navigate(`/gigs/${id}/checkout`, { state: { package: selectedPackage, price: packages[selectedPackage as keyof typeof packages].price } })}
                    className="w-full py-4 bg-[#044071] hover:bg-[#055a99] text-white rounded-xl font-semibold transition-all shadow-lg shadow-[#044071]/30 hover:scale-105"
                  >
                    Continue (₹{packages[selectedPackage as keyof typeof packages].price.toLocaleString()})
                  </button>
                  <button className="w-full py-4 bg-transparent hover:bg-white/5 text-white border-2 border-neutral-700 hover:border-[#F24C20] rounded-xl font-semibold transition-all flex items-center justify-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Contact Seller
                  </button>
                </div>

                <div className="flex items-center justify-around pt-6 border-t border-neutral-800">
                  <button 
                    onClick={toggleSave}
                    className={`flex flex-col items-center gap-1 transition-colors group ${isSaved ? 'text-[#F24C20]' : 'text-neutral-400 hover:text-[#F24C20]'}`}
                  >
                    <Heart className={`w-5 h-5 ${isSaved ? 'fill-[#F24C20]' : 'group-hover:fill-[#F24C20]'}`} />
                    <span className="text-xs">{isSaved ? 'Saved' : 'Save'}</span>
                  </button>
                  <button className="flex flex-col items-center gap-1 text-neutral-400 hover:text-[#F24C20] transition-colors">
                    <Share2 className="w-5 h-5" />
                    <span className="text-xs">Share</span>
                  </button>
                </div>
              </div>

              {/* Seller Card */}
              <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800">
                <div className="flex items-center gap-4 mb-6">
                  <ImageWithFallback
                    src={sellerAvatar}
                    alt={sellerName}
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-[#F24C20]/30"
                  />
                  <div>
                    <div className="font-bold text-white">{sellerName}</div>
                    <div className="text-sm text-[#F24C20]">Pro Verified</div>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-400">Member since</span>
                    <span className="font-medium text-white">
                      {gig.freelancer_id?.createdAt ? new Date(gig.freelancer_id.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Jan 2024'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-400">Response time</span>
                    <span className="font-medium text-white">1 hour</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-400">Total orders</span>
                    <span className="font-medium text-white">{gig.orders_count || 0}+</span>
                  </div>
                </div>

                <Link
                  to={`/talent/${gig.freelancer_id?._id}`}
                  className="block w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-center text-white rounded-xl font-medium transition-all"
                >
                  View Profile
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#F24C20]/10 to-transparent border border-[#F24C20]/30">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-neutral-300">
                    <Shield className="w-5 h-5 text-green-400" />
                    <span>Money-back guarantee</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-neutral-300">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span>100% satisfaction guaranteed</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-neutral-300">
                    <Award className="w-5 h-5 text-[#F24C20]" />
                    <span>Verified top-rated seller</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
