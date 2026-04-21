import React, { useState, useEffect } from 'react';
import {
   Calendar,
   Clock,
   BookOpen,
   Users,
   AlertCircle,
   CheckCircle2,
   ChevronRight,
   TrendingUp,
   GraduationCap,
   Activity,
   Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';

export const TeacherDashboard = () => {
   const { user } = useAuth();
   const [loading, setLoading] = useState(true);
   const [schedule, setSchedule] = useState<any>(null);
   const [stats, setStats] = useState({
      totalClasses: 0,
      markedAttendance: false,
      upcomingExams: 0
   });

   useEffect(() => {
      const fetchDashboardData = async () => {
         try {
            setLoading(true);
            const [schRes, examsRes] = await Promise.all([
               api.get('/tenant/timetable/my-schedule'),
               api.get('/tenant/exams/schedules')
            ]);

            const schData = schRes.data.data;
            setSchedule(schData);

            // Count today's classes
            const classesToday = (schData.regularClasses?.length || 0) + (schData.substitutions?.length || 0);

            setStats({
               totalClasses: classesToday,
               markedAttendance: false, // In a real app, we would bridge this with attendance API
               upcomingExams: examsRes.data.data.length
            });

         } catch (err) {
            console.error('Failed to load dashboard', err);
         } finally {
            setLoading(false);
         }
      };

      fetchDashboardData();
   }, []);

   if (loading) {
      return (
         <div className="p-10 space-y-8 animate-pulse">
            <div className="h-48 bg-white/5 rounded-[3rem]" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="h-40 bg-white/5 rounded-[2.5rem]" />
               <div className="h-40 bg-white/5 rounded-[2.5rem]" />
               <div className="h-40 bg-white/5 rounded-[2.5rem]" />
            </div>
         </div>
      );
   }

   const nextClass = [...(schedule?.regularClasses || []), ...(schedule?.substitutions || [])]
      .sort((a, b) => a.periodNumber - b.periodNumber)[0];

   return (
      <div className="p-6 lg:p-10 max-w-[1600px] mx-auto space-y-10 animate-in fade-in duration-700 pb-20">

         {/* Welcome Banner - High Fidelity */}
         <div className="relative overflow-hidden bg-slate-900 border border-white/10 rounded-[3rem] p-10 shadow-2xl">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
               <div className="space-y-4">
                  <div className="flex items-center gap-3">
                     <div className="px-4 py-1.5 rounded-full bg-primary/20 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-widest">Teacher Portal</div>
                     <div className="text-slate-500 text-xs font-bold">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</div>
                  </div>
                  <div>
                     <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight uppercase italic underline decoration-primary decoration-8 underline-offset-8 decoration-skip-ink-none">
                        Hello, {user?.firstName}!
                     </h1>
                     <p className="text-slate-400 font-medium text-lg mt-6 max-w-xl leading-relaxed">
                        You have <span className="text-white font-black">{stats.totalClasses} classes</span> mapped for today. Your first period starts at <span className="text-primary font-black">{nextClass?.startTime || '08:00 AM'}</span>.
                     </p>
                  </div>
               </div>

               <div className="flex flex-wrap gap-4">
                  <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] p-6 border border-white/10 w-48 group hover:border-primary/50 transition-all">
                     <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">My Students</p>
                     <div className="flex items-end justify-between">
                        <p className="text-3xl font-black text-white tracking-tighter">42</p>
                        <Users className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                     </div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] p-6 border border-white/10 w-48 group hover:border-emerald-500/50 transition-all">
                     <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">Attendance</p>
                     <div className="flex items-end justify-between">
                        <p className="text-3xl font-black text-white tracking-tighter">{stats.markedAttendance ? '100%' : '0%'}</p>
                        <CheckCircle2 className={`w-6 h-6 ${stats.markedAttendance ? 'text-emerald-500' : 'text-slate-600'} group-hover:rotate-12 transition-transform`} />
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Critical Path Cards */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-8 rounded-[2.5rem] bg-card/40 backdrop-blur-md border-white/10 hover:border-primary/40 transition-all group relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-2xl rounded-full" />
               <div className="flex items-center justify-between mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-inner border border-primary/20">
                     <Clock className="w-7 h-7" />
                  </div>
                  <div className="text-right">
                     <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Up Next</span>
                     <p className="text-2xl font-black tracking-tight text-white">{nextClass?.startTime || '—'}</p>
                  </div>
               </div>
               <div className="space-y-1">
                  <h3 className="text-xl font-black text-white group-hover:text-primary transition-colors">{nextClass?.subjectId?.name || 'No Class'}</h3>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                     <GraduationCap className="w-4 h-4" /> {nextClass?.classId?.displayName || 'Free Period'}
                  </p>
               </div>
               <div className="mt-8 pt-6 border-t border-white/5">
                  <Button variant="outline" className="w-full h-14 rounded-2xl border-white/10 text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all shadow-xl">
                     View Lesson Content
                  </Button>
               </div>
            </Card>

            <Card className="p-8 rounded-[2.5rem] bg-card/40 backdrop-blur-md border-white/10 hover:border-emerald-500/40 transition-all group relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-2xl rounded-full" />
               <div className="flex items-center justify-between mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform shadow-inner border border-emerald-500/20">
                     <Calendar className="w-7 h-7" />
                  </div>
                  <div className="text-right">
                     <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Attendance</span>
                     <p className={`text-2xl font-black tracking-tight ${stats.markedAttendance ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {stats.markedAttendance ? 'CLEARED' : 'PENDING'}
                     </p>
                  </div>
               </div>
               <p className="text-sm font-bold text-slate-400 mb-8 leading-relaxed">
                  Record attendance for your primary class section today.
               </p>
               <div className="mt-auto">
                  <Link to="/attendance">
                     <Button className="w-full h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-500/20">
                        Identify Present Students
                     </Button>
                  </Link>
               </div>
            </Card>

            <Card className="p-8 rounded-[2.5rem] bg-card/40 backdrop-blur-md border-white/10 hover:border-amber-500/40 transition-all group relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 blur-2xl rounded-full" />
               <div className="flex items-center justify-between mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform shadow-inner border border-amber-500/20">
                     <BookOpen className="w-7 h-7" />
                  </div>
                  <div className="text-right">
                     <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Assessments</span>
                     <p className="text-2xl font-black tracking-tight text-white">{stats.upcomingExams} Active</p>
                  </div>
               </div>
               <p className="text-sm font-bold text-slate-400 mb-8 leading-relaxed">
                  Enter marks for recent exams and track student academic performance.
               </p>
               <div>
                  <Link to="/exams">
                     <Button className="w-full h-14 rounded-2xl bg-amber-500 hover:bg-amber-600 font-black uppercase tracking-widest text-xs text-black shadow-xl shadow-amber-500/20">
                        Marks Entry Portal
                     </Button>
                  </Link>
               </div>
            </Card>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* Main Schedule Container */}
            <div className="lg:col-span-3 space-y-8">
               <div className="flex items-center justify-between px-2">
                  <h2 className="text-2xl lg:text-3xl font-black text-white flex items-center gap-4 italic uppercase tracking-tighter">
                     <div className="w-2 h-8 bg-primary rounded-full" />
                     Daily Itinerary
                  </h2>
                  <div className="flex items-center gap-2 text-slate-500 font-bold text-[10px] uppercase tracking-widest">
                     <Activity className="w-4 h-4 text-primary animate-pulse" /> Live Tracking
                  </div>
               </div>

               <div className="space-y-4">
                  {[...(schedule?.regularClasses || []), ...(schedule?.substitutions || [])]
                     .sort((a, b) => a.periodNumber - b.periodNumber)
                     .map((slot, idx) => (
                        <motion.div
                           initial={{ opacity: 0, x: -20 }}
                           animate={{ opacity: 1, x: 0 }}
                           transition={{ delay: idx * 0.1 }}
                           key={slot._id || idx}
                           className={`p-8 rounded-[3rem] flex flex-col md:flex-row items-start md:items-center gap-8 group transition-all border shadow-2xl ${slot.substituteTeacherId ? 'bg-amber-500/5 border-amber-500/20' : 'bg-card/40 backdrop-blur-xl border-white/5 hover:border-primary/30'}`}
                        >
                           <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 border border-white/10 flex flex-col items-center justify-center text-slate-500 group-hover:scale-110 group-hover:bg-primary group-hover:text-white group-hover:border-primary/50 transition-all shrink-0">
                              <span className="text-[9px] font-black uppercase tracking-tighter">PRD</span>
                              <span className="text-3xl font-black tracking-tighter">{slot.periodNumber}</span>
                           </div>

                           <div className="flex-1 space-y-2">
                              <div className="flex items-center flex-wrap gap-3">
                                 <h3 className="text-2xl font-black text-white group-hover:text-primary transition-colors tracking-tight">{slot.subjectId?.name || 'Generic Period'}</h3>
                                 {slot.substituteTeacherId && (
                                    <span className="px-3 py-1 rounded-lg bg-amber-500 text-black text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-amber-500/20">Proxy Assignment</span>
                                 )}
                                 {idx === 0 && <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase tracking-[0.2em]">Ongoing</span>}
                              </div>
                              <p className="text-sm font-bold text-slate-500 flex items-center gap-3">
                                 <Users className="w-4 h-4 text-slate-600" />
                                 {slot.classId?.displayName}
                              </p>
                           </div>

                           <div className="flex md:flex-col items-end gap-6 md:gap-1 text-right w-full md:w-auto border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                              <div className="flex items-center gap-2 text-white font-black text-lg italic">
                                 <Clock className="w-4 h-4 text-primary" /> {slot.startTime || '—'}
                              </div>
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Room {slot.roomNumber || 'Main A'}</p>
                           </div>
                        </motion.div>
                     ))}

                  {[...(schedule?.regularClasses || []), ...(schedule?.substitutions || [])].length === 0 && (
                     <div className="p-32 text-center bg-card/20 border-2 border-white/5 border-dashed rounded-[4rem] group hover:border-primary/20 transition-all">
                        <TrendingUp className="w-16 h-16 text-slate-800 mx-auto mb-6 group-hover:scale-110 transition-transform" />
                        <p className="text-slate-500 font-black uppercase tracking-widest text-sm">No teaching slots detected for today.</p>
                        <p className="text-slate-600 text-xs font-bold mt-2">Check the master timetable for future sessions.</p>
                     </div>
                  )}
               </div>
            </div>

            {/* Intelligence Widgets */}
            <div className="lg:col-span-2 space-y-10">
               {/* Academic Progress Widget */}
               <Card className="p-10 rounded-[3.5rem] bg-card/40 backdrop-blur-xl border-white/10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full" />
                  <div className="relative z-10">
                     <h3 className="text-xl font-black text-white italic uppercase tracking-widest mb-8 flex items-center gap-3">
                        <Activity className="w-5 h-5 text-primary" />
                        Syllabus Pulse
                     </h3>
                     <div className="space-y-8">
                        <div className="space-y-3">
                           <div className="flex justify-between items-end">
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Physics (Grade 10-A)</span>
                              <span className="text-primary font-black text-lg">72%</span>
                           </div>
                           <div className="h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                              <motion.div initial={{ width: 0 }} animate={{ width: '72%' }} transition={{ duration: 1.5 }} className="h-full bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" />
                           </div>
                        </div>
                        <div className="space-y-3">
                           <div className="flex justify-between items-end">
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mathematics (Grade 9-B)</span>
                              <span className="text-emerald-500 font-black text-lg">45%</span>
                           </div>
                           <div className="h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                              <motion.div initial={{ width: 0 }} animate={{ width: '45%' }} transition={{ duration: 1.5, delay: 0.2 }} className="h-full bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                           </div>
                        </div>
                     </div>
                     <div className="mt-10 p-4 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Academic Health: Optimal</p>
                     </div>
                  </div>
               </Card>

               {/* Personal Alerts / Gaps */}
               <div className="space-y-6">
                  <h3 className="text-lg font-black px-4 text-white flex items-center gap-3 uppercase tracking-tighter italic">
                     <AlertCircle className="w-5 h-5 text-amber-500" />
                     Operational Briefing
                  </h3>
                  <div className="p-8 rounded-[2.5rem] bg-indigo-500/5 border border-indigo-500/20 group hover:border-indigo-500/40 transition-all">
                     <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                           <Sparkles className="w-4 h-4" />
                        </div>
                        <p className="text-xs font-black text-indigo-400 uppercase tracking-widest">Weekly Observation</p>
                     </div>
                     <p className="text-slate-300 font-medium leading-relaxed italic text-sm">
                        "Class 10-A showed significant improvement in the recent mock tests. Consider introducing advanced thermodynamics modules next week."
                     </p>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};
