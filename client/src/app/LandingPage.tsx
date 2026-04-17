import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  ArrowRight, 
  Users, 
  ShieldCheck, 
  Zap, 
  LayoutDashboard,
  Building2,
  TrendingUp,
  Fingerprint
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export const LandingPage = () => {
  return (
    <div className="bg-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden bg-slate-50">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-bold mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <Zap className="w-4 h-4 fill-primary" />
              <span>Next-Gen School ERP for Indian K-12</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              The OS that makes your <span className="text-primary italic">School Intelligent.</span>
            </h1>
            <p className="text-xl text-slate-600 mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-1000">
              Unify fee collection, attendance, academics, and payroll into a single, agentic system. Built for speed, security, and multiple campuses.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
              <Link to="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto px-10 h-16 text-lg tracking-wide group">
                  Start Your 12-Month Pilot 
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto px-10 h-16 text-xl">
                  Sign In
                </Button>
              </Link>
            </div>
            
            <div className="mt-16 flex items-center justify-center gap-8 text-slate-400 grayscale opacity-60">
              <Building2 className="w-8 h-8" />
              <div className="h-4 w-px bg-slate-200" />
              <span className="font-bold text-lg uppercase tracking-widest">Multi-Branch Ready</span>
              <div className="h-4 w-px bg-slate-200" />
              <ShieldCheck className="w-8 h-8" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Built for modern administrators.</h2>
            <p className="text-lg text-slate-500">Stop fighting your software. Start leading your school.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Fee Intelligence',
                desc: 'Real-time defaulter tracking, automatic ledger generation, and 30-second fee collection flow.',
                icon: TrendingUp
              },
              {
                title: 'Tenant Isolation',
                desc: 'Every school belongs to its own hard-walled data secure layer. Your data never mixes.',
                icon: ShieldCheck
              },
              {
                title: 'Mobile-First PWA',
                desc: 'Works flawlessly on any phone, tablet or desktop. No app store installation required.',
                icon: LayoutDashboard
              },
              {
                title: 'AI-Ready Schema',
                desc: 'Exportable JSON/CSV data ready to power your school’s own RAG and AI-insight pipelines.',
                icon: Zap
              },
              {
                title: 'Role-Aware Dashboards',
                desc: 'Tailored experiences for Owners, Admins, Teachers, Parents and Students.',
                icon: Users
              },
              {
                title: 'Academic Perfection',
                desc: 'Flexible class-section logic, subject masters, and rapid attendance marking.',
                icon: CheckCircle2
              }
            ].map((f, i) => (
              <div key={i} className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all group">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm group-hover:bg-primary group-hover:text-white transition-colors mb-6">
                  <f.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
                <p className="text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Quote */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat" />
        </div>
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <p className="text-3xl md:text-4xl font-medium leading-tight mb-8">
            "School OS is the first ERP that actually understands the administrative chaos of Indian schools. It turned our 3-day fee closing cycle into a 30-minute task."
          </p>
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-primary">DS</div>
            <div className="text-left">
              <p className="font-bold text-lg">Dr. Sameer Gupta</p>
              <p className="text-slate-400">Director, Delhi International School</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="py-32 bg-slate-50 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-8 tracking-tight">Ready to lead with Intelligence?</h2>
          <Link to="/register">
            <Button size="lg" className="px-12 h-16 text-lg shadow-2xl">Create Your School Account</Button>
          </Link>
          <p className="mt-6 text-slate-500 font-medium italic">Join 5 Pilot Schools in the Phase 0 rollout.</p>
        </div>
      </section>
    </div>
  );
};
