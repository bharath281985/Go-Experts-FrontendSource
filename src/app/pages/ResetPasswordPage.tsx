import { useState } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Lock, ArrowLeft, Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';
import logo from '@/assets/0772c85ef8b5349a958c92c3b3261c8a881ce229.png';

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const { token } = useParams();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);

        try {
            const response = await api.put(`/auth/reset-password/${token}`, { password });
            if (response.data.success) {
                setIsSuccess(true);
                toast.success('Password reset successfully!');
                setTimeout(() => {
                    navigate('/signin');
                }, 3000);
            }
        } catch (error: any) {
            console.error('Reset password error:', error);
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
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <img src={logo} alt="Go Experts" className="h-10 w-auto brightness-0 invert" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2 text-white">Choose new password</h1>
                    <p className="text-neutral-400">
                        Create a new password that is at least 6 characters long.
                    </p>
                </div>

                {!isSuccess ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-neutral-300">New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Minimum 6 characters"
                                    required
                                    className="w-full pl-12 pr-12 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#F24C20] transition-colors"
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

                        <div>
                            <label className="block text-sm font-medium mb-2 text-neutral-300">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
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
                                    Resetting Password...
                                </>
                            ) : (
                                'Reset Password'
                            )}
                        </button>
                    </form>
                ) : (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-8 text-center">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-white mb-2">Success!</h3>
                        <p className="text-neutral-400 mb-6">
                            Your password has been reset successfully. Redirecting you to sign in...
                        </p>
                        <Link
                            to="/signin"
                            className="inline-block py-3 px-8 bg-[#F24C20] text-white rounded-xl font-semibold transition-all hover:bg-orange-600"
                        >
                            Go to Sign In
                        </Link>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
