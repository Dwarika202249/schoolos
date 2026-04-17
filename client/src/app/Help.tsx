import React from 'react';
import { motion } from 'framer-motion';
import { Search, Book, Shield, Wallet, Settings, Users, MessageSquare, PlayCircle } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

const helpCategories = [
  { icon: Book, title: "Getting Started", desc: "Learn the basics of setting up your school and primary branch.", count: 12 },
  { icon: Users, title: "Staff & Students", desc: "Manage enrollments, profiles, and attendance logging.", count: 24 },
  { icon: Wallet, title: "Finance & Fees", desc: "Setup fee structures, invoices, and expense tracking.", count: 15 },
  { icon: Shield, title: "Security & Privacy", desc: "Understanding multi-tenant isolation and data protection.", count: 8 },
  { icon: Settings, title: "Workspace Config", desc: "Roles, permissions, and school-wide configuration.", count: 10 },
  { icon: MessageSquare, title: "Communication", desc: "Parent notifications and internal school messaging.", count: 6 },
];

export const HelpPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero Search */}
      <section className="pt-24 pb-16 px-4 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-3xl mx-auto space-y-8"
        >
          <h1 className="text-4xl md:text-6xl font-black tracking-tight">How can we help?</h1>
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search articles (e.g. Setting up a new branch...)" 
              className="w-full bg-card border border-white/5 rounded-3xl pl-16 pr-8 py-6 text-lg outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all shadow-2xl"
            />
          </div>
          <div className="flex flex-wrap justify-center gap-2 text-sm text-slate-500 font-medium">
             <span>Popular:</span>
             <button className="hover:text-primary transition-colors hover:underline">Resetting owner password</button>
             <button className="hover:text-primary transition-colors hover:underline ml-2">Exporting fee reports</button>
          </div>
        </motion.div>
      </section>

      {/* Category Grid */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {helpCategories.map((cat, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -5, borderColor: 'rgba(var(--primary), 0.3)' }}
              className="p-8 rounded-3xl bg-card border border-white/5 cursor-pointer relative group overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                 <cat.icon className="w-32 h-32" />
              </div>
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                 <cat.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">{cat.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6 font-medium">{cat.desc}</p>
              <div className="flex items-center text-xs font-black text-primary uppercase tracking-wider">
                {cat.count} Articles &rarr;
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Video Guides */}
      <section className="py-24 bg-card/20 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4">
           <div className="flex justify-between items-end mb-12">
             <div>
               <h2 className="text-3xl font-black tracking-tight">Video Tutorials</h2>
               <p className="text-slate-400 font-medium">Prefer watching? We've got you covered.</p>
             </div>
             <button className="hidden sm:block text-primary font-black text-sm uppercase hover:underline">Browse Channel</button>
           </div>
           
           <div className="grid md:grid-cols-2 gap-8">
              {[
                "Setup your school in 5 minutes",
                "Advanced role management guide"
              ].map((title, i) => (
                <div key={i} className="aspect-video rounded-3xl bg-slate-900 border border-white/10 flex items-center justify-center relative overflow-hidden group cursor-pointer shadow-xl">
                   <div className="absolute inset-0 bg-primary/10 group-hover:bg-primary/20 transition-colors" />
                   <PlayCircle className="w-16 h-16 text-primary group-hover:scale-110 transition-transform" />
                   <div className="absolute bottom-6 left-6 right-6">
                      <p className="text-lg font-bold text-white drop-shadow-md">{title}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Support Card */}
      <section className="py-32 px-4">
         <div className="max-w-4xl mx-auto p-12 rounded-[2rem] bg-gradient-to-br from-primary to-purple-600 flex flex-col items-center text-center space-y-6 shadow-2xl shadow-primary/20">
            <h2 className="text-3xl md:text-5xl font-black text-white">Still stuck?</h2>
            <p className="text-white/80 text-lg font-medium max-w-xl">Our human support team is online 24/7 to unblock your administrative workflow.</p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
               <button className="px-10 py-5 bg-white text-primary font-black rounded-2xl shadow-xl hover:scale-105 transition-transform">Live Chat</button>
               <button className="px-10 py-5 bg-black/20 text-white font-black rounded-2xl border border-white/20 hover:bg-black/30 transition-all">Email Help Desk</button>
            </div>
         </div>
      </section>

      <Footer />
    </div>
  );
};
