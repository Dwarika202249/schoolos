import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Save,
  ChevronRight,
  Users,
  Filter,
  Check
} from 'lucide-react';
import api from '../utils/api';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export const AttendanceManagement = () => {
  const { user } = useAuth();
  const isTeacher = user?.role === 'TEACHER';

  const [classes, setClasses] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeYearId, setActiveYearId] = useState('');

  const [students, setStudents] = useState<any[]>([]);
  const [records, setRecords] = useState<Record<string, { status: string; comment?: string }>>({});
  const [fetchingSheet, setFetchingSheet] = useState(false);
  const [saving, setSaving] = useState(false);

  // Initial Data Fetch
  useEffect(() => {
    const init = async () => {
      try {
        const [cRes, yRes] = await Promise.all([
          api.get('/tenant/classes'),
          api.get('/tenant/academic-years')
        ]);

        let allClasses = cRes.data.data;

        // ── Teacher Filter ──────────────────────────────────────────
        // If the user is a TEACHER, show only their assigned class
        // A class is theirs if classTeacherId === their staffProfileId
        if (isTeacher) {
          const myClasses = allClasses.filter(
            (c: any) => (c.classTeacherId === (user?.id || user?._id))
          );
          allClasses = myClasses;
        }
        // ────────────────────────────────────────────────────────────

        setClasses(allClasses);
        const years = yRes.data.data;
        setAcademicYears(years);

        const current = years.find((y: any) => y.isCurrent);
        if (current) setActiveYearId(current.id || current._id);

        // Auto-select first class if available
        if (allClasses.length > 0) {
          const first = allClasses[0];
          setSelectedClass(first.id || first._id);
        }
      } catch (error) {
        toast.error('Failed to load classes/sessions');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [isTeacher, user?.staffProfileId]);

  // Fetch Attendance Sheet
  const fetchSheet = useCallback(async () => {
    if (!selectedClass || !selectedDate) return;

    try {
      setFetchingSheet(true);
      const res = await api.get('/tenant/attendance/sheet', {
        params: { classId: selectedClass, date: selectedDate }
      });

      const { students, existingRecords } = res.data.data;
      setStudents(students);

      // Map existing records to status map
      const recordMap: Record<string, { status: string; comment?: string }> = {};

      // Default all to PRESENT if no existing records
      if (existingRecords.length === 0) {
        students.forEach((s: any) => {
          recordMap[s.id || s._id] = { status: 'PRESENT' };
        });
      } else {
        existingRecords.forEach((r: any) => {
          recordMap[r.studentId] = { status: r.status, comment: r.comment };
        });
        // If some students are missing from existing records (new joins?), default them to PRESENT
        students.forEach((s: any) => {
          const sid = s.id || s._id;
          if (!recordMap[sid]) recordMap[sid] = { status: 'PRESENT' };
        });
      }

      setRecords(recordMap);
    } catch (error) {
      toast.error('Failed to fetch attendance sheet');
    } finally {
      setFetchingSheet(false);
    }
  }, [selectedClass, selectedDate]);

  useEffect(() => {
    fetchSheet();
  }, [fetchSheet]);

  const handleStatusChange = (studentId: string, status: string) => {
    setRecords(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], status }
    }));
  };

  const markAllPresent = () => {
    const newRecords = { ...records };
    Object.keys(newRecords).forEach(id => {
      newRecords[id] = { ...newRecords[id], status: 'PRESENT' };
    });
    setRecords(newRecords);
    toast.success('All marked as PRESENT locally');
  };

  const handleSave = async () => {
    if (!activeYearId) {
      toast.error('Current academic year not found');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        classId: selectedClass,
        date: selectedDate,
        academicYearId: activeYearId,
        records: Object.entries(records).map(([studentId, data]) => ({
          studentId,
          ...data
        }))
      };

      await api.post('/tenant/attendance/mark', payload);
      toast.success('Attendance synced to cloud');
      fetchSheet(); // Refresh
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const stats = {
    total: students.length,
    present: Object.values(records).filter(r => r.status === 'PRESENT').length,
    absent: Object.values(records).filter(r => r.status === 'ABSENT').length,
    late: Object.values(records).filter(r => r.status === 'LATE').length,
  };

  if (loading) return null;

  // Teacher has no assigned class — show friendly empty state
  if (isTeacher && classes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 animate-in fade-in duration-700">
        <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
          <CalendarDays className="w-10 h-10 text-amber-500" />
        </div>
        <h2 className="text-2xl font-black text-foreground">No Class Assigned</h2>
        <p className="text-slate-400 font-medium max-w-sm">
          You haven't been assigned as a Class Teacher yet. Please contact your school administrator to configure your class assignment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Attendance Marking</h1>
          <p className="text-slate-500 font-medium tracking-tight">Daily morning attendance for all class sections.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={markAllPresent} className="rounded-2xl px-6 py-6 border-white/5 bg-card hover:bg-white/10 transition-all font-bold">
            Mark All Present
          </Button>
          <Button
            onClick={handleSave}
            isLoading={saving}
            className="rounded-2xl px-8 py-6 shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 transition-all font-black flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Sync Records
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="grid md:grid-cols-4 gap-4 p-8 rounded-[2.5rem] bg-card border border-white/5 shadow-2xl">
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-[10px] uppercase font-black text-slate-500 ml-1 tracking-widest">Select Class Section</label>
          <div className="relative">
            <select
              title="Class Section"
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="w-full h-14 bg-card border border-white/5 rounded-2xl px-5 text-sm font-bold text-foreground outline-none focus:border-primary/50 transition-all appearance-none"
            >
              <option value="">Select a Class</option>
              {classes.map(c => (
                <option key={c.id || c._id} value={c.id || c._id}>Class {c.grade} - {c.section} ({c.displayName})</option>
              ))}
            </select>
            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 rotate-90" />
          </div>
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-[10px] uppercase font-black text-slate-500 ml-1 tracking-widest">Select Date</label>
          <div className="relative">
            <input
              type="date"
              title="Attendance Date"
              value={selectedDate}
              max={new Date().toISOString().split('T')[0]}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-5 text-sm font-bold text-foreground outline-none focus:border-primary/50 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {([
          { label: 'Total Strength', val: stats.total, icon: Users, color: 'text-slate-400', bg: 'bg-slate-400/10' },
          { label: 'Present Today', val: stats.present, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
          { label: 'Absent Today', val: stats.absent, icon: XCircle, color: 'text-rose-400', bg: 'bg-rose-400/10' },
          { label: 'Late Commers', val: stats.late, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10' },
        ]).map((stat, i) => (
          <div key={`stat-${i}`} className="p-6 rounded-[2rem] bg-card border border-white/5 flex items-center gap-4 group hover:border-primary/20 transition-all">
            <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider font-sans">{stat.label}</p>
              <p className="text-2xl font-black text-foreground">{stat.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Attendance Grid */}
      <div className="bg-card border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
        {fetchingSheet && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] z-10 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-black uppercase tracking-widest text-primary animate-pulse">Fetching Class Registry...</p>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/5">
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest">Student Details</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest">Adm. No</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest text-center">Attendance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {students.map((student) => (
                <tr key={student.id || student._id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-lg font-black overflow-hidden">
                        {student.userId?.avatarUrl ? (
                          <img src={student.userId.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : student.userId?.firstName?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{student.userId?.firstName} {student.userId?.lastName}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{student.rollNumber ? `Roll: ${student.rollNumber}` : 'No Roll'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-slate-400">
                      {student.admissionNumber}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-center gap-2">
                      {[
                        { id: 'PRESENT', label: 'P', color: 'bg-emerald-500', icon: Check },
                        { id: 'ABSENT', label: 'A', color: 'bg-rose-500', icon: XCircle },
                        { id: 'LATE', label: 'L', color: 'bg-amber-500', icon: Clock }
                      ].map(btn => (
                        <button
                          key={btn.id}
                          onClick={() => handleStatusChange(student.id || student._id, btn.id)}
                          className={`
                                    w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 relative group/btn
                                    ${records[student.id || student._id]?.status === btn.id
                              ? `${btn.color} text-white shadow-lg ring-4 ring-white/10`
                              : 'bg-white/5 text-slate-500 hover:bg-white/10 hover:text-slate-300'}
                                  `}
                          title={btn.id}
                        >
                          {records[student.id || student._id]?.status === btn.id ? (
                            <span className="text-sm font-black tracking-tighter">{btn.label}</span>
                          ) : (
                            <span className="text-sm font-black opacity-50 group-hover/btn:opacity-100">{btn.label}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
              {students.length === 0 && !fetchingSheet && (
                <tr>
                  <td colSpan={3} className="px-8 py-20 text-center">
                    <Users className="w-12 h-12 text-slate-600 mx-auto mb-4 opacity-20" />
                    <p className="text-slate-500 font-bold">No students found in this section.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
