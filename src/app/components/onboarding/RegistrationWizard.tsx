import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, ArrowLeft, ArrowRight, CheckCircle, Sparkles,
  Target, Briefcase, Users, Globe, MapPin, Clock,
  Palette, Code, Smartphone, TrendingUp, FileText, Video,
  Shield, Building, IndianRupee, Award, Calendar, Mail, Lock,
  User as UserIcon, Loader2, Eye, EyeOff
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'sonner';

const IconMap: Record<string, any> = {
  Target, Briefcase, Users, Globe, MapPin, Clock,
  Palette, Code, Smartphone, TrendingUp, FileText, Video,
  Shield, Building, IndianRupee, Award, Calendar, Mail, Lock
};

interface RegistrationWizardProps {
  onClose: () => void;
}

interface RegistrationData {
  accountType: string;
  categories: string[];
  workPreference: string;
  budgetRange: string;
  experienceLevel: string;
  location: string;
  availability: string;
  fullName: string;
  email: string;
  password: string;
}

const commonLocations = [
  'Mumbai, Maharashtra', 'Delhi, NCR', 'Bangalore, Karnataka', 'Hyderabad, Telangana',
  'Ahmedabad, Gujarat', 'Chennai, Tamil Nadu', 'Kolkata, West Bengal', 'Surat, Gujarat',
  'Pune, Maharashtra', 'Jaipur, Rajasthan', 'Lucknow, Uttar Pradesh', 'Kanpur, Uttar Pradesh',
  'Nagpur, Maharashtra', 'Indore, Madhya Pradesh', 'Thane, Maharashtra', 'Bhopal, Madhya Pradesh',
  'Visakhapatnam, Andhra Pradesh', 'Pimpri-Chinchwad, Maharashtra', 'Patna, Bihar', 'Vadodara, Gujarat',
  'Ghaziabad, Uttar Pradesh', 'Ludhiana, Punjab', 'Agra, Uttar Pradesh', 'Nashik, Maharashtra',
  'Faridabad, Haryana', 'Meerut, Uttar Pradesh', 'Rajkot, Gujarat', 'Kalyan-Dombivli, Maharashtra',
  'Vasai-Virar, Maharashtra', 'Varanasi, Uttar Pradesh', 'Srinagar, Jammu and Kashmir', 'Aurangabad, Maharashtra',
  'Dhanbad, Jharkhand', 'Amritsar, Punjab', 'Navi Mumbai, Maharashtra', 'Allahabad, Uttar Pradesh',
  'Ranchi, Jharkhand', 'Howrah, West Bengal', 'Jabalpur, Madhya Pradesh', 'Gwalior, Madhya Pradesh',
  'Vijayawada, Andhra Pradesh', 'Jodhpur, Rajasthan', 'Madurai, Tamil Nadu', 'Raipur, Chhattisgarh',
  'Kota, Rajasthan', 'Guwahati, Assam', 'Chandigarh, Punjab/Haryana', 'Solapur, Maharashtra',
  'Hubballi-Dharwad, Karnataka', 'Bareilly, Uttar Pradesh', 'Moradabad, Uttar Pradesh', 'Mysore, Karnataka',
  'Gurgaon, Haryana', 'Aligarh, Uttar Pradesh', 'Jalandhar, Punjab', 'Tiruchirappalli, Tamil Nadu',
  'Bhubaneswar, Odisha', 'Salem, Tamil Nadu', 'Mira-Bhayandar, Maharashtra', 'Warangal, Telangana',
  'Thiruvananthapuram, Kerala', 'Bhiwandi, Maharashtra', 'Saharanpur, Uttar Pradesh', 'Guntur, Andhra Pradesh',
  'Amravati, Maharashtra', 'Bikaner, Rajasthan', 'Noida, Uttar Pradesh', 'Jamshedpur, Jharkhand',
  'Bhilai, Chhattisgarh', 'Cuttack, Odisha', 'Firozabad, Uttar Pradesh', 'Kochi, Kerala',
  'Bhavnagar, Gujarat', 'Dehradun, Uttarakhand', 'Durgapur, West Bengal', 'Asansol, West Bengal',
  'Nanded, Maharashtra', 'Kolhapur, Maharashtra', 'Ajmer, Rajasthan', 'Gulbarga, Karnataka',
  'Jamnagar, Gujarat', 'Ujjain, Madhya Pradesh', 'Loni, Uttar Pradesh', 'Siliguri, West Bengal',
  'Jhansi, Uttar Pradesh', 'Ulhasnagar, Maharashtra', 'Nellore, Andhra Pradesh', 'Jammu, Jammu and Kashmir',
  'Sangli-Miraj & Kupwad, Maharashtra', 'Belgaum, Karnataka', 'Mangalore, Karnataka', 'Ambattur, Tamil Nadu',
  'Tirunelveli, Tamil Nadu', 'Malegaon, Maharashtra', 'Gaya, Bihar', 'Jalgaon, Maharashtra',
  'Udaipur, Rajasthan', 'Maheshtala, West Bengal'
];

export default function RegistrationWizard({ onClose }: RegistrationWizardProps) {
  const navigate = useNavigate();
  const [dynamicSteps, setDynamicSteps] = useState<any[]>([]);
  const [loadingSteps, setLoadingSteps] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<RegistrationData>({
    accountType: '',
    categories: [],
    workPreference: '',
    budgetRange: '',
    experienceLevel: '',
    location: '',
    availability: '',
    fullName: '',
    email: '',
    password: '',
  });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const fetchFlowData = async () => {
      try {
        // Fetch both steps and real categories in parallel
        const [stepsRes, categoriesRes] = await Promise.all([
          api.get('/registration-steps'),
          api.get('/cms/categories')
        ]);

        if (stepsRes.data.success) {
          let steps = stepsRes.data.data;

          // Inject real categories into the categories step
          if (categoriesRes.data.success) {
            const realCategories = categoriesRes.data.data
              .filter((c: any) => c.is_active && !c.parent) // Only active top-level categories
              .map((c: any) => ({
                label: c.name,
                value: c._id,
                icon: c.icon, // This might be an emoji or lucide icon name
                emoji: c.icon && c.icon.length <= 2 ? c.icon : null,
                subtitle: c.description || `Explore ${c.name} opportunities`
              }));

            steps = steps.map((step: any) => {
              if (step.field === 'categories') {
                return { ...step, options: realCategories };
              }
              return step;
            });
          }

          setDynamicSteps(steps);
        }
      } catch (error) {
        console.error('Failed to fetch registration data:', error);
        toast.error('Failed to load registration flow. Please try again.');
      } finally {
        setLoadingSteps(false);
      }
    };
    fetchFlowData();
  }, []);

  const totalSteps = dynamicSteps.length;

  const updateData = (field: keyof RegistrationData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
    if (field === 'location') {
      if (typeof value === 'string' && value.trim().length > 1) {
        const filtered = commonLocations.filter(loc =>
          loc.toLowerCase().includes(value.toLowerCase())
        ).slice(0, 5);
        setSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }
  };

  const canProceed = () => {
    if (dynamicSteps.length === 0) return false;
    const step = dynamicSteps[currentStep - 1];
    if (!step) return false;

    // Handle optional steps
    if (step.validation?.required === false) return true;

    if (step.type === 'account-creation') {
      return !!(data.fullName && data.email && data.password);
    }

    const value = data[step.field as keyof RegistrationData];
    if (step.type === 'multi-selection') {
      return Array.isArray(value) && value.length > 0;
    }

    if (step.field === 'location' && !step.validation?.required) return true;

    return value !== '' && value !== undefined && value !== null;
  };

  const nextStep = () => {
    if (currentStep < totalSteps && canProceed()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const autoDetectLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    toast.info('Detecting your location...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyBNVn5j-M6F4VHkaOluoOcVY3K5r2-NlPk`
          );
          const data = await response.json();

          if (data.results && data.results.length > 0) {
            const addressComponents = data.results[0].address_components;
            let city = '';
            let country = '';

            for (const component of addressComponents) {
              if (component.types.includes('locality')) {
                city = component.long_name;
              }
              if (component.types.includes('country')) {
                country = component.long_name;
              }
            }

            const location = city && country ? `${city}, ${country}` : data.results[0].formatted_address;
            updateData('location', location);
            toast.success('Location detected successfully!');
          } else {
            toast.error('Could not determine your location');
          }
        } catch (error) {
          console.error('Geocoding error:', error);
          toast.error('Failed to get location details');
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast.error('Unable to access your location. Please enter it manually.');
      }
    );
  };

  // OTP Logic removed as per Netflix model (Verification via link sent after registration)

  const handleComplete = async () => {
    try {
      const normalizedEmail = data.email.toLowerCase().trim();
      const roles = data.accountType === 'both' ? ['client', 'freelancer'] : [data.accountType];

      const payload = {
        full_name: data.fullName,
        email: normalizedEmail,
        password: data.password,
        roles: roles,
        categories: data.categories,
        location: data.location,
        work_preference: data.workPreference,
        experience_level: data.experienceLevel,
        availability: data.availability,
        budget_range: data.budgetRange
      };

      const response = await api.post('/auth/register', payload);

      if (response.data.success) {
        // Store credentials so ProtectedRoute can show the email-verification screen
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('isLoggedIn', 'true');
        }
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
          localStorage.setItem('userName', response.data.user.full_name);
          if (response.data.user.roles?.includes('freelancer')) {
            localStorage.setItem('userType', 'freelancer');
          } else {
            localStorage.setItem('userType', 'client');
          }
        }
        toast.success(response.data.message || 'Account created! Please check your email to verify.');
        setIsSuccess(true);
      }
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-3 rounded-full bg-neutral-900/50 hover:bg-neutral-800 border border-neutral-800 hover:border-[#F24C20] transition-all group z-10"
      >
        <X className="w-6 h-6 text-neutral-400 group-hover:text-[#F24C20]" />
      </button>

      {isSuccess ? (
        <div className="w-full max-w-2xl mx-auto p-12 text-center flex flex-col items-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6 border-2 border-green-500">
            <Mail className="w-12 h-12 text-green-500" />
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl font-bold text-white mb-4">
            Verify Your Email
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-xl text-neutral-400 mb-8 max-w-md">
            We've sent a verification link to <strong className="text-white">{data.email}</strong>. Please check your inbox and click the link to verify your account before logging in.
          </motion.p>
          <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} onClick={() => navigate('/dashboard')} className="px-8 py-4 bg-[#F24C20] hover:bg-[#d43a12] text-white rounded-xl text-lg font-bold w-full max-w-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
            Go to Dashboard
          </motion.button>
        </div>
      ) : (
        <div className="w-full max-w-7xl h-[95vh] mx-auto px-6 flex gap-12">
        {/* Left Side - Progress & Benefits */}
        <div className="w-96 flex-shrink-0 py-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="sticky top-12 space-y-8"
          >
            <div>
              <h2 className="text-4xl font-bold text-white mb-3">Join Go Experts</h2>
              <p className="text-xl text-neutral-400">Let's personalize your experience</p>
            </div>

            {/* Progress Steps */}
            <div className="space-y-3">
              {dynamicSteps.map((step, index) => (
                <motion.div
                  key={step._id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4"
                >
                  <div className="relative">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${currentStep > index + 1
                        ? 'bg-green-500 text-white'
                        : currentStep === index + 1
                          ? 'bg-[#F24C20] text-white shadow-lg shadow-[#F24C20]/50'
                          : 'bg-neutral-800 text-neutral-500'
                        }`}
                    >
                      {currentStep > index + 1 ? <CheckCircle className="w-5 h-5" /> : index + 1}
                    </div>
                    {index < dynamicSteps.length - 1 && (
                      <div className={`absolute top-10 left-1/2 -translate-x-1/2 w-0.5 h-6 transition-all duration-300 ${currentStep > index + 1 ? 'bg-green-500' : 'bg-neutral-800'}`} />
                    )}
                  </div>
                  <div className={`font-medium transition-colors text-sm ${currentStep === index + 1 ? 'text-white' : currentStep > index + 1 ? 'text-green-400' : 'text-neutral-500'}`}>
                    {step.label}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Progress Bar */}
            <div className="mt-8">
              <div className="flex justify-between text-sm text-neutral-400 mb-2">
                <span>Progress</span>
                <span>{totalSteps > 0 ? Math.round((currentStep / totalSteps) * 100) : 0}%</span>
              </div>
              <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#F24C20] to-orange-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Benefits */}
            <div className="mt-12 p-6 rounded-2xl bg-gradient-to-br from-[#F24C20]/10 to-transparent border border-[#F24C20]/30">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-[#F24C20]" />
                <h3 className="font-bold text-white">Why Go Experts?</h3>
              </div>
              <ul className="space-y-3 text-sm text-neutral-300">
                {[
                  'Connect with verified clients & talent',
                  'Secure payments & escrow protection',
                  'AI-powered project matching',
                  'Build your professional portfolio'
                ].map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Right Side - Question Content */}
        <div className="flex-1 flex flex-col py-12">
          <div className="overflow-y-auto pr-4 pb-24">
            <AnimatePresence mode="wait">
              {loadingSteps ? (
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                  <Loader2 className="w-12 h-12 text-[#F24C20] animate-spin mb-4" />
                  <p className="text-neutral-400">Personalizing your journey...</p>
                </div>
              ) : dynamicSteps.map((step, index) => {
                if (currentStep !== index + 1) return null;

                const isSelected = (val: string) => {
                  const currentVal = data[step.field as keyof RegistrationData];
                  return Array.isArray(currentVal) ? currentVal.includes(val) : currentVal === val;
                };

                const handleSelect = (val: string) => {
                  if (step.type === 'multi-selection') {
                    const currentVal = data[step.field as keyof RegistrationData] as string[];
                    if (currentVal.includes(val)) {
                      updateData(step.field as keyof RegistrationData, currentVal.filter(c => c !== val));
                    } else {
                      updateData(step.field as keyof RegistrationData, [...currentVal, val]);
                    }
                  } else {
                    updateData(step.field as keyof RegistrationData, val);
                  }
                };

                return (
                  <motion.div
                    key={step._id || index}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="space-y-8"
                  >
                    <div>
                      <h3 className="text-3xl lg:text-5xl font-bold text-white mb-4">{step.title}</h3>
                      <p className="text-xl text-neutral-400">{step.description}</p>
                    </div>

                    {(step.type === 'single-selection' || step.type === 'multi-selection') && (
                      <div className={`grid gap-4 ${step.options.length > 4 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                        {step.options.map((opt: any) => {
                          const Icon = IconMap[opt.icon];
                          const selected = isSelected(opt.value);
                          return (
                            <motion.button
                              key={opt.value}
                              onClick={() => handleSelect(opt.value)}
                              whileHover={{ scale: 1.02, x: 10 }}
                              whileTap={{ scale: 0.98 }}
                              className={`relative p-6 rounded-2xl border-2 transition-all text-left flex items-start gap-6 group ${selected
                                ? 'border-[#F24C20] bg-[#F24C20]/10'
                                : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700'
                                }`}
                            >
                              <div className="flex-shrink-0">
                                {opt.emoji ? <span className="text-5xl">{opt.emoji}</span> : Icon ? <Icon className={`w-10 h-10 ${selected ? 'text-[#F24C20]' : 'text-neutral-400'}`} /> : <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center font-bold text-neutral-500">{opt.label[0]}</div>}
                              </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-3">
                                    <h4 className="text-xl font-bold text-white">{opt.label}</h4>
                                    {selected && <CheckCircle className="w-6 h-6 text-[#F24C20]" />}
                                  </div>
                                </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    )}

                    {step.type === 'input' && step.field === 'location' && (
                      <div className="space-y-6">
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                          <input
                            type="text"
                            value={data.location}
                            onChange={(e) => updateData('location', e.target.value)}
                            onFocus={() => data.location.length > 1 && suggestions.length > 0 && setShowSuggestions(true)}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            placeholder="e.g., Mumbai, India"
                            className="w-full pl-12 pr-4 py-4 bg-neutral-950 border-2 border-neutral-800 rounded-xl text-white text-lg placeholder:text-neutral-500 focus:outline-none focus:border-[#F24C20] transition-colors"
                          />
                          <AnimatePresence>
                            {showSuggestions && (
                              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute z-50 w-full mt-2 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden">
                                {suggestions.map((suggestion, idx) => (
                                  <button key={idx} onClick={() => { updateData('location', suggestion); setShowSuggestions(false); }} className="w-full px-4 py-3 text-left text-white hover:bg-[#F24C20]/10 hover:text-[#F24C20] transition-colors flex items-center gap-2">
                                    <MapPin className="w-4 h-4 opacity-50" />
                                    {suggestion}
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        <button onClick={autoDetectLocation} className="text-[#F24C20] hover:text-orange-400 font-medium transition-colors flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Auto-detect my location
                        </button>
                      </div>
                    )}

                    {step.type === 'input' && step.field !== 'location' && (
                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-white mb-3">{step.label}</label>
                        <input
                          type="text"
                          value={data[step.field as keyof RegistrationData] as string}
                          onChange={(e) => updateData(step.field as keyof RegistrationData, e.target.value)}
                          placeholder={step.title}
                          className="w-full px-6 py-4 bg-neutral-950 border-2 border-neutral-800 rounded-xl text-white text-lg placeholder:text-neutral-500 focus:outline-none focus:border-[#F24C20] transition-colors"
                        />
                      </div>
                    )}

                    {step.type === 'account-creation' && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-white mb-3">Full Name</label>
                            <div className="relative">
                              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                              <input
                                type="text"
                                value={data.fullName}
                                onChange={(e) => updateData('fullName', e.target.value)}
                                placeholder="Enter full name"
                                className="w-full pl-12 pr-4 py-4 bg-neutral-950 border-2 border-neutral-800 rounded-xl text-white text-lg placeholder:text-neutral-500 focus:outline-none focus:border-[#F24C20] transition-colors"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-white mb-3">Password</label>
                            <div className="relative">
                              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                              <input
                                type={showPassword ? "text" : "password"}
                                value={data.password}
                                onChange={(e) => updateData('password', e.target.value)}
                                placeholder="Create password"
                                className="w-full pl-12 pr-12 py-4 bg-neutral-950 border-2 border-neutral-800 rounded-xl text-white text-lg placeholder:text-neutral-500 focus:outline-none focus:border-[#F24C20] transition-colors"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
                              >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-white mb-3">Email Address</label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                            <input
                              type="email"
                              value={data.email}
                              onChange={(e) => updateData('email', e.target.value)}
                              placeholder="Email"
                              className="w-full pl-12 pr-4 py-4 bg-neutral-950 border-2 border-neutral-800 rounded-xl text-white text-lg placeholder:text-neutral-500 focus:outline-none focus:border-[#F24C20] transition-colors"
                            />
                          </div>
                          <p className="mt-2 text-xs text-neutral-500">We will send a verification link to this email after registration.</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-neutral-800 mt-6 bg-neutral-950/50 backdrop-blur-sm sticky bottom-0 z-10">
            <button
              onClick={prevStep}
              disabled={currentStep === 1 || loadingSteps}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>Back</span>
            </button>

            <div className="flex items-center gap-4">
              {currentStep < totalSteps ? (
                <button
                  onClick={nextStep}
                  disabled={!canProceed() || loadingSteps}
                  className="flex items-center gap-2 px-10 py-3 rounded-xl bg-[#F24C20] hover:bg-orange-600 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#F24C20]/20 group"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <button
                  onClick={handleComplete}
                  disabled={!canProceed() || loadingSteps}
                  className="flex items-center gap-2 px-10 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-600/20 group"
                >
                  <Sparkles className="w-5 h-5 animate-pulse" />
                  <span>Get Started</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}