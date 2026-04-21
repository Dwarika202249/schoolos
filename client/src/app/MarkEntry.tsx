import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  User,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Info,
  History,
  FileText
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import toast from 'react-hot-toast';

export const MarkEntry = () => {
  const { scheduleId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [canEdit, setCanEdit] = useState(true);

  const [schedule, setSchedule] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [marksData, setMarksData] = useState<Record<string, { obtainedMarks: string; status: string; remarks: string }>>({});

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/tenant/exams/marking-sheet/${scheduleId}`);
      const { schedule, students, existingMarks, canEdit: editPermission } = res.data.data;

      setSchedule(schedule);
      setStudents(students);
      setCanEdit(editPermission ?? true);

      // Initialize marks mapping
      const mapping: any = {};

      // Seed with existing marks if any
      existingMarks.forEach((m: any) => {
        mapping[m.studentId] = {
          obtainedMarks: m.obtainedMarks.toString(),
          status: m.status,
          remarks: m.remarks || ''
        };
      });

      // Fill remaining with defaults
      students.forEach((s: any) => {
        const id = s.id || s._id;
        if (!mapping[id]) {
          mapping[id] = { obtainedMarks: '', status: 'PRESENT', remarks: '' };
        }
      });

      setMarksData(mapping);
    } catch (error) {
      toast.error('Failed to load marking sheet');
      navigate('/exams');
    } finally {
      setLoading(false);
    }
  }, [scheduleId, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateRecord = (studentId: string, field: string, value: string) => {
    setMarksData(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Format data for backend
      const records = Object.entries(marksData).map(([studentId, data]) => ({
        studentId,
        obtainedMarks: data.status === 'PRESENT' ? parseFloat(data.obtainedMarks || '0') : 0,
        status: data.status,
        remarks: data.remarks
      }));

      // Validation
      const invalid = records.find(r => r.status === 'PRESENT' && r.obtainedMarks > schedule.maxMarks);
      if (invalid) {
        toast.error(`Marks cannot exceed ${schedule.maxMarks}`);
        setSaving(false);
        return;
      }

      await api.post('/tenant/exams/bulk-update-marks', {
        examScheduleId: scheduleId,
        records
      });

      toast.success('Marks saved successfully!');
      navigate('/exams');
    } catch {
      toast.error('Failed to save marks');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      <p className="font-bold text-slate-500 animate-pulse">Loading Result Sheet...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 animate-in fade-in duration-1000">

      {/* Navigation Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-5">
          <button
            title='Back'
            onClick={() => navigate('/exams')}
            className="p-4 rounded-2xl bg-card border border-white/5 hover:border-white/10 transition-all text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full w-fit mb-2">
              Term Assessment
            </div>
            <h1 className="text-3xl font-black">{schedule?.subjectId?.name || 'Mark Sheet'}</h1>
            <p className="text-sm font-medium text-slate-500">Entering results for all students in the class.</p>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="hidden lg:flex items-center gap-3 px-6 py-4 bg-white/5 border border-white/5 rounded-2xl">
            <Info className="w-5 h-5 text-amber-500" />
            <div className="text-xs">
              <p className="font-black text-slate-300 uppercase tracking-tight">Max Marks: {schedule?.maxMarks}</p>
              <p className="font-bold text-slate-500">Passing: {schedule?.passingMarks}</p>
            </div>
          </div>
          {canEdit ? (
            <Button
                onClick={handleSave}
                isLoading={saving}
                className="flex-1 md:flex-none px-10 py-6 rounded-2xl bg-emerald-500 hover:bg-emerald-600 shadow-xl shadow-emerald-500/10 font-black text-lg gap-3"
            >
                <Save className="w-5 h-5" /> Save Result
            </Button>
          ) : (
            <div className="px-6 py-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-3 text-amber-500 font-bold">
               <AlertCircle className="w-5 h-5" />
               View Only Access
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* Main Entry Sheet */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="bg-card/40 backdrop-blur-xl border-white/10 rounded-[3rem] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/5 border-b border-white/5">
                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest">Roll / Name</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest">Attendance</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest">Obtained Marks</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest">Remarks (Optional)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {students.map(student => {
                    const id = student.id || student._id;
                    const markData = marksData[id] || { obtainedMarks: '', status: 'PRESENT', remarks: '' };

                    return (
                      <tr key={id} className="group hover:bg-white/[0.02] transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-black text-xs text-slate-500 border border-white/5">
                              {student.admissionNumber?.slice(-2)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-200">{student.userId?.firstName} {student.userId?.lastName}</p>
                              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{student.admissionNumber}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <select
                            title="Status"
                            disabled={!canEdit}
                            className={`bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-xs font-black outline-none transition-all ${markData.status === 'PRESENT' ? 'text-emerald-500' : 'text-rose-500'} disabled:opacity-50`}
                            value={markData.status}
                            onChange={e => handleUpdateRecord(id, 'status', e.target.value)}
                          >
                            <option value="PRESENT">Present</option>
                            <option value="ABSENT">Absent</option>
                            <option value="EXCUSED">Excused</option>
                          </select>
                        </td>
                        <td className="px-8 py-6">
                          <div className="relative group">
                            <input
                              type="number"
                              placeholder="00"
                              disabled={!canEdit || markData.status !== 'PRESENT'}
                              className={`w-28 bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-center font-black text-xl outline-none focus:border-primary/50 transition-all ${parseFloat(markData.obtainedMarks) > schedule?.maxMarks ? 'border-rose-500/50 text-rose-500' : 'text-primary'} disabled:opacity-30 disabled:cursor-not-allowed`}
                              value={markData.obtainedMarks}
                              onChange={e => handleUpdateRecord(id, 'obtainedMarks', e.target.value)}
                            />
                            <span className="absolute -right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-600 uppercase">/{schedule?.maxMarks}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <input
                            type="text"
                            placeholder="Good / Needs Improvement..."
                            disabled={!canEdit}
                            className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:border-primary/50 transition-all disabled:opacity-50"
                            value={markData.remarks}
                            onChange={e => handleUpdateRecord(id, 'remarks', e.target.value)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <div className="p-8 rounded-[2.5rem] bg-emerald-500/5 border border-emerald-500/10 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <p className="text-sm font-black text-emerald-500 uppercase tracking-widest mb-2">Grading Ready</p>
            <p className="text-xs font-medium text-slate-500 leading-relaxed">
              Marks will be automatically converted to Letter Grades (A1, A2, etc.) based on the percentage achieved.
            </p>
          </div>

          <div className="p-8 rounded-[2.5rem] bg-card border border-white/5 space-y-6">
            <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">Class Statistics</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center px-4 py-3 bg-white/5 rounded-2xl border border-white/5">
                <span className="text-xs font-bold text-slate-500">Enrolled Students</span>
                <span className="text-sm font-black">{students.length}</span>
              </div>
              <div className="flex justify-between items-center px-4 py-3 bg-white/5 rounded-2xl border border-white/5">
                <span className="text-xs font-bold text-slate-500">Marks Entered</span>
                <span className="text-sm font-black text-primary">
                  {Object.values(marksData).filter(m => m.obtainedMarks !== '').length} / {students.length}
                </span>
              </div>
              <div className="flex justify-between items-center px-4 py-3 bg-white/5 rounded-2xl border border-white/5">
                <span className="text-xs font-bold text-slate-500">Absentees</span>
                <span className="text-sm font-black text-rose-500">
                  {Object.values(marksData).filter(m => m.status === 'ABSENT').length}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
