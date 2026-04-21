import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Briefcase,
  Mail,
  Home,
  Award,
  CheckCircle,
  MapPin,
  IndianRupee,
  Star,
  Clock,
  MessageCircle,
  ExternalLink,
  Link as LinkIcon,
  ChevronRight,
  Send,
  Loader2,
  AlertCircle,
  ShieldCheck,
  Lock,
  Globe,
  X,
  Share2,
  Linkedin,
  Github,
  Twitter,
  Instagram,
  Facebook,
  Youtube,
  Dribbble
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { getImgUrl } from '@/app/utils/api';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { toast } from 'sonner';
import Header from '@/app/components/Header';
import { CreditUnlockModal } from '@/app/components/subscription/CreditUnlockModal';

const maskEmail = (email?: string) => {
  if (!email || !email.includes('@')) return 'hidden@protected.com';
  const [localPart, domain] = email.split('@');
  const domainParts = domain.split('.');
  const domainName = domainParts[0] || 'protected';
  const extension = domainParts.slice(1).join('.') || 'com';

  const visibleLocal = localPart.slice(0, Math.min(2, localPart.length));
  const visibleDomain = domainName.slice(0, Math.min(2, domainName.length));

  return `${visibleLocal}${'•'.repeat(Math.max(localPart.length - visibleLocal.length, 4))}@${visibleDomain}${'•'.repeat(Math.max(domainName.length - visibleDomain.length, 3))}.${extension}`;
};

const maskText = (value?: string, fallback = 'Protected') => {
  if (!value) return fallback;
  const words = value.split(/\s+/).filter(Boolean);
  if (words.length === 0) return fallback;

  return words
    .map((word) => {
      const visible = word.slice(0, Math.min(2, word.length));
      return `${visible}${'•'.repeat(Math.max(word.length - visible.length, 2))}`;
    })
    .join(' ');
};

export default function FreelancerLandingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<'home' | 'about' | 'portfolio' | 'contact' | 'chat'>('home');
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSending, setIsSending] = useState(false);
  const [talent, setTalent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);
  const [initialMessage, setInitialMessage] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [selectedPortfolioItem, setSelectedPortfolioItem] = useState<any | null>(null);
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockReason, setUnlockReason] = useState<'portfolio' | 'chat'>('portfolio');

  useEffect(() => {
    fetchTalentDetails();
  }, [id]);

  useEffect(() => {
    if (talent) {
      document.title = `${talent.full_name} | Professional Portfolio - Go Experts`;

      // Meta tags for SEO & Social Sharing
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', talent.bio || `Professional portfolio of ${talent.full_name} on Go Experts.`);
      }

      // OpenGraph
      const updateOrCreateMeta = (property: string, content: string) => {
        let meta = document.querySelector(`meta[property="${property}"]`);
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('property', property);
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
      };

      updateOrCreateMeta('og:title', `${talent.full_name} - ${talent.role_title || 'Expert Freelancer'}`);
      updateOrCreateMeta('og:description', talent.bio?.slice(0, 160) || `Check out my professional portfolio on Go Experts.`);
      updateOrCreateMeta('og:image', getImgUrl(talent.profile_image));
      updateOrCreateMeta('og:type', 'profile');
    }
  }, [talent]);

  const fetchTalentDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/users/freelancers/${id}`);
      if (res.data.success) {
        const talentData = res.data.data;
        setTalent(talentData);

        // Fetch current user and unlock status
        try {
          const meRes = await api.get('/auth/me', { skipAuthRedirect: true, skipToast: true } as any);
          if (meRes.data.success) {
            const me = meRes.data.user;
            setCurrentUser(me);

            // If viewing own profile, it's always unlocked
            if (me._id === talentData._id) {
              setIsUnlocked(true);
            } else {
              // Check if already unlocked
              const unlockRes = await api.get(`/subscription/is-unlocked/${talentData._id}`, { skipAuthRedirect: true, skipToast: true } as any);
              if (unlockRes.data.success) {
                setIsUnlocked(unlockRes.data.isUnlocked);
              }
            }
          }
        } catch (innerErr: any) {
          if (innerErr.response?.status === 401) {
            toast.error('Please register to review portfolio');
            navigate('/signin');
            return;
          }
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Profile not found');
    } finally {
      setLoading(false);
    }
  };

  const promptUnlock = (reason: 'portfolio' | 'chat') => {
    if (!currentUser) {
      toast.error('Please sign in to unlock this profile');
      navigate('/signin');
      return;
    }
    setUnlockReason(reason);
    setShowUnlockModal(true);
  };

  const handleUnlockSuccess = () => {
    setIsUnlocked(true);
    setShowUnlockModal(false);
    if (unlockReason === 'chat') {
      setIsChatDrawerOpen(true);
      setActiveSection('chat');
    }
  };

  const handleHireMeNow = () => {
    if (!isUnlocked) {
      promptUnlock('chat');
      return;
    }
    setActiveSection('chat');
    setIsChatDrawerOpen(true);
  };

  if (loading) return <div className="min-h-screen bg-[#0b0b0b] flex items-center justify-center"><Loader2 className="animate-spin text-[#F24C20] w-12 h-12" /></div>;
  if (error || !talent) return <div className="min-h-screen bg-[#0b0b0b] flex flex-col items-center justify-center p-6 text-center"><AlertCircle className="text-red-500 w-16 h-16 mb-4" /><h1 className="text-white text-2xl font-bold">{error}</h1><button onClick={() => navigate('/talent')} className="mt-6 px-8 py-3 bg-[#F24C20] rounded-full font-bold">Back to Talent</button></div>;

  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'about', icon: User, label: 'About' },
    { id: 'portfolio', icon: Briefcase, label: 'Portfolio' },
    { id: 'contact', icon: Mail, label: 'Contact' },
    {
      id: 'chat',
      icon: MessageCircle,
      label: 'Chat',
      action: () => {
        if (!isUnlocked) {
          promptUnlock('chat');
          return;
        }
        setActiveSection('chat');
        setIsChatDrawerOpen(true);
      }
    },
  ];

  const activeSocials = [
    { icon: Linkedin, url: talent?.social_links?.linkedin, label: 'LinkedIn' },
    { icon: Github, url: talent?.social_links?.github, label: 'GitHub' },
    { icon: Dribbble, url: talent?.social_links?.dribbble, label: 'Dribbble' },
    { icon: Twitter, url: talent?.social_links?.twitter, label: 'Twitter' },
    { icon: Instagram, url: talent?.social_links?.instagram, label: 'Instagram' },
    { icon: Facebook, url: talent?.social_links?.facebook, label: 'Facebook' },
    { icon: Youtube, url: talent?.social_links?.youtube, label: 'YouTube' }
  ].filter(s => s.url);
  const maskedEmail = maskEmail(talent?.email);
  const maskedLocation = maskText(talent?.location, 'Remote •••••');

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white font-['Outfit',sans-serif] overflow-hidden selection:bg-[#F24C20] selection:text-white">
      {/* Global Header */}
      <Header />

      {/* Background Static Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#F24C20] filter blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#F24C20] filter blur-[150px] rounded-full opacity-50" />
      </div>

      {/* Navigation Desktop */}
      <nav className="fixed right-8 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col gap-5">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              if ('action' in item && item.action) {
                item.action();
                return;
              }
              setActiveSection(item.id as any);
            }}
            className={`group relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${activeSection === item.id ? 'bg-[#F24C20]' : 'bg-[#2b2b2b] hover:bg-[#F24C20]'
              }`}
          >
            <item.icon className="relative z-10 w-5 h-5 text-white" />
            <span className="absolute right-0 top-0 h-full px-8 bg-[#F24C20] rounded-full flex items-center text-xs font-black uppercase tracking-widest text-white opacity-0 group-hover:opacity-100 group-hover:-translate-x-0 translate-x-full transition-all duration-500 pointer-events-none -z-10 overflow-hidden pr-16">
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      {/* Navigation Mobile */}
      <nav className="fixed bottom-0 left-0 w-full bg-[#111] border-t border-white/5 z-50 flex lg:hidden justify-around p-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              if ('action' in item && item.action) {
                item.action();
                return;
              }
              setActiveSection(item.id as any);
            }}
            className={`flex flex-col items-center gap-1 ${activeSection === item.id ? 'text-[#F24C20]' : 'text-neutral-500'
              }`}
          >
            <item.icon className="w-6 h-6" />
            <span className="text-[10px] uppercase font-bold">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Main Content Sections */}
      <main className="relative z-10 w-full h-screen overflow-y-auto overflow-x-hidden scroll-smooth pt-24 lg:pt-32">
        <AnimatePresence mode="wait">
          {activeSection === 'home' && (
            <motion.section
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="relative min-h-[calc(100vh-6rem)] lg:min-h-[calc(100vh-8rem)] w-full overflow-hidden"
            >
              <div
                className="fixed top-0 left-0 w-full h-full bg-[#0b0b0b] z-[-2]"
              />
              <div
                className="fixed top-0 left-0 w-full h-full opacity-30 lg:opacity-40 z-[-1]"
                style={{
                  backgroundImage: talent.landing_page_image ? `url(${getImgUrl(talent.landing_page_image)})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: 'grayscale(50%) contrast(1.2)'
                }}
              />
              <div
                className="fixed top-0 left-0 w-1/3 h-full bg-[#F24C20] hidden lg:block"
                style={{
                  clipPath: 'polygon(0 0, 100% 0, 25% 100%, 0% 100%)',
                  zIndex: -1
                }}
              />

              <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-20 pt-6 pb-32 lg:py-0 min-h-[calc(100vh-6rem)] lg:min-h-[calc(100vh-8rem)] flex items-center">
                <div className="w-full grid grid-cols-1 lg:grid-cols-[minmax(320px,420px)_72px_minmax(0,1fr)] items-center gap-8 lg:gap-10 xl:gap-14 pr-0 lg:pr-24">
                  <div className="w-full flex justify-center lg:justify-start z-10 order-1">
                    <div className="relative w-72 h-80 sm:w-80 sm:h-[26rem] lg:w-[420px] lg:h-[580px] overflow-hidden rounded-[2.5rem] shadow-2xl bg-[#111] border-4 border-white/5">
                      <ImageWithFallback
                        src={getImgUrl(talent.profile_image)}
                        alt={talent.full_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="hidden lg:flex h-full items-center justify-center z-10 order-2">
                    {activeSocials.length > 0 ? (
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-px h-20 bg-gradient-to-b from-transparent via-white/25 to-white/10" />
                        {activeSocials.map((social, idx) => (
                          <div key={idx} className="relative group">
                            <a
                              href={social.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center relative overflow-hidden transition-colors duration-300 group-hover:border-[#F24C20]"
                              title={social.label}
                            >
                              <div className="absolute top-0 left-0 w-full h-0 bg-[#F24C20] group-hover:h-full transition-all duration-300 ease-out z-0" />
                              <social.icon className="w-5 h-5 text-white relative z-10 transition-transform duration-300 group-hover:scale-110" />
                            </a>
                          </div>
                        ))}
                        <div className="w-px h-20 bg-gradient-to-t from-transparent via-white/25 to-white/10" />
                      </div>
                    ) : null}
                  </div>

                  {/* Hero Content */}
                  <div className="w-full text-center lg:text-left z-10 space-y-5 lg:space-y-6 order-3 min-w-0">
                    <div className="flex flex-col gap-5 mb-4 lg:mb-6">
                      <div className="flex flex-wrap items-center justify-center gap-3 lg:hidden w-full opacity-90">
                        {activeSocials.map((social, idx) => (
                          <div key={idx} className="relative group">
                            <a
                              href={social.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center relative overflow-hidden transition-colors duration-300 group-hover:border-[#F24C20]"
                              title={social.label}
                            >
                              <div className="absolute top-0 left-0 w-full h-0 bg-[#F24C20] group-hover:h-full transition-all duration-300 ease-out z-0" />
                              <social.icon className="w-4 h-4 text-white relative z-10 transition-transform duration-300 group-hover:scale-110" />
                            </a>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 justify-center lg:justify-start">
                        <div className="flex items-center gap-2 px-4 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-green-500">Available For Hire</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-1.5 bg-[#F24C20]/10 border border-[#F24C20]/20 rounded-full">
                          <IndianRupee className="w-3 h-3 text-[#F24C20]" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#F24C20]">Starts from ₹{talent.hourly_rate || '1200'}</span>
                        </div>
                      </div>
                    </div>

                    <h1 className="flex flex-col mb-4 lg:mb-6">
                      <span className="text-lg sm:text-xl lg:text-3xl font-black text-white uppercase tracking-widest mb-3 lg:mb-4 flex items-center justify-center lg:justify-start gap-4">
                        <span className="w-10 h-[4px] bg-[#F24C20]" />
                        I'm <span className="text-[#F24C20]">{talent.full_name}.</span>
                      </span>
                      <span className="text-4xl sm:text-5xl lg:text-7xl font-black uppercase text-white leading-[1.05] break-words">
                        {talent.role_title || 'Expert Professional'}
                      </span>
                    </h1>

                    <p className="text-neutral-300 text-sm sm:text-base lg:text-[0.95rem] xl:text-lg leading-6 lg:leading-7 mb-8 lg:mb-10 max-w-none xl:max-w-[58rem] mx-auto lg:mx-0 break-words">
                      {talent.bio || 'I am a passionate freelancer dedicated to delivering high-quality work and exceeding client expectations.'}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 lg:gap-6 w-full sm:w-auto max-w-sm mx-auto lg:mx-0">
                      <button
                        onClick={() => setActiveSection('about')}
                        className="group relative flex h-14 w-full sm:w-[270px] items-center bg-transparent border-2 border-[#F24C20] rounded-full font-black uppercase text-sm tracking-[0.12em] overflow-hidden transition-all duration-300"
                      >
                        <span className="relative z-10 flex-1 pl-8 pr-16 whitespace-nowrap text-left group-hover:text-white transition-colors duration-300">
                          More About Me
                        </span>
                        <div className="absolute top-0 right-0 h-full w-14 bg-[#F24C20] rounded-full flex items-center justify-center z-20 transition-transform group-hover:scale-110">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="absolute inset-0 bg-[#F24C20] translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-300 z-0" />
                      </button>

                      <button
                        onClick={handleHireMeNow}
                        className="group relative flex h-14 w-full sm:w-[240px] items-center bg-[#F24C20] rounded-full font-black uppercase text-sm tracking-[0.12em] overflow-hidden transition-all duration-300 shadow-lg shadow-[#F24C20]/20 hover:scale-105"
                      >
                        <span className="flex-1 pl-8 pr-16 whitespace-nowrap text-left text-white">
                          Hire Me Now
                        </span>
                        <div className="absolute top-0 right-0 h-full w-14 bg-black/10 rounded-full flex items-center justify-center">
                          <Send className="w-5 h-5 text-white" />
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {activeSection === 'about' && (
            <motion.section
              key="about"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="max-w-7xl mx-auto px-6 pt-20 pb-32 lg:py-32"
            >
              <div className="text-center mb-20 relative">
                <h2 className="text-6xl lg:text-9xl font-black text-white/5 uppercase select-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full">Resume</h2>
                <h3 className="text-4xl lg:text-5xl font-black uppercase relative z-10">About <span className="text-[#F24C20]">Me</span></h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
                <div>
                  <h4 className="text-2xl font-bold mb-8 uppercase tracking-widest">Personal Infos</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 text-neutral-400">
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-widest opacity-50 p-0 m-0">Full Name</span>
                      <span className="text-white font-bold">{talent.full_name}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-widest opacity-50 p-0 m-0">Role</span>
                      <span className="text-white font-bold">{talent.role_title || 'Expert'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-widest opacity-50 p-0 m-0">Experience</span>
                      <span className="text-white font-bold capitalize">{talent.experience_level || 'Pro'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-widest opacity-50 p-0 m-0">Freelance</span>
                      <span className="text-green-400 font-bold">{talent.availability || 'Available'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-widest opacity-50 p-0 m-0">Address</span>
                      <span className="text-white font-bold">{talent.location || 'Remote'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-widest opacity-50 p-0 m-0">Languages</span>
                      <span className="text-white font-bold">{talent.languages?.join(', ') || 'English, Hindi'}</span>
                    </div>
                  </div>


                </div>

                <div className="grid grid-cols-2 gap-6">
                  {[
                    { label: 'Years Experience', value: talent.experience_level === 'senior' ? '10+' : (talent.experience_level === 'intermediate' ? '5+' : '2+') },
                    { label: 'Completed Projects', value: (talent.completed_projects || 10) + '+' },
                    { label: 'Happy Customers', value: (talent.happy_customers || 20) + '+' },
                    { label: 'Review Score', value: talent.review_score > 0 ? talent.review_score.toFixed(1) : '-' },
                  ].map((stat, i) => (
                    <div key={i} className="p-8 border border-white/10 rounded-3xl hover:border-[#F24C20]/30 transition-colors">
                      <div className="text-4xl lg:text-5xl font-black text-[#F24C20] mb-2">{stat.value}</div>
                      <div className="text-xs lg:text-sm uppercase tracking-widest text-neutral-400 leading-tight" style={{ whiteSpace: 'pre-line' }}>{stat.label.replace(' ', '\n')}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills Section */}
              {talent.skills?.length > 0 && (
                <div className="mb-24">
                  <h4 className="text-2xl font-bold mb-12 text-center uppercase tracking-widest">My Skills</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {talent.skills.slice(0, 8).map((skill: any, i: number) => (
                      <div key={i} className="flex flex-col items-center">
                        <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full border-4 border-[#F24C20] flex items-center justify-center mb-4 relative bg-white/5">
                          <span className="text-lg lg:text-xl font-bold">95%</span>
                        </div>
                        <span className="uppercase text-[10px] lg:text-xs font-bold tracking-widest text-neutral-300 text-center">{typeof skill === 'object' ? skill.name : skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                <div>
                  <h4 className="text-2xl font-bold mb-12 uppercase tracking-widest">Experience</h4>
                  <div className="space-y-12 border-l border-white/5 pl-8 relative">
                    {talent.experience_details?.length > 0 ? talent.experience_details.map((exp: any, i: number) => (
                      <div key={i} className="relative">
                        <div className="absolute -left-[41px] top-0 w-10 h-10 rounded-full bg-[#F24C20] flex items-center justify-center">
                          <Briefcase className="w-5 h-5" />
                        </div>
                        <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4 inline-block">{exp.year_range}</span>
                        <h5 className="text-lg font-bold uppercase mb-2">{exp.title} <span className="opacity-40 ml-2">| {exp.company}</span></h5>
                        <p className="text-neutral-500 text-sm">{exp.description}</p>
                      </div>
                    )) : (
                      <div className="relative">
                        <div className="absolute -left-[41px] top-0 w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center">
                          <Briefcase className="w-5 h-5 text-neutral-500" />
                        </div>
                        <p className="text-neutral-500">No experience details shared yet.</p>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-2xl font-bold mb-12 uppercase tracking-widest">Education</h4>
                  <div className="space-y-12 border-l border-white/5 pl-8 relative">
                    {talent.education_details?.length > 0 ? talent.education_details.map((edu: any, i: number) => (
                      <div key={i} className="relative">
                        <div className="absolute -left-[41px] top-0 w-10 h-10 rounded-full bg-[#F24C20] flex items-center justify-center">
                          <Award className="w-5 h-5" />
                        </div>
                        <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4 inline-block">{edu.year_range}</span>
                        <h5 className="text-lg font-bold uppercase mb-2">{edu.title} <span className="opacity-40 ml-2">| {edu.institution}</span></h5>
                        <p className="text-neutral-500 text-sm">{edu.description}</p>
                      </div>
                    )) : (
                      <div className="relative">
                        <div className="absolute -left-[41px] top-0 w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center">
                          <Award className="w-5 h-5 text-neutral-500" />
                        </div>
                        <p className="text-neutral-500">No education details shared yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {activeSection === 'portfolio' && (
            <motion.section
              key="portfolio"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-7xl mx-auto px-6 pt-20 pb-32 lg:py-32"
            >
              <div className="text-center mb-20 relative">
                <h2 className="text-6xl lg:text-9xl font-black text-white/5 uppercase select-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full">Works</h2>
                <h3 className="text-4xl lg:text-5xl font-black uppercase relative z-10">My <span className="text-[#F24C20]">Portfolio</span></h3>
              </div>

              {!isUnlocked ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-[3rem] border border-white/5 backdrop-blur-sm text-center px-6">
                  <Lock className="w-16 h-16 text-[#F24C20] mb-6 opacity-40" />
                  <h4 className="text-2xl font-black uppercase mb-3 text-white">Portfolio is Locked</h4>
                  <p className="text-neutral-500 max-w-md mx-auto mb-8">
                    To view project gallery and case studies, please unlock this freelancer's details using your subscription credits.
                  </p>
                    <button
                      onClick={() => promptUnlock('portfolio')}
                      className="px-10 py-4 bg-[#F24C20] text-white rounded-full font-bold uppercase tracking-widest text-sm shadow-xl shadow-[#F24C20]/20 hover:scale-105 transition-all flex items-center gap-3 disabled:opacity-50"
                    >
                      <ShieldCheck className="w-5 h-5 text-white" />
                      Unlock Full Profile
                    </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {talent.portfolio?.length > 0 ? (
                    talent.portfolio.map((item: any, pIdx: number) => {
                      const allImages = [
                        ...(item.image ? [item.image] : []),
                        ...(item.images || [])
                      ];

                      return (
                        <div key={pIdx} className="group relative flex flex-col bg-neutral-900/50 rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-[#F24C20]/30 transition-all duration-500">
                          {/* Image Slider Wrapper */}
                          <div className="relative aspect-[4/3] overflow-hidden">
                            <AnimatePresence mode="wait">
                              <motion.div
                                key={`${pIdx}-img`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="w-full h-full"
                              >
                                <ImageWithFallback
                                  src={getImgUrl(allImages[0] || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80')}
                                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                  alt={item.title}
                                />
                              </motion.div>
                            </AnimatePresence>

                            {/* Badge for multiple images */}
                            {allImages.length > 1 && (
                              <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-white/10">
                                <Share2 className="w-3 h-3 text-[#F24C20]" />
                                {allImages.length} Shots
                              </div>
                            )}

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-8 translate-y-4 group-hover:translate-y-0">
                              <div className="flex gap-3 mb-4">
                                {item.links?.map((link: string, lIdx: number) => (
                                  <a
                                    key={lIdx}
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-10 h-10 rounded-full bg-[#F24C20] flex items-center justify-center hover:bg-white hover:text-[#F24C20] transition-colors"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                ))}
                              </div>
                              <button
                                onClick={() => {
                                  setSelectedPortfolioItem(item);
                                  setIsPortfolioModalOpen(true);
                                  setCurrentImageIndex(0);
                                }}
                                className="w-full py-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-[#F24C20] hover:border-[#F24C20] transition-all"
                              >
                                View Full Case Study
                              </button>
                            </div>
                          </div>

                          {/* Content Wrapper */}
                          <div className="p-8">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-xl font-black uppercase text-white truncate">{item.title}</h4>
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#F24C20] px-2 py-0.5 bg-[#F24C20]/10 rounded-md">
                                  {item.duration_days > 0 ? `${item.duration_days} Days` : 'Fixed'}
                                </span>
                              </div>
                            </div>
                            <p className="text-neutral-500 text-sm leading-relaxed line-clamp-2 font-medium">{item.description}</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-[2rem]">
                      <Briefcase className="w-16 h-16 text-neutral-700 mx-auto mb-4" />
                      <p className="text-neutral-500">No project works shared yet.</p>
                    </div>
                  )}
                </div>
              )}
            </motion.section>
          )}

          {activeSection === 'contact' && (
            <motion.section
              key="contact"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="max-w-7xl mx-auto px-6 pt-20 pb-32 lg:py-32"
            >
              <div className="text-center mb-20 relative">
                <h2 className="text-6xl lg:text-9xl font-black text-white/5 uppercase select-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full">Contact</h2>
                <h3 className="text-4xl lg:text-5xl font-black uppercase relative z-10">Get In <span className="text-[#F24C20]">Touch With Talent</span></h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                <div className="lg:col-span-1 border-r border-white/5 pr-8">
                  <h4 className="text-2xl font-bold mb-8 uppercase tracking-widest">Don't be shy !</h4>
                  <p className="text-neutral-500 mb-8 leading-relaxed">Feel free to get in touch with me. I am always open to discussing new projects, creative ideas or opportunities to be part of your visions.</p>

                  <div className="space-y-8">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-[#F24C20] border border-white/5">
                        <Mail className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-xs uppercase text-neutral-500 tracking-widest mb-1">Mail Me</div>
                        <div className="font-bold text-lg">
                          {isUnlocked ? (talent.email || 'Contact via Platform') : maskedEmail}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-[#F24C20] border border-white/5">
                        <MapPin className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-xs uppercase text-neutral-500 tracking-widest mb-1">Location</div>
                        <div className="font-bold text-lg">{isUnlocked ? (talent.location || 'Remote, World') : maskedLocation}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-[#F24C20] border border-white/5">
                        <Clock className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-xs uppercase text-neutral-500 tracking-widest mb-1">Response Time</div>
                        <div className="font-bold text-lg">Within 24 Hours</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2">
                  {!isUnlocked ? (
                    <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[2rem] p-10 text-center">
                      <Lock className="w-12 h-12 text-[#F24C20] mb-4 opacity-40" />
                      <h5 className="text-xl font-bold uppercase mb-2">Message feature is locked</h5>
                      <p className="text-sm text-neutral-500 mb-6">Unlock this freelancer's profile to send them a direct email inquiry.</p>
                        <button
                          onClick={() => promptUnlock('chat')}
                          className="px-8 py-3 bg-[#F24C20] text-white rounded-full font-bold uppercase text-xs tracking-widest"
                        >
                          Unlock to Contact
                        </button>
                    </div>
                  ) : (
                    <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={async (e) => {
                      e.preventDefault();
                      if (isSending) return;
                      setIsSending(true);
                      try {
                        const res = await api.post('/contact/freelancer', {
                          freelancerId: talent._id,
                          ...formData
                        });
                        if (res.data.success) {
                          toast.success('Your message has been sent successfully!');
                          setFormData({ name: '', email: '', subject: '', message: '' });
                        }
                      } catch (err: any) {
                        toast.error(err.response?.data?.message || 'Failed to send message');
                      } finally {
                        setIsSending(false);
                      }
                    }}>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="YOUR NAME"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full bg-[#212121] border border-transparent rounded-full px-8 py-4 text-sm focus:border-[#F24C20] focus:ring-1 focus:ring-[#F24C20] outline-none transition-all" required />
                      </div>
                      <div className="relative">
                        <input
                          type="email"
                          placeholder="YOUR EMAIL"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full bg-[#212121] border border-transparent rounded-full px-8 py-4 text-sm focus:border-[#F24C20] focus:ring-1 focus:ring-[#F24C20] outline-none transition-all" required />
                      </div>
                      <div className="md:col-span-2">
                        <input
                          type="text"
                          placeholder="YOUR SUBJECT"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          className="w-full bg-[#212121] border border-transparent rounded-full px-8 py-4 text-sm focus:border-[#F24C20] focus:ring-1 focus:ring-[#F24C20] outline-none transition-all" required />
                      </div>
                      <div className="md:col-span-2">
                        <textarea
                          placeholder="YOUR MESSAGE"
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          className="w-full bg-[#212121] border border-transparent rounded-[2rem] px-8 py-6 text-sm focus:border-[#F24C20] focus:ring-1 focus:ring-[#F24C20] outline-none transition-all h-60 resize-none" required></textarea>
                      </div>
                      <div className="md:col-span-2">
                        <button
                          type="submit"
                          disabled={isSending}
                          className="group px-10 py-4 bg-[#F24C20] text-white rounded-full font-bold uppercase tracking-widest text-sm flex items-center gap-4 hover:bg-white hover:text-black transition-all disabled:opacity-50"
                        >
                          {isSending ? 'Sending...' : 'Send Message'}
                          <div className="w-10 h-10 bg-black/10 rounded-full flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                            <Send className="w-5 h-5" />
                          </div>
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>
      {/* Portfolio Item Modal */}
      <AnimatePresence>
        {isPortfolioModalOpen && selectedPortfolioItem && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPortfolioModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-4 lg:p-12"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#111] w-full max-w-6xl max-h-full overflow-y-auto rounded-[3rem] border border-white/10 shadow-2xl relative custom-scrollbar"
              >
                <button
                  onClick={() => setIsPortfolioModalOpen(false)}
                  className="absolute top-8 right-8 w-12 h-12 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full flex items-center justify-center text-white z-10 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2">
                  {/* Image Gallery Slider */}
                  <div className="p-8 lg:p-12 space-y-6">
                    <div className="relative aspect-video rounded-[2rem] overflow-hidden border border-white/10 bg-neutral-900 shadow-2xl group/slider">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentImageIndex}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="w-full h-full"
                        >
                          <ImageWithFallback
                            src={getImgUrl(selectedPortfolioItem.images?.[currentImageIndex] || selectedPortfolioItem.image)}
                            className="w-full h-full object-cover"
                            alt={`${selectedPortfolioItem.title} - Image ${currentImageIndex + 1}`}
                          />
                        </motion.div>
                      </AnimatePresence>

                      {/* Navigation Controls */}
                      {selectedPortfolioItem.images?.length > 1 && (
                        <>
                          <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between items-center z-10 opacity-0 group-hover/slider:opacity-100 transition-opacity">
                            <button
                              onClick={() => setCurrentImageIndex(prev => (prev === 0 ? selectedPortfolioItem.images.length - 1 : prev - 1))}
                              className="w-12 h-12 bg-black/60 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-[#F24C20] transition-all"
                            >
                              <ChevronRight className="w-6 h-6 rotate-180" />
                            </button>
                            <button
                              onClick={() => setCurrentImageIndex(prev => (prev === selectedPortfolioItem.images.length - 1 ? 0 : prev + 1))}
                              className="w-12 h-12 bg-black/60 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-[#F24C20] transition-all"
                            >
                              <ChevronRight className="w-6 h-6" />
                            </button>
                          </div>

                          {/* Dots / Counter */}
                          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                            {selectedPortfolioItem.images.map((_: any, idx: number) => (
                              <button
                                key={idx}
                                onClick={() => setCurrentImageIndex(idx)}
                                className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? 'bg-[#F24C20] w-6' : 'bg-white/30 hover:bg-white/50'}`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Thumbnails */}
                    {selectedPortfolioItem.images?.length > 1 && (
                      <div className="grid grid-cols-4 gap-4">
                        {selectedPortfolioItem.images.map((img: string, idx: number) => (
                          <div
                            key={idx}
                            onClick={() => setCurrentImageIndex(idx)}
                            className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${idx === currentImageIndex ? 'border-[#F24C20] scale-[0.98]' : 'border-white/10 grayscale hover:grayscale-0 hover:border-white/30'}`}
                          >
                            <ImageWithFallback src={getImgUrl(img)} className="w-full h-full object-cover" alt="Thumbnail" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-8 lg:p-12 lg:pl-0 flex flex-col justify-center">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                        <span className="text-xs font-black uppercase tracking-widest text-[#F24C20]">
                          {selectedPortfolioItem.duration_days > 0 ? `${selectedPortfolioItem.duration_days} Days Duration` : 'Flexible Duration'}
                        </span>
                      </div>
                      {selectedPortfolioItem.completion_date && (
                        <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                          <span className="text-xs font-black uppercase tracking-widest text-neutral-400">
                            Completed {new Date(selectedPortfolioItem.completion_date).getFullYear()}
                          </span>
                        </div>
                      )}
                    </div>

                    <h3 className="text-4xl lg:text-6xl font-black uppercase text-white mb-8 leading-tight">
                      {selectedPortfolioItem.title}
                    </h3>

                    <div className="prose prose-invert max-w-none mb-12">
                      <p className="text-neutral-400 text-lg leading-relaxed whitespace-pre-wrap font-medium">
                        {selectedPortfolioItem.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-4">
                      {selectedPortfolioItem.links?.map((link: string, idx: number) => (
                        <a
                          key={idx}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 px-8 py-4 bg-[#F24C20] hover:bg-orange-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl shadow-[#F24C20]/20"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Visit Project
                        </a>
                      ))}
                      <button
                        onClick={() => setIsPortfolioModalOpen(false)}
                        className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all"
                      >
                        Back to Portfolio
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <CreditUnlockModal
        isOpen={showUnlockModal && !!talent?._id}
        onClose={() => setShowUnlockModal(false)}
        targetId={talent?._id || ''}
        targetType="freelancer"
        onUnlocked={handleUnlockSuccess}
        customTitle={unlockReason === 'chat' ? 'Unlock Chat Access' : 'Unlock Portfolio Access'}
        customDescription={
          unlockReason === 'chat'
            ? `To chat or use Hire Me Now with ${talent?.full_name || 'this freelancer'}, 1 credit will be deducted from your balance. After unlock, you will be redirected into your dashboard messages.`
            : `To view the full portfolio and case studies of ${talent?.full_name || 'this freelancer'}, 1 credit will be deducted from your balance.`
        }
        confirmLabel={unlockReason === 'chat' ? 'Unlock Chat for 1 Credit' : 'Unlock Portfolio for 1 Credit'}
      />

      {/* Chat Aside Drawer */}
      <AnimatePresence>
        {isChatDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsChatDrawerOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full sm:w-[450px] bg-[#111] border-l border-white/10 z-[101] shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#161616]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#F24C20]">
                    <ImageWithFallback src={getImgUrl(talent.profile_image)} alt={talent.full_name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-black uppercase text-sm">{talent.full_name}</h4>
                    <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Typically replies in 24h</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsChatDrawerOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-full text-neutral-500 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="bg-[#F24C20]/5 border border-[#F24C20]/10 rounded-2xl p-6">
                  <MessageCircle className="w-8 h-8 text-[#F24C20] mb-4" />
                  <h5 className="text-sm font-bold uppercase mb-2">Instant Inquiry</h5>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Start a conversation with {talent.full_name.split(' ')[0]} directly. Your message will be sent to their dashboard and email.
                  </p>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] uppercase font-black tracking-widest text-neutral-500">Your Message</label>
                  <textarea
                    value={initialMessage}
                    onChange={(e) => setInitialMessage(e.target.value)}
                    placeholder={`Hi ${talent.full_name.split(' ')[0]}, I'm interested in working with you...`}
                    className="w-full h-40 bg-[#161616] border border-white/10 rounded-2xl p-6 text-sm outline-none focus:border-[#F24C20] transition-all resize-none"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-white/5 bg-[#161616]">
                <button
                  disabled={isSendingChat || !initialMessage.trim()}
                  onClick={async () => {
                    setIsSendingChat(true);
                    try {
                      const res = await api.post('/messages', {
                        receiverId: talent._id,
                        content: initialMessage,
                        intent: 'hire'
                      });
                      if (res.data.success) {
                        toast.success('Message sent! You can continue in your dashboard.');
                        setIsChatDrawerOpen(false);
                        setInitialMessage('');
                        navigate(`/dashboard/messages?user=${talent._id}`);
                      }
                    } catch (err: any) {
                      toast.error(err.response?.data?.message || 'Failed to send message');
                    } finally {
                      setIsSendingChat(false);
                    }
                  }}
                  className="w-full py-4 bg-[#F24C20] rounded-xl font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale"
                >
                  {isSendingChat ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {isSendingChat ? 'Sending...' : 'Send Message Now'}
                </button>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <ShieldCheck className="w-3 h-3 text-neutral-600" />
                  <span className="text-[9px] uppercase font-bold text-neutral-600">Secure Professional Communication</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
