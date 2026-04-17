import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Building2, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    schoolSlug: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formData);
      navigate('/dashboard');
    } catch (error) {
      // toast is already handled in useAuth
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
              name="schoolSlug"
              placeholder="e.g. dps-delhi" 
              icon={<Building2 className="w-5 h-5" />} 
              value={formData.schoolSlug}
              onChange={handleChange}
              required 
            />
            <Input 
              label="Email Address" 
              name="email"
              type="email" 
              placeholder="admin@school.com" 
              icon={<Mail className="w-5 h-5" />} 
              value={formData.email}
              onChange={handleChange}
              required 
            />
            <div className="space-y-1">
              <Input 
                label="Password" 
                name="password"
                type="password" 
                placeholder="••••••••" 
                icon={<Lock className="w-5 h-5" />} 
                value={formData.password}
                onChange={handleChange}
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
