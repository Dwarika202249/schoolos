import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  AlertCircle,
  Plus, 
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  GraduationCap,
  ListRestart,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';

export const SubstitutionLedger = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [ledger, setLedger] = useState<any>({ gaps: [], existingSubstitutions: [] });
  const [availableTeachers, setAvailableTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [assignModal, setAssignModal] = useState<any>(null); // { period, classId, subjectId, originalTeacherId }

  useEffect(() => {
    fetchLedger();
  }, [date]);

  const fetchLedger = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tenant/substitution/ledger', { params: { date } });
      setLedger(res.data.data);
    } catch (err) {
      toast.error('Failed to load ledger');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAssign = async (gap: any) => {
    setAssignModal(gap);
    try {
      const res = await api.get('/tenant/substitution/available-teachers', {
        params: { date, period: gap.periodNumber }
      });
      setAvailableTeachers(res.data.data);
    } catch (err) {
      toast.error('Failed to fetch available teachers');
    }
  };

  const handleAssign = async (teacherId: string) => {
    try {
      await api.post('/tenant/substitution/assign', {
        date,
        periodNumber: assignModal.periodNumber,
        classId: assignModal.classId?._id || assignModal.classId,
        subjectId: assignModal.subjectId?._id || assignModal.subjectId,
        originalTeacherId: assignModal.teacherId?._id || assignModal.teacherId,
        substituteTeacherId: teacherId,
        note: 'Proxy assignment via Ledger'
      });
      toast.success('Substitution assigned successfully');
      setAssignModal(null);
      fetchLedger();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to assign substitution');
    }
  };

  return (
    <div className="space-y-8 pb-32 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-black text-foreground">Substitution Ledger</h1>
          <p className="text-slate-500 font-medium">Daily adjustments for absent teachers and unassigned slots.</p>
        </div>
        <div className="flex gap-4">
           <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">Select Date</label>
              <input 
                title="Ledger Date"
                type="date" 
                value={date} 
                onChange={e => setDate(e.target.value)}
                className="h-12 bg-card border border-white/5 rounded-xl px-4 text-sm font-bold outline-none focus:border-primary/50"
              />
           </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
         {/* Gaps / Missing Teachers */}
         <div className="space-y-6">
            <h2 className="text-xl font-black flex items-center gap-2 px-2">
               <AlertCircle className="w-5 h-5 text-amber-500" />
               Identified Gaps
            </h2>
            
            {loading ? (
               <div className="p-20 text-center bg-card border border-white/5 rounded-[3rem] animate-pulse">
                  <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">Scanning Schedule...</p>
               </div>
            ) : ledger.gaps.length === 0 ? (
               <div className="p-20 text-center bg-card border border-white/5 border-dashed rounded-[3rem]">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4 opacity-20" />
                  <p className="text-slate-500 font-bold">No gaps identified for today. All classes accounted for!</p>
               </div>
            ) : (
               <div className="space-y-4">
                  {ledger.gaps.map((gap: any) => {
                    const isAssigned = ledger.existingSubstitutions.some((s: any) => 
                      s.classId === gap.classId?._id && s.periodNumber === gap.periodNumber
                    );
                    return (
                      <Card 
                        key={gap.id || gap._id} 
                        className={`p-6 rounded-[2.5rem] bg-card border border-white/5 flex items-center gap-6 group hover:border-primary/20 transition-all ${isAssigned ? 'opacity-50 grayscale' : ''}`}
                      >
                         <div className="w-16 h-16 rounded-3xl bg-white/5 flex flex-col items-center justify-center text-slate-400">
                            <span className="text-[10px] font-black uppercase tracking-tight">Period</span>
                            <span className="text-2xl font-black text-white">{gap.periodNumber}</span>
                         </div>
                         <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-black uppercase text-amber-500 tracking-widest mb-1 italic">Absent: {gap.teacherId?.firstName}</p>
                            <h3 className="text-lg font-black truncate">{gap.classId?.displayName}</h3>
                            <p className="text-xs font-bold text-slate-500">{gap.subjectId?.name}</p>
                         </div>
                         {!isAssigned && (
                           <Button 
                             onClick={() => handleOpenAssign(gap)}
                             className="rounded-2xl h-12 px-6 bg-primary font-black shadow-lg shadow-primary/20"
                           >
                              Resolve
                           </Button>
                         )}
                         {isAssigned && (
                            <span className="text-xs font-black text-emerald-500 uppercase flex items-center gap-1">
                               <CheckCircle2 className="w-4 h-4" /> Fixed
                            </span>
                         )}
                      </Card>
                    );
                  })}
               </div>
            )}
         </div>

         {/* Existing Adjustments */}
         <div className="space-y-6">
            <h2 className="text-xl font-black flex items-center gap-2 px-2 text-emerald-500">
               <ListRestart className="w-5 h-5" />
               Adjustment Log
            </h2>

            {ledger.existingSubstitutions.length === 0 ? (
               <div className="p-20 text-center bg-card border border-white/5 border-dashed rounded-[3rem]">
                  <p className="text-slate-600 font-bold italic">No manual adjustments made yet.</p>
               </div>
            ) : (
               <div className="space-y-4">
                  {ledger.existingSubstitutions.map((sub: any) => (
                    <div key={sub.id || sub._id} className="p-6 rounded-[2.5rem] bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-6 group">
                       <div className="flex-1">
                          <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1">Period {sub.periodNumber} • Class {sub.classId?.displayName || '—'}</p>
                          <div className="flex items-center gap-3">
                             <div className="text-sm font-bold text-slate-400 flex items-center gap-2">
                                <Users className="w-4 h-4" /> Proxy:
                             </div>
                             <p className="text-base font-black text-emerald-400 italic">
                                {sub.substituteTeacherId?.firstName} {sub.substituteTeacherId?.lastName}
                             </p>
                          </div>
                       </div>
                       <Button variant="outline" className="rounded-xl h-10 w-10 p-0 border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 className="w-4 h-4 text-rose-500" />
                       </Button>
                    </div>
                  ))}
               </div>
            )}
         </div>
      </div>

      <AnimatePresence>
        {assignModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setAssignModal(null)} />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg bg-card border border-white/10 p-10 rounded-[3rem] shadow-2xl space-y-8"
            >
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-4">
                   Resolving Gap
                </div>
                <h2 className="text-3xl font-black leading-tight">Assign Proxy for <span className="text-primary italic">Period {assignModal.periodNumber}</span></h2>
                <p className="text-slate-500 font-medium mt-2">Pick from teachers who are free during this period.</p>
              </div>

              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                 {availableTeachers.length === 0 ? (
                    <div className="p-8 text-center bg-white/5 rounded-3xl border border-white/10">
                       <p className="text-slate-500 font-bold">No free teachers found for this period. 😓</p>
                    </div>
                 ) : availableTeachers.map((teacher) => (
                    <div 
                      key={teacher.id || teacher._id} 
                      className="p-4 rounded-[1.5rem] bg-white/5 border border-white/5 hover:border-primary/50 transition-all cursor-pointer flex items-center justify-between group"
                      onClick={() => handleAssign(teacher._id)}
                    >
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-lg font-black text-primary overflow-hidden">
                             {teacher.avatarUrl ? <img src={teacher.avatarUrl} alt="" className="w-full h-full object-cover" /> : teacher.firstName?.charAt(0)}
                          </div>
                          <div>
                             <p className="font-bold text-white group-hover:text-primary transition-colors">{teacher.firstName} {teacher.lastName}</p>
                             <p className="text-[10px] font-black uppercase text-slate-600 tracking-widest transition-colors">Available Now</p>
                          </div>
                       </div>
                       <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 -translate-x-2">
                          <Plus className="w-5 h-5" />
                       </div>
                    </div>
                 ))}
              </div>

              <div className="pt-4 flex justify-center">
                 <button onClick={() => setAssignModal(null)} className="text-sm font-black text-slate-500 hover:text-white transition-colors uppercase tracking-widest">
                    Discard Adjustment
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Trash2 = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
);
