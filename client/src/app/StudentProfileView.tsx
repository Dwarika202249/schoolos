import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  Calendar,
  GraduationCap,
  Info,
  CreditCard,
  Building2,
  AlertTriangle,
  Clock,
  TrendingDown,
  CircleDollarSign,
  ChevronRight,
  ShieldCheck,
  MapPin,
  Users,
  Activity,
  CheckCircle2,
  XCircle,
  FileBarChart
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

type Tab = 'overview' | 'academic' | 'attendance' | 'financial' | 'guardians';

export const StudentProfileView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/students/${id}`);
        setStudent(response.data.data);
      } catch (error) {
        toast.error('Failed to load intelligence profile.');
        navigate('/students');
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [id, navigate]);

  const handleToggleStatus = async () => {
    try {
      const newStatus = student.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await api.patch(`/students/${id}`, { status: newStatus });
      setStudent((prev: any) => ({ ...prev, status: newStatus }));
      toast.success(`Identity core status shifted to ${newStatus}`);
    } catch (error) {
      toast.error('Command failed.');
    }
  };

  const handleResendActivation = async () => {
    try {
        const promise = api.post(`/students/${id}/resend-activation`);
        toast.promise(promise, {
            loading: 'Generating zero-trust token...',
            success: 'Magic link dispatched successfully.',
            error: 'Failed to queue dispatcher.'
        });
    } catch {}
  };

  if (loading || !student) {
    return (
      <div className="p-10 space-y-8 animate-pulse max-w-[1400px] mx-auto">
        <div className="h-48 bg-white/5 rounded-[3rem]" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 h-96 bg-white/5 rounded-[2.5rem]" />
          <div className="lg:col-span-3 h-96 bg-white/5 rounded-[2.5rem]" />
        </div>
      </div>
    );
  }

  const user = student.userId || {};
  const isMale = student.gender === 'MALE';
  const primaryGuardian = student.guardians?.find((g: any) => g.isEmergencyContact) || student.guardians?.[0];

  const tabs = [
    { id: 'overview', label: 'Identity Overview', icon: Info },
    { id: 'academic', label: 'Academic Radar', icon: GraduationCap },
    { id: 'attendance', label: 'Chronos (Attendance)', icon: Clock },
    { id: 'financial', label: 'Financial Matrix', icon: CircleDollarSign },
    { id: 'guardians', label: 'Guardian Intel', icon: ShieldCheck },
  ];

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-[1500px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Top Protocol Bar */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => navigate('/students')}
          className="bg-card/40 backdrop-blur-md hover:bg-white/5 border-white/10 rounded-2xl h-12 px-6 shadow-xl text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Roster
        </Button>
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            onClick={handleResendActivation}
            className="rounded-2xl border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white h-12 px-6 font-black text-xs uppercase tracking-widest transition-all shadow-xl"
            title="Dispatch zero-trust magic link to assigned emails"
          >
            <Mail className="w-4 h-4 mr-2" />
            Ping Activation
          </Button>
          <Button 
            variant="outline" 
            onClick={handleToggleStatus}
            className={`rounded-2xl border-white/10 h-12 px-6 font-black text-xs uppercase tracking-widest transition-all shadow-xl hover:text-white ${
              student.status === 'ACTIVE' 
                ? 'hover:bg-rose-500 hover:border-rose-500 text-rose-400' 
                : 'hover:bg-emerald-500 hover:border-emerald-500 text-emerald-400'
            }`}
          >
            {student.status === 'ACTIVE' ? <XCircle className="w-4 h-4 mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
            {student.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
          </Button>
          <Link to={`/students/edit/${student._id || id}`}>
             <Button className="rounded-2xl h-12 px-8 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20">
               <Edit className="w-4 h-4 mr-2" />
               Modify Core
             </Button>
          </Link>
        </div>
      </div>

      {/* Hero Module */}
      <Card className="p-8 border-white/20 shadow-2xl shadow-black/60 bg-card/40 backdrop-blur-xl rounded-[3rem] relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[100px] rounded-full group-hover:scale-150 transition-all duration-1000" />
        
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start justify-between">
          <div className="flex flex-col md:flex-row items-center md:items-center gap-8">
             <div className="w-32 h-32 rounded-full border-4 border-white/10 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-black text-5xl shadow-[0_0_30px_rgba(var(--primary),0.3)] shrink-0 overflow-hidden relative">
               {user?.avatarUrl ? (
                 <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
               ) : (
                 <span className="relative z-10">{user?.firstName?.charAt(0) || 'U'}</span>
               )}
               <div className="absolute inset-0 bg-primary/10 animate-pulse" />
             </div>
             
             <div className="text-center md:text-left space-y-2">
                 <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                    <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border shadow-inner ${student.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/10' : 'bg-slate-800 text-slate-400 border-white/10'}`}>
                        {student.status}
                    </span>
                    <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-md text-[10px] font-black uppercase tracking-widest text-primary shadow-inner">
                        ID: {student.admissionNumber}
                    </span>
                 </div>
                 <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight drop-shadow-sm group-hover:text-primary transition-colors">
                    {user?.firstName} {user?.lastName}
                 </h1>
                 <p className="text-sm font-bold text-slate-400 uppercase tracking-widest pt-1 flex items-center justify-center md:justify-start gap-2">
                    <Building2 className="w-4 h-4" /> {student.branchId?.name || 'Unassigned Facility'}
                 </p>
             </div>
          </div>

          {/* Quick HUD */}
          <div className="grid grid-cols-2 gap-4 w-full md:w-auto mt-6 md:mt-0">
             <div className="p-4 bg-white/5 border border-white/10 rounded-2xl border-l-rose-500 border-l-2">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Financial Standing</p>
                 <p className="text-lg font-black text-rose-500 tracking-tight mt-1">Defaulter</p>
                 <p className="text-[10px] font-bold text-slate-400 italic mt-0.5">₹8,400 Pending</p>
             </div>
             <div className="p-4 bg-white/5 border border-white/10 rounded-2xl border-l-emerald-500 border-l-2">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Attendance Index</p>
                 <p className="text-lg font-black text-emerald-500 tracking-tight mt-1">94.2%</p>
                 <p className="text-[10px] font-bold text-slate-400 italic mt-0.5">Optimal</p>
             </div>
             <div className="p-4 bg-white/5 border border-white/10 rounded-2xl border-l-primary border-l-2 col-span-2">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Assigned Sector</p>
                 <p className="flex items-center gap-2 text-lg font-black text-slate-200 mt-1">
                    {student.classId?.displayName || 'Unassigned'} 
                    <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">Roll: {student.rollNumber || 'N/A'}</span>
                 </p>
             </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Nav */}
        <div className="lg:col-span-1 space-y-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`w-full flex items-center gap-4 px-6 py-5 rounded-[1.5rem] transition-all font-black text-xs uppercase tracking-widest ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-100'
                  : 'bg-card/40 backdrop-blur-md border border-white/5 text-slate-400 hover:bg-white/10 hover:text-white scale-95 hover:scale-100'
              }`}
            >
              <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'animate-pulse' : ''}`} />
              {tab.label}
              {activeTab === tab.id && <ChevronRight className="w-4 h-4 ml-auto" />}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              
              {/* TAB: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                   <Card className="p-8 border-white/20 shadow-2xl shadow-black/40 bg-card/40 backdrop-blur-xl rounded-[2.5rem]">
                      <h3 className="text-lg font-black text-foreground uppercase tracking-widest border-b border-white/10 pb-4 mb-6 flex items-center gap-3">
                         <Info className="w-5 h-5 text-primary" /> Core Bio-Metrics
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                         <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date of Birth</p>
                            <p className="text-sm font-black text-slate-200 mt-1">
                                {new Date(student.dateOfBirth).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                         </div>
                         <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Gender</p>
                            <p className="text-sm font-black text-slate-200 mt-1 capitalize">{student.gender.toLowerCase()}</p>
                         </div>
                         <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Blood Type</p>
                            <p className="text-sm font-black text-rose-400 mt-1">{student.bloodGroup}</p>
                         </div>
                         <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nationality</p>
                            <p className="text-sm font-black text-slate-200 mt-1">{student.nationality}</p>
                         </div>
                      </div>
                   </Card>

                   <Card className="p-8 border-white/20 shadow-2xl shadow-black/40 bg-slate-900 rounded-[2.5rem]">
                      <h3 className="text-lg font-black text-foreground uppercase tracking-widest border-b border-white/10 pb-4 mb-6 flex items-center gap-3">
                         <MapPin className="w-5 h-5 text-emerald-500" /> Geographical Vector
                      </h3>
                      <div className="grid grid-cols-1 gap-6">
                         <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2 mb-2">Current Coordinates</p>
                             <p className="text-sm font-bold text-slate-300 leading-relaxed">
                                {student.currentAddress?.line1}<br/>
                                {student.currentAddress?.city}, {student.currentAddress?.state} - {student.currentAddress?.pincode}
                             </p>
                         </div>
                         {student.permanentAddress?.line1 && (
                            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2 mb-2">Permanent Coordinates</p>
                                <p className="text-sm font-bold text-slate-300 leading-relaxed">
                                    {student.permanentAddress.line1}<br/>
                                    {student.permanentAddress.city}, {student.permanentAddress.state} - {student.permanentAddress.pincode}
                                </p>
                            </div>
                         )}
                      </div>
                   </Card>
                </div>
              )}

              {/* TAB: ACADEMIC MOCK */}
              {activeTab === 'academic' && (
                 <div className="space-y-6">
                    <Card className="p-12 border-dashed border-2 border-white/10 shadow-2xl shadow-black/40 bg-card/20 rounded-[3rem] text-center relative overflow-hidden group">
                       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.05]" />
                       <FileBarChart className="w-16 h-16 text-primary/50 mx-auto mb-6 group-hover:scale-110 transition-transform" />
                       <h2 className="text-2xl font-black text-foreground uppercase tracking-widest italic drop-shadow-md">Academic Radar Standby</h2>
                       <p className="text-slate-400 font-medium max-w-lg mx-auto mt-4 leading-relaxed">
                           Waiting for Grading & Subject synchronization module to initiate. Historical exam scores, assignments, and neural progress reports will route here.
                       </p>
                       <div className="mt-8 flex gap-3 justify-center">
                          <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                          <div className="w-3 h-3 bg-white/10 rounded-full" />
                          <div className="w-3 h-3 bg-white/10 rounded-full" />
                       </div>
                    </Card>
                 </div>
              )}

              {/* TAB: ATTENDANCE MOCK */}
              {activeTab === 'attendance' && (
                 <div className="space-y-6">
                    <Card className="p-8 border-emerald-500/20 shadow-2xl shadow-black/40 bg-emerald-500/5 rounded-[3rem] text-center relative">
                       <Activity className="w-16 h-16 text-emerald-500/50 mx-auto mb-6" />
                       <h2 className="text-2xl font-black text-emerald-400 uppercase tracking-widest italic drop-shadow-md">Chronos Tracker Online</h2>
                       <p className="text-emerald-500/80 font-medium max-w-lg mx-auto mt-4 leading-relaxed">
                           Overall aggregate indicates optimal presence. Connecting to bio-metric/RFID gateway for daily visual maps.
                       </p>
                       
                       {/* Mock Grid */}
                       <div className="mt-10 max-w-xl mx-auto bg-black/40 p-6 rounded-3xl border border-white/5">
                           <div className="flex gap-2 justify-center flex-wrap">
                               {[...Array(30)].map((_, i) => (
                                  <div 
                                      key={i} 
                                      className={`w-6 h-6 rounded-md ${
                                          i === 14 || i === 22 
                                              ? 'bg-rose-500/20 border border-rose-500/50' 
                                              : (i > 25 && i < 28) ? 'bg-amber-500/20 border border-amber-500/50' : 'bg-emerald-500/20 border border-emerald-500/50'
                                      }`}
                                  />
                               ))}
                           </div>
                           <div className="flex justify-between items-center mt-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">
                               <span>Start of Cycle</span>
                               <span>Present Day</span>
                           </div>
                       </div>
                    </Card>
                 </div>
              )}

              {/* TAB: FINANCIAL MOCK */}
              {activeTab === 'financial' && (
                  <div className="space-y-6">
                     <Card className="p-8 border-rose-500/20 shadow-2xl shadow-black/40 bg-rose-500/5 rounded-[3rem] text-center relative">
                        <AlertTriangle className="w-16 h-16 text-rose-500/50 mx-auto mb-6" />
                        <h2 className="text-2xl font-black text-rose-400 uppercase tracking-widest italic drop-shadow-md">Active Defaulter Flag</h2>
                        <p className="text-rose-500/80 font-medium max-w-lg mx-auto mt-4 leading-relaxed">
                            Finance sector reports pending invoices. Linking to Fee Management API...
                        </p>
                        <div className="mt-8 bg-black/40 rounded-3xl p-6 border border-white/5 text-left max-w-2xl mx-auto">
                            <div className="flex justify-between items-center border-b border-rose-500/20 pb-4 mb-4">
                                <div>
                                   <p className="font-black text-slate-300">Term 2 Tuition Fee</p>
                                   <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-1">Due: 15 Days Ago</p>
                                </div>
                                <span className="text-2xl font-black text-rose-500 flex items-center">
                                    <span className="text-sm mr-1">₹</span>8,400
                                </span>
                            </div>
                            <Button className="w-full bg-rose-500 hover:bg-rose-600 text-white font-black uppercase tracking-widest h-12">
                                Request Immediate Settlement
                            </Button>
                        </div>
                     </Card>
                  </div>
              )}

              {/* TAB: GUARDIANS */}
              {activeTab === 'guardians' && (
                <div className="space-y-6">
                   {student.guardians?.map((guardian: any, idx: number) => (
                       <Card key={idx} className="p-8 border-white/20 shadow-2xl shadow-black/40 bg-card/40 backdrop-blur-xl rounded-[2.5rem] relative overflow-hidden group">
                           {guardian.isEmergencyContact && (
                               <div className="absolute top-0 right-0 px-6 py-2 bg-rose-500/20 border-b border-l border-rose-500/30 rounded-bl-[2rem] text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2">
                                   <AlertTriangle className="w-3 h-3" /> Priority Primary
                               </div>
                           )}
                           <div className="flex items-center gap-6">
                               <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 shadow-inner group-hover:scale-110 transition-transform">
                                   <Users className="w-8 h-8" />
                               </div>
                               <div>
                                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{guardian.relationship}</p>
                                   <h3 className="text-2xl font-black text-foreground tracking-tight">{guardian.name}</h3>
                               </div>
                           </div>
                           
                           <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                               <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                                   <Phone className="w-5 h-5 text-slate-400" />
                                   <span className="font-bold text-slate-300">{guardian.phone}</span>
                               </div>
                               {guardian.email && (
                                   <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                                      <Mail className="w-5 h-5 text-slate-400" />
                                      <span className="font-bold text-slate-300">{guardian.email}</span>
                                   </div>
                               )}
                           </div>
                           
                           {guardian.userId && (
                               <div className="mt-6 pt-6 border-t border-white/10 flex items-center gap-3 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                                   <ShieldCheck className="w-4 h-4" /> Authenticated Zero-Trust Portal Linked
                               </div>
                           )}
                       </Card>
                   ))}
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
