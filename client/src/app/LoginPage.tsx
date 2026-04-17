import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, BookOpen, Building2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [schoolSlug, setSchoolSlug] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password, schoolSlug: schoolSlug || undefined });
      navigate('/dashboard');
    } catch (error) {
      // Errors handled by toast in useAuth
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Pane - Visuals */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="hidden lg:flex w-1/2 relative bg-card overflow-hidden items-center justify-center border-r border-white/5"
      >
        <img src="/auth-bg.png" alt="Abstract Background" className="absolute inset-0 w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        
        <div className="relative z-10 max-w-lg px-12 text-center">
          <div className="w-20 h-20 bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <BookOpen className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-4xl font-black text-white tracking-tight mb-4 leading-tight">Welcome back to the future of education.</h2>
          <p className="text-lg text-slate-300">Sign in to your School OS workspace to manage your campus, students, and finances securely.</p>
        </div>
      </motion.div>

      {/* Right Pane - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
        <Link to="/" className="absolute top-8 right-8 text-sm font-semibold text-slate-400 hover:text-white transition-colors">
          &larr; Back to Home
        </Link>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md space-y-8"
        >
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">Sign In</h1>
            <p className="text-slate-400 mt-2 text-sm">Enter your credentials to access your dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Input
                label="Workspace Slug (Optional)"
                placeholder="e.g. m-acad"
                icon={<Building2 className="w-5 h-5" />}
                value={schoolSlug}
                onChange={(e) => setSchoolSlug(e.target.value)}
              />
              <Input
                label="Official Email"
                type="email"
                placeholder="you@school.com"
                icon={<Mail className="w-5 h-5" />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                icon={<Lock className="w-5 h-5" />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" size="lg" className="w-full text-base py-6 shadow-xl shadow-primary/20" isLoading={loading}>
              Access Dashboard <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <p className="text-center text-sm text-slate-500 font-medium">
              Don't have a workspace? <Link to="/register" className="text-primary hover:underline hover:text-white transition-colors">Register your school</Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
};
