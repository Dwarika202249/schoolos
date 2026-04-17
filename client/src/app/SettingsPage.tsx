import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Palette, Globe, Phone, Mail, MapPin, Save, ShieldCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const SettingsPage = () => {
  const { school, updateSchoolState } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'branding' | 'contact'>('general');
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

  // Sync with auth state
  useEffect(() => {
    if (school) {
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
  }, [school]);

  const handleSubmit = async (e: React.FormEvent) => {
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

  const tabs = [
    { id: 'general', label: 'General Identity', icon: Building2 },
    { id: 'branding', label: 'Theme & Branding', icon: Palette },
    { id: 'contact', label: 'Contact Details', icon: Globe }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Settings</h1>
          <p className="text-slate-500 font-medium">Configure your institution's global identity and appearance.</p>
        </div>
        <Button 
          onClick={handleSubmit} 
          isLoading={loading}
          className="shadow-xl shadow-primary/20"
        >
          <Save className="w-4 h-4 mr-2" /> Save All Changes
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-card border border-white/5 rounded-2xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`
              flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all
              ${activeTab === tab.id 
                ? 'bg-primary text-white shadow-lg' 
                : 'text-slate-500 hover:text-foreground hover:bg-white/5'}
            `}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <form className="lg:col-span-2 space-y-8">
          {/* General Tab */}
          {activeTab === 'general' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 bg-card border border-white/5 p-8 rounded-[2rem]">
               <h3 className="text-lg font-bold flex items-center gap-2">
                 <ShieldCheck className="w-5 h-5 text-primary" /> Institutional Profile
               </h3>
               <div className="grid md:grid-cols-2 gap-4">
                  <Input 
                    label="School Name" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                  />
                  <Input 
                    label="Institution Code" 
                    value={formData.code} 
                    disabled
                    className="opacity-60"
                  />
                  <Input 
                    label="Board Affiliation" 
                    placeholder="CBSE, ICSE, etc."
                    value={formData.boardAffiliation} 
                    onChange={e => setFormData({...formData, boardAffiliation: e.target.value})} 
                  />
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground/80 ml-1">Academic Year Start</label>
                    <select 
                      title="Academic Year Start Month"
                      className="w-full bg-card border border-white/5 rounded-xl px-4 py-3 text-foreground outline-none focus:border-primary/50 transition-all font-bold text-sm"
                      value={formData.academicYearStartMonth}
                      onChange={e => setFormData({...formData, academicYearStartMonth: parseInt(e.target.value)})}
                    >
                      <option value={1}>January</option>
                      <option value={4}>April</option>
                      <option value={6}>June</option>
                    </select>
                  </div>
               </div>
            </motion.div>
          )}

          {/* Branding Tab */}
          {activeTab === 'branding' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 bg-card border border-white/5 p-8 rounded-[2rem]">
               <div className="space-y-6">
                 <h3 className="text-lg font-bold flex items-center gap-2">
                   <Palette className="w-5 h-5 text-primary" /> Visual Identity
                 </h3>
                 <div className="flex items-center gap-12">
                    <div className="space-y-3">
                       <label className="text-sm font-bold text-slate-500">School Primary Color</label>
                       <div className="flex items-center gap-4">
                         <input 
                           type="color" 
                           title="Primary Color Picker"
                           value={formData.branding.primaryColor}
                           onChange={e => setFormData({...formData, branding: {...formData.branding, primaryColor: e.target.value}})}
                           className="w-16 h-16 rounded-2xl bg-transparent border-none cursor-pointer"
                         />
                         <div className="text-sm font-black font-mono tracking-wider">{formData.branding.primaryColor.toUpperCase()}</div>
                       </div>
                    </div>
                    
                    <div className="flex-1 p-6 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-center text-center">
                       <p className="text-xs text-slate-500 font-medium">
                         Changing this color updates buttons, active states, and sidebar accents throughout the dashboard for all your staff.
                       </p>
                    </div>
                 </div>
               </div>
            </motion.div>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 flex flex-col">
              <div className="bg-card border border-white/5 p-8 rounded-[2rem] space-y-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" /> Communication
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                    <Input 
                      label="Official Phone" 
                      icon={<Phone className="w-4 h-4" />}
                      value={formData.phone} 
                      onChange={e => setFormData({...formData, phone: e.target.value})} 
                    />
                    <Input 
                      label="Support Email" 
                      icon={<Mail className="w-4 h-4" />}
                      value={formData.email} 
                      onChange={e => setFormData({...formData, email: e.target.value})} 
                    />
                    <div className="md:col-span-2">
                      <Input 
                        label="Website" 
                        icon={<Globe className="w-4 h-4" />}
                        value={formData.website} 
                        onChange={e => setFormData({...formData, website: e.target.value})} 
                      />
                    </div>
                </div>
              </div>

              <div className="bg-card border border-white/5 p-8 rounded-[2rem] space-y-6 mt-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" /> Location Detail
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Input 
                        label="Address Line 1" 
                        placeholder="Building, Street, Area"
                        value={formData.address.line1} 
                        onChange={e => setFormData({...formData, address: {...formData.address, line1: e.target.value}})} 
                      />
                    </div>
                    <Input 
                      label="City / Town" 
                      value={formData.address.city} 
                      onChange={e => setFormData({...formData, address: {...formData.address, city: e.target.value}})} 
                    />
                     <Input 
                      label="District" 
                      value={formData.address.district} 
                      onChange={e => setFormData({...formData, address: {...formData.address, district: e.target.value}})} 
                    />
                    <Input 
                      label="State" 
                      value={formData.address.state} 
                      onChange={e => setFormData({...formData, address: {...formData.address, state: e.target.value}})} 
                    />
                     <Input 
                      label="Pincode" 
                      value={formData.address.pincode} 
                      onChange={e => setFormData({...formData, address: {...formData.address, pincode: e.target.value}})} 
                    />
                </div>
              </div>
            </motion.div>
          )}
        </form>

        {/* Sidebar help / Info */}
        <div className="space-y-6">
           <div className="bg-primary/10 border border-primary/20 p-6 rounded-3xl">
              <h4 className="font-black text-primary text-sm uppercase mb-3">Settings Tips</h4>
              <ul className="space-y-3 text-xs text-slate-400 font-medium">
                <li className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1 shrink-0" />
                  Institution codes are immutable after registration.
                </li>
                <li className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1 shrink-0" />
                  Updating your primary address here will automatically sync with your **Headquarters** campus in the Branches dashboard.
                </li>
              </ul>
           </div>
        </div>
      </div>
    </div>
  );
};
