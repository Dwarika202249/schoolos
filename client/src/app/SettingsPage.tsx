import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Palette, 
  Globe, 
  Phone, 
  Mail, 
  MapPin, 
  Save, 
  ShieldCheck, 
  User, 
  CreditCard,
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export const SettingsPage = () => {
  const { user, school, updateSchoolState } = useAuth();
  const isAdmin = user?.role === 'OWNER' || user?.role === 'ADMIN';
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'branding' | 'contact' | 'profile'>(isAdmin ? 'general' : 'profile');

  // Institution Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    boardAffiliation: '',
    mediumOfInstruction: '',
    academicYearStartMonth: 4,
    phone: '',
    email: '',
    website: '',
    address: {
      line1: '',
      city: '',
      district: '',
      state: '',
      pincode: ''
    },
    branding: {
      primaryColor: '#2563EB',
      secondaryColor: '#1E40AF'
    }
  });

  // Staff Personal Form State
  const [staffData, setStaffData] = useState<any>({
    firstName: '',
    lastName: '',
    gender: '',
    dob: '',
    phone: '',
    alternatePhone: '',
    maritalStatus: 'SINGLE',
    address: '',
    bio: '',
    bankDetails: {
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      branchName: ''
    },
    emergencyContact: {
      name: '',
      relation: '',
      phone: ''
    }
  });

  // Sync Institution Data
  useEffect(() => {
    if (school && isAdmin) {
      setFormData({
        name: school.name || '',
        code: school.code || '',
        boardAffiliation: school.boardAffiliation || '',
        mediumOfInstruction: school.mediumOfInstruction || 'English',
        academicYearStartMonth: school.academicYearStartMonth || 4,
        phone: school.phone || '',
        email: school.email || '',
        website: school.website || '',
        address: {
          line1: school.address?.line1 || '',
          city: school.address?.city || '',
          district: school.address?.district || '',
          state: school.address?.state || '',
          pincode: school.address?.pincode || ''
        },
        branding: {
          primaryColor: school.branding?.primaryColor || '#2563EB',
          secondaryColor: school.branding?.secondaryColor || '#1E40AF'
        }
      });
    }
  }, [school, isAdmin]);

  // Fetch Staff Data
  useEffect(() => {
    const fetchStaffMe = async () => {
      try {
        const res = await api.get('/tenant/staff/me');
        const data = res.data.data;
        setStaffData({
          firstName: data.userId?.firstName || '',
          lastName: data.userId?.lastName || '',
          gender: data.gender || '',
          dob: data.dob ? new Date(data.dob).toISOString().split('T')[0] : '',
          phone: data.phone || '',
          alternatePhone: data.alternatePhone || '',
          maritalStatus: data.maritalStatus || 'SINGLE',
          address: data.address || '',
          bio: data.bio || '',
          bankDetails: data.bankDetails || { bankName: '', accountNumber: '', ifscCode: '', branchName: '' },
          emergencyContact: data.emergencyContact || { name: '', relation: '', phone: '' }
        });
      } catch (err) {
        if (!isAdmin) toast.error('Failed to load profile data');
      }
    };
    fetchStaffMe();
  }, [isAdmin]);

  const handleSchoolSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.patch('/tenant/school', formData);
      toast.success('School settings updated successfully');
      updateSchoolState(response.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch('/tenant/staff/me', staffData);
      toast.success('Personal profile updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    ...(isAdmin ? [
      { id: 'general', label: 'Institutional', icon: Building2 },
      { id: 'branding', label: 'Branding', icon: Palette },
      { id: 'contact', label: 'Contact', icon: Globe },
    ] : []),
    { id: 'profile', label: 'My Profile', icon: User }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase italic">{activeTab === 'profile' ? 'PERSONAL SETTINGS' : 'SCHOOL SETTINGS'}</h1>
          <p className="text-slate-500 font-medium">
            {activeTab === 'profile' 
              ? 'Manage your personal identity, bank details and emergency records.' 
              : 'Configure your institution\'s global identity and appearance.'}
          </p>
        </div>
        <Button 
          onClick={activeTab === 'profile' ? handleStaffSubmit : handleSchoolSubmit} 
          isLoading={loading}
          className="shadow-xl shadow-primary/20 h-14 px-8 rounded-2xl font-black uppercase text-xs tracking-widest"
        >
          <Save className="w-4 h-4 mr-2" /> Save Changes
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-card border border-white/5 rounded-[2rem] w-fit shadow-inner">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`
              flex items-center gap-3 px-8 py-3.5 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all
              ${activeTab === tab.id 
                ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-105' 
                : 'text-slate-500 hover:text-foreground hover:bg-white/5'}
            `}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.3 }}
            >
              {/* Profile Settings (Universal) */}
              {activeTab === 'profile' && (
                 <div className="space-y-10">
                    {/* Identity Matrix */}
                    <Card className="p-10 border-white/10 rounded-[3rem] bg-card/40 backdrop-blur-xl shadow-2xl space-y-8">
                       <h3 className="text-xl font-black flex items-center gap-3 uppercase italic tracking-tight">
                         <User className="w-6 h-6 text-primary" /> Identity Matrix
                       </h3>
                       <div className="grid md:grid-cols-2 gap-6">
                          <Input label="First Name" value={staffData.firstName} onChange={e => setStaffData({...staffData, firstName: e.target.value})} />
                          <Input label="Last Name" value={staffData.lastName} onChange={e => setStaffData({...staffData, lastName: e.target.value})} />
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">Gender</label>
                            <select 
                              title="Gender Select"
                              className="w-full h-14 bg-card border border-white/5 rounded-2xl px-6 text-sm font-bold text-foreground outline-none focus:border-primary/50"
                              value={staffData.gender}
                              onChange={e => setStaffData({...staffData, gender: e.target.value})}
                            >
                              <option value="">Select Gender</option>
                              <option value="MALE">Male</option>
                              <option value="FEMALE">Female</option>
                              <option value="OTHER">Other</option>
                            </select>
                          </div>
                          <Input label="Date of Birth" type="date" value={staffData.dob} onChange={e => setStaffData({...staffData, dob: e.target.value})} />
                          <Input label="Personal Phone" value={staffData.phone} onChange={e => setStaffData({...staffData, phone: e.target.value})} />
                          <div className="space-y-1.5 md:col-span-2">
                             <label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">Personal Bio</label>
                             <textarea 
                               placeholder="Tell us about yourself..."
                               className="w-full h-32 bg-card border border-white/5 rounded-3xl p-6 text-sm font-bold text-foreground outline-none focus:border-primary/50 resize-none transition-all shadow-inner"
                               value={staffData.bio}
                               onChange={e => setStaffData({...staffData, bio: e.target.value})}
                             />
                          </div>
                       </div>
                    </Card>

                    {/* Treasury & Bank */}
                    <Card className="p-10 border-white/10 rounded-[3rem] bg-card/40 backdrop-blur-xl shadow-2xl space-y-8">
                       <h3 className="text-xl font-black flex items-center gap-3 uppercase italic tracking-tight">
                         <CreditCard className="w-6 h-6 text-emerald-500" /> Treasury & Bank
                       </h3>
                       <div className="grid md:grid-cols-2 gap-6">
                          <Input label="Bank Name" value={staffData.bankDetails.bankName} onChange={e => setStaffData({...staffData, bankDetails: {...staffData.bankDetails, bankName: e.target.value}})} />
                          <Input label="Account Number" value={staffData.bankDetails.accountNumber} onChange={e => setStaffData({...staffData, bankDetails: {...staffData.bankDetails, accountNumber: e.target.value}})} />
                          <Input label="IFSC Code" value={staffData.bankDetails.ifscCode} onChange={e => setStaffData({...staffData, bankDetails: {...staffData.bankDetails, ifscCode: e.target.value}})} />
                          <Input label="Branch Name" value={staffData.bankDetails.branchName} onChange={e => setStaffData({...staffData, bankDetails: {...staffData.bankDetails, branchName: e.target.value}})} />
                       </div>
                    </Card>

                    {/* Emergency Safeguard */}
                    <Card className="p-10 border-white/10 rounded-[3rem] bg-card/40 backdrop-blur-xl shadow-2xl space-y-8">
                       <h3 className="text-xl font-black flex items-center gap-3 uppercase italic tracking-tight text-rose-500">
                         <AlertCircle className="w-6 h-6" /> Emergency Safeguard
                       </h3>
                       <div className="grid md:grid-cols-2 gap-6">
                          <Input label="Guardian Name" value={staffData.emergencyContact.name} onChange={e => setStaffData({...staffData, emergencyContact: {...staffData.emergencyContact, name: e.target.value}})} />
                          <Input label="Relation" placeholder="Father, Spouse, etc." value={staffData.emergencyContact.relation} onChange={e => setStaffData({...staffData, emergencyContact: {...staffData.emergencyContact, relation: e.target.value}})} />
                          <Input label="Emergency Phone" className="md:col-span-2" value={staffData.emergencyContact.phone} onChange={e => setStaffData({...staffData, emergencyContact: {...staffData.emergencyContact, phone: e.target.value}})} />
                       </div>
                    </Card>
                 </div>
              )}

              {/* Admin Tabs */}
              {activeTab === 'general' && isAdmin && (
                <Card className="p-10 border-white/10 rounded-[3rem] bg-card/40 backdrop-blur-xl shadow-2xl space-y-8">
                   <h3 className="text-xl font-black flex items-center gap-3 uppercase italic tracking-tight">
                     <ShieldCheck className="w-6 h-6 text-primary" /> Institutional Profile
                   </h3>
                   <div className="grid md:grid-cols-2 gap-6">
                      <Input label="School Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                      <Input label="Institution Code" value={formData.code} disabled className="opacity-60" />
                      <Input label="Board Affiliation" placeholder="CBSE, ICSE, etc." value={formData.boardAffiliation} onChange={e => setFormData({...formData, boardAffiliation: e.target.value})} />
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-black text-slate-500 ml-1 tracking-widest">Academic Year Start</label>
                        <select 
                          title="Start Month Select"
                          className="w-full h-14 bg-card border border-white/5 rounded-2xl px-6 text-sm font-bold outline-none focus:border-primary/50"
                          value={formData.academicYearStartMonth}
                          onChange={e => setFormData({...formData, academicYearStartMonth: parseInt(e.target.value)})}
                        >
                          <option value={1}>January</option>
                          <option value={4}>April</option>
                          <option value={6}>June</option>
                        </select>
                      </div>
                   </div>
                </Card>
              )}

              {activeTab === 'branding' && isAdmin && (
                <Card className="p-10 border-white/10 rounded-[3rem] bg-card/40 backdrop-blur-xl shadow-2xl space-y-8">
                   <h3 className="text-xl font-black flex items-center gap-3 uppercase italic tracking-tight">
                     <Palette className="w-6 h-6 text-primary" /> Visual Identity
                   </h3>
                   <div className="flex flex-col md:flex-row items-center gap-12">
                      <div className="space-y-4">
                         <label className="text-xs font-black uppercase text-slate-500 tracking-widest">Primary Color</label>
                         <div className="flex items-center gap-6">
                           <input 
                             type="color" 
                             title="Pick Color"
                             value={formData.branding.primaryColor}
                             onChange={e => setFormData({...formData, branding: {...formData.branding, primaryColor: e.target.value}})}
                             className="w-20 h-20 rounded-[1.5rem] bg-transparent border-none cursor-pointer shadow-2xl"
                           />
                           <div className="text-lg font-black font-mono tracking-widest">{formData.branding.primaryColor.toUpperCase()}</div>
                         </div>
                      </div>
                      <div className="flex-1 p-8 rounded-[2rem] bg-primary/5 border border-primary/20 text-center">
                         <p className="text-sm text-slate-400 font-medium italic">
                           Updating this color synchronizes the design language across all staff portals and system-generated reports.
                         </p>
                      </div>
                   </div>
                </Card>
              )}

              {activeTab === 'contact' && isAdmin && (
                <div className="space-y-10">
                   <Card className="p-10 border-white/10 rounded-[3rem] bg-card/40 backdrop-blur-xl shadow-2xl space-y-8">
                      <h3 className="text-xl font-black flex items-center gap-3 uppercase italic tracking-tight">
                        <Globe className="w-6 h-6 text-primary" /> Communication Hub
                      </h3>
                      <div className="grid md:grid-cols-2 gap-6">
                         <Input label="Official Phone" icon={<Phone className="w-4 h-4" />} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                         <Input label="Support Email" icon={<Mail className="w-4 h-4" />} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                         <Input label="Website" className="md:col-span-2" icon={<Globe className="w-4 h-4" />} value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} />
                      </div>
                   </Card>
                   <Card className="p-10 border-white/10 rounded-[3rem] bg-card/40 backdrop-blur-xl shadow-2xl space-y-8">
                      <h3 className="text-xl font-black flex items-center gap-3 uppercase italic tracking-tight">
                        <MapPin className="w-6 h-6 text-primary" /> Location Registry
                      </h3>
                      <div className="grid md:grid-cols-2 gap-6">
                         <Input label="Address Line 1" className="md:col-span-2" value={formData.address.line1} onChange={e => setFormData({...formData, address: {...formData.address, line1: e.target.value}})} />
                         <Input label="City" value={formData.address.city} onChange={e => setFormData({...formData, address: {...formData.address, city: e.target.value}})} />
                         <Input label="Pincode" value={formData.address.pincode} onChange={e => setFormData({...formData, address: {...formData.address, pincode: e.target.value}})} />
                      </div>
                   </Card>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Sidebar Intelligence */}
        <div className="space-y-8">
           <Card className="p-8 border-white/10 rounded-[2.5rem] bg-primary/10 shadow-xl overflow-hidden relative group">
              <ShieldCheck className="absolute -right-4 -bottom-4 w-32 h-32 text-primary opacity-5 group-hover:scale-125 transition-transform" />
              <h4 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-4">Security Protocol</h4>
              <ul className="space-y-4 text-[11px] text-slate-400 font-bold leading-relaxed">
                <li className="flex gap-3 items-start">
                   <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0 shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                   Any changes to your bank registry will undergo automated KYC verification.
                </li>
                <li className="flex gap-3 items-start">
                   <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0 shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                   Institutional settings are locked for non-administrative roles to prevent ecosystem disruption.
                </li>
                <li className="flex gap-3 items-start">
                   <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0 shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                   Emergency contacts are used strictly for safety protocols.
                </li>
              </ul>
           </Card>

           <Card className="p-8 border-white/10 rounded-[2.5rem] bg-card/40 backdrop-blur-xl shadow-xl flex flex-col items-center text-center space-y-6">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-[1.5rem] flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-inner">
                 <Briefcase className="w-10 h-10" />
              </div>
              <div>
                 <h5 className="font-black text-foreground uppercase text-xs tracking-widest">Employment Ledger</h5>
                 <p className="text-[10px] text-slate-500 font-bold mt-1">Designation & Salary are managed by HQ.</p>
              </div>
              <div className="w-full pt-4 border-t border-white/5">
                 <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] mb-2">Designation</p>
                 <p className="text-lg font-black text-primary italic uppercase tracking-tight">{user?.role?.replace(/_/g, ' ')}</p>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
};
