import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, MapPin, Phone, Mail, ShieldCheck, Check } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import api from '../utils/api';
import toast from 'react-hot-toast';

interface BranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  branch?: any; // If present, we are editing
}

export const BranchModal: React.FC<BranchModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  branch
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: {
      line1: '',
      city: '',
      district: '',
      state: '',
      pincode: ''
    },
    phone: '',
    email: '',
    isHeadquarters: false
  });

  useEffect(() => {
    if (branch) {
      setFormData({
        name: branch.name || '',
        code: branch.code || '',
        address: {
          line1: branch.address?.line1 || '',
          city: branch.address?.city || '',
          district: branch.address?.district || '',
          state: branch.address?.state || '',
          pincode: branch.address?.pincode || ''
        },
        phone: branch.phone || '',
        email: branch.email || '',
        isHeadquarters: branch.isHeadquarters || false
      });
    } else {
      setFormData({
        name: '',
        code: '',
        address: { line1: '', city: '', district: '', state: '', pincode: '' },
        phone: '',
        email: '',
        isHeadquarters: false
      });
    }
  }, [branch, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (branch) {
        await api.patch(`/tenant/branches/${branch._id}`, formData);
        toast.success('Branch updated successfully');
      } else {
        await api.post('/tenant/branches', formData);
        toast.success('New branch registered');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      const msg = error.response?.data?.error?.message || error.response?.data?.message || 'Action failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-card border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight">{branch ? 'Edit Branch' : 'New Branch'}</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">Campus Registration</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-3 rounded-2xl hover:bg-white/5 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              {/* Identity */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                   <ShieldCheck className="w-4 h-4" /> Identity
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                   <Input 
                      label="Branch Name" 
                      placeholder="e.g. North City Campus"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      required
                   />
                   <Input 
                      label="Branch Code" 
                      placeholder="e.g. NC-01"
                      value={formData.code}
                      onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                      required
                   />
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                   <Phone className="w-4 h-4" /> Contact
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                   <Input 
                      label="Official Email" 
                      icon={<Mail className="w-4 h-4" />}
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                   />
                   <Input 
                      label="Contact Number" 
                      icon={<Phone className="w-4 h-4" />}
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                   />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                   <MapPin className="w-4 h-4" /> Location
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                   <div className="md:col-span-2">
                    <Input 
                        label="Address Line 1" 
                        value={formData.address.line1}
                        onChange={e => setFormData({...formData, address: {...formData.address, line1: e.target.value}})}
                        required
                    />
                   </div>
                   <Input 
                      label="City" 
                      value={formData.address.city}
                      onChange={e => setFormData({...formData, address: {...formData.address, city: e.target.value}})}
                      required
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
                      required
                   />
                   <Input 
                      label="Pincode" 
                      value={formData.address.pincode}
                      onChange={e => setFormData({...formData, address: {...formData.address, pincode: e.target.value}})}
                      required
                   />
                </div>
              </div>

              {/* Settings */}
              <div className="pt-4">
                 <button
                   type="button"
                   onClick={() => setFormData({...formData, isHeadquarters: !formData.isHeadquarters})}
                   className={`
                     w-full flex items-center justify-between p-6 rounded-3xl border transition-all group
                     ${formData.isHeadquarters 
                       ? 'bg-primary/5 border-primary/40 shadow-xl shadow-primary/5' 
                       : 'bg-white/5 border-white/5 hover:border-white/10'}
                   `}
                 >
                    <div className="text-left">
                       <p className={`font-bold ${formData.isHeadquarters ? 'text-primary' : 'text-foreground'}`}>Headquarters Location</p>
                       <p className="text-xs text-slate-500 font-medium">This will be the primary branch for school-wide reports.</p>
                    </div>
                    <div className={`
                      w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                      ${formData.isHeadquarters ? 'bg-primary border-primary' : 'border-slate-700 group-hover:border-slate-500'}
                    `}>
                       {formData.isHeadquarters && <Check className="w-4 h-4 text-white stroke-[4]" />}
                    </div>
                 </button>
              </div>
            </form>

            {/* Footer */}
            <div className="p-8 border-t border-white/5 bg-white/5 flex gap-4">
              <Button 
                variant="outline" 
                onClick={onClose}
                className="flex-1 py-6 rounded-2xl border-white/5 hover:bg-white/5 font-bold"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                isLoading={loading}
                className="flex-1 py-6 rounded-2xl font-black shadow-xl shadow-primary/20"
              >
                {branch ? 'Update Campus' : 'Register Branch'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
