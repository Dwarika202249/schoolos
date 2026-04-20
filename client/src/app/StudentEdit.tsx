import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { User, Phone, Mail, MapPin, Calendar, Building2, ShieldCheck, HelpCircle, Save, ChevronRight, ChevronLeft, ArrowLeft, Edit } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export const StudentEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 3;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    const [branches, setBranches] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [academicYears, setAcademicYears] = useState<any[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: 'MALE',
        bloodGroup: 'Unknown',
        nationality: 'Indian',
        status: 'ACTIVE',

        branchId: '',
        classId: '',
        academicYearId: '',
        admissionNumber: '',
        rollNumber: '',

        currentAddress: {
            line1: '',
            city: '',
            state: '',
            pincode: ''
        },

        guardians: [{
            name: '',
            relationship: 'Father',
            phone: '',
            email: '',
            isEmergencyContact: true
        }]
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const [branchRes, classRes, ayRes, studentRes] = await Promise.all([
                    api.get('/tenant/branches'),
                    api.get('/tenant/classes'),
                    api.get('/tenant/academic-years'),
                    api.get(`/students/${id}`)
                ]);

                setBranches(branchRes.data.data);
                setClasses(classRes.data.data);
                setAcademicYears(ayRes.data.data);

                const s = studentRes.data.data;
                const u = s?.userId;

                setFormData({
                    firstName: u?.firstName || '',
                    lastName: u?.lastName || '',
                    dateOfBirth: s.dateOfBirth ? new Date(s.dateOfBirth).toISOString().split('T')[0] : '',
                    gender: s.gender || 'MALE',
                    bloodGroup: s.bloodGroup || 'Unknown',
                    nationality: s.nationality || 'Indian',
                    status: s.status || 'ACTIVE',
                    branchId: s.branchId?._id || s.branchId?.id || s.branchId || '',
                    classId: s.classId?._id || s.classId?.id || s.classId || '',
                    academicYearId: s.academicYearId || '',
                    admissionNumber: s.admissionNumber || '',
                    rollNumber: s.rollNumber || '',
                    currentAddress: {
                        line1: s.currentAddress?.line1 || '',
                        city: s.currentAddress?.city || '',
                        state: s.currentAddress?.state || '',
                        pincode: s.currentAddress?.pincode || ''
                    },
                    guardians: s.guardians?.length ? s.guardians : [{
                        name: '',
                        relationship: 'Father',
                        phone: '',
                        email: '',
                        isEmergencyContact: true
                    }]
                });

            } catch (e) {
                toast.error('Failed to resolve intelligence profile data.');
                navigate('/students');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const parts = name.split('.');
            if (parts[0] === 'currentAddress') {
                setFormData(prev => ({
                    ...prev,
                    currentAddress: { ...prev.currentAddress, [parts[1]]: value }
                }));
            } else if (parts[0] === 'guardians') {
                const index = parseInt(parts[1], 10);
                const field = parts[2];
                setFormData(prev => {
                    const newGuardians = [...prev.guardians];
                    newGuardians[index] = { ...newGuardians[index], [field]: value };
                    return { ...prev, guardians: newGuardians };
                });
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);
            const submissionPayload = {
                ...formData,
                rollNumber: parseInt(formData.rollNumber) || 1,
            };

            await api.patch(`/students/${id}`, submissionPayload);
            toast.success('Core identity metrics updated successfully.');
            navigate(`/students/${id}`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Data sync failed.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const nextStep = () => {
        setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    };

    if (loading) {
        return (
            <div className="p-10 space-y-8 animate-pulse max-w-5xl mx-auto">
                <div className="h-12 w-64 bg-white/5 rounded-2xl" />
                <div className="h-96 bg-white/5 rounded-[3rem]" />
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700">

            {/* Header & Progress Indicator */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-white/10">
                <div>
                    <h1 className="text-3xl font-black text-foreground tracking-tight uppercase italic flex items-center gap-3">
                        <Edit className="w-8 h-8 text-primary" />
                        Core Modification
                    </h1>
                    <p className="text-slate-500 mt-1 uppercase text-xs font-bold tracking-widest hidden sm:block">Altering Registry: {formData.admissionNumber}</p>
                </div>
                <div className="flex items-center gap-4 bg-card/40 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 shadow-xl">
                    <div className="flex items-center gap-2 text-slate-400 font-bold text-sm tracking-widest uppercase">
                        <span className={currentStep >= 1 ? "text-primary drop-shadow-[0_0_10px_rgba(var(--primary),0.8)]" : ""}>01</span>
                        <div className={`w-8 h-1 rounded-full ${currentStep >= 2 ? "bg-primary shadow-[0_0_10px_rgba(var(--primary),0.8)]" : "bg-white/10"}`} />
                        <span className={currentStep >= 2 ? "text-primary drop-shadow-[0_0_10px_rgba(var(--primary),0.8)]" : ""}>02</span>
                        <div className={`w-8 h-1 rounded-full ${currentStep >= 3 ? "bg-primary shadow-[0_0_10px_rgba(var(--primary),0.8)]" : "bg-white/10"}`} />
                        <span className={currentStep >= 3 ? "text-primary drop-shadow-[0_0_10px_rgba(var(--primary),0.8)]" : ""}>03</span>
                    </div>
                </div>
            </div>

            <div className="min-h-[500px]">
                <AnimatePresence mode="wait">
                    {/* STEP 1: IDENTITY & ACADEMIC */}
                    {currentStep === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="flex items-center gap-3 border-l-4 border-primary pl-4 mb-8">
                                <User className="w-6 h-6 text-primary" />
                                <h3 className="text-xl font-black text-foreground uppercase tracking-widest italic">Identity & Target Sector</h3>
                            </div>

                            <Card className="p-8 border-white/20 shadow-2xl shadow-black/60 bg-card/40 backdrop-blur-xl rounded-[2.5rem] grid grid-cols-1 md:grid-cols-2 gap-8">
                                <Input label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="e.g. Rahul" icon={<User className="w-5 h-5" />} required />
                                <Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="e.g. Kumar" />
                                <Input label="Date of Birth" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} type="date" icon={<Calendar className="w-5 h-5" />} required />

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Gender</label>
                                    <select name="gender" title="Gender Selection" value={formData.gender} onChange={handleChange} className="w-full h-14 bg-white/5 border border-white/20 rounded-2xl px-4 text-slate-300 font-bold focus:border-primary outline-none transition-all">
                                        <option value="MALE" className="bg-slate-900">Male</option>
                                        <option value="FEMALE" className="bg-slate-900">Female</option>
                                        <option value="OTHER" className="bg-slate-900">Other</option>
                                    </select>
                                </div>
                            </Card>

                            <Card className="p-8 border-white/20 shadow-2xl shadow-black/60 bg-slate-900 backdrop-blur-xl rounded-[2.5rem] grid grid-cols-1 md:grid-cols-2 gap-8 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full" />
                                <div className="col-span-1 md:col-span-2 flex items-center justify-between border-b border-white/10 pb-4">
                                    <span className="text-[10px] uppercase font-black tracking-widest text-primary flex items-center gap-2"><Building2 className="w-4 h-4" /> Academic Placement</span>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Target Branch</label>
                                    <select name="branchId" title="Branch Selection" value={formData.branchId} onChange={handleChange} className="w-full h-14 bg-white/5 border border-white/20 rounded-2xl px-4 text-slate-300 font-bold focus:border-primary outline-none transition-all" required>
                                        <option value="" disabled className="bg-slate-900">Select Branch Facility</option>
                                        {branches.map((b, i) => (
                                            <option key={b.id || b._id || i} value={b.id || b._id} className="bg-slate-900">{b.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Class & Section</label>
                                    <select name="classId" title="Class Selection" value={formData.classId} onChange={handleChange} className="w-full h-14 bg-white/5 border border-white/20 rounded-2xl px-4 text-slate-300 font-bold focus:border-primary outline-none transition-all" required>
                                        <option value="" disabled className="bg-slate-900">Select Assigned Sector</option>
                                        {classes.map((c, i) => (
                                            <option key={c.id || c._id || i} value={c.id || c._id} className="bg-slate-900">{c.displayName || `${c.grade} - ${c.section}`}</option>
                                        ))}
                                    </select>
                                </div>

                                <Input label="Roll Number" name="rollNumber" value={formData.rollNumber} onChange={handleChange} placeholder="e.g. 1" type="number" />
                            </Card>
                        </motion.div>
                    )}

                    {/* STEP 2: ADDRESS */}
                    {currentStep === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="flex items-center gap-3 border-l-4 border-emerald-500 pl-4 mb-8">
                                <MapPin className="w-6 h-6 text-emerald-500" />
                                <h3 className="text-xl font-black text-foreground uppercase tracking-widest italic">Communication Geography</h3>
                            </div>

                            <Card className="p-8 border-white/20 shadow-2xl shadow-black/60 bg-card/40 backdrop-blur-xl rounded-[2.5rem] space-y-8">
                                <Input label="Address Line 1" name="currentAddress.line1" value={formData.currentAddress.line1} onChange={handleChange} placeholder="House no, Street..." icon={<MapPin className="w-5 h-5" />} required />
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <Input label="City" name="currentAddress.city" value={formData.currentAddress.city} onChange={handleChange} placeholder="New Delhi" required />
                                    <Input label="State" name="currentAddress.state" value={formData.currentAddress.state} onChange={handleChange} placeholder="Delhi" required />
                                    <Input label="Pincode" name="currentAddress.pincode" value={formData.currentAddress.pincode} onChange={handleChange} placeholder="110001" required />
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {/* STEP 3: GUARDIANS */}
                    {currentStep === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="flex items-center gap-3 border-l-4 border-indigo-500 pl-4 mb-8">
                                <ShieldCheck className="w-6 h-6 text-indigo-500" />
                                <h3 className="text-xl font-black text-foreground uppercase tracking-widest italic">Guardian Intel</h3>
                            </div>

                            <Card className="p-8 border-white/20 shadow-2xl shadow-black/60 bg-card/40 backdrop-blur-xl rounded-[3rem] space-y-8 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 blur-3xl rounded-full" />
                                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <Input label="Parent / Guardian Name" name="guardians.0.name" value={formData.guardians[0].name} onChange={handleChange} icon={<User className="w-5 h-5" />} required />
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Relationship</label>
                                        <select name="guardians.0.relationship" title="Guardian Relationship" value={formData.guardians[0].relationship} onChange={handleChange} className="w-full h-14 bg-white/5 border border-white/20 rounded-2xl px-4 text-slate-300 font-bold focus:border-primary outline-none transition-all">
                                            <option value="Father">Father</option>
                                            <option value="Mother">Mother</option>
                                            <option value="Guardian">Guardian</option>
                                        </select>
                                    </div>
                                    <Input label="Mobile Number (Primary)" name="guardians.0.phone" value={formData.guardians[0].phone} onChange={handleChange} placeholder="e.g. +91 9999999999" icon={<Phone className="w-5 h-5" />} required />
                                    <Input label="Email Address" name="guardians.0.email" value={formData.guardians[0].email} onChange={handleChange} type="email" icon={<Mail className="w-5 h-5" />} />
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Navigation Footer */}
            <div className="flex items-center justify-between pt-6 border-t border-white/10 mt-10">
                <Button variant="outline" onClick={() => navigate(`/students/${id}`)} className="bg-transparent border-white/10 text-slate-500 hover:text-white rounded-2xl h-14 px-8">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Cancel & Retreat
                </Button>

                <div className="flex gap-4">
                    {currentStep > 1 && (
                        <Button variant="outline" onClick={() => setCurrentStep(p => p - 1)} className="rounded-2xl border-white/20 h-14 px-8 text-xs tracking-widest uppercase font-black hover:bg-white/5">
                            <ChevronLeft className="w-4 h-4 mr-1" /> Retreat
                        </Button>
                    )}
                    {currentStep < totalSteps ? (
                        <Button onClick={nextStep} className="rounded-2xl h-14 px-10 text-xs tracking-widest uppercase font-black shadow-2xl shadow-primary/30">
                            Next Phase <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit} isLoading={isSubmitting} className="rounded-2xl h-14 px-10 text-xs tracking-widest uppercase font-black bg-emerald-500 hover:bg-emerald-600 text-white shadow-2xl shadow-emerald-500/30">
                            <Save className="w-4 h-4 mr-2" /> Commit Changes
                        </Button>
                    )}
                </div>
            </div>

        </div>
    );
};
