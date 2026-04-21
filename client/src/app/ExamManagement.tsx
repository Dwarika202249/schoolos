import React, { useState, useEffect, useCallback } from 'react';
import {
  CalendarDays,
  Plus,
  Search,
  Sparkles,
  Trash2,
  ChevronRight,
  Filter,
  FileSpreadsheet,
  Clock,
  BookOpen,
  GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export const ExamManagement = () => {
  const [activeTab, setActiveTab] = useState<'schedules' | 'terms' | 'grading'>('schedules');
  const [loading, setLoading] = useState(true);
  const [gradeSystem, setGradeSystem] = useState<any[]>([]);

  // Data lists
  const [terms, setTerms] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);

  // Filter state
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');

  // Modals
  const [isTermModalOpen, setIsTermModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Editing state
  const [editingTerm, setEditingTerm] = useState<any>(null);
  const [editingGrade, setEditingGrade] = useState<any>(null);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [confirmConfig, setConfirmConfig] = useState({ title: '', message: '', onConfirm: () => { } });

  // Form states
  const [termForm, setTermForm] = useState({ name: '', academicYearId: '', startDate: '', endDate: '' });
  const [gradeForm, setGradeForm] = useState({ label: '', minPercent: '', maxPercent: '', points: '' });
  const [scheduleForm, setScheduleForm] = useState({
    examTermId: '', classId: '', subjectId: '', examDate: '', startTime: '', duration: '', maxMarks: '100', passingMarks: '33'
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [tRes, cRes, sRes, yRes, gRes] = await Promise.all([
        api.get('/tenant/exams/terms'),
        api.get('/tenant/classes'),
        api.get('/tenant/subjects'),
        api.get('/tenant/academic-years'),
        api.get('/tenant/exams/grade-system')
      ]);

      setTerms(tRes.data.data);
      setClasses(cRes.data.data);
      setSubjects(sRes.data.data);
      setAcademicYears(yRes.data.data);
      setGradeSystem(gRes.data.data);

      if (tRes.data.data.length > 0) setSelectedTerm(tRes.data.data[0]._id);

      // Fetch schedules based on current selection
      const schRes = await api.get('/tenant/exams/schedules', {
        params: {
          examTermId: selectedTerm || tRes.data.data[0]?._id,
          classId: selectedClass
        }
      });
      setSchedules(schRes.data.data);

    } catch (error) {
      toast.error('Failed to load exam data');
    } finally {
      setLoading(false);
    }
  }, [selectedTerm, selectedClass]);

  useEffect(() => {
    fetchData();
  }, [selectedTerm, selectedClass]);

  const handleUpsertTerm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTerm) {
        await api.put(`/tenant/exams/terms/${editingTerm.id || editingTerm._id}`, termForm);
        toast.success('Exam Term updated');
      } else {
        await api.post('/tenant/exams/terms', termForm);
        toast.success('Exam Term created');
      }
      setIsTermModalOpen(false);
      setEditingTerm(null);
      setTermForm({ name: '', academicYearId: '', startDate: '', endDate: '' });
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save term');
    }
  };

  const handleDeleteTerm = (term: any) => {
    setConfirmConfig({
      title: 'Delete Exam Term',
      message: `Are you sure you want to delete "${term.name}"? This will also delete all associated schedules and student marks. This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await api.delete(`/tenant/exams/terms/${term.id || term._id}`);
          toast.success('Term deleted successfully');
          fetchData();
        } catch {
          toast.error('Failed to delete term');
        }
      }
    });
    setIsConfirmModalOpen(true);
  };

  const handleUpsertGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingGrade) {
        await api.patch(`/tenant/exams/grade-system/${editingGrade.id || editingGrade._id}`, gradeForm);
        toast.success('Grade scale updated');
      } else {
        await api.post('/tenant/exams/grade-system', gradeForm);
        toast.success('Grade scale added');
      }
      setIsGradeModalOpen(false);
      setEditingGrade(null);
      setGradeForm({ label: '', minPercent: '', maxPercent: '', points: '' });
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save grade');
    }
  };

  const handleDeleteGrade = (grade: any) => {
    setConfirmConfig({
      title: 'Delete Grade Scale',
      message: `Delete grade "${grade.label}"? This may affect how existing results are displayed.`,
      onConfirm: async () => {
        try {
          await api.delete(`/tenant/exams/grade-system/${grade.id || grade._id}`);
          toast.success('Grade scale deleted');
          fetchData();
        } catch (err: any) {
          toast.error(err.response?.data?.message || 'Failed to delete grade');
        }
      }
    });
    setIsConfirmModalOpen(true);
  };

  const handleUpsertSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSchedule) {
        await api.put(`/tenant/exams/schedules/${editingSchedule.id || editingSchedule._id}`, scheduleForm);
        toast.success('Exam schedule updated');
      } else {
        await api.post('/tenant/exams/schedules', scheduleForm);
        toast.success('Exam scheduled!');
      }
      setIsScheduleModalOpen(false);
      setEditingSchedule(null);
      setScheduleForm({
        examTermId: '', classId: '', subjectId: '', examDate: '', startTime: '', duration: '', maxMarks: '100', passingMarks: '33'
      });
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save schedule');
    }
  };

  const handleDeleteSchedule = (sch: any) => {
    setConfirmConfig({
      title: 'Delete Scheduled Paper',
      message: `Delete the ${sch.subjectId?.name} exam for ${sch.classId?.displayName}? This will also delete all student marks entered for this paper.`,
      onConfirm: async () => {
        try {
          await api.delete(`/tenant/exams/schedules/${sch.id || sch._id}`);
          toast.success('Schedule deleted');
          fetchData();
        } catch {
          toast.error('Failed to delete schedule');
        }
      }
    });
    setIsConfirmModalOpen(true);
  };

  const handleSeedGrades = async () => {
    try {
      await api.post('/tenant/exams/grade-system/seed');
      toast.success('Grading system initialized!');
      fetchData();
    } catch {
      toast.error('Failed to initialize grading');
    }
  };

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-primary shrink-0" />
            Exams & Assessments
          </h1>
          <p className="text-slate-500 font-medium mt-1">Manage academic cycles, schedule papers, and publish results.</p>
        </div>
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => setActiveTab('grading')}
            className="rounded-2xl px-6 py-6 border-emerald-500/30 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-black transition-all font-bold"
          >
            Setup Grades
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsTermModalOpen(true)}
            className="rounded-2xl px-6 py-6 border-white/10 bg-card hover:bg-white/10 transition-all font-bold"
          >
            Create Term
          </Button>
          <Button
            onClick={() => setIsScheduleModalOpen(true)}
            className="rounded-2xl px-8 py-6 shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 transition-all font-black flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Schedule Paper
          </Button>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
        <div className="flex gap-3 p-1.5 bg-card border border-white/5 rounded-2xl">
          <button
            onClick={() => setActiveTab('schedules')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'schedules' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-white'}`}
          >
            Exam Schedules
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'terms' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-white'}`}
          >
            Manage Terms
          </button>
          <button
            onClick={() => setActiveTab('grading')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'grading' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-white'}`}
          >
            Grading System
          </button>
        </div>

        {activeTab === 'schedules' && (
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 bg-card border border-white/10 rounded-2xl px-4 py-2">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select
                title="Select Term"
                className="bg-transparent border-none text-sm font-bold outline-none"
                value={selectedTerm}
                onChange={e => setSelectedTerm(e.target.value)}
              >
                <option key="default-term" value="">All Terms</option>
                {terms.map((t, idx) => <option key={t.id || t._id || `term-${idx}`} value={t.id || t._id}>{t.name}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 bg-card border border-white/10 rounded-2xl px-4 py-2">
              <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
              <select
                title="Select Class"
                className="bg-card border-none text-sm font-bold outline-none"
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
              >
                <option key="default-class" value="">All Classes</option>
                {classes.map((c, idx) => <option key={c.id || c._id || `class-${idx}`} value={c.id || c._id}>{c.displayName}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <Card className="min-h-[400px] bg-card/40 backdrop-blur-xl border-white/10 rounded-[3rem] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-20">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : activeTab === 'schedules' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 border-b border-white/5">
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest">Date & Time</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest">Subject</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest">Class</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest">Max / Pass</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {schedules.map(sch => (
                  <tr key={sch.id || sch._id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex flex-col items-center justify-center text-primary leading-tight">
                          <span className="text-xs font-black">{new Date(sch.examDate).toLocaleDateString(undefined, { day: '2-digit' })}</span>
                          <span className="text-[10px] font-bold uppercase">{new Date(sch.examDate).toLocaleDateString(undefined, { month: 'short' })}</span>
                        </div>
                        <div>
                          <p className="font-bold text-sm">{new Intl.DateTimeFormat(undefined, { weekday: 'long' }).format(new Date(sch.examDate))}</p>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                            <Clock className="w-2.5 h-2.5" /> {sch.startTime || '—'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-black text-slate-200">{sch.subjectId?.name}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase">{sch.subjectId?.code || 'NO-CODE'}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-[10px] font-black text-slate-400 capitalize">
                        {sch.classId?.displayName}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-emerald-500">{sch.maxMarks}</span>
                        <span className="text-slate-600">/</span>
                        <span className="text-xs font-bold text-slate-400">{sch.passingMarks}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/exams/marking/${sch.id || sch._id}`}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary text-xs font-black rounded-xl transition-all hover:text-white"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                          Marks
                        </Link>
                        <button
                          title="Edit"
                          onClick={() => {
                            setEditingSchedule(sch);
                            setScheduleForm({
                              examTermId: sch.examTermId?._id || sch.examTermId,
                              classId: sch.classId?._id || sch.classId,
                              subjectId: sch.subjectId?._id || sch.subjectId,
                              examDate: new Date(sch.examDate).toISOString().split('T')[0],
                              startTime: sch.startTime || '',
                              duration: sch.duration || '',
                              maxMarks: sch.maxMarks.toString(),
                              passingMarks: sch.passingMarks.toString(),
                            });
                            setIsScheduleModalOpen(true);
                          }}
                          className="p-2 text-slate-500 hover:text-primary transition-colors bg-white/5 rounded-xl"
                        >
                          <ChevronRight className="w-4 h-4 rotate-[-90deg]" />
                        </button>
                        <button
                          title="Delete"
                          onClick={() => handleDeleteSchedule(sch)}
                          className="p-2 text-slate-500 hover:text-rose-500 transition-colors bg-white/5 rounded-xl"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {schedules.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-20 text-center text-slate-500 font-medium">No exams scheduled for the selected filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'terms' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-10">
            {terms.map(t => (
              <div key={t.id || t._id} className="p-8 rounded-[2.5rem] bg-card border border-white/5 hover:border-primary/20 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-3xl rounded-full group-hover:scale-150 transition-all duration-700" />
                <h3 className="text-xl font-black mb-4">{t.name}</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                    <CalendarDays className="w-4 h-4 text-primary/60" />
                    {new Date(t.startDate).toLocaleDateString()} — {new Date(t.endDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                    <BookOpen className="w-4 h-4 text-primary/60" />
                    Academic Session: {academicYears.find(y => (y.id || y._id) === t.academicYearId)?.name || 'Default'}
                  </div>
                </div>
                <div className="mt-8 flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">Active Term</span>
                  <div className="flex items-center gap-1">
                    <button
                      title="Edit"
                      onClick={() => {
                        setEditingTerm(t);
                        setTermForm({
                          name: t.name,
                          academicYearId: t.academicYearId,
                          startDate: new Date(t.startDate).toISOString().split('T')[0],
                          endDate: new Date(t.endDate).toISOString().split('T')[0],
                        });
                        setIsTermModalOpen(true);
                      }}
                      className="p-2 text-slate-500 hover:text-primary transition-colors"
                    >
                      <ChevronRight className="w-4 h-4 rotate-[-90deg]" />
                    </button>
                    <button
                      title="Delete"
                      onClick={() => handleDeleteTerm(t)}
                      className="p-2 text-slate-600 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {terms.length === 0 && (
              <div className="col-span-full py-20 text-center text-slate-500 font-medium">No exam terms created yet.</div>
            )}
          </div>
        ) : (
          <div className="p-10">
            {gradeSystem.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-20 text-center space-y-6">
                <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary">
                  <Sparkles className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-xl font-black">No Grading Scales Found</h3>
                  <p className="text-slate-500 text-sm max-w-sm mt-2">
                    Initialize the standard academic grading system (A1-E) to start auto-calculating results.
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setEditingGrade(null);
                    setGradeForm({ label: '', minPercent: '', maxPercent: '', points: '' });
                    setIsGradeModalOpen(true);
                  }}
                  className="rounded-2xl px-10 py-6 bg-primary font-black"
                >
                  Add Custom Grade
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSeedGrades}
                  className="rounded-2xl px-10 py-6 border-white/5 font-black hover:bg-white/5"
                >
                  Initialize Standard Grades
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="bg-emerald-500/5 border border-emerald-500/10 p-6 rounded-3xl flex items-center gap-4">
                  <div className="flex-1">
                    <h4 className="text-sm font-black text-emerald-500 uppercase tracking-widest">Active Grading Scales</h4>
                    <p className="text-xs text-slate-500 mt-1">These mappings are used to automatically assign letter grades during mark entry.</p>
                  </div>
                  <Button variant="outline" onClick={handleSeedGrades} className="text-xs py-3 rounded-xl border-white/5 hover:bg-white/5">Reset to Defaults</Button>
                  <Button
                    onClick={() => {
                      setEditingGrade(null);
                      setGradeForm({ label: '', minPercent: '', maxPercent: '', points: '' });
                      setIsGradeModalOpen(true);
                    }}
                    className="text-xs py-3 px-6 rounded-xl bg-primary text-white font-black"
                  >
                    Add Grade
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {gradeSystem.map((g: any, idx: number) => (
                    <div key={g.id || g._id || idx} className="p-6 rounded-3xl bg-card border border-white/5 group hover:border-primary/30 transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <span className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-xl">{g.label}</span>
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Points: {g.points || '—'}</span>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              title="Edit"
                              onClick={() => {
                                setEditingGrade(g);
                                setGradeForm({
                                  label: g.label,
                                  minPercent: g.minPercent.toString(),
                                  maxPercent: g.maxPercent.toString(),
                                  points: g.points?.toString() || ''
                                });
                                setIsGradeModalOpen(true);
                              }}
                              className="p-1.5 text-slate-500 hover:text-primary transition-colors bg-white/5 rounded-lg"
                            >
                              <ChevronRight className="w-3 h-3 rotate-[-90deg]" />
                            </button>
                            {!g.isSystem && (
                              <button
                                title="Delete"
                                onClick={() => handleDeleteGrade(g)}
                                className="p-1.5 text-slate-600 hover:text-rose-500 transition-colors bg-white/5 rounded-lg"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-black text-slate-400">PERCENTAGE RANGE</p>
                        <p className="text-lg font-bold text-white">{g.minPercent}% — {g.maxPercent}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* CREATE TERM MODAL */}
      <AnimatePresence>
        {isTermModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsTermModalOpen(false)} />
            <motion.form
              onSubmit={handleUpsertTerm}
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="relative w-full max-w-lg bg-card border border-white/10 p-10 rounded-[3rem] shadow-2xl space-y-6"
            >
              <h2 className="text-2xl font-black">{editingTerm ? 'Edit Exam Term' : 'Create Exam Term'}</h2>
              <Input label="Term Name" placeholder="e.g. First Semester" value={termForm.name} onChange={e => setTermForm({ ...termForm, name: e.target.value })} required />
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black text-slate-500 ml-1 tracking-widest">Academic Year</label>
                <select
                  title="Select Year" className="w-full h-14 bg-card border border-white/5 rounded-2xl px-5 text-sm font-bold text-foreground outline-none focus:border-primary/50 transition-all"
                  value={termForm.academicYearId} onChange={e => setTermForm({ ...termForm, academicYearId: e.target.value })} required
                >
                  <option key="default-year" value="">Select Year</option>
                  {academicYears.map((y, idx) => <option key={y.id || y._id || `year-${idx}`} value={y.id || y._id}>{y.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Start Date" type="date" value={termForm.startDate} onChange={e => setTermForm({ ...termForm, startDate: e.target.value })} required />
                <Input label="End Date" type="date" value={termForm.endDate} onChange={e => setTermForm({ ...termForm, endDate: e.target.value })} required />
              </div>
              <div className="flex gap-4 pt-4">
                <Button variant="outline" type="button" className="flex-1 py-6 rounded-2xl" onClick={() => { setIsTermModalOpen(false); setEditingTerm(null); }}>Cancel</Button>
                <Button type="submit" className="flex-1 py-6 rounded-2xl font-black">{editingTerm ? 'Save Changes' : 'Create Cycle'}</Button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE/EDIT GRADE MODAL */}
      <AnimatePresence>
        {isGradeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsGradeModalOpen(false)} />
            <motion.form
              onSubmit={handleUpsertGrade}
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="relative w-full max-w-md bg-card border border-white/10 p-10 rounded-[3rem] shadow-2xl space-y-6"
            >
              <h2 className="text-2xl font-black">{editingGrade ? 'Edit Grade Scale' : 'Add New Grade'}</h2>
              <Input label="Grade Label" placeholder="e.g. A1" value={gradeForm.label} onChange={e => setGradeForm({ ...gradeForm, label: e.target.value })} required />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Min %" type="number" value={gradeForm.minPercent} onChange={e => setGradeForm({ ...gradeForm, minPercent: e.target.value })} required />
                <Input label="Max %" type="number" value={gradeForm.maxPercent} onChange={e => setGradeForm({ ...gradeForm, maxPercent: e.target.value })} required />
              </div>
              <Input label="Grade Points" type="number" placeholder="e.g. 10" value={gradeForm.points} onChange={e => setGradeForm({ ...gradeForm, points: e.target.value })} />

              <div className="flex gap-4 pt-4">
                <Button variant="outline" type="button" className="flex-1 py-6 rounded-2xl" onClick={() => { setIsGradeModalOpen(false); setEditingGrade(null); }}>Cancel</Button>
                <Button type="submit" className="flex-1 py-6 rounded-2xl font-black">Save Scale</Button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
      />

      {/* SCHEDULE EXAM MODAL */}
      <AnimatePresence>
        {isScheduleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsScheduleModalOpen(false)} />
            <motion.form
              onSubmit={handleUpsertSchedule}
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="relative w-full max-w-xl bg-card border border-white/10 p-10 rounded-[3rem] shadow-2xl space-y-6"
            >
              <h2 className="text-2xl font-black">{editingSchedule ? 'Edit Paper Schedule' : 'Schedule New Paper'}</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-[10px] uppercase font-black text-slate-500 ml-1 tracking-widest">Exam Term</label>
                  <select
                    title="Term" className="w-full h-14 bg-card border border-white/5 rounded-2xl px-5 text-sm font-bold text-foreground outline-none focus:border-primary/50 transition-all"
                    value={scheduleForm.examTermId} onChange={e => setScheduleForm({ ...scheduleForm, examTermId: e.target.value })} required
                  >
                    <option key="default-term-modal" value="">Select Term</option>
                    {terms.map((t, idx) => <option key={t.id || t._id || `term-mod-${idx}`} value={t.id || t._id}>{t.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-slate-500 ml-1 tracking-widest">Target Class</label>
                  <select
                    title="Class" className="w-full h-14 bg-card border border-white/5 rounded-2xl px-5 text-sm font-bold text-foreground outline-none focus:border-primary/50 transition-all"
                    value={scheduleForm.classId} onChange={e => setScheduleForm({ ...scheduleForm, classId: e.target.value })} required
                  >
                    <option key="default-class-modal" value="">Select Class</option>
                    {classes.map((c, idx) => <option key={c.id || c._id || `class-mod-${idx}`} value={c.id || c._id}>{c.displayName}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-slate-500 ml-1 tracking-widest">Subject</label>
                  <select
                    title="Subject" className="w-full h-14 bg-card border border-white/5 rounded-2xl px-5 text-sm font-bold text-foreground outline-none focus:border-primary/50 transition-all"
                    value={scheduleForm.subjectId} onChange={e => setScheduleForm({ ...scheduleForm, subjectId: e.target.value })} required
                  >
                    <option key="default-subject-modal" value="">Select Subject</option>
                    {subjects.map((s, idx) => <option key={s.id || s._id || `sub-mod-${idx}`} value={s.id || s._id}>{s.name} ({s.code})</option>)}
                  </select>
                </div>
                <Input label="Exam Date" type="date" value={scheduleForm.examDate} onChange={e => setScheduleForm({ ...scheduleForm, examDate: e.target.value })} required />
                <Input label="Start Time" placeholder="e.g. 10:00 AM" value={scheduleForm.startTime} onChange={e => setScheduleForm({ ...scheduleForm, startTime: e.target.value })} />
                <Input label="Max Marks" type="number" value={scheduleForm.maxMarks} onChange={e => setScheduleForm({ ...scheduleForm, maxMarks: e.target.value })} required />
                <Input label="Pass Marks" type="number" value={scheduleForm.passingMarks} onChange={e => setScheduleForm({ ...scheduleForm, passingMarks: e.target.value })} required />
              </div>
              <div className="flex gap-4 pt-4">
                <Button variant="outline" type="button" className="flex-1 py-6 rounded-2xl" onClick={() => { setIsScheduleModalOpen(false); setEditingSchedule(null); }}>Cancel</Button>
                <Button type="submit" className="flex-1 py-6 rounded-2xl font-black">{editingSchedule ? 'Save Changes' : 'Schedule'}</Button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
