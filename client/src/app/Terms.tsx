import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

const sections = [
  { id: "agreement", title: "1. Agreement to Terms" },
  { id: "license", title: "2. B2B SaaS License" },
  { id: "tenancy", title: "3. Data Ownership & Tenancy" },
  { id: "sla", title: "4. SLA & Uptime" },
  { id: "termination", title: "5. Termination of Accounts" },
];

export const TermsPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <header className="pt-24 pb-12 px-4 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight">Terms of Service</h1>
          <p className="mt-4 text-slate-500 font-medium italic">Last updated: April 17, 2026</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-16 grid lg:grid-cols-4 gap-12 relative">
        {/* Sticky Sidebar */}
        <aside className="hidden lg:block space-y-4 sticky top-32 h-fit">
           <p className="text-xs font-black uppercase tracking-widest text-primary mb-6">Table of Contents</p>
           {sections.map(s => (
             <a 
               key={s.id}
               href={`#${s.id}`} 
               className="block text-sm font-bold text-slate-500 hover:text-primary transition-colors py-1"
             >
               {s.title}
             </a>
           ))}
        </aside>

        {/* Content Area */}
        <main className="lg:col-span-3 space-y-16 lg:pl-12 border-l border-white/5">
           <section id="agreement" className="space-y-4 scroll-mt-32">
              <h2 className="text-2xl font-bold text-white tracking-tight">1. Agreement to Terms</h2>
              <p className="text-slate-400 leading-relaxed font-medium">
                By accessing or using the School OS platform ("the Service"), you agree to be bound 
                by these Terms. The Service is provided by CloudEdu Systems Inc. ("the Company"). 
                If you disagree with any part of these terms, you must immediately cease 
                all institutional access and delete your Workspace.
              </p>
           </section>

           <section id="license" className="space-y-4 scroll-mt-32">
              <h2 className="text-2xl font-bold text-white tracking-tight">2. B2B SaaS License</h2>
              <p className="text-slate-400 leading-relaxed font-medium">
                School OS grants your educational institution a limited, non-exclusive, 
                non-transferable, and revocable license to use the platform solely for internal 
                school administrative purposes. You may not:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-400 font-medium">
                <li>Attempt to reverse-engineer out proprietary encryption/isolation protocols.</li>
                <li>Sublicense or resell access to your School OS tenant to third parties.</li>
                <li>Use the platform to distribute malicious payloads or deep-intercept network traffic.</li>
              </ul>
           </section>

           <section id="tenancy" className="space-y-4 scroll-mt-32">
              <h2 className="text-2xl font-bold text-white tracking-tight">3. Data Ownership & Tenancy</h2>
              <p className="text-slate-400 leading-relaxed font-medium">
                Your school's data belongs to your school. Every record—be it staff salaries, 
                student attendance, or financial invoices—is strictly logically partitioned from 
                other institutions. We serve as the "processor," and you maintain the role of "controller" 
                of the data under international regulations.
              </p>
           </section>

           <section id="sla" className="space-y-4 scroll-mt-32">
              <h2 className="text-2xl font-bold text-white tracking-tight">4. SLA & Uptime</h2>
              <p className="text-slate-400 leading-relaxed font-medium">
                We target a 99.99% monthly uptime guarantee for core administrative modules. 
                Service interruptions for hardware upgrades or primary database migrations 
                will be scheduled during non-operational hours and communicated to the 
                Primary School Administrator 48 hours in advance.
              </p>
           </section>

           <section id="termination" className="space-y-4 scroll-mt-32 pb-24">
              <h2 className="text-2xl font-bold text-white tracking-tight">5. Termination of Accounts</h2>
              <p className="text-slate-400 leading-relaxed font-medium">
                We reserve the right to terminate institutional access for gross violations 
                of multi-tenancy rules or persistent non-payment of subscription dues. 
                Upon termination, we provide a 30-day window for JSON/PDF data extraction 
                before the tenant partition is permanently wiped.
              </p>
           </section>
        </main>
      </div>

      <Footer />
    </div>
  );
};
