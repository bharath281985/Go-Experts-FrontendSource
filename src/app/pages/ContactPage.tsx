import { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Mail, 
    Phone, 
    MapPin, 
    Send, 
    ShieldCheck, 
    CheckCircle, 
    AlertCircle, 
    Loader2, 
    Smartphone, 
    MessageSquare,
    Headphones
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../utils/api';
import { toast } from 'sonner';
import { SiteSettingsContext } from '../context/SiteSettingsContext';

export default function ContactPage() {
    const settings = useContext(SiteSettingsContext);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        subject: '',
        message: '',
        otp: ''
    });

    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);

    const handleSendOTP = async () => {
        if (!formData.email || !formData.email.includes('@')) {
            toast.error('Please enter a valid email address');
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/contact/send-otp', { email: formData.email });
            if (res.data.success) {
                toast.success(res.data.message);
                setIsOtpSent(true);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!formData.otp || formData.otp.length < 6) {
            toast.error('Please enter a valid 6-digit OTP');
            return;
        }

        setVerifying(true);
        try {
            const res = await api.post('/contact/verify-otp', { 
                email: formData.email, 
                otp: formData.otp 
            });
            if (res.data.success) {
                toast.success(res.data.message);
                setIsEmailVerified(true);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Invalid or expired OTP');
        } finally {
            setVerifying(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!isEmailVerified) {
            toast.error('Please verify your email address first');
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/contact/submit', formData);
            if (res.data.success) {
                toast.success(res.data.message);
                // Reset form
                setFormData({
                    name: '',
                    email: '',
                    phoneNumber: '',
                    subject: '',
                    message: '',
                    otp: ''
                });
                setIsOtpSent(false);
                setIsEmailVerified(false);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to submit inquiry');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-black min-h-screen text-white overflow-x-hidden">
            <Header />

            <main className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Page Header */}
                    <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
                        <motion.div 
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-8"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F24C20]/10 text-[#F24C20] border border-[#F24C20]/20">
                                <Headphones className="w-4 h-4" />
                                <span className="text-sm font-medium">Get in Touch</span>
                            </div>
                            <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight">
                                Let's build <br/> 
                                <span className="bg-gradient-to-r from-[#F24C20] to-orange-400 bg-clip-text text-transparent">Great Things</span> <br/>
                                Together
                            </h1>
                            <p className="text-xl text-neutral-400 leading-relaxed max-w-lg">
                                Have questions about a project or want to learn more about Go Experts? We're here to help you navigate your journey.
                            </p>

                            <div className="grid sm:grid-cols-2 gap-6 mt-12">
                                {[
                                    { icon: Mail, label: 'Email', value: settings.contact_email || 'support@goexperts.in', color: 'text-blue-400' },
                                    { icon: Phone, label: 'Phone', value: settings.contact_phone || '+91 91544 51333', color: 'text-green-400' },
                                    { icon: MapPin, label: 'Location', value: settings.contact_address || 'Hyderabad, Telangana', color: 'text-red-400' },
                                    { icon: ShieldCheck, label: 'Response Time', value: '< 24 Hours', color: 'text-yellow-400' }
                                ].map((item, idx) => {
                                    const Icon = item.icon;
                                    return (
                                        <div key={idx} className="p-6 rounded-3xl bg-neutral-900/50 border border-neutral-800 backdrop-blur-sm group hover:border-neutral-700 transition-all">
                                            <div className={`p-3 rounded-2xl bg-neutral-800 w-fit mb-4 group-hover:scale-110 transition-transform`}>
                                                <Icon className={`w-6 h-6 ${item.color}`} />
                                            </div>
                                            <div className="text-sm text-neutral-500 mb-1">{item.label}</div>
                                            <div className="font-bold text-white truncate">{item.value}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>

                        {/* Contact Form Container */}
                        <motion.div 
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="relative"
                        >
                            <div className="absolute inset-0 bg-[#F24C20]/20 blur-[120px] rounded-full pointer-events-none" />
                            <div className="relative p-10 lg:p-12 rounded-[40px] bg-neutral-900 border border-neutral-800 backdrop-blur-xl shadow-2xl">
                                <h2 className="text-3xl font-bold mb-8">Contact For Support</h2>
                                
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-neutral-400 ml-1">Full Name</label>
                                            <input 
                                                type="text" 
                                                required
                                                placeholder="Enter your name"
                                                value={formData.name}
                                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                className="w-full px-6 py-4 bg-neutral-950 border border-neutral-800 rounded-2xl focus:outline-none focus:border-[#F24C20] transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-neutral-400 ml-1">Phone Number</label>
                                            <input 
                                                type="tel" 
                                                maxLength={10}
                                                pattern="[0-9]{10}"
                                                placeholder="10 digit number"
                                                value={formData.phoneNumber}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                                    if (val.length <= 10) {
                                                        setFormData({...formData, phoneNumber: val});
                                                    }
                                                }}
                                                className="w-full px-6 py-4 bg-neutral-950 border border-neutral-800 rounded-2xl focus:outline-none focus:border-[#F24C20] transition-colors"
                                            />
                                        </div>
                                    </div>

                                    {/* Email with OTP Flow */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-neutral-400 ml-1">Email Address</label>
                                        <div className="flex gap-4">
                                            <div className="relative flex-1">
                                                <input 
                                                    type="email" 
                                                    required
                                                    disabled={isEmailVerified}
                                                    placeholder="Enter your email"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                                    className={`w-full px-6 py-4 bg-neutral-950 border rounded-2xl focus:outline-none transition-all ${
                                                        isEmailVerified 
                                                        ? 'border-green-500/50 bg-green-500/5 text-green-200 cursor-not-allowed' 
                                                        : 'border-neutral-800 focus:border-[#F24C20]'
                                                    }`}
                                                />
                                                {isEmailVerified && <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-green-500" />}
                                            </div>
                                            {!isEmailVerified && (
                                                <button 
                                                    type="button"
                                                    onClick={handleSendOTP}
                                                    disabled={loading || !formData.email}
                                                    className="px-6 rounded-2xl bg-[#F24C20] hover:bg-orange-600 disabled:opacity-50 transition-all font-bold whitespace-nowrap min-w-[120px] flex items-center justify-center"
                                                >
                                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : isOtpSent ? 'Resend' : 'Send OTP'}
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-xs text-neutral-500 ml-1">Verification is required to prevent spam.</p>
                                    </div>

                                    {/* OTP Input */}
                                    <AnimatePresence>
                                        {isOtpSent && !isEmailVerified && (
                                            <motion.div 
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="space-y-2"
                                            >
                                                <label className="text-sm font-medium text-neutral-400 ml-1 italic">Enter 6-digit code sent to your email</label>
                                                <div className="flex gap-4">
                                                    <input 
                                                        type="text" 
                                                        maxLength={6}
                                                        placeholder="000000"
                                                        value={formData.otp}
                                                        onChange={(e) => setFormData({...formData, otp: e.target.value})}
                                                        className="flex-1 px-6 py-4 bg-neutral-950 border border-neutral-800 rounded-2xl focus:outline-none focus:border-[#F24C20] transition-colors tracking-[1em] text-center font-mono text-xl"
                                                    />
                                                    <button 
                                                        type="button"
                                                        onClick={handleVerifyOTP}
                                                        className="px-8 rounded-2xl bg-white text-black hover:bg-neutral-200 transition-all font-bold min-w-[120px] flex items-center justify-center"
                                                    >
                                                        {verifying ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify'}
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-neutral-400 ml-1">Subject</label>
                                        <input 
                                            type="text" 
                                            required
                                            placeholder="What is this about?"
                                            value={formData.subject}
                                            onChange={(e) => setFormData({...formData, subject: e.target.value})}
                                            className="w-full px-6 py-4 bg-neutral-950 border border-neutral-800 rounded-2xl focus:outline-none focus:border-[#F24C20] transition-colors"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-neutral-400 ml-1">Message</label>
                                        <textarea 
                                            required
                                            rows={4}
                                            placeholder="Tell us what you need help with..."
                                            value={formData.message}
                                            onChange={(e) => setFormData({...formData, message: e.target.value})}
                                            className="w-full px-6 py-4 bg-neutral-950 border border-neutral-800 rounded-2xl focus:outline-none focus:border-[#F24C20] transition-colors resize-none"
                                        />
                                    </div>

                                    <button 
                                        type="submit"
                                        disabled={loading || !isEmailVerified}
                                        className="w-full py-5 rounded-2xl bg-[#F24C20] text-white font-black text-lg hover:bg-orange-600 transition-all shadow-xl hover:shadow-[#F24C20]/20 disabled:opacity-50 flex items-center justify-center gap-3 overflow-hidden group"
                                    >
                                        {loading ? (
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                        ) : (
                                            <>
                                                <span>{isEmailVerified ? 'Send Message' : 'Verify Email First'}</span>
                                                <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>

                    {/* Fun Infographic */}
                    <div className="grid md:grid-cols-3 gap-8 text-center border-t border-neutral-800 pt-20">
                        {[
                            { icon: MessageSquare, title: 'Mail Support', desc: 'Get support for common queries' },
                            { icon: Smartphone, title: 'Social Presence', desc: 'Find us on  LinkedIn, Twitter,Instagram and Facebook' },
                            { icon: CheckCircle, title: 'Dedicated Support', desc: 'Professional assistance for every query' }
                        ].map((card, idx) => (
                            <div key={idx} className="space-y-4">
                                <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 w-fit mx-auto">
                                    <card.icon className="w-8 h-8 text-[#F24C20]" />
                                </div>
                                <h3 className="text-xl font-bold">{card.title}</h3>
                                <p className="text-neutral-500">{card.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
