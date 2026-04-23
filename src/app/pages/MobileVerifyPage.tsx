import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle, XCircle, Loader2, Mail, smartphone } from 'lucide-react';
import api from '../utils/api';

export default function MobileVerifyPage() {
    const { token } = useParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verifying your email for mobile app...');

    useEffect(() => {
        const verify = async () => {
            try {
                const response = await api.get(`/auth/verify-email/${token}`);
                if (response.data.success) {
                    setStatus('success');
                    setMessage('Your email has been verified successfully!');
                }
            } catch (error: any) {
                setStatus('error');
                setMessage(error.response?.data?.message || 'Verification failed. The link may be invalid or expired.');
            }
        };

        if (token) {
            verify();
        }
    }, [token]);

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 text-white font-sans">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#F24C20]/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative w-full max-w-md p-10 rounded-3xl bg-neutral-900 border border-neutral-800 text-center shadow-2xl"
            >
                <div className="mb-8 flex justify-center">
                    {status === 'loading' && <Loader2 className="w-16 h-16 text-[#F24C20] animate-spin" />}
                    {status === 'success' && (
                        <div className="p-4 bg-green-500/10 rounded-full">
                            <CheckCircle className="w-16 h-16 text-green-500" />
                        </div>
                    )}
                    {status === 'error' && (
                        <div className="p-4 bg-red-500/10 rounded-full">
                            <XCircle className="w-16 h-16 text-red-500" />
                        </div>
                    )}
                </div>

                <h1 className="text-2xl font-bold mb-4">
                    {status === 'loading' ? 'Verifying Link...' : status === 'success' ? 'Verification Success!' : 'Verification Failed'}
                </h1>

                <p className="text-neutral-400 mb-8 leading-relaxed">
                    {message}
                </p>

                {status === 'success' && (
                    <div className="mt-8 pt-8 border-t border-neutral-800">
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <div className="p-3 bg-neutral-800 rounded-2xl">
                                <Mail className="w-6 h-6 text-[#F24C20]" />
                            </div>
                            <div className="h-px w-8 bg-neutral-700" />
                            <div className="p-3 bg-neutral-800 rounded-2xl">
                                <smartphone className="w-6 h-6 text-green-500" />
                            </div>
                        </div>
                        <p className="text-white font-semibold text-lg mb-2">Instructions:</p>
                        <ul className="text-sm text-neutral-400 space-y-2 text-left list-disc list-inside px-4">
                            <li>You can now safely close this browser tab.</li>
                            <li>Open the <b>Go Experts Mobile App</b> on your phone.</li>
                            <li>Log in with your email and password.</li>
                        </ul>
                    </div>
                )}

                {status === 'error' && (
                    <Link
                        to="/contact"
                        className="inline-block px-8 py-3 rounded-xl bg-neutral-800 text-white font-medium hover:bg-neutral-700 transition-all"
                    >
                        Contact Support
                    </Link>
                )}
            </motion.div>
        </div>
    );
}
