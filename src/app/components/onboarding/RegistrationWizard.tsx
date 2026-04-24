import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, ArrowLeft, ArrowRight, CheckCircle, Sparkles,
  Target, Briefcase, Users, Globe, MapPin, Clock,
  Palette, Code, Smartphone, TrendingUp, FileText, Video,
  Shield, Building, IndianRupee, Award, Calendar, Mail, Lock,
  User as UserIcon, Loader2, Eye, EyeOff, Phone, ChevronDown, Search as SearchIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'sonner';

const IconMap: Record<string, any> = {
  Target, Briefcase, Users, Globe, MapPin, Clock,
  Palette, Code, Smartphone, TrendingUp, FileText, Video,
  Shield, Building, IndianRupee, Award, Calendar, Mail, Lock
};

const AnimatedCheck = () => (
  <motion.div
    initial={{ x: -10, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    className="relative w-9 h-9 flex items-center justify-center"
  >
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="absolute inset-0 bg-[#F24C20]/10 rounded-full"
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    />
    <svg
      className="w-6 h-8 z-10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#F24C20"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <motion.path
        d="M4 12L9 17L20 6"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          duration: 0.4,
          ease: "easeOut",
          delay: 0.1
        }}
      />
    </svg>
  </motion.div>
);

interface RegistrationWizardProps {
  onClose: () => void;
}

interface RegistrationData {
  accountType: string;
  subscriptionPlan: string;
  categories: string[];
  email: string;
  fullName: string;
  password: string;
  whatsappCountryCode: string;
  whatsappNumber: string;
  businessOrAlternativeCountryCode: string;
  businessOrAlternativeNumber: string;
  referralCode: string;
  latitude?: number;
  longitude?: number;
  [key: string]: any;
}

interface CountryCodeOption {
  code: string;
  country: string;
  iso2: string;
}

const countryCodeOptions: CountryCodeOption[] = [
  { code: '+1', country: 'United States', iso2: 'US' },
  { code: '+1', country: 'Canada', iso2: 'CA' },
  { code: '+7', country: 'Russia', iso2: 'RU' },
  { code: '+20', country: 'Egypt', iso2: 'EG' },
  { code: '+27', country: 'South Africa', iso2: 'ZA' },
  { code: '+31', country: 'Netherlands', iso2: 'NL' },
  { code: '+33', country: 'France', iso2: 'FR' },
  { code: '+34', country: 'Spain', iso2: 'ES' },
  { code: '+39', country: 'Italy', iso2: 'IT' },
  { code: '+44', country: 'United Kingdom', iso2: 'GB' },
  { code: '+49', country: 'Germany', iso2: 'DE' },
  { code: '+52', country: 'Mexico', iso2: 'MX' },
  { code: '+55', country: 'Brazil', iso2: 'BR' },
  { code: '+60', country: 'Malaysia', iso2: 'MY' },
  { code: '+61', country: 'Australia', iso2: 'AU' },
  { code: '+62', country: 'Indonesia', iso2: 'ID' },
  { code: '+65', country: 'Singapore', iso2: 'SG' },
  { code: '+66', country: 'Thailand', iso2: 'TH' },
  { code: '+81', country: 'Japan', iso2: 'JP' },
  { code: '+82', country: 'South Korea', iso2: 'KR' },
  { code: '+86', country: 'China', iso2: 'CN' },
  { code: '+91', country: 'India', iso2: 'IN' },
  { code: '+92', country: 'Pakistan', iso2: 'PK' },
  { code: '+94', country: 'Sri Lanka', iso2: 'LK' },
  { code: '+95', country: 'Myanmar', iso2: 'MM' },
  { code: '+966', country: 'Saudi Arabia', iso2: 'SA' },
  { code: '+971', country: 'United Arab Emirates', iso2: 'AE' },
  { code: '+973', country: 'Bahrain', iso2: 'BH' },
  { code: '+974', country: 'Qatar', iso2: 'QA' }
];

const getFlagEmoji = (iso2: string) =>
  iso2
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));

const PHONE_DIGITS_REGEX = /^\d{7,15}$/;

const sanitizePhoneNumber = (value: string) => value.replace(/\D/g, '').slice(0, 15);

const getPhoneValidationMessage = (value: string, isRequired: boolean) => {
  const sanitized = sanitizePhoneNumber(value);

  if (!sanitized) {
    return isRequired ? 'Phone number is required' : '';
  }

  if (!PHONE_DIGITS_REGEX.test(sanitized)) {
    return 'Enter a valid phone number with 7 to 15 digits';
  }

  return '';
};

function PhoneNumberField({
  label,
  codeValue,
  onCodeChange,
  numberValue,
  onNumberChange,
  placeholder,
  error,
}: {
  label: string;
  codeValue: string;
  onCodeChange: (value: string) => void;
  numberValue: string;
  onNumberChange: (value: string) => void;
  placeholder: string;
  error?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selected = countryCodeOptions.find((option) => `${option.code}-${option.iso2}` === codeValue);
  const filtered = countryCodeOptions.filter((option) => {
    const q = query.toLowerCase();
    return (
      option.country.toLowerCase().includes(q) ||
      option.code.includes(q) ||
      option.iso2.toLowerCase().includes(q)
    );
  });

  return (
    <div className="relative">
      <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.08em] text-neutral-400">{label}</label>
      <div
        className={`flex w-full items-center rounded-xl border-2 bg-neutral-950 transition-colors ${
          error ? 'border-red-500/60 focus-within:border-red-500' : 'border-neutral-800 focus-within:border-[#F24C20]'
        }`}
      >
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex shrink-0 items-center gap-2 rounded-l-xl border-r border-neutral-800 px-3 py-3 text-white"
        >
          <span className="text-lg leading-none">{selected ? getFlagEmoji(selected.iso2) : '🌐'}</span>
          <span className="text-sm font-medium">{selected ? selected.code : '+--'}</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <div className="relative flex-1">
          <input
            type="tel"
            value={numberValue}
            onChange={(e) => onNumberChange(sanitizePhoneNumber(e.target.value))}
            placeholder={placeholder}
            className="w-full bg-transparent py-3 pl-4 pr-4 text-sm font-normal text-white placeholder:text-[11px] placeholder:font-normal placeholder:text-neutral-500 focus:outline-none"
          />
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 shadow-2xl"
          >
            <div className="border-b border-neutral-800 p-3">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search country or code"
                  className="w-full rounded-lg bg-neutral-950 py-2 pl-9 pr-3 text-sm text-white outline-none"
                />
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {filtered.map((option) => {
                const optionValue = `${option.code}-${option.iso2}`;
                return (
                  <button
                    type="button"
                    key={optionValue}
                    onClick={() => {
                      onCodeChange(optionValue);
                      setIsOpen(false);
                      setQuery('');
                    }}
                    className="flex w-full items-center justify-between px-4 py-3 text-sm text-white transition-colors hover:bg-[#F24C20]/10"
                  >
                    <span className="flex items-center gap-3 truncate">
                      <span className="text-base leading-none">{getFlagEmoji(option.iso2)}</span>
                      <span>{option.country}</span>
                    </span>
                    <span className="ml-4 shrink-0 text-neutral-400">{option.code}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
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
    subscriptionPlan: '',
    categories: [],
    workPreference: '',
    budgetRange: '',
    experienceLevel: '',
    location: '',
    availability: '',
    fullName: '',
    email: '',
    password: '',
    whatsappCountryCode: '+91-IN',
    whatsappNumber: '',
    businessOrAlternativeCountryCode: '+91-IN',
    businessOrAlternativeNumber: '',
    referralCode: '',
    latitude: undefined,
    longitude: undefined,
  });
  const [plans, setPlans] = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [gigCats, setGigCats] = useState<any[]>([]);
  const [startupCats, setStartupCats] = useState<any[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [allSkills, setAllSkills] = useState<any[]>([]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    if (ref) {
      setData(prev => ({ ...prev, referralCode: ref.toUpperCase() }));
    }
  }, []);

  useEffect(() => {
    const fetchFlowData = async () => {
      try {
        setLoadingSteps(true);
        // Fetch Steps, CMS Cats, and Startup Cats
        const [stepsRes, cmsRes, startupRes, skillsRes] = await Promise.all([
          api.get('/registration-steps?module=onboarding'),
          api.get('/cms/categories'),
          api.get('/startup-categories'),
          api.get('/cms/skills')
        ]);

        if (stepsRes.data.success) {
          // Sort steps by order to ensure consistency
          const sortedSteps = stepsRes.data.data.sort((a: any, b: any) => a.order - b.order);
          setDynamicSteps(sortedSteps);
        }

        if (cmsRes.data.success) {
          const processedGigCats = cmsRes.data.data
            .filter((c: any) => c.is_active && !c.parent)
            .map((c: any) => ({
              label: c.name,
              value: c._id,
              icon: c.icon,
              emoji: (c.icon && c.icon.length <= 2) ? c.icon : null,
              subtitle: c.description || `Explore ${c.name} Gigs`
            }))
            .sort((a: any, b: any) => a.label.localeCompare(b.label));
          setGigCats(processedGigCats);
        }

        if (startupRes.data.success) {
          const processedStartupCats = startupRes.data.data
            .map((c: any) => ({
              label: c.name,
              value: c._id,
              icon: c.icon,
              subtitle: c.description || `Build a venture in ${c.name}`
            }))
            .sort((a: any, b: any) => a.label.localeCompare(b.label));
          setStartupCats(processedStartupCats);
        }

        if (skillsRes.data.success) {
          const processedSkills = (skillsRes.data.data || skillsRes.data.skills || [])
            .filter((s: any) => s.is_active !== false)
            .map((s: any) => ({
              label: s.name,
              value: s._id || s.name,
              // category is populated as { _id, name } from backend — extract _id as string
              categoryId: s.category?._id
                ? String(s.category._id)
                : s.category
                  ? String(s.category)
                  : null
            }));
          setAllSkills(processedSkills);
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

  // Update categories and skills options dynamically when role changes
  useEffect(() => {
    if (dynamicSteps.length > 0) {
      const isStartupRelated = ['investor', 'startup_creator'].includes(data.accountType);
      const relevantCats = isStartupRelated ? startupCats : gigCats;

      setDynamicSteps(prev => prev.map(step => {
        if (step.field === 'categories' || step.field === 'projectType') {
          return { ...step, options: relevantCats };
        }
        if (step.field === 'skills') {
          // Filter skills whose categoryId matches any of the selected category IDs (compare as strings)
          const selectedCatIds = data.categories.map(String);
          const filteredSkills = allSkills.filter(skill =>
            skill.categoryId && selectedCatIds.includes(String(skill.categoryId))
          );
          // Show filtered skills when categories are selected and matches exist; otherwise show all
          const finalSkills =
            selectedCatIds.length > 0 && filteredSkills.length > 0
              ? filteredSkills
              : allSkills;
          return { ...step, options: finalSkills };
        }
        return step;
      }));
    }
  }, [data.accountType, gigCats, startupCats, allSkills, data.categories]);

  useEffect(() => {
    const fetchPlans = async () => {
      if (data.accountType) {
        setLoadingPlans(true);
        try {
          const response = await api.get(`/subscription-plans?role=${data.accountType}`);
          if (response.data.success) {
            setPlans(response.data.data);
          }
        } catch (error) {
          console.error('Failed to fetch plans:', error);
        } finally {
          setLoadingPlans(false);
        }
      }
    };
    fetchPlans();
  }, [data.accountType]);

  // Polling for email verification status once registered
  useEffect(() => {
    let pollInterval: number | undefined;
    let isChecking = false;
    let attempts = 0;
    const maxAttempts = 30;

    if (isSuccess) {
      pollInterval = window.setInterval(async () => {
        if (document.hidden || isChecking || attempts >= maxAttempts) {
          if (attempts >= maxAttempts && pollInterval) {
            window.clearInterval(pollInterval);
          }
          return;
        }

        isChecking = true;
        attempts += 1;

        try {
          // Check current user status
          const response = await api.get('/auth/me', { skipToast: true } as any);

          if (response.data.success && response.data.user.is_email_verified) {
            if (pollInterval) {
              window.clearInterval(pollInterval);
            }

            // Success! Update local state
            const user = response.data.user;
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userName', user.full_name);
            localStorage.setItem('userType', user.role || (user.roles && user.roles[0]));

            toast.success('Email verified! Redirecting to your dashboard...');

            // Redirect after a short delay for feedback
            setTimeout(() => {
              const destination = getDashboardRedirect();
              // Use window.location.href for a full reload to ensure fresh global state
              window.location.href = destination;
            }, 1500);
          }
        } catch (error) {
          // Ignore polling errors (might happen if token isn't ready or server is blipping)
          console.debug('Verification polling error:', error);
        } finally {
          isChecking = false;
        }
      }, 10000); // Check every 10 seconds and stop after a limited number of attempts
    }

    return () => {
      if (pollInterval) {
        window.clearInterval(pollInterval);
      }
    };
  }, [isSuccess]);

  const visibleSteps = dynamicSteps.filter(step => {
    // Stage 1: Always show Account Type
    if (step.field === 'accountType') return true;

    // Skip subscription plan selection during signup as per new requirement
    if (step.type === 'subscription-plan') return false;

    // Only show if accountType selected (or step is for all)
    if (!data.accountType && step.field !== 'accountType') return false;

    // Filter by role
    if (!step.applicableRoles || step.applicableRoles.length === 0) return true;
    return step.applicableRoles.includes(data.accountType);
  });

  const totalSteps = visibleSteps.length;

  const updateData = (field: keyof RegistrationData, value: any) => {
    if (field === 'location') {
      setData(prev => ({ ...prev, location: value, latitude: undefined, longitude: undefined }));
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
    } else {
      setData(prev => ({ ...prev, [field]: value }));
    }
  };

  const whatsappNumberError = getPhoneValidationMessage(data.whatsappNumber, true);
  const businessNumberError = getPhoneValidationMessage(data.businessOrAlternativeNumber, false);

  const canProceed = () => {
    if (visibleSteps.length === 0) return false;
    const step = visibleSteps[currentStep - 1];
    if (!step) return false;

    // Handle optional steps
    if (step.validation?.required === false) return true;

    if (step.type === 'account-creation') {
      const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
      const isEmailValid = emailRegex.test(data.email);
      const isPasswordValid = data.password.length >= 8;
      return !!(
        data.fullName &&
        isEmailValid &&
        isPasswordValid &&
        data.whatsappCountryCode.trim() &&
        !whatsappNumberError &&
        !businessNumberError
      );
    }

    if (step.type === 'subscription-plan') {
      return loadingPlans ? false : (plans.length > 0 ? !!data.subscriptionPlan : true);
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
          setData(prev => ({ ...prev, latitude, longitude }));
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
        ...data,
        full_name: data.fullName,
        email: normalizedEmail,
        whatsapp_country_code: data.whatsappCountryCode.split('-')[0],
        whatsapp_number: sanitizePhoneNumber(data.whatsappNumber),
        business_or_alternative_country_code: (data.businessOrAlternativeNumber ? data.businessOrAlternativeCountryCode : data.whatsappCountryCode).split('-')[0],
        business_or_alternative_number: sanitizePhoneNumber(data.businessOrAlternativeNumber || data.whatsappNumber),
        roles: roles,
        categories: Array.isArray(data.categories) ? data.categories : [data.categories],
        // Ensure legacy fields are mapped if they differ from data state keys
        work_preference: data.workPreference,
        experience_level: data.experienceLevel,
        budget_range: data.budgetRange,
        subscription_plan: data.subscriptionPlan,
        referral_code: data.referralCode,
        latitude: data.latitude,
        longitude: data.longitude
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
          localStorage.setItem('userType', response.data.user.role);
        }
        toast.success(response.data.message || 'Account created! Please check your email to verify.');
        setIsSuccess(true);
      }
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  const getDashboardRedirect = () => {
    // Check for redirect param
    const urlParams = new URLSearchParams(window.location.search);
    const redirect = urlParams.get('redirect');
    if (redirect) return redirect;

    // Set the initial userType based on accountType so the DashboardRouter shows the correct view
    const primaryRole = data.accountType === 'both' ? 'client' : data.accountType;

    if (['client', 'freelancer'].includes(primaryRole)) {
      localStorage.setItem('userType', primaryRole);
      return '/dashboard';
    }

    switch (primaryRole) {
      case 'investor':
        localStorage.setItem('userType', 'investor');
        return '/dashboard-investor';
      case 'startup_creator':
        localStorage.setItem('userType', 'startup_creator');
        return '/dashboard-startup';
      default:
        localStorage.setItem('userType', 'client');
        return '/dashboard';
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
          <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} onClick={() => navigate(getDashboardRedirect())} className="px-8 py-4 bg-[#F24C20] hover:bg-[#d43a12] text-white rounded-xl text-lg font-bold w-full max-w-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
            Go to Dashboard
          </motion.button>
        </div>
      ) : (
        <div className="w-full max-w-7xl h-[95vh] mx-auto px-6 flex gap-12">
          {/* Left Side - Progress & Benefits */}
          <div className="w-96 flex-shrink-0 py-10">
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
                {visibleSteps.map((step, index) => (
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
                      {index < visibleSteps.length - 1 && (
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
            <div className="overflow-y-auto pr-4 pb-24 scrollbar-orange">
              <AnimatePresence mode="wait">
                {loadingSteps ? (
                  <div className="flex flex-col items-center justify-center min-h-[400px]">
                    <Loader2 className="w-12 h-12 text-[#F24C20] animate-spin mb-4" />
                    <p className="text-neutral-400">Personalizing your journey...</p>
                  </div>
                ) : visibleSteps.map((step, index) => {
                  if (currentStep !== index + 1) return null;

                  const isSelected = (val: string) => {
                    const currentVal = data[step.field as keyof RegistrationData] || [];
                    return Array.isArray(currentVal) ? currentVal.includes(val) : currentVal === val;
                  };

                  const handleSelect = (val: string) => {
                    if (step.type === 'multi-selection') {
                      const currentVal = (data[step.field as keyof RegistrationData] as string[]) || [];
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
                      className="space-y-6"
                    >
                      <div className="text-center">
                        <h3 className="mb-3 text-2xl lg:text-3xl font-bold text-white">{step.title}</h3>
                        <p className="text-base text-neutral-400">{step.description}</p>
                      </div>

                      {step.type === 'subscription-plan' && (
                        <div className="space-y-6">
                          {loadingPlans ? (
                            <div className="flex flex-col items-center justify-center py-12">
                              <Loader2 className="w-10 h-10 text-[#F24C20] animate-spin mb-4" />
                              <p className="text-neutral-400">Fetching best plans for you...</p>
                            </div>
                          ) : plans.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {plans.map((plan: any) => {
                                const selected = data.subscriptionPlan === plan._id;
                                return (
                                  <motion.button
                                    key={plan._id}
                                    onClick={() => updateData('subscriptionPlan', plan._id)}
                                    whileHover={{ y: -5 }}
                                    className={`relative flex flex-col p-6 rounded-2xl border-2 transition-all text-left group bg-gradient-to-r from-[#F24C20]/3 via-transparent to-[#F24C20]/3 ${selected
                                      ? 'border-[#F24C20] bg-[#F24C20]/10'
                                      : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700'
                                      }`}
                                  >
                                    {selected && (
                                      <div className="absolute top-4 right-4">
                                        <CheckCircle className="w-6 h-6 text-[#F24C20]" />
                                      </div>
                                    )}
                                    <div className="mb-4">
                                      <h4 className="text-2xl font-bold text-white mb-1">{plan.name}</h4>
                                      <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-black text-white">₹{plan.price}</span>
                                        <span className="text-neutral-500 text-sm">/{plan.billing_cycle}</span>
                                      </div>
                                    </div>
                                    <div className="flex-1 space-y-3 mb-6">
                                      {plan.features?.slice(0, 4).map((feature: string, i: number) => (
                                        <div key={i} className="flex items-start gap-2 text-sm text-neutral-400">
                                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                          <span>{feature}</span>
                                        </div>
                                      ))}
                                    </div>
                                    <div className={`mt-auto py-3 rounded-xl text-center font-bold text-sm transition-colors ${selected ? 'bg-[#F24C20] text-white' : 'bg-neutral-800 text-neutral-400 group-hover:bg-neutral-700'}`}>
                                      {selected ? 'Selected' : 'Choose Plan'}
                                    </div>
                                  </motion.button>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800 text-center">
                              <p className="text-neutral-400">No specific plans found for this role. Defaulting to standard free trial.</p>
                            </div>
                          )}
                        </div>
                      )}

                      {(step.type === 'single-selection' || step.type === 'multi-selection') && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {step.options.map((opt: any) => {
                            const Icon = IconMap[opt.icon];
                            const selected = isSelected(opt.value);
                            return (
                              <motion.button
                                key={opt.value}
                                onClick={() => handleSelect(opt.value)}
                                whileHover={{ scale: 1.02, x: 10 }}
                                whileTap={{ scale: 0.98 }}
                                className={`relative p-6 rounded-2xl border-2 transition-all text-left flex items-center gap-6 group bg-gradient-to-r from-[#F24C20]/3 via-transparent to-[#F24C20]/3 ${selected
                                  ? 'border-[#F24C20] bg-[#F24C20]/10'
                                  : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700'
                                  }`}
                              >
                                <div className="flex-shrink-0 w-16 flex justify-center">
                                  {opt.emoji ? <span className="text-6xl leading-none">{opt.emoji}</span> : Icon ? <Icon className={`w-12 h-12 ${selected ? 'text-[#F24C20]' : 'text-neutral-400'}`} /> : <div className="w-14 h-14 rounded-xl bg-neutral-800 flex items-center justify-center font-bold text-neutral-500">{opt.label[0]}</div>}
                                </div>
                                <div className="flex-1 flex items-center justify-between">
                                  <h4 className="text-xl font-bold text-white">{opt.label}</h4>
                                  <AnimatePresence mode="wait">
                                    {selected && (
                                      <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.8, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                      >
                                        <AnimatedCheck />
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              </motion.button>
                            );
                          })}
                        </div>
                      )}


                      {step.type === 'input' && step.field === 'location' && (
                        <div className="space-y-2">
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
                        <div className="space-y-3">
                          <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-neutral-300">{step.label}</label>
                          <input
                            type="text"
                            value={data[step.field as keyof RegistrationData] as string}
                            onChange={(e) => updateData(step.field as keyof RegistrationData, e.target.value)}
                            placeholder={step.title}
                            className="w-full rounded-xl border-2 border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#F24C20] transition-colors"
                          />
                        </div>
                      )}

                      {step.type === 'account-creation' && (
                        <div className="space-y-5">
                          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div>
                              <label className="mb-1.5 block text-xs font-medium text-neutral-200">Full Name</label>
                              <div className="relative">
                                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                                <input
                                  type="text"
                                  value={data.fullName}
                                  onChange={(e) => updateData('fullName', e.target.value)}
                                  placeholder="Enter full name"
                                  className="w-full rounded-xl border-2 border-neutral-800 bg-neutral-950 py-3 pl-10 pr-4 text-sm text-white placeholder:text-[11px] placeholder:font-normal placeholder:text-neutral-500 focus:outline-none focus:border-[#F24C20] transition-colors"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="mb-1.5 block text-xs font-medium text-neutral-200">Password</label>
                              <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                                <input
                                  type={showPassword ? "text" : "password"}
                                  value={data.password}
                                  onChange={(e) => updateData('password', e.target.value)}
                                  placeholder="Min. 8 characters"
                                  className={`w-full rounded-xl border-2 bg-neutral-950 py-3 pl-10 pr-10 text-sm text-white placeholder:text-[11px] placeholder:font-normal placeholder:text-neutral-500 focus:outline-none transition-colors ${data.password && data.password.length < 8 ? 'border-red-500/50 focus:border-red-500' : 'border-neutral-800 focus:border-[#F24C20]'}`}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
                                >
                                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              </div>
                              {data.password && data.password.length < 8 && (
                                <p className="mt-1 text-xs text-red-400">Password must be at least 8 characters</p>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div>
                              <PhoneNumberField
                                label="WhatsApp Number"
                                codeValue={data.whatsappCountryCode}
                                onCodeChange={(value) => updateData('whatsappCountryCode', value)}
                                numberValue={data.whatsappNumber}
                                onNumberChange={(value) => updateData('whatsappNumber', value)}
                                placeholder="Enter WhatsApp number"
                                error={data.whatsappNumber ? whatsappNumberError : ''}
                              />
                              {/* <p className="mt-2 text-xs text-neutral-500">Country code and number are mandatory.</p> */}
                            </div>

                            <div>
                              <PhoneNumberField
                                label="Business or Alternative Number (Optional)"
                                codeValue={data.businessOrAlternativeCountryCode}
                                onCodeChange={(value) => updateData('businessOrAlternativeCountryCode', value)}
                                numberValue={data.businessOrAlternativeNumber}
                                onNumberChange={(value) => updateData('businessOrAlternativeNumber', value)}
                                placeholder="Enter business or alternative number"
                                error={data.businessOrAlternativeNumber ? businessNumberError : ''}
                              />
                              {/* <p className="mt-2 text-xs text-neutral-500">Country code and number are mandatory.</p> */}
                            </div>
                          </div>

                          <div>
                            <label className="mb-1.5 block text-xs font-medium text-neutral-200">Email Address</label>
                            <div className="relative">
                              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                              <input
                                type="email"
                                value={data.email}
                                onChange={(e) => updateData('email', e.target.value.toLowerCase())}
                                placeholder="small-letters@example.com"
                                className={`w-full rounded-xl border-2 bg-neutral-950 py-3 pl-10 pr-4 text-sm text-white placeholder:text-[11px] placeholder:font-normal placeholder:text-neutral-500 focus:outline-none transition-colors ${data.email && !/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(data.email) ? 'border-red-500/50 focus:border-red-500' : 'border-neutral-800 focus:border-[#F24C20]'}`}
                              />
                            </div>
                            <p className="mt-1.5 text-[11px] text-neutral-500">We'll send a verification link to this email.</p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Navigation Buttons */}
            <div className="sticky bottom-0 z-10 mt-5 flex items-center justify-between border-t border-neutral-800 bg-neutral-950/50 pt-5 backdrop-blur-sm">
              <button
                onClick={prevStep}
                disabled={currentStep === 1 || loadingSteps}
                className="group flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 px-5 py-2.5 text-sm text-white transition-all hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                <span>Back</span>
              </button>

              <div className="flex items-center gap-4">
                {currentStep < totalSteps ? (
                  <button
                    onClick={nextStep}
                    disabled={!canProceed() || loadingSteps}
                    className="group flex items-center gap-2 rounded-xl bg-[#F24C20] px-8 py-2.5 text-sm font-semibold text-white transition-all shadow-lg shadow-[#F24C20]/20 hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span>Next Step</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                ) : (
                  <button
                    onClick={handleComplete}
                    disabled={!canProceed() || loadingSteps}
                    className="group flex items-center gap-2 rounded-xl bg-green-600 px-8 py-2.5 text-sm font-semibold text-white transition-all shadow-lg shadow-green-600/20 hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Sparkles className="h-4 w-4 animate-pulse" />
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
