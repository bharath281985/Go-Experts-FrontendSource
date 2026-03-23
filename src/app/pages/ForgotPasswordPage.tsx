import { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';
import logo from '@/assets/0772c85ef8b5349a958c92c3b3261c8a881ce229.png';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await api.post('/auth/forgot-password', { email });
            if (response.data.success) {
                setIsSent(true);
                toast.success('Reset link sent to your email!');
            }
        } catch (error: any) {
            console.error('Forgot password error:', error);
            // Errors are handled by api interceptor
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-8 bg-neutral-950">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <Link to="/signin" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to sign in
                </Link>

                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <img src={logo} alt="Go Experts" className="h-10 w-auto brightness-0 invert" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2 text-white">Reset Password</h1>
                    <p className="text-neutral-400">
                        {isSent
                            ? "Check your email for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder."
                            : "Enter your email address and we'll send you a link to reset your password."}
                    </p>
                </div>

                {!isSent ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-neutral-300">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="enter mail"
                                    required
                                    className="w-full pl-12 pr-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#F24C20] transition-colors"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-[#044071] hover:bg-[#055a99] text-white rounded-xl font-semibold transition-all shadow-lg shadow-[#044071]/30 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Sending Link...
                                </>
                            ) : (
                                'Send Reset Link'
                            )}
                        </button>
                    </form>
                ) : (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 text-center">
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Email Sent!</h3>
                        <p className="text-neutral-400 mb-6">
                            We've sent a password reset link to <span className="text-white font-medium">{email}</span>
                        </p>
                        <button
                            onClick={() => setIsSent(false)}
                            className="text-[#F24C20] hover:text-orange-500 font-medium transition-colors"
                        >
                            Didn't receive the email? Try again
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
