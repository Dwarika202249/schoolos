import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  BarChart3, 
  Wallet, 
  ShieldCheck, 
  LayoutDashboard, 
  Building2, 
  Search, 
  Cloud,
  Zap
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export const FeaturesPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[100px] rounded-full -mr-64 -mt-64" />
        
        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={fadeInUp}
          className="text-center space-y-4 max-w-3xl mx-auto"
        >
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
            Everything your school<br />
            <span className="text-primary">ever needed.</span>
          </h1>
          <p className="text-lg text-slate-400">
            A comprehensive suite of administrative modules designed to scale. From 
            individual classrooms to global multi-branch empires.
          </p>
        </motion.div>
      </section>

      {/* Main Feature - Multi Branch */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Multi-Branch Management</h2>
            <p className="text-slate-400 leading-relaxed">
              Managing multiple campuses used to be a technical nightmare. With School OS, 
              it's native. Switch between branches in a heartbeat while keeping 
              data logically and physically isolated.
            </p>
            <ul className="space-y-3 font-medium text-slate-300">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                Inter-branch data isolation
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                Global owner overview dashboard
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                Branch-specific administrative roles
              </li>
            </ul>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            whileInView={{ opacity: 1, scale: 1 }} 
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-gradient-to-tr from-primary/10 to-purple-500/10 rounded-3xl p-8 border border-white/5 backdrop-blur-3xl">
               <img src="/auth-bg.png" alt="Branch UI" className="rounded-2xl shadow-2xl opacity-80 mix-blend-screen" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Grid - The Core Modules */}
      <section className="py-24 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black">Modular Excellence.</h2>
            <p className="text-slate-400 mt-4">Every section of your school, perfectly digitized.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
             {[
               {
                 title: "Attendance Management",
                 desc: "Automated daily presence logs for students and staff with real-time analytics.",
                 icon: Users,
                 color: "text-blue-500",
                 bg: "bg-blue-500/10"
               },
               {
                 title: "Financial Ledgers",
                 desc: "Generate professional invoices, track pending dues, and manage salary disbursements.",
                 icon: Wallet,
                 color: "text-green-500",
                 bg: "bg-green-500/10"
               },
               {
                 title: "Academic Progress",
                 desc: "Track student performance across subjects and generate beautiful digital cards.",
                 icon: BarChart3,
                 color: "text-purple-500",
                 bg: "bg-purple-500/10"
               },
               {
                 title: "Global Search",
                 desc: "Find any student, staff, or transaction instantly with our deep-index search engine.",
                 icon: Search,
                 color: "text-orange-500",
                 bg: "bg-orange-500/10"
               },
               {
                 title: "Cloud Infrastructure",
                 desc: "Access your data from anywhere. Mobile, tablet, or desktop via our auto-sync cloud.",
                 icon: Cloud,
                 color: "text-primary",
                 bg: "bg-primary/10"
               },
               {
                 title: "Lightning Performance",
                 desc: "Powered by modern tech stacks to ensure 0.1s page responses across all modules.",
                 icon: Zap,
                 color: "text-yellow-500",
                 bg: "bg-yellow-500/10"
               }
             ].map((f, i) => (
               <motion.div 
                 key={i}
                 initial={{ opacity: 0, y: 30 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: i * 0.1 }}
                 className="p-8 rounded-3xl bg-card border border-white/5 hover:border-primary/20 transition-all group"
               >
                 <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-6`}>
                    <f.icon className={`w-6 h-6 ${f.color}`} />
                 </div>
                 <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                 <p className="text-slate-400 leading-relaxed text-sm font-medium">{f.desc}</p>
               </motion.div>
             ))}
          </div>
        </div>
      </section>

      {/* Trust & Security */}
      <section className="py-32 text-center max-w-4xl mx-auto px-6">
        <ShieldCheck className="w-16 h-16 text-primary mx-auto mb-8" />
        <h2 className="text-3xl font-bold mb-6">Security is not an option.</h2>
        <p className="text-lg text-slate-400 italic">
          "We treat school data like financial data. Absolute privacy, 
          hardware-level isolation, and deep encryption for every record."
        </p>
      </section>

      <Footer />
    </div>
  );
};
