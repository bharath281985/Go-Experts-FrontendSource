import { useState, useEffect } from "react";
import api from "@/app/utils/api";
import { toast } from "sonner";
import { 
  Loader2, 
  ShieldCheck, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  CreditCard, 
  Building2, 
  User,
  ArrowRight,
  ArrowLeft,
  XCircle,
  Calendar,
  DollarSign,
  Award
} from "lucide-react";
import { useTheme } from "@/app/components/ThemeProvider";
import { motion, AnimatePresence } from "motion/react";

interface KYCSettingsProps {
    userRole: 'investor' | 'startup_creator';
}

export default function KYCSettings({ userRole }: KYCSettingsProps) {
    const { isDarkMode } = useTheme();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [kycData, setKycData] = useState<any>(null);
    const [step, setStep] = useState(1);

    // Form State
    const [formData, setFormData] = useState<any>({
        identity: {
            full_name: '',
            dob: '',
            nationality: 'Indian',
            mobile: '',
            email: '',
            profile_photo: ''
        },
        id_proof: {
            pan_card: '',
            aadhar_card: '',
            passport: '',
            driving_license: ''
        },
        address_proof: {
            document_url: '',
            document_type: 'aadhaar'
        },
        financial_investor: {
            bank_details: {
                holder_name: '',
                account_number: '',
                ifsc_code: '',
                cancelled_cheque: ''
            },
            investor_type: 'angel_investor',
            ticket_size_range: '₹5L – ₹50L',
            experience_years: 0,
            preferred_sectors: [],
            linkedin_profile: '',
            portfolio_url: ''
        },
        startup_details: {
            startup_name: '',
            role: 'CEO',
            team_members: [],
            linkedin_profile: '',
            pitch_deck: '',
            business_plan: '',
            financial_projections: '',
            demo_screenshots: []
        },
        business_verification: {
            is_registered: false,
            inc_certificate: '',
            gst_certificate: '',
            company_pan: '',
            cin_number: '',
            startup_india_cert: ''
        },
        compliance: {
            nda_accepted: false,
            terms_accepted: false,
            ip_declaration: false,
            fraud_declaration: false,
            consent_checkbox: false
        }
    });

    useEffect(() => {
        fetchKYCStatus();
    }, []);

    const fetchKYCStatus = async () => {
        try {
            setLoading(true);
            const res = await api.get('/kyc/status');
            if (res.data.success && res.data.data) {
                setKycData(res.data.data);
                // Pre-fill form if data exists
                if (res.data.data.identity) {
                    setFormData((prev: any) => ({
                        ...prev,
                        ...res.data.data
                    }));
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, category: string, field: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('kyc_doc', file);

        try {
            toast.loading("Uploading document...");
            // Use existing file upload endpoint or a new one
            const res = await api.post('/kyc/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (res.data.success) {
                const url = res.data.url;
                setFormData((prev: any) => {
                    const updated = { ...prev };
                    if (category.includes('.')) {
                        const [parent, child] = category.split('.');
                        updated[parent][child][field] = url;
                    } else {
                        updated[category][field] = url;
                    }
                    return updated;
                });
                toast.success("Document uploaded successfully");
            }
        } catch (err) {
            toast.error("Upload failed. Please try again.");
        } finally {
            toast.dismiss();
        }
    };

    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            const res = await api.post('/kyc/submit', {
                ...formData,
                role: userRole
            });
            if (res.data.success) {
                toast.success("KYC Submitted for review!");
                fetchKYCStatus();
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Submission failed");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-[#F24C20]"/></div>;

    const StatusCard = () => (
        <div className={`p-8 rounded-[2.5rem] border mb-8 flex items-center justify-between ${
            kycData?.status === 'fully_verified' ? 'bg-emerald-500/10 border-emerald-500/30' :
            kycData?.status === 'pending' ? 'bg-orange-500/10 border-orange-500/30' :
            'bg-neutral-900/50 border-neutral-800'
        }`}>
            <div className="flex items-center gap-6">
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center ${
                    kycData?.status === 'fully_verified' ? 'bg-emerald-500 text-white' :
                    kycData?.status === 'pending' ? 'bg-orange-500 text-white' :
                    'bg-neutral-800 text-neutral-400'
                }`}>
                    <ShieldCheck className="w-8 h-8" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-white italic tracking-tighter uppercase">
                        Verification Status: {kycData?.status?.replace('_', ' ') || 'Unverified'}
                    </h3>
                    <p className="text-sm text-neutral-500 font-bold uppercase tracking-widest mt-1">
                        {kycData?.status === 'fully_verified' ? 'All systems go. Your account is fully trusted.' : 
                         kycData?.status === 'pending' ? 'Our legal team is reviewing your documents.' :
                         'Complete your KYC to unlock full platform features.'}
                    </p>
                </div>
            </div>
            {kycData?.status === 'rejected' && (
                <div className="flex items-center gap-2 text-red-500 font-bold text-xs uppercase">
                    <XCircle className="w-4 h-4" /> REASON: {kycData.admin_remarks}
                </div>
            )}
        </div>
    );

    const ProgressHeader = () => (
        <div className="flex items-center gap-4 mb-10 overflow-x-auto pb-4">
            {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black transition-all ${
                        step === s ? 'bg-[#F24C20] text-white shadow-lg shadow-[#F24C20]/20 scale-110' :
                        step > s ? 'bg-emerald-500 text-white' : 'bg-neutral-800 text-neutral-500'
                    }`}>
                        {step > s ? <CheckCircle2 className="w-5 h-5"/> : s}
                    </div>
                    {s < 4 && <div className="w-8 h-0.5 bg-neutral-800" />}
                </div>
            ))}
        </div>
    );

    return (
        <div className="space-y-6">
            <StatusCard />
            
            {(kycData?.status === 'unverified' || kycData?.status === 'rejected') && (
                <div className={`p-10 rounded-[3rem] border ${isDarkMode ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white border-neutral-200 shadow-2xl'}`}>
                    <ProgressHeader />

                    <div className="min-h-[400px]">
                        <AnimatePresence mode="wait">
                            {/* STEP 1: IDENTITY */}
                            {step === 1 && (
                                <motion.div 
                                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    <div>
                                        <h4 className="text-2xl font-black text-white italic tracking-tighter">1. Basic Identity</h4>
                                        <p className="text-sm text-neutral-500 font-bold uppercase tracking-widest mt-1">Foundational verification for regulatory compliance.</p>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <InputField label="Full Name (As per ID)" value={formData.identity.full_name} onChange={(v: string) => setFormData({...formData, identity: {...formData.identity, full_name: v}})} icon={User} />
                                        <InputField label="Date of Birth" placeholder="YYYY-MM-DD" value={formData.identity.dob} onChange={(v: string) => setFormData({...formData, identity: {...formData.identity, dob: v}})} icon={Calendar} />
                                        <InputField label="Mobile Number" value={formData.identity.mobile} onChange={(v: string) => setFormData({...formData, identity: {...formData.identity, mobile: v}})} icon={ShieldCheck} />
                                        <InputField label="Email Address" value={formData.identity.email} onChange={(v: string) => setFormData({...formData, identity: {...formData.identity, email: v}})} icon={AlertCircle} />
                                    </div>
                                    <div className="flex justify-end pt-6">
                                        <NavButton label="Next Phase" onClick={() => setStep(2)} icon={ArrowRight} />
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 2: ID PROOFS */}
                            {step === 2 && (
                                <motion.div 
                                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    <div>
                                        <h4 className="text-2xl font-black text-white italic tracking-tighter">2. Government Credentials</h4>
                                        <p className="text-sm text-neutral-500 font-bold uppercase tracking-widest mt-1">Official state-issued identification documents.</p>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <UploadField 
                                            label="PAN Card (Mandatory)" 
                                            value={formData.id_proof.pan_card} 
                                            onUpload={(e: any) => handleFileUpload(e, 'id_proof', 'pan_card')} 
                                            icon={CreditCard} 
                                        />
                                        <UploadField 
                                            label="Aadhaar Card (Masked)" 
                                            value={formData.id_proof.aadhar_card} 
                                            onUpload={(e: any) => handleFileUpload(e, 'id_proof', 'aadhar_card')} 
                                            icon={ShieldCheck} 
                                        />
                                        <UploadField 
                                            label="Address Proof (Bill/Statement)" 
                                            value={formData.address_proof.document_url} 
                                            onUpload={(e: any) => handleFileUpload(e, 'address_proof', 'document_url')} 
                                            icon={Building2} 
                                        />
                                    </div>
                                    <div className="flex justify-between pt-6">
                                        <NavButton label="Back" ghost onClick={() => setStep(1)} icon={ArrowLeft} />
                                        <NavButton label="Financial/Platform Info" onClick={() => setStep(3)} icon={ArrowRight} />
                                    </div>
                                </motion.div>
                            )}

                             {/* STEP 3: ROLE SPECIFIC */}
                             {step === 3 && (
                                <motion.div 
                                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    {userRole === 'investor' ? (
                                        <>
                                            <div>
                                                <h4 className="text-2xl font-black text-white italic tracking-tighter">3. Investment Thesis</h4>
                                                <p className="text-sm text-neutral-500 font-bold uppercase tracking-widest mt-1">Define your capital deployment parameters.</p>
                                            </div>
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <SelectField label="Investor Type" value={formData.financial_investor.investor_type} options={['angel_investor', 'venture_capitalist', 'hni']} onChange={(v: string) => setFormData({...formData, financial_investor: {...formData.financial_investor, investor_type: v}})} />
                                                <InputField label="Ticket Size Range" value={formData.financial_investor.ticket_size_range} onChange={(v: string) => setFormData({...formData, financial_investor: {...formData.financial_investor, ticket_size_range: v}})} icon={DollarSign} />
                                                <InputField label="Bank Account Number" value={formData.financial_investor.bank_details.account_number} onChange={(v: string) => setFormData({...formData, financial_investor: {...formData.financial_investor, bank_details: {...formData.financial_investor.bank_details, account_number: v}}})} icon={Building2} />
                                                <UploadField label="Cancelled Cheque" value={formData.financial_investor.bank_details.cancelled_cheque} onUpload={(e: any) => handleFileUpload(e, 'financial_investor.bank_details', 'cancelled_cheque')} icon={FileText} />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div>
                                                <h4 className="text-2xl font-black text-white italic tracking-tighter">3. Startup Infrastructure</h4>
                                                <p className="text-sm text-neutral-500 font-bold uppercase tracking-widest mt-1">Details about your vision and registered entity.</p>
                                            </div>
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <InputField label="Startup Name" value={formData.startup_details.startup_name} onChange={(v: string) => setFormData({...formData, startup_details: {...formData.startup_details, startup_name: v}})} icon={Building2} />
                                                <InputField label="Incorporation / CIN" value={formData.business_verification.cin_number} onChange={(v: string) => setFormData({...formData, business_verification: {...formData.business_verification, cin_number: v}})} icon={FileText} />
                                                <UploadField label="Pitch Deck (PDF)" value={formData.startup_details.pitch_deck} onUpload={(e: any) => handleFileUpload(e, 'startup_details', 'pitch_deck')} icon={FileText} />
                                                <UploadField label="Inc. Certificate" value={formData.business_verification.inc_certificate} onUpload={(e: any) => handleFileUpload(e, 'business_verification', 'inc_certificate')} icon={Award} />
                                            </div>
                                        </>
                                    )}
                                    <div className="flex justify-between pt-6">
                                        <NavButton label="Documents" ghost onClick={() => setStep(2)} icon={ArrowLeft} />
                                        <NavButton label="Final Compliance" onClick={() => setStep(4)} icon={ArrowRight} />
                                    </div>
                                </motion.div>
                            )}

                             {/* STEP 4: COMPLIANCE */}
                             {step === 4 && (
                                <motion.div 
                                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    <div>
                                        <h4 className="text-2xl font-black text-white italic tracking-tighter">4. Trust & Safety Layer</h4>
                                        <p className="text-sm text-neutral-500 font-bold uppercase tracking-widest mt-1">Final legal declarations and platform consent.</p>
                                    </div>
                                    <div className="space-y-4 max-w-2xl">
                                        <Checkbox label="I declare that I am not involved in any fraudulent or illegal financial activities." checked={formData.compliance.fraud_declaration} onChange={(c: boolean) => setFormData({...formData, compliance: {...formData.compliance, fraud_declaration: c}})} />
                                        <Checkbox label="IP Declaration: I own all intellectual property disclosed on this platform." checked={formData.compliance.ip_declaration} onChange={(c: boolean) => setFormData({...formData, compliance: {...formData.compliance, ip_declaration: c}})} />
                                        <Checkbox label="I agree to the Terms & Conditions and the platform's NDA policies." checked={formData.compliance.terms_accepted} onChange={(c: boolean) => setFormData({...formData, compliance: {...formData.compliance, terms_accepted: c, nda_accepted: c}})} />
                                        <Checkbox label="KYC Consent: I authorize GoExperts to verify my identity via third-party providers." checked={formData.compliance.consent_checkbox} onChange={(c: boolean) => setFormData({...formData, compliance: {...formData.compliance, consent_checkbox: c}})} />
                                    </div>
                                    <div className="flex justify-between pt-8">
                                        <NavButton label="Edit Info" ghost onClick={() => setStep(3)} icon={ArrowLeft} />
                                        <button 
                                            onClick={handleSubmit}
                                            disabled={submitting}
                                            className="flex items-center gap-3 rounded-2xl bg-emerald-600 px-10 py-4 font-black text-white shadow-2xl shadow-emerald-600/20 hover:scale-[1.05] active:scale-95 transition-all text-sm uppercase tracking-[0.2em] disabled:opacity-50"
                                        >
                                            {submitting ? <Loader2 className="w-5 h-5 animate-spin"/> : <ShieldCheck className="w-5 h-5"/>}
                                            Submit Final Application
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            )}
        </div>
    );
}

// --- Internal Helper Components ---

function InputField({ label, value, onChange, icon: Icon, placeholder = "" }: any) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 ml-1">{label}</label>
            <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center text-neutral-500 group-focus-within:text-[#F24C20] transition-colors">
                    <Icon className="w-4 h-4" />
                </div>
                <input 
                    type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
                    className="w-full bg-neutral-900 border-2 border-neutral-800 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold text-white focus:border-[#F24C20] outline-none transition-all placeholder:text-neutral-700"
                />
            </div>
        </div>
    );
}

function SelectField({ label, value, options, onChange }: any) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 ml-1">{label}</label>
            <select 
                value={value} onChange={(e) => onChange(e.target.value)}
                className="w-full bg-neutral-900 border-2 border-neutral-800 rounded-2xl px-5 py-3.5 text-sm font-bold text-white focus:border-[#F24C20] outline-none transition-all appearance-none cursor-pointer"
            >
                {options.map((o: string) => <option key={o} value={o}>{o.replace('_', ' ').toUpperCase()}</option>)}
            </select>
        </div>
    );
}

function UploadField({ label, value, onUpload, icon: Icon }: any) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 ml-1">{label}</label>
            <div className={`relative rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center p-6 transition-all group ${
                value ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-neutral-800 hover:border-[#F24C20]/30 hover:bg-neutral-900'
            }`}>
               {value ? (
                   <>
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
                    <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">Document Secured</span>
                    <button onClick={() => window.open(value)} className="mt-2 text-[8px] font-black text-white hover:underline uppercase">View Upload</button>
                   </>
               ) : (
                   <>
                    <Icon className="w-8 h-8 text-neutral-700 mb-2 group-hover:text-[#F24C20] group-hover:scale-110 transition-all" />
                    <span className="text-[8px] font-bold text-neutral-600 uppercase tracking-widest text-center">Click to browse archive</span>
                    <input type="file" onChange={onUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                   </>
               )}
            </div>
        </div>
    );
}

function Checkbox({ label, checked, onChange }: any) {
    return (
        <label className="flex items-start gap-4 cursor-pointer group">
            <div 
                onClick={() => onChange(!checked)}
                className={`mt-1 w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                    checked ? 'bg-[#F24C20] shadow-lg shadow-[#F24C20]/20' : 'bg-neutral-800 border-2 border-neutral-700'
                }`}
            >
                {checked && <CheckCircle2 className="w-4 h-4 text-white" />}
            </div>
            <span className={`text-xs font-bold leading-relaxed transition-colors ${checked ? 'text-white' : 'text-neutral-500 group-hover:text-neutral-400'}`}>
                {label}
            </span>
        </label>
    );
}

function NavButton({ label, onClick, icon: Icon, ghost = false }: any) {
    return (
        <button 
            onClick={onClick}
            className={`flex items-center gap-2 rounded-2xl px-8 py-3.5 font-black text-xs uppercase tracking-widest transition-all ${
                ghost ? 'bg-transparent text-neutral-500 hover:text-white' : 'bg-white text-black hover:bg-[#F24C20] hover:text-white shadow-xl shadow-black/10'
            }`}
        >
            {!ghost && label}
            <Icon className="w-4 h-4" />
            {ghost && label}
        </button>
    );
}


