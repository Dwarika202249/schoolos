import React from 'react';
import { 
  Users, 
  GraduationCap, 
  Building2, 
  IndianRupee,
  TrendingDown,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  BellRing,
  Activity,
  Sparkles
} from 'lucide-react';
import { Card } from '../components/ui/Card';

export const Dashboard = () => {
  return (
    <div className="p-6 lg:p-10 max-w-[1600px] mx-auto space-y-10 animate-in fade-in duration-700">
      
      {/* Header & Morning Briefing */}
      <div className="flex flex-col lg:flex-row justify-between gap-8">
        <div>
          <h1 className="text-4xl lg:text-5xl font-black text-foreground tracking-tight uppercase italic drop-shadow-sm">Command Center</h1>
          <p className="text-slate-400 font-medium text-sm mt-2 tracking-wide">Principal Intelligence Dashboard. Metrics updated in real-time.</p>
        </div>
        
        <div className="flex-1 max-w-2xl bg-primary/10 border border-primary/20 p-6 rounded-3xl flex items-start gap-4">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
               <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
               <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-1">Morning Briefing</h3>
               <p className="text-slate-300 font-medium leading-relaxed">
                   Good Morning. Initial sweeps show <strong>3 classes</strong> haven't marked attendance yet. 
                   Financial sensors indicate <strong>12 students</strong> fell into the active fee defaulter category this week. 
                   System operations are nominal.
               </p>
            </div>
        </div>
      </div>

      {/* Primary KPI Grid - Actionable Financials & Ops */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card className="p-8 border-white/20 shadow-2xl shadow-black/60 bg-card/40 backdrop-blur-xl rounded-[2.5rem] relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-300 min-h-[220px] flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full group-hover:scale-150 transition-all duration-700" />
            <div className="flex justify-between items-start relative z-10">
               <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Monthly Realized</p>
                  <p className="text-4xl font-black text-foreground tracking-tighter mt-1 flex items-baseline gap-1">
                     <span className="text-2xl text-slate-500 font-bold">₹</span>4.2M
                  </p>
               </div>
               <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 shadow-inner border border-emerald-500/20">
                  <IndianRupee className="w-6 h-6" />
               </div>
            </div>
            <div className="flex items-center gap-2 mt-6 border-t border-white/5 pt-6 relative z-10">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-500 font-bold text-xs uppercase tracking-widest">+12.5% M/M</span>
            </div>
        </Card>

        <Card className="p-8 border-white/20 shadow-2xl shadow-black/60 bg-card/40 backdrop-blur-xl rounded-[2.5rem] relative overflow-hidden group hover:border-rose-500/40 transition-all duration-300 min-h-[220px] flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 blur-3xl rounded-full group-hover:scale-150 transition-all duration-700" />
            <div className="flex justify-between items-start relative z-10">
               <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] text-rose-500/80">Outstanding Dues</p>
                  <p className="text-4xl font-black text-rose-500 tracking-tighter mt-1 flex items-baseline gap-1">
                     <span className="text-2xl text-rose-500/50 font-bold">₹</span>840K
                  </p>
               </div>
               <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 shadow-inner border border-rose-500/20">
                  <AlertTriangle className="w-6 h-6" />
               </div>
            </div>
            <div className="mt-6 border-t border-rose-500/10 pt-6 relative z-10">
                <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Immediate action required</span>
            </div>
        </Card>

        <Card className="p-8 border-white/20 shadow-2xl shadow-black/60 bg-card/40 backdrop-blur-xl rounded-[2.5rem] relative overflow-hidden group hover:border-primary/40 transition-all duration-300 min-h-[220px] flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full group-hover:scale-150 transition-all duration-700" />
            <div className="flex justify-between items-start relative z-10">
               <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Collection Velocity</p>
                  <p className="text-4xl font-black text-foreground tracking-tighter mt-1 flex items-baseline gap-1">
                     83.4<span className="text-2xl text-slate-500 font-bold">%</span>
                  </p>
               </div>
               <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner border border-primary/20">
                  <Activity className="w-6 h-6" />
               </div>
            </div>
            <div className="flex items-center gap-2 mt-6 border-t border-white/5 pt-6 relative z-10">
                <ArrowUpRight className="w-4 h-4 text-primary" />
                <span className="text-primary font-bold text-xs uppercase tracking-widest">Target: 95%</span>
            </div>
        </Card>

        <Card className="p-8 border-white/20 shadow-2xl shadow-black/60 bg-slate-900 backdrop-blur-xl rounded-[2.5rem] relative overflow-hidden group min-h-[220px] flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full group-hover:scale-150 transition-all duration-700" />
            <div className="flex justify-between items-start relative z-10">
               <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Total Enrollment</p>
                  <p className="text-4xl font-black text-foreground tracking-tighter mt-1">1,248</p>
               </div>
               <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-slate-300 shadow-inner border border-white/10">
                  <GraduationCap className="w-6 h-6" />
               </div>
            </div>
            
            <div className="mt-6 border-t border-white/5 pt-6 relative z-10 flex gap-4">
                <div>
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Focus</p>
                   <p className="text-sm font-black text-slate-300 mt-1">1,230</p>
                </div>
                <div className="w-[1px] h-full bg-white/10 mx-1" />
                <div>
                   <p className="text-[10px] font-bold text-rose-500/70 uppercase tracking-widest">Attrition</p>
                   <p className="text-sm font-black text-rose-400 mt-1">18</p>
                </div>
            </div>
        </Card>
      </div>

      {/* Main Content Area Placeholder - Ops View */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2 p-10 min-h-[400px] border-white/20 shadow-2xl shadow-black/60 bg-card/40 backdrop-blur-xl rounded-[3rem] flex flex-col items-center justify-center relative overflow-hidden">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02]" />
             <div className="relative z-10 text-center space-y-4">
                 <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10 shadow-inner mb-6">
                     <TrendingUp className="w-10 h-10 text-slate-600" />
                 </div>
                 <h3 className="text-xl font-black text-foreground uppercase tracking-widest italic">Temporal Revenue Analysis</h3>
                 <p className="text-slate-500 font-medium max-w-md mx-auto">Graph module awaiting telemetry synchronization from the Finance sector.</p>
                 <div className="flex gap-2 justify-center pt-6">
                    <div className="w-8 h-1 bg-primary rounded-full animate-pulse" />
                    <div className="w-8 h-1 bg-white/10 rounded-full" />
                    <div className="w-8 h-1 bg-white/10 rounded-full" />
                 </div>
             </div>
        </Card>
        
        <Card className="p-8 border-white/20 shadow-2xl shadow-black/60 bg-card/40 backdrop-blur-xl rounded-[3rem]">
            <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-6">
                <BellRing className="w-5 h-5 text-slate-400" />
                <h3 className="text-lg font-black text-foreground uppercase tracking-widest italic">System Signals</h3>
            </div>
            <div className="space-y-6">
               {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-4 group cursor-pointer hover:bg-white/5 p-4 -mx-4 rounded-2xl transition-all">
                     <div className="w-2 h-2 mt-2 shrink-0 rounded-full bg-primary group-hover:shadow-[0_0_10px_rgba(var(--primary),0.8)] transition-all" />
                     <div>
                        <p className="text-sm font-bold text-slate-300">New faculty onboarded successfully.</p>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">2 Hours Ago • HR Module</p>
                     </div>
                  </div>
               ))}
            </div>
        </Card>
      </div>
    </div>
  );
};
