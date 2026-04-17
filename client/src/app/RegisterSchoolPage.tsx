import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Building2, User, Mail, Lock, Globe } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';

export const RegisterSchoolPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      navigate('/');
    }, 1500);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 flex items-center justify-center p-4 py-16">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-5 gap-8">

        {/* Left Side: Info */}
        <div className="lg:col-span-2 space-y-8 py-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Launch your school on Cloud.</h2>
            <p className="text-lg text-slate-600">Join the elite schools using School OS for zero-friction management.</p>
          </div>

          <div className="space-y-6">
            {[
              { title: 'Free Pilot', desc: '12-month full access at zero cost.', icon: ShieldCheck },
              { title: 'Data Privacy', desc: 'Hardware-grade isolation for your school.', icon: Building2 },
              { title: 'Multi-Branch', desc: 'Scale to infinite campuses instantly.', icon: Globe },
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">{item.title}</p>
                  <p className="text-sm text-slate-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 bg-slate-900 rounded-3xl text-white">
            <p className="text-sm font-medium italic opacity-80">
              "By far the most intuitive onboarding we've ever experienced in an ERP."
            </p>
            <p className="mt-4 text-xs font-bold uppercase tracking-widest text-primary">Delhi Intl. School</p>
          </div>
        </div>

        {/* Right Side: Form */}
        <Card className="lg:col-span-3 p-8 border-none shadow-2xl">
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-slate-900 border-l-4 border-primary pl-4">School Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="School Name" placeholder="e.g. Modern Academy" icon={<Building2 className="w-5 h-5" />} required />
                <Input label="Short Code / Slug" placeholder="e.g. m-acad" required />
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-bold text-slate-900 border-l-4 border-primary pl-4">Owner Profile</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="First Name" placeholder="John" icon={<User className="w-5 h-5" />} required />
                <Input label="Last Name" placeholder="Doe" required />
              </div>
              <Input label="Email Address" type="email" placeholder="admin@school.com" icon={<Mail className="w-5 h-5" />} required />
              <Input label="Password" type="password" placeholder="••••••••" icon={<Lock className="w-5 h-5" />} required />
            </div>

            <div className="pt-4">
              <Button size="lg" className="w-full text-base py-6 shadow-xl" isLoading={loading}>
                Register & Setup School Account
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <p className="mt-6 text-center text-sm text-slate-500">
                Already have a school account? {' '}
                <Link to="/login" className="text-primary font-bold hover:underline">Sign In</Link>
              </p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
