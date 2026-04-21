import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Users,
  BookOpen,
  Plus,
  Trash2,
  ChevronRight,
  Save,
  Search,
  LayoutGrid,
  Settings,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import toast from 'react-hot-toast';

const ALL_DAYS = [
  { name: 'Monday', val: 1 },
  { name: 'Tuesday', val: 2 },
  { name: 'Wednesday', val: 3 },
  { name: 'Thursday', val: 4 },
  { name: 'Friday', val: 5 },
  { name: 'Saturday', val: 6 },
  { name: 'Sunday', val: 7 },
];

export const TimetableManagement = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [school, setSchool] = useState<any>(null);

  const [selectedClass, setSelectedClass] = useState('');
  const [activeYearId, setActiveYearId] = useState('');
  const [timetable, setTimetable] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Grid Config State
  const [config, setConfig] = useState({ workDays: 6, periodCount: 8 });
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  const [editingSlot, setEditingSlot] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    subjectId: '',
    teacherId: '',
    startTime: '',
    endTime: '',
    roomNumber: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cRes, sRes, tRes, yRes, schoolRes] = await Promise.all([
          api.get('/tenant/classes'),
          api.get('/tenant/subjects'),
          api.get('/tenant/staff?designation=TEACHER'),
          api.get('/tenant/academic-years'),
          api.get('/tenant/school')
        ]);
        setClasses(cRes.data.data);
        setSubjects(sRes.data.data);
        setTeachers(tRes.data.data);
        setAcademicYears(yRes.data.data);
        setSchool(schoolRes.data.data);

        const currentConfig = schoolRes.data.data.configuration?.timetable || { workDays: 6, periodCount: 8 };
        setConfig(currentConfig);

        const current = yRes.data.data.find((y: any) => y.isCurrent);
        if (current) setActiveYearId(current.id || current._id);

        if (cRes.data.data.length > 0) setSelectedClass(cRes.data.data[0].id || cRes.data.data[0]._id);
      } catch (err) {
        toast.error('Failed to load initial data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchTimetable = async () => {
      if (!selectedClass || !activeYearId) return;
      try {
        const res = await api.get(`/tenant/timetable/class/${selectedClass}`, {
          params: { academicYearId: activeYearId }
        });
        setTimetable(res.data.data);
      } catch (err) {
        toast.error('Failed to load timetable');
      }
    };
    fetchTimetable();
  }, [selectedClass, activeYearId]);

  const handleOpenSlot = (day: number, period: number) => {
    const existing = timetable.find(t => t.dayOfWeek === day && t.periodNumber === period);
    setEditingSlot({ day, period });

    // Explicitly extract string IDs to prevent "Cast to ObjectId failed" errors
    const teacherId = existing?.teacherId?._id || existing?.teacherId || '';
    const subjectId = existing?.subjectId?._id || existing?.subjectId || '';

    if (existing) {
      setForm({
        subjectId: typeof subjectId === 'string' ? subjectId : '',
        teacherId: typeof teacherId === 'string' ? teacherId : '',
        startTime: existing.startTime || '',
        endTime: existing.endTime || '',
        roomNumber: existing.roomNumber || ''
      });
    } else {
      setForm({ subjectId: '', teacherId: '', startTime: '', endTime: '', roomNumber: '' });
    }
    setIsModalOpen(true);
  };

  const handleSaveSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Final validation to ensure IDs are valid (24 chars)
      if (form.teacherId.length !== 24 || form.subjectId.length !== 24) {
        toast.error('Invalid Teacher or Subject selected');
        return;
      }

      const payload = {
        academicYearId: activeYearId,
        classId: selectedClass,
        dayOfWeek: editingSlot.day,
        periodNumber: editingSlot.period,
        ...form
      };
      await api.post('/tenant/timetable/upsert', payload);
      toast.success('Timetable slot updated');
      setIsModalOpen(false);

      // Refresh
      const res = await api.get(`/tenant/timetable/class/${selectedClass}`, {
        params: { academicYearId: activeYearId }
      });
      setTimetable(res.data.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save slot');
    }
  };

  const handleUpdateConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.patch('/tenant/school', {
        configuration: {
          ...school.configuration,
          timetable: config
        }
      });
      toast.success('Grid configuration saved');
      setIsConfigModalOpen(false);
      // Update local school state to keep configuration in sync
      setSchool({ ...school, configuration: { ...school.configuration, timetable: config } });
    } catch (err) {
      toast.error('Failed to update configuration');
    }
  };

  if (loading) return null;

  const currentDays = ALL_DAYS.slice(0, config.workDays);
  const currentPeriods = Array.from({ length: config.periodCount }, (_, i) => i + 1);

  return (
    <div className="space-y-8 pb-32 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-foreground">Weekly Timetable</h1>
          <p className="text-slate-500 font-medium">Create and manage the recurring class schedule.</p>
        </div>
        <div className="flex gap-4">
          <Button
            variant="outline"
            className="h-15 w-15 rounded-xl border-white/5 bg-card"
            onClick={() => setIsConfigModalOpen(true)}
            title="Grid Configuration"
          >
            <Settings className="w-8 h-8" />
          </Button>

          <div className="space-y-1.5 min-w-[200px]">
            <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">Select Class</label>
            <select
              title="Class Select"
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="w-full h-12 bg-card border border-white/5 rounded-xl px-4 text-sm font-bold outline-none focus:border-primary/50"
            >
              {classes.map(c => <option key={c.id || c._id} value={c.id || c._id}>{c.displayName}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-card border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-white/5">
                <th className="p-6 border-r border-white/5 text-[10px] font-black uppercase text-slate-500 tracking-widest text-center w-24">Time / Period</th>
                {currentDays.map(d => (
                  <th key={d.val} className="p-6 border-r border-white/5 text-[10px] font-black uppercase text-slate-500 tracking-widest text-center">{d.name}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {currentPeriods.map(p => (
                <tr key={p}>
                  <td className="p-6 border-r border-white/5 text-center bg-white/5">
                    <p className="text-xl font-black text-primary">{p}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Period</p>
                  </td>
                  {currentDays.map(d => {
                    const slot = timetable.find(t => t.dayOfWeek === d.val && t.periodNumber === p);
                    return (
                      <td
                        key={`${d.val}-${p}`}
                        className="p-3 border-r border-white/5 min-w-[160px] group cursor-pointer hover:bg-primary/5 transition-all"
                        onClick={() => handleOpenSlot(d.val, p)}
                      >
                        {slot ? (
                          <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 space-y-2">
                            <p className="text-xs font-black text-primary uppercase truncate">{slot.subjectId?.name || 'Subject'}</p>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-[10px] font-black">
                                {slot.teacherId?.firstName?.charAt(0)}
                              </div>
                              <p className="text-[11px] font-bold text-slate-300 truncate">
                                {slot.teacherId?.firstName} {slot.teacherId?.lastName}
                              </p>
                            </div>
                            <div className="flex items-center justify-between gap-1 mt-1">
                              {slot.startTime && (
                                <p className="text-[9px] font-black text-primary/60 flex items-center gap-1 uppercase tracking-tight">
                                  <Clock className="w-2.5 h-2.5" /> {slot.startTime} {slot.endTime && ` - ${slot.endTime}`}
                                </p>
                              )}
                              {slot.roomNumber && (
                                <p className="text-[9px] font-black text-slate-500 flex items-center gap-1 uppercase tracking-widest truncate">
                                  <LayoutGrid className="w-2.5 h-2.5" /> {slot.roomNumber}
                                </p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="h-24 rounded-2xl border border-dashed border-white/5 flex items-center justify-center group-hover:border-primary/30 transition-all">
                            <Plus className="w-6 h-6 text-slate-700 group-hover:text-primary transition-colors" />
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <motion.form
              onSubmit={handleSaveSlot}
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-card border border-white/10 p-10 rounded-[3rem] shadow-2xl space-y-6"
            >
              <div>
                <h2 className="text-2xl font-black">Period {editingSlot?.period} Assignment</h2>
                <p className="text-slate-500 text-sm font-medium">Configure {ALL_DAYS.find(d => d.val === editingSlot?.day)?.name} schedule.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">Subject</label>
                  <select
                    title="Subject Select"
                    value={form.subjectId}
                    onChange={e => setForm({ ...form, subjectId: e.target.value })}
                    required
                    className="w-full h-14 bg-card border border-white/10 rounded-2xl px-6 text-sm font-bold outline-none focus:border-primary"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(s => <option key={s.id || s._id} value={s.id || s._id}>{s.name}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">Teacher</label>
                  <select
                    title="Teacher Select"
                    value={form.teacherId}
                    onChange={e => setForm({ ...form, teacherId: e.target.value })}
                    required
                    className="w-full h-14 bg-card border border-white/10 rounded-2xl px-6 text-sm font-bold outline-none focus:border-primary"
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map(t => (
                      <option key={t.userId?.id || t.userId?._id || t.id || t._id} value={t.userId?.id || t.userId?._id}>
                        {t.userId?.firstName} {t.userId?.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input label="Start Time" type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} />
                  <Input label="End Time" type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} />
                </div>
                <Input label="Room / Lab" placeholder="e.g. Science Lab 2" value={form.roomNumber} onChange={e => setForm({ ...form, roomNumber: e.target.value })} />
              </div>

              <div className="flex gap-4 pt-4">
                <Button variant="outline" type="button" className="flex-1 py-6 rounded-2xl" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="flex-1 py-6 rounded-2xl font-black">Save Assignment</Button>
              </div>
            </motion.form>
          </div>
        )}

        {isConfigModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsConfigModalOpen(false)} />
            <motion.form
              onSubmit={handleUpdateConfig}
              initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
              className="relative w-full max-w-sm bg-card border border-white/10 p-10 rounded-[3rem] shadow-2xl space-y-6 text-center"
            >
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-2">
                <Settings className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-black">Grid Configuration</h2>
                <p className="text-slate-500 text-sm font-medium mt-1">Adjust your school's weekly cycle.</p>
              </div>

              <div className="space-y-6 pt-2">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm px-1">
                    <span className="font-bold text-slate-400">Total Periods</span>
                    <span className="text-primary font-black">{config.periodCount}</span>
                  </div>
                  <input
                    title="Period Count Range"
                    type="range" min="1" max="15"
                    value={config.periodCount}
                    onChange={e => setConfig({ ...config, periodCount: Number(e.target.value) })}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm px-1">
                    <span className="font-bold text-slate-400">Working Days</span>
                    <span className="text-primary font-black">{config.workDays} Days</span>
                  </div>
                  <input
                    title="Work Days Range"
                    type="range" min="1" max="7"
                    value={config.workDays}
                    onChange={e => setConfig({ ...config, workDays: Number(e.target.value) })}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[8px] font-black text-slate-600 uppercase tracking-tighter px-1">
                    <span>Mon</span>
                    <span>Sun</span>
                  </div>
                </div>

                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex gap-3 text-left">
                  <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />
                  <p className="text-[10px] font-bold text-amber-500 leading-relaxed uppercase tracking-wide">
                    Reducing grid size will hide existing data beyond selected range. It will not be deleted.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button variant="outline" type="button" className="flex-1 py-6 rounded-2xl" onClick={() => setIsConfigModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="flex-1 py-6 rounded-2xl font-black">Save Changes</Button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
