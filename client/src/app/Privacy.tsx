import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

const sections = [
  { id: "collection", title: "Data Collection" },
  { id: "isolation", title: "Hardware-Level Isolation" },
  { id: "security", title: "Security Layers" },
  { id: "gdpr", title: "Compliance & GDPR" },
];

export const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <header className="pt-24 pb-12 px-4 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight">Privacy Policy</h1>
          <p className="mt-4 text-slate-500 font-medium italic">We don't just protect data; we engineer isolation.</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-16 grid lg:grid-cols-4 gap-12 relative">
        <aside className="hidden lg:block space-y-4 sticky top-32 h-fit">
           <p className="text-xs font-black uppercase tracking-widest text-primary mb-6">Policy Sections</p>
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

        <main className="lg:col-span-3 space-y-16 lg:pl-12 border-l border-white/5">
           <section id="collection" className="space-y-4 scroll-mt-32">
              <h2 className="text-2xl font-bold text-white tracking-tight">Data Collection</h2>
              <p className="text-slate-400 leading-relaxed font-medium">
                The Service collects primary administrative data necessary for school operations: 
                Staff professional details, Student attendance logs, Institutional ledgers, 
                and Administrator account credentials. We do not sell this data to advertisers 
                nor do we share it with third-party tracking conglomerates.
              </p>
           </section>

           <section id="isolation" className="space-y-4 scroll-mt-32">
              <h2 className="text-2xl font-bold text-white tracking-tight">Hardware-Level Isolation</h2>
              <p className="text-slate-400 leading-relaxed font-medium">
                Our multi-tenant architecture ensures that every school operates in its 
                own logical partition. Your institutional keys never leave our secure 
                runtime, and no cross-school queries are ever possible at the database level.
              </p>
           </section>

           <section id="security" className="space-y-4 scroll-mt-32">
              <h2 className="text-2xl font-bold text-white tracking-tight">Security Layers</h2>
              <p className="text-slate-400 leading-relaxed font-medium">
                We use bank-grade AES-256 encryption at rest and TLS 1.3 for all data 
                in transit. Access tokens are short-lived, and every sensitive transaction 
                (like salary disbursement) is protected by high-entropy role-based 
                permission checks.
              </p>
           </section>

           <section id="gdpr" className="space-y-4 scroll-mt-32 pb-24">
              <h2 className="text-2xl font-bold text-white tracking-tight">Compliance & GDPR</h2>
              <p className="text-slate-400 leading-relaxed font-medium">
                CloudEdu Systems Inc. is fully compliant with modern data protection 
                regulations including GDPR and FERPA. Your institution is the data 
                owner, and you have the right to purge all staff/student records 
                instantly from our clusters upon request.
              </p>
           </section>
        </main>
      </div>

      <Footer />
    </div>
  );
};
