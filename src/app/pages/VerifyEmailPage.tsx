import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle, XCircle, Loader2, ArrowRight, Mail } from 'lucide-react';
import api from '../utils/api';

export default function VerifyEmailPage() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verifying your email...');
    const [countdown, setCountdown] = useState(3);

    const queryParams = new URLSearchParams(window.location.search);
    const platform = queryParams.get('platform');

    useEffect(() => {
        const verify = async () => {
            try {
                const response = await api.get(`/auth/verify-email/${token}`);
                if (response.data.success) {
                    setStatus('success');
                    
                    if (platform === 'mobile') {
                        setMessage('Account Verified! You can now return to your mobile app and log in safely.');
                    } else {
                        setMessage(response.data.message);
                    }

                    // Mark email as verified in stored user object
                    const userStr = localStorage.getItem('user');


                    if (userStr) {
                        try {
                            const storedUser = JSON.parse(userStr);
                            storedUser.is_email_verified = true;
                            localStorage.setItem('user', JSON.stringify(storedUser));
                        } catch { /* ignore */ }
                    }

                    // If server returned fresh token/user, store them
                    if (response.data.token) {
                        localStorage.setItem('token', response.data.token);
                    }
                    if (response.data.user) {
                        localStorage.setItem('user', JSON.stringify(response.data.user));
                    }
                }
            } catch (error: any) {
                setStatus('error');
                setMessage(error.response?.data?.message || 'Verification failed. The link may be invalid or expired.');
            }
        };

        if (token) {
            verify();
        }
    }, [token, navigate]);

    useEffect(() => {
        if (status === 'success' && countdown > 0 && platform !== 'mobile') {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (status === 'success' && countdown === 0 && platform !== 'mobile') {
            handleTargetRedirect();
        }
    }, [status, countdown, navigate, platform]);


    const handleTargetRedirect = () => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                const role = user.role || (user.roles && user.roles[0]);

                // Use window.location.href for a full reload redirect to ensure fresh state (avoiding stale localStorage)
                if (role === 'investor') window.location.href = '/dashboard-investor';
                else if (role === 'startup_creator') window.location.href = '/dashboard-startup';
                else window.location.href = '/dashboard';
            } catch {
                navigate('/dashboard');
            }
        } else {
            navigate('/dashboard');
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#F24C20]/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative w-full max-w-md p-8 rounded-3xl bg-neutral-900/50 border border-neutral-800 backdrop-blur-xl text-center shadow-2xl"
            >
                <div className="mb-8 flex justify-center">
                    {status === 'loading' && (
                        <div className="relative">
                            <div className="absolute inset-0 bg-[#F24C20]/20 rounded-full blur-xl animate-pulse" />
                            <div className="relative w-20 h-20 rounded-full bg-neutral-800 flex items-center justify-center">
                                <Loader2 className="w-10 h-10 text-[#F24C20] animate-spin" />
                            </div>
                        </div>
                    )}
                    {status === 'success' && (
                        <div className="relative">
                            <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse" />
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="relative w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center"
                            >
                                <CheckCircle className="w-10 h-10 text-green-500" />
                            </motion.div>
                        </div>
                    )}
                    {status === 'error' && (
                        <div className="relative">
                            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-pulse" />
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="relative w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center"
                            >
                                <XCircle className="w-10 h-10 text-red-500" />
                            </motion.div>
                        </div>
                    )}
                </div>

                <h1 className="text-3xl font-bold text-white mb-4">
                    {status === 'loading' ? 'Verifying...' : status === 'success' ? 'Email Verified!' : 'Verification Failed'}
                </h1>

                <p className="text-neutral-400 mb-8 leading-relaxed">
                    {message}
                    {status === 'success' && platform !== 'mobile' && (
                        <span className="block mt-4 text-[#F24C20] font-semibold animate-pulse">
                            Redirecting to your dashboard in {countdown}s...
                        </span>
                    )}
                </p>


                <div className="space-y-4">
                    {status === 'success' ? (
                        platform === 'mobile' ? (
                            <div className="p-4 rounded-xl bg-neutral-800/50 border border-neutral-700 text-neutral-300 text-sm">
                                You can now close this tab and log in to the Go Experts app.
                            </div>
                        ) : (
                            <button
                                onClick={handleTargetRedirect}
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#F24C20] to-orange-600 text-white font-bold hover:shadow-lg hover:shadow-[#F24C20]/20 transition-all flex items-center justify-center gap-2 group"
                            >
                                Go to Dashboard
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        )
                    ) : status === 'error' ? (

                        <>
                            <Link
                                to="/signup"
                                className="block w-full py-4 rounded-xl bg-neutral-800 text-white font-bold hover:bg-neutral-700 transition-all"
                            >
                                Back to Sign Up
                            </Link>
                            <p className="text-xs text-neutral-500">
                                Need help? <Link to="/contact" className="text-[#F24C20] hover:underline">Contact Support</Link>
                            </p>
                        </>
                    ) : (
                        <div className="flex items-center justify-center gap-2 text-neutral-500">
                            <Mail className="w-4 h-4 animate-bounce" />
                            <span className="text-sm">Securing your account...</span>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
