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
  GraduationCap
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
          api.get('/tenant/exams/schedules') // We'll filter these later or create a specific teacher endpoint
        ]);

        setSchedule(schRes.data.data);
        
        // Mock stats calculation for now
        setStats({
          totalClasses: (schRes.data.data.regularClasses?.length || 0) + (schRes.data.data.substitutions?.length || 0),
          markedAttendance: false, // We'd check StaffAttendance for today
          upcomingExams: 2
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      
      {/* Welcome Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary to-primary-600 rounded-[3rem] p-8 text-white shadow-2xl shadow-primary/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-black mb-2">Good morning, {user?.firstName}! 👋</h1>
            <p className="text-primary-100 font-medium max-w-md">You have {stats.totalClasses} classes scheduled for today. Ready for a great day of teaching?</p>
          </div>
          <div className="flex gap-4">
             <div className="bg-white/10 backdrop-blur-md rounded-3xl p-4 border border-white/10">
                <p className="text-xs font-bold uppercase tracking-wider opacity-60">Status</p>
                <p className="text-lg font-black flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                   Active
                </p>
             </div>
          </div>
        </div>
      </div>

      {/* Quick Action Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6 rounded-[2.5rem] bg-card border-white/5 hover:border-primary/30 transition-all group">
          <div className="flex items-center justify-between mb-4">
             <div className="p-4 rounded-2xl bg-primary/10 text-primary">
                <Clock className="w-6 h-6" />
             </div>
             <div className="text-right">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Next Class</span>
                <p className="text-xl font-black">09:00 AM</p>
             </div>
          </div>
          <p className="text-sm font-bold text-slate-400 mb-6">Class 10-A • Physics</p>
          <Button variant="outline" className="w-full rounded-2xl border-white/10 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
             View Lesson Plan
          </Button>
        </Card>

        <Card className="p-6 rounded-[2.5rem] bg-card border-white/5 hover:border-emerald-500/30 transition-all group">
          <div className="flex items-center justify-between mb-4">
             <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-500">
                <CheckCircle2 className="w-6 h-6" />
             </div>
             <div className="text-right">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Attendance</span>
                <p className="text-xl font-black">{stats.markedAttendance ? 'Completed' : 'Pending'}</p>
             </div>
          </div>
          <p className="text-sm font-bold text-slate-400 mb-6">Today's rolls for Class 10-A</p>
          <Link to="/attendance">
            <Button className="w-full rounded-2xl bg-emerald-500 hover:bg-emerald-600 font-black">
               Mark Attendance
            </Button>
          </Link>
        </Card>

        <Card className="p-6 rounded-[2.5rem] bg-card border-white/5 hover:border-yellow-500/30 transition-all group">
          <div className="flex items-center justify-between mb-4">
             <div className="p-4 rounded-2xl bg-yellow-500/10 text-yellow-500">
                <BookOpen className="w-6 h-6" />
             </div>
             <div className="text-right">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Grading</span>
                <p className="text-xl font-black">04 Papers</p>
             </div>
          </div>
          <p className="text-sm font-bold text-slate-400 mb-6">Upcoming exams in your subjects</p>
          <Link to="/exams">
            <Button className="w-full rounded-2xl bg-yellow-500 hover:bg-yellow-600 font-black text-black">
               Open Exams
            </Button>
          </Link>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Main Schedule */}
        <div className="lg:col-span-3 space-y-6">
           <div className="flex items-center justify-between px-2">
              <h2 className="text-2xl font-black flex items-center gap-2">
                 <Calendar className="w-6 h-6 text-primary" />
                 Today's Schedule
              </h2>
              <span className="text-xs font-bold text-slate-500">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
           </div>

           <div className="space-y-4">
              {[...(schedule.regularClasses || []), ...(schedule.substitutions || [])].sort((a,b) => a.periodNumber - b.periodNumber).map((slot, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={slot._id} 
                  className={`p-6 rounded-[2.5rem] flex items-center gap-6 group transition-all border ${slot.substituteTeacherId ? 'bg-amber-500/5 border-amber-500/20' : 'bg-card border-white/5 hover:border-primary/20'}`}
                >
                   <div className="w-16 h-16 rounded-3xl bg-white/5 flex flex-col items-center justify-center text-slate-400 group-hover:scale-110 transition-all">
                      <span className="text-[10px] font-black uppercase">Period</span>
                      <span className="text-2xl font-black group-hover:text-primary transition-colors">{slot.periodNumber}</span>
                   </div>

                   <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                         <h3 className="text-xl font-black">{slot.subjectId?.name}</h3>
                         {slot.substituteTeacherId && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-black text-[9px] font-black uppercase tracking-widest">Proxy Class</span>
                         )}
                      </div>
                      <p className="text-sm font-bold text-slate-500 flex items-center gap-2">
                         <Users className="w-3.5 h-3.5" />
                         {slot.classId?.displayName}
                      </p>
                   </div>

                   <div className="text-right">
                      <p className="text-sm font-black">{slot.startTime || '—'}</p>
                      <p className="text-xs font-bold text-slate-500">{slot.roomNumber || 'Normal Lab'}</p>
                   </div>
                </motion.div>
              ))}

              {[...(schedule.regularClasses || []), ...(schedule.substitutions || [])].length === 0 && (
                 <div className="p-20 text-center bg-card border border-white/5 border-dashed rounded-[3rem]">
                    <p className="text-slate-500 font-bold italic">No classes scheduled for you today.</p>
                 </div>
              )}
           </div>
        </div>

        {/* Sidebar widgets */}
        <div className="lg:col-span-2 space-y-8">
           {/* Attendance Quick Stats */}
           <Card className="p-8 rounded-[3rem] bg-card border-white/5 overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl -translate-y-1/2 translate-x-1/2" />
              <h3 className="text-lg font-black mb-6">Subject Progress</h3>
              <div className="space-y-6">
                 <div>
                    <div className="flex justify-between text-xs font-bold mb-2">
                       <span className="text-slate-400 uppercase tracking-widest">Syllabus Covered</span>
                       <span>65%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                       <motion.div initial={{ width: 0 }} animate={{ width: '65%' }} className="h-full bg-primary" />
                    </div>
                 </div>
                 <div>
                    <div className="flex justify-between text-xs font-bold mb-2">
                       <span className="text-slate-400 uppercase tracking-widest">Avg Attendance</span>
                       <span>88%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                       <motion.div initial={{ width: 0 }} animate={{ width: '88%' }} className="h-full bg-emerald-500" />
                    </div>
                 </div>
              </div>
           </Card>

           {/* Notices */}
           <div className="space-y-4">
              <h3 className="text-lg font-black px-4 flex items-center gap-2">
                 <AlertCircle className="w-5 h-5 text-amber-500" />
                 Important Gaps
              </h3>
              <div className="p-6 rounded-[2rem] bg-amber-500/10 border border-amber-500/20 text-sm">
                 <p className="text-amber-500 font-bold mb-2">Substitution Request</p>
                 <p className="text-slate-300 leading-relaxed">
                    Mr. Sharma is on leave today. You have been assigned as a proxy for <strong>Period 5 (Class 9-B)</strong>.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
