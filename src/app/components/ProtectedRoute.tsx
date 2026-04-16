import { Navigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, ArrowRight, Loader2, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import api from '../utils/api';
import { toast } from 'sonner';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[]; // Optional: list of roles allowed to access this route
}

/**
 * ProtectedRoute — Guards any route behind:
 *   1. Authentication (token + user in localStorage)
 *   2. Email verification (is_email_verified = true)
 *   3. Role-based Authorization (if allowedRoles is provided)
 *
 * If not logged in → redirect to /signin
 * If logged in but email not verified → show "verify your email" screen
 * If unauthorized role → redirect to their respective dashboard home
 * If all good → render children
 */
export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const location = useLocation();
    const [resending, setResending] = useState(false);
    const [resent, setResent] = useState(false);

    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    // Not logged in at all — Guests can view everything else, but not this.
    if (!token || !userStr) {
        return <Navigate to="/signin" state={{ from: location }} replace />;
    }

    let user: any = null;
    try {
        user = JSON.parse(userStr);
    } catch {
        return <Navigate to="/signin" replace />;
    }

    // Role-based restriction
    if (allowedRoles && allowedRoles.length > 0) {
        const userRoles = user?.roles || [user?.role];
        const hasAccess = allowedRoles.some(role => userRoles.includes(role));

        if (!hasAccess) {
            // Redirect to their default dashboard based on their role
            const primaryRole = user?.role || (user?.roles ? user.roles[0] : null);
            let redirectPath = '/dashboard';
            
            if (primaryRole === 'investor') redirectPath = '/dashboard-investor';
            else if (primaryRole === 'startup_creator') redirectPath = '/dashboard-startup';
            else if (primaryRole === 'client') redirectPath = '/dashboard';
            else if (primaryRole === 'freelancer') redirectPath = '/dashboard';

            toast.error("You are not authorized to access this section.");
            return <Navigate to={redirectPath} replace />;
        }
    }

    // Logged in but email not verified
    if (!user?.is_email_verified) {
        const handleResend = async () => {
            setResending(true);
            try {
                await api.post('/auth/resend-verification');
                setResent(true);
                toast.success('Verification email resent! Check your inbox.');
            } catch (err: any) {
                toast.error(err?.response?.data?.message || 'Failed to resend. Please try again.');
            } finally {
                setResending(false);
            }
        };

        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-6">
                {/* Ambient glow */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#F24C20]/10 rounded-full blur-[120px]" />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative w-full max-w-md text-center"
                >
                    {/* Icon */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                        className="w-24 h-24 rounded-full bg-[#F24C20]/10 border-2 border-[#F24C20]/30 flex items-center justify-center mx-auto mb-8"
                    >
                        <Mail className="w-12 h-12 text-[#F24C20]" />
                    </motion.div>

                    <h1 className="text-3xl font-bold text-white mb-3">Verify Your Email</h1>
                    <p className="text-neutral-400 mb-2 text-lg leading-relaxed">
                        We sent a verification link to:
                    </p>
                    <p className="text-white font-semibold text-lg mb-8 px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl inline-block">
                        {user?.email || 'your email'}
                    </p>

                    <div className="space-y-3 mb-8">
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-neutral-900 border border-neutral-800 text-left">
                            <div className="w-8 h-8 rounded-full bg-[#F24C20]/10 flex items-center justify-center flex-shrink-0">
                                <span className="text-[#F24C20] font-bold text-sm">1</span>
                            </div>
                            <p className="text-neutral-300 text-sm">Check your inbox (and spam folder)</p>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-neutral-900 border border-neutral-800 text-left">
                            <div className="w-8 h-8 rounded-full bg-[#F24C20]/10 flex items-center justify-center flex-shrink-0">
                                <span className="text-[#F24C20] font-bold text-sm">2</span>
                            </div>
                            <p className="text-neutral-300 text-sm">Click the "Verify Email Address" button in the email</p>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-neutral-900 border border-neutral-800 text-left">
                            <div className="w-8 h-8 rounded-full bg-[#F24C20]/10 flex items-center justify-center flex-shrink-0">
                                <span className="text-[#F24C20] font-bold text-sm">3</span>
                            </div>
                            <p className="text-neutral-300 text-sm">Return here and refresh the page to access your dashboard</p>
                        </div>
                    </div>

                    {/* Resend Button */}
                    {!resent ? (
                        <button
                            onClick={handleResend}
                            disabled={resending}
                            className="w-full py-4 rounded-xl bg-[#F24C20] hover:bg-[#d43a12] text-white font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-[#F24C20]/20"
                        >
                            {resending ? (
                                <><Loader2 className="w-5 h-5 animate-spin" /> Sending...</>
                            ) : (
                                <><Mail className="w-5 h-5" /> Resend Verification Email</>
                            )}
                        </button>
                    ) : (
                        <div className="w-full py-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 font-semibold flex items-center justify-center gap-2">
                            <Mail className="w-5 h-5" /> Email resent! Check your inbox.
                        </div>
                    )}

                    {/* Refresh after verifying */}
                    <button
                        onClick={async () => {
                            try {
                                const res = await api.get('/auth/me');
                                if (res.data.success) {
                                    localStorage.setItem('user', JSON.stringify(res.data.user));
                                    if (res.data.user.is_email_verified) {
                                        toast.success('Email verification confirmed!');
                                        window.location.reload();
                                    } else {
                                        toast.error("Email is still not verified. Please check your inbox.");
                                    }
                                }
                            } catch (error) {
                                console.error('Failed to sync profile status:', error);
                                toast.error('Error verifying status. Please refresh the page manually.');
                            }
                        }}
                        className="mt-4 w-full py-4 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 font-semibold transition-all flex items-center justify-center gap-2"
                    >
                        <ArrowRight className="w-5 h-5" /> I've verified — Take me to dashboard
                    </button>

                    <p className="mt-6 text-xs text-neutral-600">
                        Wrong account?{' '}
                        <button
                            onClick={() => {
                                localStorage.clear();
                                window.location.href = '/signin';
                            }}
                            className="text-[#F24C20] hover:underline"
                        >
                            Sign out
                        </button>
                    </p>
                </motion.div>
            </div>
        );
    }

    // All checks passed — render the protected content
    return <>{children}</>;
}
