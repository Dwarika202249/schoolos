import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  GraduationCap,
  Info,
  CreditCard,
  Building2,
  BadgeCheck,
  ShieldCheck,
  Clock,
  TrendingDown,
  CircleDollarSign,
  ChevronRight,
  AlertCircle,
  MapPin
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

type Tab = 'overview' | 'professional' | 'attendance' | 'payroll' | 'documents';

export const StaffProfileView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [staff, setStaff] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/staff/${id}`);
        setStaff(response.data.data);
      } catch (error) {
        toast.error('Failed to load staff profile');
        navigate('/staff');
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, [id, navigate]);

  const handleToggleStatus = async () => {
    try {
      const newStatus = !staff.isActive;
      await api.patch(`/staff/${id}/status`, { isActive: newStatus });
      setStaff((prev: any) => ({ ...prev, isActive: newStatus }));
      toast.success(`Account ${newStatus ? 'Activated' : 'Deactivated'}`);
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  if (loading || !staff) {
    return (
      <div className="p-10 space-y-8 animate-pulse">
        <div className="h-48 bg-white/5 rounded-[2.5rem]" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 h-96 bg-white/5 rounded-[2rem]" />
          <div className="lg:col-span-2 h-96 bg-white/5 rounded-[2rem]" />
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Info },
    { id: 'professional', label: 'Professional', icon: Briefcase },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'payroll', label: 'Payroll', icon: CircleDollarSign },
    { id: 'documents', label: 'Documents', icon: ShieldCheck },
  ];

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => navigate('/staff')}
          className="bg-card/40 backdrop-blur-md hover:bg-white/5 border-white/10 rounded-xl"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Directory
        </Button>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={handleToggleStatus}
            className={`rounded-xl border-white/10 ${staff.isActive ? 'text-rose-400 hover:bg-rose-500/10' : 'text-emerald-400 hover:bg-emerald-500/10'}`}
          >
            {staff.isActive ? 'Deactivate Account' : 'Activate Account'}
          </Button>
          <Button onClick={() => navigate(`/staff/edit/${id}`)} className="rounded-xl shadow-lg shadow-primary/20">
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Profile Header Hero */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-indigo-600/30 rounded-[2.5rem] opacity-50 blur-3xl group-hover:opacity-70 transition-opacity" />
        <Card className="relative overflow-hidden border-white/20 rounded-[2.5rem] bg-card/60 backdrop-blur-2xl p-8 lg:p-12 shadow-2xl shadow-black/60 hover:border-primary/40 transition-all duration-500">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 text-center md:text-left">
            <div className="relative">
              <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-[2.5rem] bg-white/5 border-4 border-white/20 shadow-2xl flex items-center justify-center overflow-hidden">
                {staff.userId?.avatarUrl ? (
                  <img src={staff.userId.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl font-black text-primary">{staff.userId?.firstName?.charAt(0)}</span>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 border-4 border-slate-900 rounded-2xl flex items-center justify-center shadow-lg">
                <BadgeCheck className="w-5 h-5 text-white" />
              </div>
            </div>

            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-center md:justify-start gap-4">
                <h1 className="text-4xl lg:text-5xl font-black text-foreground tracking-tight">
                  {staff.userId?.firstName} {staff.userId?.lastName}
                </h1>
                <span className={`px-4 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest ${staff.isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}>
                  {staff.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-slate-400 font-bold">
                <span className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-primary" /> {staff.designation.replace(/_/g, ' ')}</span>
                <span className="flex items-center gap-2"><Building2 className="w-4 h-4 text-primary" /> {staff.department || 'Central Academic'}</span>
                <span className="text-primary text-sm font-black uppercase tracking-widest bg-primary/10 px-4 py-1.5 rounded-2xl border border-primary/20 shadow-inner">ID: {staff.employeeId}</span>
              </div>
            </div>

            <div className="hidden lg:grid grid-cols-1 gap-3">
              <div className="px-6 py-4 rounded-[1.5rem] bg-white/5 border border-white/10 text-center min-w-[140px] shadow-inner">
                <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-1">Attendance</p>
                <p className="text-2xl font-black text-foreground">94.2%</p>
              </div>
              <div className="px-6 py-4 rounded-[1.5rem] bg-emerald-500/5 border border-emerald-500/20 text-center min-w-[140px] shadow-inner">
                <p className="text-[10px] uppercase font-black text-emerald-500/60 tracking-widest mb-1">Performance</p>
                <p className="text-2xl font-black text-emerald-400">4.8/5</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-white/5 backdrop-blur-md p-2 rounded-[2rem] gap-2 w-fit border border-white/5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === tab.id
                ? 'bg-primary text-white shadow-xl shadow-primary/20 translate-y-[-2px]'
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Bio / Basic Info */}
              <div className="lg:col-span-2 space-y-8">
                <Card className="p-8 rounded-[2.5rem] border-white/15 shadow-2xl shadow-black/60 bg-card/40 backdrop-blur-xl space-y-8 hover:border-primary/30 transition-all duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-2">
                      <p className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em]">Contact Email</p>
                      <div className="text-lg font-bold text-foreground flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20"><Mail className="w-5 h-5" /></div>
                        {staff.userId?.email}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em]">Emergency Phone</p>
                      <div className="text-lg font-bold text-foreground flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20"><Phone className="w-5 h-5" /></div>
                        {staff.emergencyContact?.phone || 'Not Logged'}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em]">Joining Date</p>
                      <div className="text-lg font-bold text-foreground flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20"><Calendar className="w-5 h-5" /></div>
                        {new Date(staff.joiningDate).toLocaleDateString(undefined, { dateStyle: 'long' })}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em]">System Role</p>
                      <div className="text-lg font-bold text-foreground flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20"><ShieldCheck className="w-5 h-5" /></div>
                        {staff.userId?.role}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Performance Analytics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card className="p-10 rounded-[2.5rem] bg-emerald-500/5 border border-emerald-500/20 shadow-xl shadow-black/40 space-y-6 hover:border-emerald-500/40 transition-all">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-emerald-500 uppercase text-[10px] tracking-[0.3em]">Teaching Load</h4>
                      <TrendingDown className="w-6 h-6 text-emerald-500/50" />
                    </div>
                    <p className="text-4xl font-black text-foreground tracking-tighter">22 hrs <span className="text-sm font-medium text-slate-500 tracking-normal">/ week</span></p>
                    <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden border border-white/10">
                      <div className="bg-emerald-500 h-full w-[80%] shadow-[0_0_20px_rgba(16,185,129,0.3)]" />
                    </div>
                  </Card>
                  <Card className="p-10 rounded-[2.5rem] bg-primary/5 border border-primary/20 shadow-xl shadow-black/40 space-y-6 hover:border-primary/40 transition-all">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-primary uppercase text-[10px] tracking-[0.3em]">Assigned Classes</h4>
                      <Layers className="w-6 h-6 text-primary/50" />
                    </div>
                    <p className="text-4xl font-black text-foreground tracking-tighter">06 <span className="text-sm font-medium text-slate-500 tracking-normal text-xs uppercase">Classrooms</span></p>
                    <div className="flex flex-wrap gap-2">
                      {['10A', '9B', '12C'].map(zone => (
                        <span key={zone} className="px-3 py-1.5 bg-white/5 text-primary text-[10px] font-black rounded-xl border border-primary/20 uppercase tracking-widest">{zone}</span>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>

              {/* Sidebar Modules */}
              <div className="space-y-8">
                <Card className="p-10 rounded-[3rem] bg-slate-900 border border-white/10 shadow-2xl relative overflow-hidden group hover:border-primary/40 transition-all duration-300">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full" />
                  <h3 className="font-black text-white text-xl uppercase tracking-tighter mb-8 italic">Bank Details</h3>
                  <div className="space-y-6 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-[1.2rem] bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Bank Name</p>
                        <p className="font-bold text-slate-200">{staff.bankDetails?.bankName || 'Not Set'}</p>
                      </div>
                    </div>

                    <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 space-y-3">
                      <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Account Number</p>
                      <p className="text-xl font-mono font-black tracking-[0.3em] text-foreground">
                        •••• •••• {staff.bankDetails?.accountNumber?.slice(-4) || '7721'}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        <span className="text-[9px] font-black text-emerald-500 tracking-[0.2em] uppercase">Verified Account</span>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-8 rounded-[2.5rem] bg-card/40 border-white/10 backdrop-blur-xl shadow-xl space-y-6 hover:border-rose-500/40 transition-all duration-300">
                  <h3 className="font-black text-foreground text-lg uppercase tracking-tight italic">Emergency Contact</h3>
                  <div className="p-6 bg-rose-500/5 rounded-[2rem] border border-rose-500/10 flex items-center gap-5">
                    <div className="w-14 h-14 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-rose-500/20">
                      <Phone className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-rose-500/70 tracking-[0.2em]">{staff.emergencyContact?.relation || 'Primary Guardian'}</p>
                      <p className="text-xl font-black text-foreground">{staff.emergencyContact?.name || 'Full Name'}</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'professional' && (
            <div className="space-y-8">
              <Card className="p-12 rounded-[3.5rem] border-white/5 shadow-2xl bg-card/40 backdrop-blur-xl">
                <div className="flex items-center gap-8 mb-12">
                  <div className="w-20 h-20 rounded-[2rem] bg-primary flex items-center justify-center text-white shadow-2xl shadow-primary/30">
                    <GraduationCap className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-foreground tracking-tight">Education & Skills</h3>
                    <p className="text-slate-500 font-medium text-lg">Detailed background and qualifications.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {staff.qualifications?.length > 0 ? staff.qualifications.map((q: any, i: number) => (
                    <div key={i} className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 group hover:border-primary/30 transition-all duration-500 hover:translate-y-[-4px]">
                      <div className="flex justify-between items-start mb-4">
                        <span className="px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black rounded-xl border border-primary/20 tracking-widest uppercase">{q.year}</span>
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                          <BadgeCheck className="w-5 h-5" />
                        </div>
                      </div>
                      <h4 className="text-2xl font-black text-foreground group-hover:text-primary transition-colors">{q.degree}</h4>
                      <p className="text-slate-500 font-bold uppercase text-xs tracking-widest mb-4 inline-block">{q.field}</p>
                      <p className="text-slate-400 font-medium flex items-center gap-2 pt-4 border-t border-white/5">
                        <MapPin className="w-4 h-4 text-primary" /> {q.institution}
                      </p>
                    </div>
                  )) : (
                    <div className="col-span-2 py-20 text-center bg-white/5 rounded-[3rem] border-2 border-dashed border-white/10">
                      <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-sm">No Intel Available</p>
                    </div>
                  )}
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="p-12 bg-slate-900 border border-white/5 text-white rounded-[3.5rem] shadow-2xl">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-8 italic">KYC Verification</h4>
                  <div className="space-y-6">
                    {[
                      { label: 'Aadhaar Card', value: staff.aadhaarNumber, mask: 'XXXX-XXXX-' },
                      { label: 'PAN Card', value: staff.panNumber, mask: '' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-8 bg-white/5 rounded-[2.5rem] border border-white/10 group hover:border-primary/30 transition-all">
                        <div className="flex items-center gap-6">
                          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-emerald-500 shadow-inner group-hover:scale-110 transition-transform">
                            <ShieldCheck className="w-7 h-7" />
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-slate-500 tracking-[0.2em] uppercase mb-1">{item.label}</p>
                            <p className="text-xl font-bold font-mono tracking-widest text-slate-200">
                              {item.mask}{item.value?.slice(item.mask ? -4 : 0) || 'Not Linked'}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-black p-2 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20 shadow-sm">VERIFIED</span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-12 bg-card/40 border-white/5 backdrop-blur-xl rounded-[3.5rem] shadow-2xl flex flex-col justify-center items-center text-center space-y-6">
                  <div className="w-24 h-24 bg-primary rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-primary/40 relative">
                    <Clock className="w-12 h-12" />
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-slate-900 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-3xl font-black text-foreground tracking-tighter">Joined On</h4>
                    <p className="text-slate-500 text-lg font-medium mt-1">{new Date(staff.joiningDate).getFullYear()} • {staff.employmentType.replace(/_/g, ' ')}</p>
                  </div>
                  <div className="pt-8 space-y-3 w-full max-w-sm">
                    <div className="flex items-center justify-between text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">
                      <span>Experience</span>
                      <span className="text-emerald-500">Gold Tier</span>
                    </div>
                    <div className="w-full bg-white/5 h-4 rounded-full border border-white/5 p-1">
                      <div className="bg-gradient-to-r from-primary to-indigo-500 h-full w-full rounded-full shadow-[0_0_15px_rgba(var(--primary),0.4)]" />
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="p-10 rounded-[3rem] bg-card/40 border-white/5 backdrop-blur-xl shadow-xl text-center space-y-3 py-16 group hover:translate-y-[-4px] transition-all">
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">Active Ops-Cycle</p>
                  <p className="text-6xl font-black text-foreground group-hover:text-primary transition-colors">22</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" /> Current Deployment
                  </p>
                </Card>
                <Card className="p-10 rounded-[3rem] bg-emerald-500 text-white shadow-2xl shadow-emerald-500/20 text-center space-y-3 py-16 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full" />
                  <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase text-emerald-200 tracking-[0.3em] opacity-80">Cycle Present</p>
                    <p className="text-6xl font-black tracking-tighter">20</p>
                    <p className="text-[10px] font-black text-emerald-100 uppercase tracking-[0.2em] mt-2 italic">92.4% Reliability</p>
                  </div>
                </Card>
                <Card className="p-10 rounded-[3rem] bg-card/40 border-white/5 backdrop-blur-xl shadow-xl text-center space-y-3 py-16 group hover:translate-y-[-4px] transition-all">
                  <p className="text-[10px] font-black uppercase text-rose-500/70 tracking-[0.3em]">System Downtime</p>
                  <p className="text-6xl font-black text-rose-500 group-hover:scale-110 transition-transform">02</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Sanctioned Leaves</p>
                </Card>
              </div>
              <Card className="p-20 rounded-[4rem] border-white/5 shadow-2xl bg-card/40 backdrop-blur-xl min-h-[500px] flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/2 opacity-20 pointer-events-none" />
                <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center mb-10 border border-white/5 relative shadow-inner">
                  <Calendar className="w-14 h-14 text-slate-700" />
                  <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin opacity-30" />
                </div>
                <h3 className="text-3xl font-black text-foreground mb-4 uppercase tracking-tighter italic">Registry synchronization</h3>
                <p className="text-slate-500 font-medium text-lg max-w-md text-center">We're calibrating the biometric intelligence grid. Historical logs are currently in high-security encryption.</p>
                <div className="mt-10 flex gap-4">
                  <div className="h-1 w-12 bg-primary rounded-full" />
                  <div className="h-1 w-12 bg-white/10 rounded-full" />
                  <div className="h-1 w-12 bg-white/10 rounded-full" />
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'payroll' && (
            <div className="space-y-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <Card className="p-12 rounded-[3.5rem] bg-slate-900 border border-white/5 text-white relative overflow-hidden group shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]">
                  <div className="relative z-10 space-y-12">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3">Allocated Resources</p>
                        <p className="text-6xl lg:text-7xl font-black text-primary flex items-baseline gap-2 tracking-tighter">
                          <span className="text-3xl font-black opacity-30 italic">₹</span>
                          42,500
                        </p>
                        <p className="text-xs text-slate-500 font-bold tracking-[0.1em] mt-2 italic uppercase">Net distribution per cycle</p>
                      </div>
                      <div className="w-20 h-20 rounded-[2rem] bg-white/5 flex items-center justify-center text-primary border border-white/10">
                        <CircleDollarSign className="w-10 h-10" />
                      </div>
                    </div>
                    <div className="flex gap-12 pt-8 border-t border-white/5">
                      <div>
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.5em] mb-2">Last Dispatch</p>
                        <p className="text-lg font-black text-slate-200 italic tracking-tight">02 Apr, 2026</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.5em] mb-2">Registry</p>
                        <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-black rounded-xl border border-emerald-500/20 uppercase tracking-[0.2em] shadow-sm">VERIFIED</span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute right-[-15%] top-[-15%] w-80 h-80 bg-primary/10 blur-[100px] rounded-full group-hover:bg-primary/20 transition-all duration-1000" />
                </Card>

                <Card className="p-12 rounded-[3.5rem] bg-card/40 border-white/5 backdrop-blur-xl shadow-2xl space-y-8 flex flex-col justify-center">
                  <h4 className="font-black text-2xl text-foreground tracking-tighter italic uppercase border-b border-white/5 pb-6">Treasury Breakdown</h4>
                  <div className="space-y-4">
                    {[
                      { label: 'Basic Provision', value: '35,000', positive: true, icon: TrendingDown },
                      { label: 'Intelligence Allowance', value: '10,500', positive: true, icon: BadgeCheck },
                      { label: 'Infrastructure Deductions', value: '3,000', positive: false, icon: AlertCircle },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center p-8 bg-white/5 rounded-[2.5rem] border border-white/5 group hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-4">
                          <item.icon className={`w-5 h-5 ${item.positive ? 'text-primary' : 'text-rose-500'}`} />
                          <span className="text-sm font-black text-slate-400 tracking-widest uppercase">{item.label}</span>
                        </div>
                        <span className={`text-xl font-black ${item.positive ? 'text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)]'}`}>
                          {item.positive ? '+' : '-'} ₹{item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <Card className="p-12 rounded-[4rem] border-white/5 shadow-2xl bg-card/40 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-12">
                  <h4 className="font-black text-3xl text-foreground tracking-tight uppercase italic">Ledger Timeline</h4>
                  <Button variant="outline" size="sm" className="rounded-2xl bg-white/5 text-[10px] font-black px-8 py-6 border-white/10 tracking-[0.2em] hover:bg-primary hover:text-white transition-all">EXPORT REGISTRY</Button>
                </div>
                <div className="space-y-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex flex-wrap items-center justify-between p-8 hover:bg-white/10 rounded-[3rem] transition-all border border-transparent hover:border-white/5 group cursor-pointer shadow-sm">
                      <div className="flex items-center gap-8">
                        <div className="w-16 h-16 bg-primary rounded-[1.5rem] flex items-center justify-center text-white font-black uppercase text-[12px] group-hover:scale-110 transition-transform shadow-xl shadow-primary/20">
                          LEDX
                        </div>
                        <div>
                          <p className="text-2xl font-black text-foreground group-hover:text-primary transition-colors tracking-tight">Dispatch Slip • March 2026</p>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em] mt-1 italic">Verified on 02 Apr 2026</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-12">
                        <p className="font-black text-foreground text-3xl italic tracking-tighter">₹42,500</p>
                        <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-primary hover:text-white transition-all text-slate-400 group-hover:shadow-xl group-hover:shadow-primary/20 shadow-inner">
                          <ChevronRight className="w-8 h-8" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {[
                { name: 'Identity Registry', count: 2, icon: ShieldCheck, color: 'emerald' },
                { name: 'Intel Qualifications', count: 3, icon: GraduationCap, color: 'primary' },
                { name: 'Service Contract', count: 1, icon: Briefcase, color: 'indigo' },
                { name: 'Clearance Certificates', count: 0, icon: AlertCircle, color: 'rose' },
              ].map((doc, i) => (
                <Card key={i} className="p-10 rounded-[3.5rem] bg-card/40 backdrop-blur-xl border-white/5 shadow-2xl hover:translate-y-[-8px] transition-all duration-500 group cursor-pointer relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-3xl rounded-full group-hover:bg-primary/10 transition-all" />
                  <div className={`w-16 h-16 rounded-[1.5rem] bg-${doc.color === 'primary' ? 'primary' : doc.color + '-500'}/10 flex items-center justify-center mb-8 text-${doc.color === 'primary' ? 'primary' : doc.color + '-500'} group-hover:scale-110 transition-transform shadow-inner`}>
                    <doc.icon className="w-8 h-8" />
                  </div>
                  <h4 className="text-2xl font-black text-foreground italic uppercase tracking-tighter">{doc.name}</h4>
                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/5">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic">{doc.count} Files Encrypted</span>
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all text-slate-600 shadow-sm">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </Card>
              ))}
              <Card className="p-10 rounded-[3.5rem] border-2 border-dashed border-white/10 bg-transparent flex flex-col items-center justify-center text-center space-y-6 hover:bg-white/5 transition-all duration-500 group cursor-pointer">
                <div className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(var(--primary),0.1)]">
                  <Plus className="w-8 h-8" />
                </div>
                <p className="text-xs font-black text-slate-500 uppercase tracking-[0.4em]">Initialize Upload</p>
              </Card>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const Plus = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

const Layers = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);
