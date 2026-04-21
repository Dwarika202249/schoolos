import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CalendarDays, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Save, 
  Search,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';
import { Card } from '../components/ui/Card';

export const StaffAttendancePage = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSheet();
  }, [date]);

  const fetchSheet = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tenant/staff-attendance/sheet', { params: { date } });
      const { staff, attendance } = res.data.data;
      
      setStaffList(staff);
      
      // Map existing records
      const map: any = {};
      staff.forEach((s: any) => {
        const userId = s.userId?._id || s.userId;
        const existing = attendance.find((a: any) => a.userId === userId);
        map[userId] = existing || { status: 'PRESENT', note: '' };
      });
      setAttendanceMap(map);
    } catch (err) {
      toast.error('Failed to load staff list');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (userId: string, status: string) => {
    setAttendanceMap((prev: any) => ({
      ...prev,
      [userId]: { ...prev[userId], status }
    }));
  };

  const saveOne = async (userId: string) => {
    const record = attendanceMap[userId];
    try {
      setSaving(true);
      await api.post('/tenant/staff-attendance/mark', {
        userId,
        date,
        status: record.status,
        note: record.note,
        branchId: staffList.find(s => s.userId?._id === userId || s.userId === userId)?.branchId
      });
      toast.success('Saved');
    } catch (err) {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-32 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-foreground">Staff Attendance</h1>
          <p className="text-slate-500 font-medium">Record daily presence for all school employees.</p>
        </div>
        <div className="flex gap-4">
           <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">Select Date</label>
              <input 
                title="Attendance Date"
                type="date" 
                value={date} 
                onChange={e => setDate(e.target.value)}
                className="h-12 bg-card border border-white/5 rounded-xl px-4 text-sm font-bold outline-none focus:border-primary/50"
              />
           </div>
        </div>
      </div>

      <div className="bg-card border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
        {loading && <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 animate-pulse" />}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 border-b border-white/5">
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest">Employee</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest">Role</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {staffList.map((s) => {
                const uid = s.userId?._id || s.userId;
                const status = attendanceMap[uid]?.status || 'PRESENT';
                return (
                  <tr key={uid} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center font-black text-primary">
                           {s.userId?.firstName?.charAt(0)}
                        </div>
                        <div>
                           <p className="font-bold text-foreground">{s.userId?.firstName} {s.userId?.lastName}</p>
                           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{s.employeeId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                       <span className="text-xs font-bold text-slate-400 capitalize">{s.designation?.toLowerCase().replace(/_/g, ' ')}</span>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex justify-center gap-2">
                          {[
                            { id: 'PRESENT', label: 'P', color: 'bg-emerald-500' },
                            { id: 'ABSENT', label: 'A', color: 'bg-rose-500' },
                            { id: 'ON_LEAVE', label: 'L', color: 'bg-amber-500' }
                          ].map(btn => (
                            <button
                              key={btn.id}
                              onClick={() => handleStatusChange(uid, btn.id)}
                              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${status === btn.id ? `${btn.color} text-white shadow-lg` : 'bg-white/5 text-slate-500 hover:text-slate-300'}`}
                            >
                               <span className="text-[10px] font-black">{btn.label}</span>
                            </button>
                          ))}
                       </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                       <Button 
                         variant="outline" 
                         size="sm" 
                         onClick={() => saveOne(uid)}
                         className="rounded-xl h-10 px-4 border-white/10 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest"
                       >
                          Update
                       </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
