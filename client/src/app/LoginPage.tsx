import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Building2, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate Login
    setTimeout(() => {
      setLoading(false);
      navigate('/');
    }, 1200);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Welcome Back.</h2>
          <p className="text-slate-500 font-medium tracking-tight">Access your institutional portal.</p>
        </div>

        <Card className="p-8 shadow-2xl border-none">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input 
              label="School Short Code / Slug" 
              placeholder="e.g. dps-delhi" 
              icon={<Building2 className="w-5 h-5" />} 
              required 
            />
            <Input 
              label="Email Address" 
              type="email" 
              placeholder="admin@school.com" 
              icon={<Mail className="w-5 h-5" />} 
              required 
            />
            <div className="space-y-1">
              <Input 
                label="Password" 
                type="password" 
                placeholder="••••••••" 
                icon={<Lock className="w-5 h-5" />} 
                required 
              />
              <div className="text-right">
                <button type="button" className="text-xs font-bold text-primary hover:underline">Forgot Password?</button>
              </div>
            </div>

            <Button size="lg" className="w-full text-base py-6 shadow-xl" isLoading={loading}>
              Sign In to Dashboard
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>

            <p className="text-center text-sm text-slate-500 pt-4 border-t border-slate-50">
              New to School OS? {' '}
              <Link to="/register" className="text-primary font-bold hover:underline">Register your school</Link>
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
};
