import { useState } from 'react';
import { useSiteSettings } from '../context/SiteSettingsContext';
import logoFallback from '@/assets/0772c85ef8b5349a958c92c3b3261c8a881ce229.png';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';

export default function SignInPage() {
  const { site_logo } = useSiteSettings();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const logoUrl = site_logo ? (site_logo.startsWith('http') ? site_logo : `${apiUrl}${site_logo}`) : logoFallback;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      if (response.data.success) {
        const user = response.data.user;
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userName', user.full_name);

        // Redirect based on redirect param or primary role
        const params = new URLSearchParams(window.location.search);
        const redirectTo = params.get('redirect');

        if (redirectTo) {
          navigate(redirectTo);
        } else if (user.roles?.includes('investor')) {
          localStorage.setItem('userType', 'investor');
          navigate('/dashboard-investor');
        } else if (user.roles?.includes('startup_creator')) {
          localStorage.setItem('userType', 'startup_creator');
          navigate('/dashboard-startup');
        } else {
          // Set initial userType for marketplace roles
          const currentType = localStorage.getItem('userType');
          if (!currentType) {
            if (user.roles?.includes('freelancer')) {
              localStorage.setItem('userType', 'freelancer');
            } else {
              localStorage.setItem('userType', 'client');
            }
          }
          navigate('/dashboard');
        }
      }
    } catch (error: any) {
      const status = error?.response?.status;
      const message = error?.response?.data?.message;

      // Handle "email not verified" case — store token so resend-verification API works
      if (status === 403 && message?.includes('verify')) {
        const errorUser = error?.response?.data?.user;
        const errorToken = error?.response?.data?.token;
        if (errorToken) localStorage.setItem('token', errorToken);
        if (errorUser) {
          localStorage.setItem('user', JSON.stringify(errorUser));
          localStorage.setItem('isLoggedIn', 'true');
        }
        toast.error('Please verify your email first. Check your inbox or request a new link.');
        if (errorUser?.roles?.includes('investor')) {
          navigate('/dashboard-investor');
        } else if (errorUser?.roles?.includes('startup_creator')) {
          navigate('/dashboard-startup');
        } else {
          navigate('/dashboard');
        }
      } else {
        toast.error(message || 'Invalid email or password');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-neutral-950">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <img src={logoUrl} alt="Go Experts" className="h-10 w-auto brightness-0 invert" />
            </div>
            <h1 className="text-3xl font-bold mb-2 text-white">Welcome back</h1>
            <p className="text-neutral-400">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-300">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.toLowerCase())}
                  placeholder="enter mail"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#F24C20] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="w-full pl-12 pr-12 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#F24C20] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-neutral-700 text-[#F24C20] focus:ring-[#F24C20]" />
                <span className="text-sm text-neutral-400">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-[#F24C20] hover:text-[#F24C20]/80 transition-colors">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#044071] hover:bg-[#055a99] text-white rounded-xl font-semibold transition-all shadow-lg shadow-[#044071]/30 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="text-center text-neutral-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#F24C20] hover:text-[#F24C20]/80 transition-colors font-medium">
              Sign up
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Illustration */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden lg:flex flex-1 items-center justify-center p-8 bg-gradient-to-br from-[#F24C20]/10 to-orange-600/5 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[linear-gradient(rgba(242,76,32,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(242,76,32,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />
        <div className="relative z-10 text-center">
          <div className="text-8xl mb-8">🚀</div>
          <h2 className="text-3xl font-bold mb-4 text-white">Start Your Journey</h2>
          <p className="text-xl text-neutral-400 max-w-md">
            Join thousands of professionals finding success on Go Experts
          </p>
        </div>
      </motion.div>
    </div>
  );
}