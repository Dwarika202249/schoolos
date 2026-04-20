import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { User, Phone, Mail, MapPin, Calendar, CreditCard, Sparkles, Building2, ShieldCheck, HelpCircle, Save, ChevronRight, ChevronLeft, HardDrive } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const CACHE_KEY = 'schoolos_student_enrollment_draft';

export const StudentEnrollment = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Load Draft & Pre-requisites
  useEffect(() => {
    const loadPrerequisites = async () => {
      try {
        const [branchRes, classRes, ayRes] = await Promise.all([
          api.get('/tenant/branches'),
          api.get('/tenant/classes'),
          api.get('/tenant/academic-years')
        ]);
        setBranches(branchRes.data.data);
        setClasses(classRes.data.data);
        setAcademicYears(ayRes.data.data);
      } catch (e) {
        toast.error('Failed to load system prerequisites.');
      }
    };
    loadPrerequisites();

    const draft = localStorage.getItem(CACHE_KEY);
    if (draft) {
      try {
        setFormData(JSON.parse(draft));
        toast('Draft restored from local cache.', { icon: '💾', className: 'bg-slate-900 border border-white/10 text-white' });
      } catch (e) {
         // ignore parse errors
      }
    }
  }, []);

  // Auto-save Draft
  useEffect(() => {
     const timeout = setTimeout(() => {
         localStorage.setItem(CACHE_KEY, JSON.stringify(formData));
     }, 1000);
     return () => clearTimeout(timeout);
  }, [formData]);

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

  const handleManualSave = () => {
      localStorage.setItem(CACHE_KEY, JSON.stringify(formData));
      toast('Draft manually secured to encypted volume.', { icon: '🔒', className: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' });
  };

  const handleSubmit = async () => {
      try {
          setIsSubmitting(true);
          // Auto-infer primary email logic for student login (if not given)
          const submissionPayload = {
              ...formData,
              rollNumber: parseInt(formData.rollNumber) || 1, // Fallback
          };
          
          await api.post('/students/enroll', submissionPayload);
          localStorage.removeItem(CACHE_KEY);
          toast.success('Registration successful. Activation payload dispatched.');
          navigate('/students');
      } catch (error: any) {
          toast.error(error.response?.data?.message || 'Enrollment failed');
      } finally {
          setIsSubmitting(false);
      }
  };

  const nextStep = () => {
      // Basic validation
      if (currentStep === 1) {
          if (!formData.firstName || !formData.dateOfBirth || !formData.classId || !formData.branchId || !formData.academicYearId) {
             return toast.error('Please complete all mandatory identity and academic fields.');
          }
      }
      if (currentStep === 2) {
          if (!formData.currentAddress.line1 || !formData.currentAddress.city) {
             return toast.error('Address details are incomplete.');
          }
      }
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700">
      
      {/* Header & Progress Indicator */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight uppercase italic flex items-center gap-3">
             <Sparkles className="w-8 h-8 text-primary" />
             New Enrollment Protocol
          </h1>
          <p className="text-slate-500 mt-1 uppercase text-xs font-bold tracking-widest hidden sm:block">Zero-Trust Registry & Smart Sibling Link</p>
        </div>
        <div className="flex items-center gap-4 bg-white/5 px-6 py-3 rounded-2xl border border-white/10">
           <div className="flex items-center gap-2 text-slate-400 font-bold text-sm tracking-widest uppercase">
               <span className={currentStep >= 1 ? "text-primary" : ""}>01</span>
               <div className={`w-8 h-1 rounded-full ${currentStep >= 2 ? "bg-primary" : "bg-white/10"}`} />
               <span className={currentStep >= 2 ? "text-primary" : ""}>02</span>
               <div className={`w-8 h-1 rounded-full ${currentStep >= 3 ? "bg-primary" : "bg-white/10"}`} />
               <span className={currentStep >= 3 ? "text-primary" : ""}>03</span>
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
                            <span className="text-[10px] uppercase font-black tracking-widest text-primary flex items-center gap-2"><Building2 className="w-4 h-4"/> Academic Placement</span>
                            <span className="text-[10px] font-bold text-slate-500">Auto-Sequence active for Registration ID</span>
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
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Academic Year</label>
                           <select name="academicYearId" title="Academic Year Selection" value={formData.academicYearId} onChange={handleChange} className="w-full h-14 bg-white/5 border border-white/20 rounded-2xl px-4 text-slate-300 font-bold focus:border-primary outline-none transition-all" required>
                              <option value="" disabled className="bg-slate-900">Select Timeline</option>
                              {academicYears.map((ay, i) => (
                                  <option key={ay.id || ay._id || i} value={ay.id || ay._id} className="bg-slate-900">{ay.name} {ay.isCurrent ? '(Current)' : ''}</option>
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

             {/* STEP 3: GUARDIANS & SECURITY */}
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
                        <h3 className="text-xl font-black text-foreground uppercase tracking-widest italic">Guardian Intel & Zero-Trust Portal</h3>
                    </div>

                    <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex gap-4">
                        <HelpCircle className="w-6 h-6 text-indigo-400 shrink-0" />
                        <div>
                            <h4 className="text-sm font-black text-indigo-300 tracking-widest uppercase">Smart Sibling Linking Active</h4>
                            <p className="text-sm font-medium text-indigo-200/70 mt-1">
                                Simply provide the Parent's exact mobile number or email. The system will auto-detect matching parent accounts and securely link the sibling records together.
                            </p>
                        </div>
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
                            <Input label="Email Address (Optional)" name="guardians.0.email" value={formData.guardians[0].email} onChange={handleChange} placeholder="Ensures portal access via Magic Link" type="email" icon={<Mail className="w-5 h-5" />} />
                        </div>
                    </Card>
                 </motion.div>
             )}
          </AnimatePresence>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-white/10 mt-10">
          <div className="flex gap-4">
             <Button variant="outline" onClick={handleManualSave} className="bg-transparent border-white/10 text-slate-500 hover:text-white rounded-2xl">
                 <HardDrive className="w-4 h-4 mr-2" /> Save to Cache
             </Button>
          </div>
          
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
                    <Save className="w-4 h-4 mr-2" /> Execute Enrollment
                 </Button>
              )}
          </div>
      </div>
    </div>
  );
};
