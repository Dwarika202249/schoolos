import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Calendar,
  Layers,
  BookOpen,
  Settings2,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import api from '../utils/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import toast from 'react-hot-toast';

type Tab = 'sessions' | 'grades' | 'subjects';

export const AcademicConfig = () => {
  const [activeTab, setActiveTab] = useState<Tab>('sessions');
  const [loading, setLoading] = useState(true);

  // Data State
  const [years, setYears] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);

  // Modal States
  const [showYearModal, setShowYearModal] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);

  const [editingItem, setEditingItem] = useState<any>(null);
  const [newYear, setNewYear] = useState({ name: '', startDate: '', endDate: '', isCurrent: false });
  const [newClass, setNewClass] = useState({ grade: '', section: '', branchId: '', academicYearId: '', maxStrength: 60 });
  const [newSubject, setNewSubject] = useState({ name: '', code: '', type: 'CORE' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [yRes, cRes, sRes, bRes] = await Promise.all([
        api.get('/tenant/academic-years'),
        api.get('/tenant/classes'),
        api.get('/tenant/subjects'),
        api.get('/tenant/branches')
      ]);
      setYears(yRes.data.data);
      setClasses(cRes.data.data);
      setSubjects(sRes.data.data);
      setBranches(bRes.data.data);
    } catch (error) {
      toast.error('Failed to sync academic engine');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveYear = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        const id = editingItem.id || editingItem._id;
        if (!id) throw new Error("Invalid object identifier");
        await api.patch(`/tenant/academic-years/${id}`, newYear);
        toast.success('Session updated');
      } else {
        await api.post('/tenant/academic-years', newYear);
        toast.success('Session created');
      }
      setShowYearModal(false);
      setEditingItem(null);
      setNewYear({ name: '', startDate: '', endDate: '', isCurrent: false });
      fetchData();
    } catch (error) {
      toast.error('Failed to save session');
    }
  };

  const handleSaveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        const id = editingItem.id || editingItem._id;
        if (!id) throw new Error("Invalid object identifier");
        await api.patch(`/tenant/classes/${id}`, newClass);
        toast.success('Class updated');
      } else {
        await api.post('/tenant/classes', newClass);
        toast.success('Class and section defined');
      }
      setShowClassModal(false);
      setEditingItem(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to save class');
    }
  };

  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        const id = editingItem.id || editingItem._id;
        if (!id) throw new Error("Invalid object identifier");
        await api.patch(`/tenant/subjects/${id}`, newSubject);
        toast.success('Subject updated');
      } else {
        await api.post('/tenant/subjects', newSubject);
        toast.success('Subject added to bank');
      }
      setShowSubjectModal(false);
      setEditingItem(null);
      setNewSubject({ name: '', code: '', type: 'CORE' });
      fetchData();
    } catch (error) {
      toast.error('Failed to save subject');
    }
  };

  const handleDeleteSubject = async (id: string) => {
    try {
      await api.delete(`/tenant/subjects/${id}`);
      toast.success('Subject removed');
      fetchData();
    } catch (error) {
      toast.error('Subject is linked to classes');
    }
  };

  const tabs = [
    { id: 'sessions', name: 'Academic Sessions', icon: Calendar },
    { id: 'grades', name: 'Grades & Sections', icon: Layers },
    { id: 'subjects', name: 'Subject Bank', icon: BookOpen },
  ];

  if (loading) return null;

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Academic Engine</h1>
          <p className="text-slate-500 font-medium">Control institutional structure and session lifecycles.</p>
        </div>
        <div className="flex bg-card border border-white/5 p-1.5 rounded-2xl gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                : 'text-slate-500 hover:text-white hover:bg-white/5'
                }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'sessions' && (
          <motion.div
            key="sessions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Calendar className="w-4 h-4" /> School Sessions
              </h3>
              <Button size="sm" onClick={() => { setEditingItem(null); setShowYearModal(true); }} className="rounded-xl px-4">
                <Plus className="w-4 h-4 mr-2" /> Add Session
              </Button>
            </div>

            <div className="grid gap-4">
              {years.map((year, idx) => (
                <div key={year.id || year._id || `year-${idx}`} className="p-6 rounded-[2rem] bg-card border border-white/5 flex items-center justify-between group hover:border-primary/20 transition-all">
                  <div className="flex items-center gap-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${year.isCurrent ? 'bg-primary/20 text-primary' : 'bg-white/5 text-slate-500'}`}>
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-lg font-black">{year.name}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                        {new Date(year.startDate).toLocaleDateString()} — {new Date(year.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {year.isCurrent && (
                      <span className="px-4 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                        Current Session
                      </span>
                    )}
                    <div className="flex opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => { setEditingItem(year); setNewYear(year); setShowYearModal(true); }} className="p-3 text-slate-400 hover:text-white transition-colors" title="Edit Session"><Edit2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'grades' && (
          <motion.div
            key="grades"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Layers className="w-4 h-4" /> Institutional Structure
              </h3>
              <Button size="sm" onClick={() => { setEditingItem(null); setShowClassModal(true); }} className="rounded-xl px-4">
                <Plus className="w-4 h-4 mr-2" /> Define Class
              </Button>
            </div>

            <div className="bg-card border border-white/5 rounded-[2.5rem] overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/5 border-b border-white/5">
                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest">Class / Grade</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest">Section</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Capacity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {classes.map((cls, idx) => (
                    <tr key={cls.id || cls._id || `class-${idx}`} className="hover:bg-white/5 transition-colors group">
                      <td className="px-8 py-5">
                        <span className="font-black text-white">Class {cls.grade}</span>
                      </td>
                      <td className="px-8 py-5">
                        <span className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                          Section {cls.section}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right font-black text-slate-400">
                        {cls.maxStrength} Students
                      </td>
                    </tr>
                  ))}
                  {classes.length === 0 && (
                    <tr key="empty-classes-row">
                      <td colSpan={3} className="px-8 py-20 text-center text-slate-500 font-medium">
                        No classes defined yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'subjects' && (
          <motion.div
            key="subjects"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Global Subject Bank
              </h3>
              <Button size="sm" onClick={() => { setEditingItem(null); setShowSubjectModal(true); }} className="rounded-xl px-4">
                <Plus className="w-4 h-4 mr-2" /> New Subject
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((sub, idx) => (
                <div key={sub.id || sub._id || `subject-${idx}`} className="p-6 rounded-3xl bg-card border border-white/5 space-y-4 group hover:border-primary/20 transition-all relative overflow-hidden">
                  <div className="flex justify-between items-start relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => { setEditingItem(sub); setNewSubject(sub); setShowSubjectModal(true); }} className="p-2 text-slate-400 hover:text-white transition-colors" title="Edit Subject"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteSubject(sub.id || sub._id)} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors" title="Delete Subject"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-black text-lg text-white">{sub.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-black uppercase text-slate-500 tracking-tight">{sub.code || 'NO-CODE'}</span>
                      <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${sub.type === 'CORE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                        {sub.type}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sessions Modal */}
      <AnimatePresence>
        {showYearModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowYearModal(false)} />
            <motion.form
              onSubmit={handleSaveYear}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative w-full max-w-md bg-card border border-white/10 p-10 rounded-[2.5rem] shadow-2xl space-y-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black">Academic Session</h3>
              </div>

              <Input label="Session Name" placeholder="e.g. 2024-25" value={newYear.name} onChange={e => setNewYear({ ...newYear, name: e.target.value })} required />

              <div className="grid grid-cols-2 gap-4">
                <Input label="Start Date" type="date" value={newYear.startDate.split('T')[0]} onChange={e => setNewYear({ ...newYear, startDate: e.target.value })} required />
                <Input label="End Date" type="date" value={newYear.endDate.split('T')[0]} onChange={e => setNewYear({ ...newYear, endDate: e.target.value })} required />
              </div>

              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5 cursor-pointer" onClick={() => setNewYear({ ...newYear, isCurrent: !newYear.isCurrent })}>
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${newYear.isCurrent ? 'bg-primary border-primary' : 'border-slate-700'}`}>
                  {newYear.isCurrent && <CheckCircle2 className="w-4 h-4 text-white" />}
                </div>
                <span className="text-xs font-black uppercase tracking-tight">Active Current Session</span>
              </div>

              <div className="flex gap-4 pt-4">
                <Button variant="outline" type="button" className="flex-1 py-6 rounded-2xl" onClick={() => setShowYearModal(false)}>Cancel</Button>
                <Button type="submit" className="flex-1 py-6 rounded-2xl font-black shadow-xl shadow-primary/20">Save Session</Button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* Class Modal */}
      <AnimatePresence>
        {showClassModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowClassModal(false)} />
            <motion.form
              onSubmit={handleSaveClass}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative w-full max-w-md bg-card border border-white/10 p-10 rounded-[2.5rem] shadow-2xl space-y-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black">Define Class</h3>
              </div>

              <div className="space-y-4">
                <Input label="Grade / Class Name" placeholder="e.g. Grade 10" value={newClass.grade} onChange={e => setNewClass({ ...newClass, grade: e.target.value })} required />
                <Input label="Section Name" placeholder="e.g. A" value={newClass.section} onChange={e => setNewClass({ ...newClass, section: e.target.value })} required />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Branch</label>
                    <select
                      title="Branch"
                      className="bg-card border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-primary/40"
                      value={newClass.branchId}
                      onChange={e => setNewClass({ ...newClass, branchId: e.target.value })}
                      required
                    >
                      <option value="">Select Branch</option>
                      {branches.map((b, idx) => <option key={b.id || b._id || `br-${idx}`} value={b.id || b._id}>{b.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Session</label>
                    <select
                      title="Session"
                      className="bg-card border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-primary/40"
                      value={newClass.academicYearId}
                      onChange={e => setNewClass({ ...newClass, academicYearId: e.target.value })}
                      required
                    >
                      <option value="">Select Year</option>
                      {years.map((y, idx) => <option key={y.id || y._id || `yr-${idx}`} value={y.id || y._id}>{y.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button variant="outline" type="button" className="flex-1 py-6 rounded-2xl" onClick={() => setShowClassModal(false)}>Cancel</Button>
                <Button type="submit" className="flex-1 py-6 rounded-2xl font-black shadow-xl shadow-primary/20">Create Class</Button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* Subject Modal */}
      <AnimatePresence>
        {showSubjectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowSubjectModal(false)} />
            <motion.form
              onSubmit={handleSaveSubject}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative w-full max-w-md bg-card border border-white/10 p-10 rounded-[2.5rem] shadow-2xl space-y-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black">{editingItem ? 'Edit Subject' : 'Add Subject'}</h3>
              </div>

              <div className="space-y-4">
                <Input label="Subject Name" placeholder="e.g. Physics" value={newSubject.name} onChange={e => setNewSubject({ ...newSubject, name: e.target.value })} required />
                <Input label="Code" placeholder="e.g. PHY-101" value={newSubject.code} onChange={e => setNewSubject({ ...newSubject, code: e.target.value })} />

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Type</label>
                  <select
                    title="Type"
                    className="bg-card border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-primary/40"
                    value={newSubject.type}
                    onChange={e => setNewSubject({ ...newSubject, type: e.target.value })}
                    required
                  >
                    <option value="CORE">Core Academic</option>
                    <option value="ELECTIVE">Elective / Optional</option>
                    <option value="LANGUAGE">Language</option>
                    <option value="VOCATIONAL">Vocational</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button variant="outline" type="button" className="flex-1 py-6 rounded-2xl" onClick={() => { setShowSubjectModal(false); setEditingItem(null); }}>Cancel</Button>
                <Button type="submit" className="flex-1 py-6 rounded-2xl font-black shadow-xl shadow-primary/20">Save Subject</Button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
