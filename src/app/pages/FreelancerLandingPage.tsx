import { useState, useEffect, useMemo } from 'react';
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
  ExternalLink,
  Link as LinkIcon,
  ChevronRight,
  Send,
  Loader2,
  AlertCircle,
  ShieldCheck,
  Lock,
  Globe,
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

const ACCENT_COLOR = '#F24C20';

const Typewriter = ({ text }: { text: string }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text]);

  return (
    <span>
      {displayText}
      <span className="animate-pulse border-r-2 border-[#F24C20] ml-1"></span>
    </span>
  );
};

export default function FreelancerLandingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<'home'|'about'|'works'|'contact'>('home');
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSending, setIsSending] = useState(false);
  const [talent, setTalent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

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
        const meRes = await api.get('/auth/me');
        if (meRes.data.success) {
          const me = meRes.data.user;
          setCurrentUser(me);
          
          // If viewing own profile, it's always unlocked
          if (me._id === talentData._id) {
            setIsUnlocked(true);
          } else {
            // Check if already unlocked
            const unlockRes = await api.get(`/subscription/is-unlocked/${talentData._id}`);
            if (unlockRes.data.success) {
               setIsUnlocked(unlockRes.data.isUnlocked);
            }
          }
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Profile not found');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockProfile = async () => {
    if (!currentUser) {
      toast.error('Please sign in to unlock this profile');
      navigate('/signin');
      return;
    }

    setUnlocking(true);
    try {
      const res = await api.post('/subscription/unlock', {
        targetId: talent._id,
        targetType: 'freelancer'
      });
      if (res.data.success) {
        toast.success(res.data.message);
        setIsUnlocked(true);
        // Refresh talent list/points if needed
      }
    } catch (err: any) {
      if (err.response?.data?.type === 'PLAN_EXPIRED' || err.response?.data?.type === 'OUT_OF_CREDITS') {
        toast.error(err.response.data.message, {
          action: {
            label: 'Upgrade',
            onClick: () => navigate('/dashboard/subscription')
          }
        });
      } else {
        toast.error(err.response?.data?.message || 'Failed to unlock profile');
      }
    } finally {
      setUnlocking(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#0b0b0b] flex items-center justify-center"><Loader2 className="animate-spin text-[#F24C20] w-12 h-12" /></div>;
  if (error || !talent) return <div className="min-h-screen bg-[#0b0b0b] flex flex-col items-center justify-center p-6 text-center"><AlertCircle className="text-red-500 w-16 h-16 mb-4" /><h1 className="text-white text-2xl font-bold">{error}</h1><button onClick={() => navigate('/talent')} className="mt-6 px-8 py-3 bg-[#F24C20] rounded-full font-bold">Back to Talent</button></div>;

  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'about', icon: User, label: 'About' },
    { id: 'portfolio', icon: Briefcase, label: 'Portfolio' },
    { id: 'contact', icon: Mail, label: 'Contact' },
  ];

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
            onClick={() => setActiveSection(item.id as any)}
            className={`group relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
              activeSection === item.id ? 'bg-[#F24C20]' : 'bg-[#2b2b2b] hover:bg-[#F24C20]'
            }`}
          >
            <item.icon className="relative z-10 w-5 h-5 text-white" />
            <span className="absolute right-0 top-0 h-full px-8 bg-[#F24C20] rounded-full flex items-center text-xs font-black uppercase tracking-widest text-white opacity-0 group-hover:opacity-100 group-hover:-translate-x-0 translate-x-full transition-all duration-300 pointer-events-none -z-10 overflow-hidden pr-16">
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
            onClick={() => setActiveSection(item.id as any)}
            className={`flex flex-col items-center gap-1 ${
              activeSection === item.id ? 'text-[#F24C20]' : 'text-neutral-500'
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
              className="relative min-h-screen w-full flex flex-col lg:flex-row items-center overflow-hidden"
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

              <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center w-full px-6 lg:px-12 py-12 lg:py-0">
                  <div className="w-full lg:w-[40%] flex justify-center lg:justify-start mb-12 lg:mb-0 z-10">
                    <div className="relative w-72 h-80 lg:w-[420px] lg:h-[580px] overflow-hidden rounded-[2.5rem] shadow-2xl bg-[#111] border-4 border-white/5">
                      <ImageWithFallback
                        src={getImgUrl(talent.profile_image)}
                        alt={talent.full_name}
                        className="w-full h-full object-cover"
                      />
                   </div>
                </div>
                   {/* Hero Content */}
                 <div className="w-full lg:w-[60%] lg:pl-16 text-center lg:text-left z-10 space-y-6">
                   <div className="flex flex-col gap-6 mb-6">
                      {/* Horizontal Social Links with Accent Lines */}
                      <div className="flex items-center gap-4 justify-center lg:justify-start w-full opacity-90 mb-4">
                         {/* Static Line Left */}
                         <div className="hidden lg:flex items-center">
                           <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                           <div className="w-16 h-[1px] bg-white/20" />
                         </div>
                         
                         <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                            {(() => {
                               const activeSocials = [
                                 { icon: Linkedin, url: talent.social_links?.linkedin, label: 'LinkedIn' },
                                 { icon: Github, url: talent.social_links?.github, label: 'GitHub' },
                                 { icon: Dribbble, url: talent.social_links?.dribbble, label: 'Dribbble' },
                                 { icon: Twitter, url: talent.social_links?.twitter, label: 'Twitter' },
                                 { icon: Instagram, url: talent.social_links?.instagram, label: 'Instagram' },
                                 { icon: Facebook, url: talent.social_links?.facebook, label: 'Facebook' },
                                 { icon: Youtube, url: talent.social_links?.youtube, label: 'YouTube' }
                               ].filter(s => s.url);

                               if (activeSocials.length > 0) {
                                 return activeSocials.map((social, idx) => (
                                   <div key={idx} className="relative group">
                                     <a 
                                       href={social.url}
                                       target="_blank"
                                       rel="noopener noreferrer"
                                       className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center relative overflow-hidden transition-colors duration-300 group-hover:border-[#F24C20]"
                                       title={social.label}
                                     >
                                        {/* Fluid Fill Top → Bottom */}
                                        <div className="absolute top-0 left-0 w-full h-0 bg-[#F24C20] group-hover:h-full transition-all duration-300 ease-out z-0" />
                                        <social.icon className="w-5 h-5 text-white relative z-10 transition-transform duration-300 group-hover:scale-110" />
                                     </a>
                                   </div>
                                 ));
                               } else {
                                 return null;
                               }
                            })()}
                         </div>

                         {/* Static Line Right */}
                         <div className="hidden lg:flex items-center">
                           <div className="w-16 h-[1px] bg-gradient-to-r from-white/20 to-transparent" />
                         </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 justify-center lg:justify-start">
                        <div className="flex items-center gap-2 px-4 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-green-500">Available For Hire</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-1.5 bg-[#F24C20]/10 border border-[#F24C20]/20 rounded-full">
                          <IndianRupee className="w-3 h-3 text-[#F24C20]" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#F24C20]">Starting ₹{talent.hourly_rate || '1200'} / hr</span>
                        </div>
                      </div>
                   </div>

                  <h1 className="flex flex-col mb-6">
                     <span className="text-xl lg:text-3xl font-black text-white uppercase tracking-widest mb-4 flex items-center justify-center lg:justify-start gap-4">
                        <span className="w-10 h-[4px] bg-[#F24C20]" />
                        I'm <span className="text-[#F24C20]">{talent.full_name}.</span>
                     </span>
                     <span className="text-5xl lg:text-7xl font-black uppercase text-white leading-[1.1]">
                        {talent.role_title || 'Expert Professional'}
                     </span>
                  </h1>

                  <p className="text-neutral-300 text-lg leading-relaxed mb-10 max-w-xl mx-auto lg:mx-0">
                    {talent.bio || 'I am a passionate freelancer dedicated to delivering high-quality work and exceeding client expectations.'}
                  </p>

                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6">
                    <button 
                      onClick={() => setActiveSection('about')}
                      className="group relative h-14 pl-8 pr-20 bg-transparent border-2 border-[#F24C20] rounded-full font-black uppercase text-sm tracking-widest overflow-hidden transition-all duration-300"
                    >
                      <span className="relative z-10 group-hover:text-white transition-colors duration-300">More About Me</span>
                      <div className="absolute top-0 right-0 h-full w-14 bg-[#F24C20] rounded-full flex items-center justify-center z-20 transition-transform group-hover:scale-110">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="absolute inset-0 bg-[#F24C20] translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-300 z-0" />
                    </button>
   
                    <button 
                      onClick={() => navigate(`/dashboard/messages?user=${id}&intent=hire`)}
                      className="group relative h-14 pl-8 pr-20 bg-[#F24C20] rounded-full font-black uppercase text-sm tracking-widest overflow-hidden transition-all duration-300 shadow-lg shadow-[#F24C20]/20 hover:scale-105"
                    >
                      <span className="text-white">Hire Me Now</span>
                      <div className="absolute top-0 right-0 h-full w-14 bg-black/10 rounded-full flex items-center justify-center">
                        <Send className="w-5 h-5 text-white" />
                      </div>
                    </button>
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
              className="max-w-7xl mx-auto px-6 py-20 lg:py-32"
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
                      
                      <button 
                        onClick={() => navigate(`/talent/${id}`)}
                        className="group relative h-14 pl-8 pr-20 bg-[#F24C20] rounded-full font-black uppercase text-sm tracking-widest mt-12 overflow-hidden transition-all duration-300 hover:scale-105"
                      >
                         <span className="text-white">GoExperts Profile</span>
                         <div className="absolute top-0 right-0 h-full w-14 bg-black/10 rounded-full flex items-center justify-center">
                           <ChevronRight className="w-5 h-5 text-white" />
                         </div>
                      </button>
                   </div>

                   <div className="grid grid-cols-2 gap-6">
                       {[
                         { label: 'Years Experience', value: talent.experience_level === 'senior' ? '10+' : (talent.experience_level === 'intermediate' ? '5+' : '2+') },
                         { label: 'Completed Projects', value: (talent.completed_projects || 10) + '+' },
                         { label: 'Happy Customers', value: (talent.happy_customers || 20) + '+' },
                         { label: 'Review Score', value: talent.review_score || '4.9' },
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
              className="max-w-7xl mx-auto px-6 py-20 lg:py-32"
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
                         onClick={handleUnlockProfile}
                         disabled={unlocking}
                         className="px-10 py-4 bg-[#F24C20] text-white rounded-full font-bold uppercase tracking-widest text-sm shadow-xl shadow-[#F24C20]/20 hover:scale-105 transition-all flex items-center gap-3 disabled:opacity-50"
                       >
                          {unlocking ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : <ShieldCheck className="w-5 h-5 text-white" />}
                          {unlocking ? 'Unlocking...' : 'Unlock Full Profile'}
                       </button>
                    </div>
                 ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                       {talent.portfolio?.length > 0 ? (
                          talent.portfolio.map((item: any, i: number) => (
                            <div key={i} className="group relative aspect-[4/3] rounded-[2rem] overflow-hidden cursor-pointer bg-[#111]">
                               <ImageWithFallback 
                                  src={item.image || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80'} 
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                  alt={item.title} 
                               />
                               <div className="absolute inset-0 bg-[#F24C20]/95 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-full group-hover:translate-y-0 p-8 text-center text-white">
                                  <h4 className="text-xl font-black uppercase mb-2">{item.title}</h4>
                                  <p className="text-xs mb-6 opacity-90 line-clamp-3 font-medium">{item.description}</p>
                                  <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center">
                                     <LinkIcon className="w-5 h-5" />
                                  </div>
                               </div>
                            </div>
                          ))
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
              className="max-w-7xl mx-auto px-6 py-20 lg:py-32"
             >
                <div className="text-center mb-20 relative">
                   <h2 className="text-6xl lg:text-9xl font-black text-white/5 uppercase select-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full">Contact</h2>
                   <h3 className="text-4xl lg:text-5xl font-black uppercase relative z-10">Get In <span className="text-[#F24C20]">Touch</span></h3>
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
                                   {isUnlocked ? (talent.email || 'Contact via Platform') : '••••••••@••••.com'}
                               </div>
                            </div>
                         </div>
                         <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-[#F24C20] border border-white/5">
                               <MapPin className="w-6 h-6" />
                            </div>
                            <div>
                               <div className="text-xs uppercase text-neutral-500 tracking-widest mb-1">Location</div>
                               <div className="font-bold text-lg">{isUnlocked ? (talent.location || 'Remote, World') : '•••••••'}</div>
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
                             onClick={handleUnlockProfile}
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
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="w-full bg-[#212121] border border-transparent rounded-full px-8 py-4 text-sm focus:border-[#F24C20] focus:ring-1 focus:ring-[#F24C20] outline-none transition-all" required />
                           </div>
                           <div className="relative">
                              <input 
                                type="email" 
                                placeholder="YOUR EMAIL" 
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                className="w-full bg-[#212121] border border-transparent rounded-full px-8 py-4 text-sm focus:border-[#F24C20] focus:ring-1 focus:ring-[#F24C20] outline-none transition-all" required />
                           </div>
                           <div className="md:col-span-2">
                              <input 
                                type="text" 
                                placeholder="YOUR SUBJECT" 
                                value={formData.subject}
                                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                                className="w-full bg-[#212121] border border-transparent rounded-full px-8 py-4 text-sm focus:border-[#F24C20] focus:ring-1 focus:ring-[#F24C20] outline-none transition-all" required />
                           </div>
                           <div className="md:col-span-2">
                              <textarea 
                                placeholder="YOUR MESSAGE" 
                                value={formData.message}
                                onChange={(e) => setFormData({...formData, message: e.target.value})}
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
    </div>
  );
}
