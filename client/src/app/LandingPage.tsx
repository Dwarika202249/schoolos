import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShieldCheck, Rocket, LayoutDashboard, Fingerprint, CalendarDays, Wallet, ArrowRight, BookOpen } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Footer } from '../components/Footer';
import { Navbar } from '../components/Navbar';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background overflow-hidden selection:bg-primary/30">
      <Navbar />
      {/* Decorative Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none opacity-50 border-none" />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="relative z-10 w-full max-w-4xl mx-auto">
          
          <motion.div variants={fadeInUp} className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium text-sm">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            Introducing the Next Generation of School Management
          </motion.div>

          <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-black text-foreground tracking-tighter leading-[1.1] mb-8">
            Run your entire school.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Instantly.</span>
          </motion.h1>

          <motion.p variants={fadeInUp} className="text-lg md:text-xl text-slate-400 font-medium max-w-2xl mx-auto mb-12">
            No more scattered spreadsheets or clunky legacy software. School OS unites your attendance, staff, students, and finances under one beautiful, lightning-fast roof.
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full text-lg px-8 py-6 rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
                Start Your School <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full text-lg px-8 py-6 rounded-2xl border-white/10 hover:bg-white/5 bg-transparent text-foreground">
                Sign into Dashboard
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Hero Visual Mockup */}
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mt-20 relative w-full max-w-5xl rounded-3xl overflow-hidden glassmorphism shadow-2xl border border-white/10 bg-card/60 backdrop-blur-xl p-4 md:p-8"
        >
          <img src="/auth-bg.png" alt="Dashboard Preview" className="w-full h-[400px] sm:h-[600px] object-cover rounded-2xl opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </motion.div>
      </section>

      {/* Bento Grid Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative relative z-10">
        <div className="mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tight mb-4">Everything you need.<br/>Nothing you don't.</h2>
          <p className="text-slate-400 text-lg">We designed School OS for humans. It takes minutes to learn and seconds to use.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Feature */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="md:col-span-2 rounded-3xl bg-card border border-white/5 p-8 flex flex-col justify-between overflow-hidden relative group"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[80px] rounded-full group-hover:bg-primary/30 transition-all duration-700" />
            <div className="mb-16">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center mb-6">
                <UsersIcon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Multi-Branch Ecosystem</h3>
              <p className="text-slate-400">Manage 1 or 1,000 campuses from a single pane of glass. Data is strictly hardware-isolated but globally visible to the owner.</p>
            </div>
          </motion.div>

          {/* Secondary Feature */}
          <motion.div whileHover={{ y: -5 }} className="rounded-3xl bg-card border border-white/5 p-8 relative flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center mb-6">
                <Wallet className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Frictionless Finance</h3>
              <p className="text-slate-400">Generate fee invoices, track pending dues, and view daily revenue instantly.</p>
            </div>
          </motion.div>

          {/* Feature 3 */}
          <motion.div whileHover={{ y: -5 }} className="rounded-3xl bg-card border border-white/5 p-8 relative">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6">
              <CalendarDays className="w-6 h-6 text-purple-500" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Smart Attendance</h3>
            <p className="text-slate-400 text-sm">Teachers log daily presence with one tap. Parents get notified instantly if a student is missing.</p>
          </motion.div>

          {/* Feature 4 */}
          <motion.div whileHover={{ y: -5 }} className="rounded-3xl bg-card border border-white/5 p-8 relative md:col-span-2 overflow-hidden group">
             <div className="absolute -bottom-24 -right-24 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
               <ShieldCheck className="w-96 h-96" />
             </div>
             <div className="w-12 h-12 rounded-2xl bg-rose-500/20 flex items-center justify-center mb-6">
              <Fingerprint className="w-6 h-6 text-rose-500" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">Military-grade Privacy</h3>
            <p className="text-slate-400">We don't sell data. We encrypt it. Your students' and staffs' information is cryptographically protected against external breaches.</p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 border-t border-white/5 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tight mb-4">Radically Simple Pricing.</h2>
            <p className="text-slate-400 text-lg">No hidden installation fees. Setup happens in 30 seconds.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-8">
            <motion.div whileHover={{ scale: 1.02 }} className="bg-card border border-white/10 rounded-3xl p-8 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold text-slate-300 mb-2">Standard Orbit</h3>
                <p className="text-5xl font-black text-foreground mb-6">Free</p>
                <ul className="space-y-4 mb-8">
                  <li className="flex gap-3 text-slate-400"><ShieldCheck className="text-primary w-5 h-5"/> Single Branch Support</li>
                  <li className="flex gap-3 text-slate-400"><ShieldCheck className="text-primary w-5 h-5"/> 1,000 Students Max</li>
                  <li className="flex gap-3 text-slate-400"><ShieldCheck className="text-primary w-5 h-5"/> Basic Analytics</li>
                </ul>
              </div>
              <Button variant="outline" className="w-full py-6 rounded-xl border-white/10 text-foreground">Current MVP Tier</Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.02 }} className="bg-gradient-to-b from-primary/20 to-card border border-primary/30 rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden">
               <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-4 py-1 rounded-bl-xl">POPULAR</div>
              <div>
                <h3 className="text-2xl font-bold text-primary mb-2">Enterprise Nexus</h3>
                <p className="text-5xl font-black text-foreground mb-6">$199<span className="text-lg text-slate-500 font-normal">/mo</span></p>
                <ul className="space-y-4 mb-8">
                  <li className="flex gap-3 text-slate-200"><ShieldCheck className="text-primary w-5 h-5"/> Infinite Branches</li>
                  <li className="flex gap-3 text-slate-200"><ShieldCheck className="text-primary w-5 h-5"/> Infinite Students</li>
                  <li className="flex gap-3 text-slate-200"><ShieldCheck className="text-primary w-5 h-5"/> Custom Themes & App</li>
                </ul>
              </div>
              <Button className="w-full py-6 rounded-xl hover:scale-105 transition-transform">Contact Sales</Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About & Trust Section */}
      <section id="about" className="py-32 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <BookOpen className="w-16 h-16 text-slate-800 mx-auto mb-8" />
        <h2 className="text-3xl font-bold text-foreground mb-6">Built for Educators, by Technologists.</h2>
        <p className="text-xl text-slate-400 leading-relaxed">
          The education sector has been abandoned by modern software design for too long, cursed with clunky interfaces from 2005. At School OS, we firmly believe that managing a child's educational environment should feel just as fast, premium, and magical as using the world's best consumer apps.
        </p>
      </section>

      <Footer />
    </div>
  );
};

function UsersIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
