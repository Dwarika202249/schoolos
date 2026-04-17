import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ShieldCheck, Heart, Sparkles, Zap, BrainCircuit } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const AboutPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground scroll-smooth">
      <Navbar />

      {/* Hero Narrative */}
      <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center space-y-8">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
           <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-primary/20">
              <BookOpen className="w-8 h-8 text-primary font-bold" />
           </div>
           <h1 className="text-4xl md:text-7xl font-black tracking-tight leading-tight">
             Reshaping the <br />
             <span className="text-primary">educational backbone.</span>
           </h1>
           <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 font-medium leading-relaxed mt-6">
             The world changed overnight, but school management software stayed in 2005. 
             We are here to bridge that gap with a focus on speed, isolation, and beauty.
           </p>
        </motion.div>
      </section>

      {/* The Story Section */}
      <section className="py-24 bg-card/30 border-y border-white/5 px-4">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Built for Educators, by <br />Technologists.</h2>
            <p className="text-slate-400 text-lg leading-relaxed font-medium">
              School OS started with a simple observation: Most ERP systems are burdens on teachers, 
              not tools for them. They are clunky, slow, and often leak data across boundaries. 
            </p>
            <p className="text-slate-400 text-lg leading-relaxed font-medium">
              We decided to rethink everything. Our architecture uses extreme horizontal scaling and 
              cryptographic multi-tenancy to ensure that every school operates in its own 
              private, lightning-fast universe.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Zap, label: "0.1s Response", desc: "Native cloud speed." },
              { icon: ShieldCheck, label: "Zero Leakage", desc: "Data is isolated." },
              { icon: BrainCircuit, label: "AI Powered", desc: "Automated analysis." },
              { icon: Heart, label: "Human Centric", desc: "Focused on UX." }
            ].map((v, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="p-6 rounded-3xl bg-card border border-white/5 flex flex-col justify-between"
              >
                <v.icon className="w-6 h-6 text-primary mb-4" />
                <div>
                   <p className="font-bold text-white text-sm">{v.label}</p>
                   <p className="text-xs text-slate-500 font-medium mt-1">{v.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-32 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-black">Our Core Principles.</h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-12">
           {[
             { title: "Simplicity", desc: "If a non-techy teacher can't use it in 60 seconds, we've failed. We value clear interfaces over complex menus." },
             { title: "Security", desc: "We don't collect data for ads. We manage data for schools. Security is built into our hardware layer." },
             { title: "Scalability", desc: "From a single coaching center to a national chain of institutions—our platform expands without friction." }
           ].map((item, i) => (
             <div key={i} className="space-y-4">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs italic">0{i+1}</div>
                   <h3 className="text-xl font-bold">{item.title}</h3>
                </div>
                <p className="text-slate-400 leading-relaxed font-medium">{item.desc}</p>
             </div>
           ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-32 bg-primary/5 text-center">
         <Sparkles className="w-12 h-12 text-primary mx-auto mb-6 animate-pulse" />
         <h2 className="text-3xl font-black mb-4">Join the digital revolution.</h2>
         <p className="text-slate-400 mb-10 max-w-xl mx-auto font-medium">Ready to see how School OS can transform your institution?</p>
         <button className="px-12 py-5 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl transition-all shadow-xl shadow-primary/20">
           Start Your School Pilot
         </button>
      </section>

      <Footer />
    </div>
  );
};
