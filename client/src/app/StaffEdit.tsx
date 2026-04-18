import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  User, 
  Mail, 
  Briefcase, 
  Building2, 
  Calendar,
  CreditCard,
  PhoneCall,
  ShieldCheck,
  UserCog
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import api from '../utils/api';
import toast from 'react-hot-toast';

const DESIGNATIONS = [
  'PRINCIPAL', 'VICE_PRINCIPAL', 'HEAD_OF_DEPARTMENT', 'SENIOR_TEACHER', 
  'TEACHER', 'ASSISTANT_TEACHER', 'LAB_ASSISTANT', 'LIBRARIAN', 
  'ACCOUNTANT', 'CLERK', 'PEON', 'SECURITY', 'DRIVER', 'OTHER'
];

const EMPLOYMENT_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'GUEST'];

export const StaffEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [branches, setBranches] = useState<any[]>([]);
  
  const [formData, setFormData] = useState<any>({
    firstName: '',
    lastName: '',
    email: '',
    role: 'TEACHER',
    branchId: '',
    
    employeeId: '',
    designation: 'TEACHER',
    department: '',
    employmentType: 'FULL_TIME',
    joiningDate: '',
    
    emergencyContact: {
      name: '',
      relation: '',
      phone: ''
    },
    
    bankDetails: {
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      accountHolderName: ''
    }
  });

  useEffect(() => {
    const init = async () => {
      try {
        setInitialLoading(true);
        const [branchRes, staffRes] = await Promise.all([
          api.get('/tenant/branches'),
          api.get(`/staff/${id}`)
        ]);
        
        setBranches(branchRes.data.data);
        const staff = staffRes.data.data;
        
        setFormData({
          firstName: staff.userId?.firstName || '',
          lastName: staff.userId?.lastName || '',
          email: staff.userId?.email || '',
          role: staff.userId?.role || 'TEACHER',
          branchId: staff.branchId?._id || staff.branchId || '',
          
          employeeId: staff.employeeId,
          designation: staff.designation,
          department: staff.department || '',
          employmentType: staff.employmentType,
          joiningDate: staff.joiningDate?.split('T')[0] || '',
          
          emergencyContact: {
            name: staff.emergencyContact?.name || '',
            relation: staff.emergencyContact?.relation || '',
            phone: staff.emergencyContact?.phone || ''
          },
          
          bankDetails: {
            bankName: staff.bankDetails?.bankName || '',
            accountNumber: staff.bankDetails?.accountNumber || '',
            ifscCode: staff.bankDetails?.ifscCode || '',
            accountHolderName: staff.bankDetails?.accountHolderName || ''
          }
        });
      } catch (err) {
        toast.error('Failed to load details');
        navigate('/staff');
      } finally {
        setInitialLoading(false);
      }
    };
    init();
  }, [id, navigate]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev: any) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch(`/staff/${id}`, formData);
      toast.success('Staff details updated');
      navigate(`/staff/${id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return (
    <div className="p-20 flex flex-col items-center justify-center space-y-6">
       <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin" />
       <p className="font-black text-slate-500 uppercase tracking-[0.2em] animate-pulse">Loading Details...</p>
    </div>
  );

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Button variant="outline" size="sm" onClick={() => navigate(`/staff/${id}`)} className="bg-card/40 backdrop-blur-md border-white/10 rounded-xl px-6">
            <ArrowLeft className="w-5 h-5 mr-1" />
            Go Back
          </Button>
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tight uppercase">Edit Staff Details</h1>
            <p className="text-slate-500 font-medium text-sm text-slate-400">Updating profile for <span className="text-primary font-black uppercase text-xs">{formData.employeeId}</span></p>
          </div>
        </div>
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
           <UserCog className="w-8 h-8" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10 pb-20 font-sans">
        {/* Core Identity */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-l-4 border-primary pl-4">
             <ShieldCheck className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-black text-foreground uppercase tracking-widest italic">1. Account Details</h3>
          </div>
          <Card className="p-8 border-white/20 shadow-2xl shadow-black/60 bg-card/40 backdrop-blur-xl grid grid-cols-1 md:grid-cols-2 gap-8 rounded-[2.5rem] hover:border-primary/40 transition-all duration-300">
            <Input label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} icon={<User className="w-5 h-5" />} required />
            <Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required />
            <Input label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} icon={<Mail className="w-5 h-5" />} required />
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Branch Name</label>
              <select name="branchId" value={formData.branchId} onChange={handleChange} title="Select Branch" className="w-full h-12 bg-white/5 border border-white/20 rounded-xl px-4 text-slate-300 font-medium focus:ring-2 focus:ring-primary/20 outline-none" required>
                {branches.map(b => (
                  <option key={b.id || b._id} value={b.id || b._id} className="bg-slate-900 text-white">{b.name}</option>
                ))}
              </select>
            </div>
          </Card>
        </section>

        {/* Professional Details */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-l-4 border-primary pl-4">
             <Briefcase className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-black text-foreground uppercase tracking-widest italic">2. Employment Details</h3>
          </div>
          <Card className="p-8 border-white/20 shadow-2xl shadow-black/60 bg-card/40 backdrop-blur-xl grid grid-cols-1 md:grid-cols-2 gap-8 rounded-[2.5rem] hover:border-primary/40 transition-all duration-300">
            <Input label="Employee ID" value={formData.employeeId} disabled className="bg-white/5 cursor-not-allowed font-mono text-primary shadow-inner opacity-70 border-white/20" />
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Job Designation</label>
              <select name="designation" value={formData.designation} onChange={handleChange} title="Select Designation" className="w-full h-12 bg-white/5 border border-white/20 rounded-xl px-4 text-slate-300 font-medium focus:ring-2 focus:ring-primary/20 outline-none">
                {DESIGNATIONS.map(d => <option key={d} value={d} className="bg-slate-900 text-white">{d.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <Input label="Department" name="department" value={formData.department} onChange={handleChange} placeholder="e.g. Science, Maths, IT" icon={<Building2 className="w-5 h-5" />} />
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Employment Type</label>
              <select name="employmentType" value={formData.employmentType} onChange={handleChange} title="Select Employment Type" className="w-full h-12 bg-white/5 border border-white/20 rounded-xl px-4 text-slate-300 font-medium focus:ring-2 focus:ring-primary/20 outline-none">
                {EMPLOYMENT_TYPES.map(e => <option key={e} value={e} className="bg-slate-900 text-white">{e.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <Input label="Date of Joining" name="joiningDate" type="date" value={formData.joiningDate} onChange={handleChange} icon={<Calendar className="w-5 h-5" />} required />
          </Card>
        </section>

        {/* Financial & Emergency */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <section className="space-y-6">
                <div className="flex items-center gap-3 border-l-4 border-rose-500 pl-4">
                    <PhoneCall className="w-5 h-5 text-rose-500" />
                    <h3 className="text-sm font-black text-foreground uppercase tracking-widest italic">3. Emergency Contact</h3>
                </div>
                <Card className="p-8 border-white/20 shadow-2xl shadow-black/60 bg-card/40 backdrop-blur-xl space-y-6 rounded-[2.5rem] hover:border-rose-500/30 transition-all duration-300">
                    <Input label="Contact Person" name="emergencyContact.name" value={formData.emergencyContact.name} onChange={handleChange} icon={<User className="w-5 h-5" />} />
                    <Input label="Relationship" name="emergencyContact.relation" value={formData.emergencyContact.relation} onChange={handleChange} />
                    <Input label="Phone Number" name="emergencyContact.phone" value={formData.emergencyContact.phone} onChange={handleChange} />
                </Card>
            </section>

            <section className="space-y-6">
                <div className="flex items-center gap-3 border-l-4 border-emerald-500 pl-4">
                    <CreditCard className="w-5 h-5 text-emerald-500" />
                    <h3 className="text-sm font-black text-foreground uppercase tracking-widest italic">4. Bank Details</h3>
                </div>
                <Card className="p-8 border-white/20 shadow-2xl shadow-black/60 bg-card/40 backdrop-blur-xl space-y-6 rounded-[2.5rem] hover:border-emerald-500/30 transition-all duration-300">
                    <Input label="Bank Name" name="bankDetails.bankName" value={formData.bankDetails.bankName} onChange={handleChange} icon={<Building2 className="w-5 h-5" />} />
                    <Input label="Account Number" name="bankDetails.accountNumber" value={formData.bankDetails.accountNumber} onChange={handleChange} />
                    <Input label="IFSC Code" name="bankDetails.ifscCode" value={formData.bankDetails.ifscCode} onChange={handleChange} />
                </Card>
            </section>
        </div>

        <div className="flex justify-end gap-6 pt-10">
           <Button variant="outline" type="button" onClick={() => navigate(`/staff/${id}`)} className="rounded-2xl px-12 h-16 border-white/10 bg-card/40 backdrop-blur-md">
              Discard Changes
           </Button>
           <Button type="submit" size="lg" className="shadow-2xl px-16 h-16 rounded-2xl text-lg font-black tracking-tight" isLoading={loading}>
            <Save className="w-6 h-6 mr-3" />
            Update Profile
          </Button>
        </div>
      </form>
    </div>
  );
};
