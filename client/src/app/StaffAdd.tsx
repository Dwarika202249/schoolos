import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  User, 
  Mail, 
  Lock, 
  Briefcase, 
  Building2, 
  Calendar,
  CreditCard,
  PhoneCall
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

export const StaffAdd = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'TEACHER',
    branchId: '', // Should be selected from a list in real app
    
    employeeId: '',
    designation: 'TEACHER',
    department: '',
    employmentType: 'FULL_TIME',
    joiningDate: new Date().toISOString().split('T')[0],
    
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

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent as keyof typeof prev] as any, [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/staff', formData);
      toast.success('Staff member registered successfully');
      navigate('/staff');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add staff member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/staff')} className="bg-white">
          <ArrowLeft className="w-5 h-5 mr-1" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Onboard Staff</h1>
          <p className="text-slate-500 font-medium text-sm">Create a user account and professional profile.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 pb-20">
        {/* Account Details */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-4 border-l-4 border-primary pl-4">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter">1. Account Details</h3>
          </div>
          <Card className="p-6 border-none shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6 bg-white">
            <Input label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} icon={<User className="w-5 h-5" />} required />
            <Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required />
            <Input label="Email Official" name="email" type="email" value={formData.email} onChange={handleChange} icon={<Mail className="w-5 h-5" />} required />
            <Input label="Default Password" name="password" type="password" value={formData.password} onChange={handleChange} icon={<Lock className="w-5 h-5" />} required />
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">System Role</label>
              <select name="role" value={formData.role} onChange={handleChange} title="Select Role" className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 text-slate-700 font-medium focus:ring-2 focus:ring-primary/20">
                <option value="TEACHER">Teacher</option>
                <option value="ADMIN">Admin / Clerk</option>
                <option value="STAFF">Support Staff</option>
              </select>
            </div>
            {/* Added dummy branchId for MVP setup */}
            <Input label="Branch ID (Auto-fill)" name="branchId" value={formData.branchId} onChange={handleChange} placeholder="Paste a branch ID" required />
          </Card>
        </section>

        {/* Professional Details */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-4 border-l-4 border-primary pl-4">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter">2. Professional Profile</h3>
          </div>
          <Card className="p-6 border-none shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6 bg-white">
            <Input label="Employee ID" name="employeeId" value={formData.employeeId} onChange={handleChange} icon={<Briefcase className="w-5 h-5" />} placeholder="e.g. STF001" required />
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Designation</label>
              <select name="designation" value={formData.designation} onChange={handleChange} title="Select Designation" className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 text-slate-700 font-medium focus:ring-2 focus:ring-primary/20">
                {DESIGNATIONS.map(d => <option key={d} value={d}>{d.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <Input label="Department" name="department" value={formData.department} onChange={handleChange} placeholder="e.g. Science, Maths, IT" />
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Employment Type</label>
              <select name="employmentType" value={formData.employmentType} onChange={handleChange} title="Select Employment Type" className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 text-slate-700 font-medium focus:ring-2 focus:ring-primary/20">
                {EMPLOYMENT_TYPES.map(e => <option key={e} value={e}>{e.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <Input label="Joining Date" name="joiningDate" type="date" value={formData.joiningDate} onChange={handleChange} icon={<Calendar className="w-5 h-5" />} required />
          </Card>
        </section>

        {/* Emergency Contact */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-4 border-l-4 border-primary pl-4">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter">3. Emergency Contact</h3>
          </div>
          <Card className="p-6 border-none shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6 bg-white">
            <Input label="Contact Name" name="emergencyContact.name" value={formData.emergencyContact.name} onChange={handleChange} icon={<User className="w-5 h-5" />} required />
            <Input label="Relation" name="emergencyContact.relation" value={formData.emergencyContact.relation} onChange={handleChange} placeholder="e.g. Spouse, Parent" required />
            <Input label="Phone Number" name="emergencyContact.phone" value={formData.emergencyContact.phone} onChange={handleChange} icon={<PhoneCall className="w-5 h-5" />} required />
          </Card>
        </section>

        {/* Bank Details */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-4 border-l-4 border-primary pl-4">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter">4. Bank & Compensation</h3>
          </div>
          <Card className="p-6 border-none shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6 bg-white">
            <Input label="Bank Name" name="bankDetails.bankName" value={formData.bankDetails.bankName} onChange={handleChange} icon={<Building2 className="w-5 h-5" />} required />
            <Input label="Account Number" name="bankDetails.accountNumber" value={formData.bankDetails.accountNumber} onChange={handleChange} icon={<CreditCard className="w-5 h-5" />} required />
            <Input label="IFSC Code" name="bankDetails.ifscCode" value={formData.bankDetails.ifscCode} onChange={handleChange} required />
            <Input label="Account Holder Name" name="bankDetails.accountHolderName" value={formData.bankDetails.accountHolderName} onChange={handleChange} required />
          </Card>
        </section>

        <div className="fixed bottom-8 right-8 left-8 lg:left-72 z-50 transition-all flex justify-end">
          <Button type="submit" size="lg" className="shadow-2xl px-12 py-7 text-lg rounded-2xl" isLoading={loading}>
            <Save className="w-6 h-6 mr-2" />
            Save & Add Staff
          </Button>
        </div>
      </form>
    </div>
  );
};
