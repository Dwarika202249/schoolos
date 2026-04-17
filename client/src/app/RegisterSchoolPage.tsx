import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Building2, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';

export const RegisterSchoolPage = () => {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    ownerEmail: '',
    ownerPassword: '',
    firstName: '',
    lastName: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        slug: formData.slug,
        owner: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.ownerEmail,
          password: formData.ownerPassword,
        }
      };
      await register(payload);
      navigate('/dashboard');
    } catch (error) {
      // Handled in context
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Left Pane - Marketing */}
      <motion.div 
        initial={{ opacity: 0, flex: 0 }}
        animate={{ opacity: 1, flex: 1 }}
        transition={{ duration: 0.8 }}
        className="hidden lg:flex lg:w-5/12 bg-card relative overflow-hidden flex-col justify-between p-12 border-r border-white/5"
      >
        <img src="/auth-bg.png" alt="Abstract Background" className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-screen" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />

        <div className="relative z-10">
          <Link to="/" className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
             <ShieldCheck className="w-6 h-6 text-primary" /> School OS
          </Link>
        </div>

        <div className="relative z-10 space-y-6">
           <h2 className="text-4xl font-black text-white tracking-tight leading-tight">Build the ultimate environment for your staff and students.</h2>
           <p className="text-slate-400 text-lg">Secure your digital campus today. Registration takes less than 30 seconds.</p>
           
           <div className="pt-8 flex items-center gap-4 border-t border-white/10">
             <div className="flex -space-x-3">
               {[1,2,3].map(i => (
                 <div key={i} className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-xs font-bold text-white">
                   {String.fromCharCode(64+i)}
                 </div>
               ))}
             </div>
             <p className="text-sm font-medium text-slate-400">Join 500+ premium schools worldwide.</p>
           </div>
        </div>
      </motion.div>

      {/* Right Pane - Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 relative">
        <Link to="/login" className="absolute top-8 right-8 text-sm font-semibold text-slate-400 hover:text-white transition-colors">
          Sign In Instead
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full max-w-xl"
        >
          <div className="mb-8">
            <h1 className="text-3xl font-black text-foreground tracking-tight">Setup your Workspace</h1>
            <p className="text-slate-400 mt-2 text-sm">Create your multi-tenant isolation unit in seconds.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* School Profile */}
            <div className="space-y-4">
              <h3 className="text-xs uppercase tracking-widest font-bold text-primary">School Profile</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="School Name" name="name" placeholder="Modern Academy" icon={<Building2 className="w-5 h-5" />} value={formData.name} onChange={handleChange} required />
                <Input label="Short Code / Slug" name="slug" placeholder="m-acad" value={formData.slug} onChange={handleChange} required />
              </div>
            </div>

            {/* Owner Identity */}
            <div className="space-y-4">
               <h3 className="text-xs uppercase tracking-widest font-bold text-primary">Owner Identity</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="First Name" name="firstName" placeholder="John" icon={<User className="w-5 h-5" />} value={formData.firstName} onChange={handleChange} required />
                <Input label="Last Name" name="lastName" placeholder="Doe" value={formData.lastName} onChange={handleChange} required />
              </div>
              <Input label="Official Email" name="ownerEmail" type="email" placeholder="admin@school.com" icon={<Mail className="w-5 h-5" />} value={formData.ownerEmail} onChange={handleChange} required />
              <Input label="Password" name="ownerPassword" type="password" placeholder="••••••••" icon={<Lock className="w-5 h-5" />} value={formData.ownerPassword} onChange={handleChange} required />
            </div>

            <Button type="submit" size="lg" className="w-full text-base py-6 shadow-xl shadow-primary/20" isLoading={loading}>
              Create School Workspace <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};
