import { motion } from 'motion/react';
import { Briefcase, Code, Laptop, MessageCircle, MapPin, ArrowRight } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

export default function HeroSection() {
  const navigate = useNavigate();
  const [searchType, setSearchType] = useState<'sellers' | 'buyers'>('sellers');
  const [searchTerm, setSearchTerm] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
        });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await api.get('/cms/banners');
        if (res.data.success) {
          // Filter for active hero banners
          const heroBanners = res.data.banners.filter((b: any) => b.is_active && b.position === 'hero');
          setBanners(heroBanners);
        }
      } catch (err) {
        console.error('Failed to fetch banners:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  // Use dynamic banner if available, otherwise fallback to hardcoded
  const activeBanner = banners[0] || {
    title: 'The Future of Freelancing',
    subtitle: 'Connect with world-class talent and build the future of work. Verified. Secure. Revolutionary.',
    link_text: 'Search',
    link_url: '#'
  };

  const floatingIcons = [
    { Icon: Laptop, x: 10, y: 20, delay: 0 },
    { Icon: Code, x: 85, y: 15, delay: 0.2 },
    { Icon: Briefcase, x: 15, y: 70, delay: 0.4 },
    { Icon: MessageCircle, x: 80, y: 75, delay: 0.6 },
    { Icon: MapPin, x: 50, y: 85, delay: 0.8 },
  ];

  const [skills, setSkills] = useState<any[]>([]);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await api.get('/cms/skills');
        if (res.data.success) {
          const activeSkills = res.data.skills.filter((s: any) => s.is_active).slice(0, 5);
          if (activeSkills.length > 0) {
            setSkills(activeSkills.map((s: any) => s.name));
          } else {
            setSkills(['AI Engineer', 'UI/UX Design', 'Blockchain', 'React Developer', 'Content Writer']);
          }
        }
      } catch (err) {
        console.error('Failed to fetch skills:', err);
        setSkills(['AI Engineer', 'UI/UX Design', 'Blockchain', 'React Developer', 'Content Writer']);
      }
    };
    fetchSkills();
  }, []);

  const handleSearch = (e?: React.FormEvent, overrideTerm?: string) => {
    if (e) e.preventDefault();
    const finalTerm = (overrideTerm || searchTerm).trim();
    if (!finalTerm && !overrideTerm) return;

    if (searchType === 'sellers') {
      navigate(`/talent?search=${encodeURIComponent(finalTerm)}`);
    } else {
      navigate(`/projects?search=${encodeURIComponent(finalTerm)}`);
    }
  };

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at top, #1a0a0a 0%, #0a0505 50%, #000000 100%)',
      }}
    >
      {/* Background Image if available */}
      {activeBanner.image_url && (
        <div className="absolute inset-0 z-0">
          <img
            src={activeBanner.image_url}
            alt="Hero Background"
            className="w-full h-full object-cover opacity-20 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
      )}

      {/* Dark Mesh Background with Glow */}
      <div className="absolute inset-0">
        {/* Primary Color Glow */}
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, #F24C20 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Mesh Pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(242, 76, 32, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(242, 76, 32, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />

        {/* Noise Texture */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
          }}
        />

        {/* Radial Spotlights */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-radial from-[#F24C20]/20 to-transparent blur-3xl rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-radial from-orange-800/20 to-transparent blur-3xl rounded-full" />
      </div>

      {/* Floating Vector Icons with Parallax */}
      {floatingIcons.map(({ Icon, x, y, delay }, index) => (
        <motion.div
          key={index}
          className="absolute hidden lg:block"
          style={{
            left: `${x}%`,
            top: `${y}%`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.1, 1],
            x: (mousePosition.x - 0.5) * 30,
            y: (mousePosition.y - 0.5) * 30,
          }}
          transition={{
            opacity: { duration: 4, delay, repeat: Infinity, ease: 'easeInOut' },
            scale: { duration: 4, delay, repeat: Infinity, ease: 'easeInOut' },
            x: { duration: 0.5, ease: 'easeOut' },
            y: { duration: 0.5, ease: 'easeOut' },
          }}
        >
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#F24C20]/10 to-transparent border border-[#F24C20]/20 backdrop-blur-sm">
            <Icon className="w-8 h-8 text-[#F24C20]" />
          </div>
        </motion.div>
      ))}

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#F24C20]/10 border border-[#F24C20]/30 mb-8 backdrop-blur-sm"
        >
          <div className="w-2 h-2 bg-[#F24C20] rounded-full animate-pulse" />
          <span className="text-sm font-medium text-neutral-300">
            Trusted by 50,000+ professionals worldwide
          </span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="text-6xl md:text-8xl font-bold mb-8 leading-tight"
        >
          <span className="block text-white mb-2">
            {activeBanner.title.split(' ').slice(0, -1).join(' ')}{' '}
            <span className="relative inline-block">
              <span className="text-[#F24C20]">{activeBanner.title.split(' ').pop()}</span>
              <motion.svg
                className="absolute -bottom-2 left-0 w-full h-3"
                viewBox="0 0 300 12"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 2, delay: 1.2, ease: 'easeInOut' }}
              >
                <motion.path
                  d="M0,6 Q75,0 150,6 T300,6"
                  stroke="#F24C20"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                />
              </motion.svg>
            </span>
          </span>
        </motion.h1>

        {/* Animated Subtitle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="text-xl md:text-2xl text-neutral-400 mb-16 max-w-4xl mx-auto"
        >
          {activeBanner.subtitle}
        </motion.div>

        {/* Search Interface */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.6 }}
          className="max-w-4xl mx-auto mb-16"
        >
          <div className="relative group">
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#F24C20]/50 to-orange-600/50 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000" />

            <form 
              onSubmit={handleSearch}
              className="relative flex flex-col md:flex-row items-stretch gap-3 p-3 bg-neutral-900/90 backdrop-blur-xl rounded-3xl border border-neutral-800"
            >
              {/* Type Selector */}
              <div className="flex gap-2 p-1.5 bg-black/40 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setSearchType('sellers')}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${searchType === 'sellers'
                    ? 'bg-[#044071] text-white shadow-lg shadow-[#044071]/50'
                    : 'text-neutral-400 hover:text-white'
                    }`}
                >
                  Find Talent
                </button>
                <button
                  type="button"
                  onClick={() => setSearchType('buyers')}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${searchType === 'buyers'
                    ? 'bg-[#044071] text-white shadow-lg shadow-[#044071]/50'
                    : 'text-neutral-400 hover:text-white'
                    }`}
                >
                  Find Projects
                </button>
              </div>

              {/* Search Input */}
              <div className="flex-1 flex items-center px-6">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={
                    searchType === 'sellers'
                      ? 'Search for experts, skills, or services...'
                      : 'Search for projects, ventures, or opportunities...'
                  }
                  className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-neutral-500 text-lg"
                />
              </div>

              {/* Search Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="px-8 py-3 bg-[#044071] hover:bg-[#055a99] text-white rounded-2xl font-semibold transition-all duration-300 flex items-center gap-2 group"
              >
                <span>Search</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </form>
          </div>

          {/* Popular Tags */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="flex flex-wrap items-center justify-center gap-3 mt-6"
          >
            <span className="text-sm text-neutral-500">Trending:</span>
            {skills.map(
              (tag, i) => (
                <motion.button
                  key={tag}
                  type="button"
                  onClick={() => handleSearch(undefined, tag)}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 2 + i * 0.1 }}
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="px-4 py-2 text-sm bg-neutral-800/50 hover:bg-[#F24C20]/20 border border-neutral-700 hover:border-[#F24C20]/50 rounded-full text-neutral-300 hover:text-[#F24C20] transition-all duration-300"
                >
                  {tag}
                </motion.button>
              )
            )}
          </motion.div>
        </motion.div>

        {/* Central Illustration / Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, filter: 'blur(20px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1.2, delay: 2.2 }}
          className="relative max-w-5xl mx-auto"
        >
          {/* Abstract Freelancing Scene */}
          <div className="relative">
            {/* Center Orb */}
            <motion.div
              className="mx-auto w-64 h-64 rounded-full relative"
              animate={{
                boxShadow: [
                  '0 0 60px 20px rgba(242, 76, 32, 0.3)',
                  '0 0 100px 40px rgba(242, 76, 32, 0.5)',
                  '0 0 60px 20px rgba(242, 76, 32, 0.3)',
                ],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <div
                className="w-full h-full rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(242, 76, 32, 0.4) 0%, rgba(242, 76, 32, 0.1) 50%, transparent 100%)',
                }}
              />

              {/* Orbiting Elements */}
              {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                <motion.div
                  key={i}
                  className="absolute top-1/2 left-1/2 w-4 h-4"
                  style={{
                    transformOrigin: '0 0',
                  }}
                  animate={{
                    rotate: [angle, angle + 360],
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: 'linear',
                    delay: i * 0.5,
                  }}
                >
                  <div className="w-4 h-4 rounded-full bg-[#F24C20] shadow-lg shadow-[#F24C20]/50"
                    style={{ marginLeft: '140px' }} />
                </motion.div>
              ))}

              {/* Center Icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Briefcase className="w-16 h-16 text-[#F24C20]" />
              </div>
            </motion.div>

            {/* Connection Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ top: '-50%', left: '-50%', width: '200%', height: '200%' }}>
              {[...Array(8)].map((_, i) => {
                const angle = (i * 45 * Math.PI) / 180;
                const x1 = 50;
                const y1 = 50;
                const x2 = 50 + Math.cos(angle) * 40;
                const y2 = 50 + Math.sin(angle) * 40;

                return (
                  <motion.line
                    key={i}
                    x1={`${x1}%`}
                    y1={`${y1}%`}
                    x2={`${x2}%`}
                    y2={`${y2}%`}
                    stroke="#F24C20"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    opacity="0.2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{
                      duration: 2,
                      delay: 2.5 + i * 0.1,
                      repeat: Infinity,
                      repeatType: 'reverse',
                    }}
                  />
                );
              })}
            </svg>
          </div>
        </motion.div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
    </section>
  );
}