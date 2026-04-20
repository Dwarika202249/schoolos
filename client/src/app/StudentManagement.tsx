import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Filter,
    Users,
    CircleDollarSign,
    AlertTriangle,
    ArrowUpRight,
    TrendingDown,
    MoreVertical,
    GraduationCap,
    List as ListIcon,
    LayoutGrid,
    Mail,
    MessageSquare,
    ChevronRight,
    CheckCircle2,
    XCircle,
    Clock,
    IndianRupee
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface Student {
    _id: string;
    admissionNumber: string;
    userId?: {
        firstName: string;
        lastName: string;
        email: string;
        avatarUrl?: string;
    };
    classId?: {
        grade: string;
        section: string;
        displayName: string;
    };
    guardians: Array<{
        name: string;
        phone: string;
        isEmergencyContact: boolean;
    }>;
    status: 'ACTIVE' | 'INACTIVE' | 'TRANSFERRED' | 'GRADUATED' | 'DROPPED';
    createdAt: string;
}

export const StudentManagement = () => {
    const navigate = useNavigate();
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [activeFilter, setActiveFilter] = useState('ALL');

    // Bulk Promote Dialog State
    const [showPromoteDialog, setShowPromoteDialog] = useState(false);
    const [promoteConfirmText, setPromoteConfirmText] = useState('');

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const res = await api.get('/students');
            setStudents(res.data.data);
        } catch (error) {
            toast.error('Failed to load students');
        } finally {
            setLoading(false);
        }
    };

    const handleBulkPromote = async () => {
        if (promoteConfirmText !== 'PROMOTE') {
            toast.error('Confirmation text does not match.', { icon: '⚠️' });
            return;
        }

        toast.promise(
            // Dummy delay as placeholder for actual locked academic year check and bulk execution
            new Promise((resolve) => setTimeout(resolve, 2000)),
            {
                loading: 'Validating System Locks & Promoting...',
                success: 'Batch promotion successful. System logs updated.',
                error: 'Academic Year is locked or operation failed.'
            }
        );
        setShowPromoteDialog(false);
        setPromoteConfirmText('');
    };

    // Filter Logic
    const filteredStudents = students.filter(student => {
        const matchesSearch =
            student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (student.userId?.firstName + ' ' + student.userId?.lastName).toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;
        if (activeFilter === 'ACTIVE' && student.status !== 'ACTIVE') return false;
        if (activeFilter === 'INACTIVE' && student.status === 'INACTIVE') return false;
        // Add logic for taxonomy filters if needed later
        return true;
    });

    // Calculate generic simulated taxonomy states since attendance/finance isn't fully linked yet
    const getTaxonomyStates = (student: Student, index: number) => {
        const isNew = new Date(student.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        // Simulate some defaulters based on ID index for visual demo purposes
        const isDefaulter = index % 5 === 0;
        const lowAttendance = index % 7 === 0;

        return { isNew, isDefaulter, lowAttendance };
    };

    if (loading) {
        return (
            <div className="p-10 space-y-8 animate-pulse opacity-50">
                <div className="h-10 w-48 bg-white/10 rounded-xl" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="h-32 bg-white/5 rounded-3xl" />
                    <div className="h-32 bg-white/5 rounded-3xl" />
                    <div className="h-32 bg-white/5 rounded-3xl" />
                </div>
                <div className="h-96 bg-white/5 rounded-[3rem]" />
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-10 max-w-[1600px] mx-auto space-y-10 animate-in fade-in duration-700">

            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl lg:text-5xl font-black text-foreground tracking-tight uppercase italic drop-shadow-sm">STUDENT ROSTER</h1>
                    <p className="text-slate-400 font-medium text-sm mt-2 tracking-wide">Manage enrollments, track compliance, and view global student metrics.</p>
                </div>

                <div className="flex items-center gap-3 bg-white/5 p-2 rounded-[1.5rem] border border-white/10 shadow-inner">
                    <button
                        onClick={() => setViewMode('grid')}
                        title="Grid View"
                        className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:bg-white/10'}`}
                    >
                        <LayoutGrid className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        title="List View"
                        className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:bg-white/10'}`}
                    >
                        <ListIcon className="w-5 h-5" />
                    </button>
                    <div className="w-[1px] h-8 bg-white/10 mx-2" />
                    <Link to="/students/enroll">
                        <Button className="rounded-xl px-6 h-12 shadow-xl shadow-primary/20 font-black tracking-tight uppercase text-xs">
                            <Plus className="w-5 h-5 mr-2" />
                            New Enrollment
                        </Button>
                    </Link>
                </div>
            </div>

            {/* KPI Dashboard - High Fidelity */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-8 border-white/20 shadow-2xl shadow-black/60 bg-card/40 backdrop-blur-xl rounded-[2.5rem] relative overflow-hidden group hover:border-primary/40 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full group-hover:scale-150 transition-all duration-700" />
                    <div className="flex items-start justify-between relative z-10">
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Total Strength</p>
                            <p className="text-5xl font-black text-foreground tracking-tighter">{students.length}</p>
                            <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 w-fit px-2 py-1 rounded-lg border border-emerald-500/20">
                                <ArrowUpRight className="w-3 h-3" />
                                <span className="text-[10px] font-black uppercase tracking-widest">+12 New</span>
                            </div>
                        </div>
                        <div className="w-14 h-14 bg-primary/10 rounded-[1.2rem] flex items-center justify-center text-primary shadow-inner border border-primary/20 group-hover:scale-110 transition-transform">
                            <Users className="w-7 h-7" />
                        </div>
                    </div>
                </Card>

                <Card className="p-8 border-white/20 shadow-2xl shadow-black/60 bg-card/40 backdrop-blur-xl rounded-[2.5rem] relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full group-hover:scale-150 transition-all duration-700" />
                    <div className="flex items-start justify-between relative z-10">
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Avg Attendance</p>
                            <p className="text-5xl font-black text-foreground tracking-tighter">94.2<span className="text-2xl text-slate-500">%</span></p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global standard met</p>
                        </div>
                        <div className="w-14 h-14 bg-emerald-500/10 rounded-[1.2rem] flex items-center justify-center text-emerald-500 shadow-inner border border-emerald-500/20 group-hover:scale-110 transition-transform">
                            <TrendingDown className="w-7 h-7" />
                        </div>
                    </div>
                </Card>

                <Card className="p-8 border-white/20 shadow-2xl shadow-black/60 bg-card/40 backdrop-blur-xl rounded-[2.5rem] relative overflow-hidden group hover:border-rose-500/40 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 blur-3xl rounded-full group-hover:scale-150 transition-all duration-700" />
                    <div className="flex items-start justify-between relative z-10">
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Fee Default Alerts</p>
                            <p className="text-5xl font-black text-rose-500 tracking-tighter">18</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Action Required</p>
                        </div>
                        <div className="w-14 h-14 bg-rose-500/10 rounded-[1.2rem] flex items-center justify-center text-rose-500 shadow-inner border border-rose-500/20 group-hover:scale-110 transition-transform text-center cursor-pointer hover:bg-rose-500 hover:text-white">
                            <CircleDollarSign className="w-7 h-7" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Toolbar & Search */}
            <div className="flex flex-col lg:flex-row justify-between gap-6">
                <div className="flex-1 flex gap-4">
                    <Input
                        placeholder="Search by ID, Name or Guardian..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        icon={<Search className="w-6 h-6 text-slate-400" />}
                        className="h-16 text-lg max-w-xl border-white/20 bg-card/40 backdrop-blur-md rounded-2xl focus:border-primary/50 font-medium"
                    />
                    <div className="flex bg-white/5 rounded-2xl p-1.5 border border-white/10 w-fit">
                        {['ALL', 'ACTIVE', 'INACTIVE'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setActiveFilter(f)}
                                className={`px-6 py-2 rounded-xl text-[10px] font-black tracking-[0.2em] transition-all uppercase ${activeFilter === f ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex gap-4">
                    <Button variant="outline" className="h-16 px-8 rounded-2xl border-white/20 bg-white/5 font-black uppercase text-[10px] tracking-widest hover:border-primary/50">
                        <Filter className="w-4 h-4 mr-2" /> FIlters
                    </Button>
                    <Button
                        variant="outline"
                        className="h-16 px-8 rounded-2xl border-rose-500/30 text-rose-400 bg-rose-500/5 hover:bg-rose-500 hover:text-white font-black uppercase text-[10px] tracking-widest transition-all"
                        onClick={() => setShowPromoteDialog(true)}
                    >
                        <GraduationCap className="w-4 h-4 mr-2" /> Bulk Promote
                    </Button>
                </div>
            </div>

            {/* Main Data View */}
            {viewMode === 'list' && (
                <Card className="p-2 border-white/20 shadow-2xl shadow-black/80 bg-card/40 backdrop-blur-2xl rounded-[3rem] overflow-hidden">
                    <div className="overflow-x-auto min-h-[500px]">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                    <th className="p-6 pl-8 rounded-tl-[2rem]">Identity & ID</th>
                                    <th className="p-6">Taxonomy / Status</th>
                                    <th className="p-6">Class Sector</th>
                                    <th className="p-6">Primary Guardian</th>
                                    <th className="p-6 text-right rounded-tr-[2rem]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredStudents.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center">
                                            <AlertTriangle className="w-10 h-10 text-slate-500 mx-auto mb-4" />
                                            <p className="text-slate-500 uppercase font-black text-xs tracking-widest">No matching records found.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredStudents.map((student, i) => {
                                        const { isNew, isDefaulter, lowAttendance } = getTaxonomyStates(student, i);
                                        const primaryGuardian = student.guardians.find(g => g.isEmergencyContact) || student.guardians[0];

                                        return (
                                            <tr key={student._id || (student as any).id || i} className="group hover:bg-white/5 transition-all cursor-pointer" onClick={() => navigate(`/students/${student._id || (student as any).id}`)}>
                                                <td className="p-6 pl-8">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black shadow-inner">
                                                            {student.userId?.firstName?.charAt(0) || 'U'}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-foreground text-base">{student.userId?.firstName} {student.userId?.lastName}</p>
                                                            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{student.admissionNumber}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-6 space-y-2">
                                                    <div className="flex flex-wrap gap-2">
                                                        <span className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${student.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-400 border-white/10'}`}>
                                                            {student.status}
                                                        </span>
                                                        {isNew && <span className="px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">NEW ADMISSION</span>}
                                                        {isDefaulter && <span className="px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border border-rose-500/20 bg-rose-500/10 text-rose-400 flex items-center gap-1"><CircleDollarSign className="w-3 h-3" /> DEFAULTER</span>}
                                                        {lowAttendance && <span className="px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border border-amber-500/20 bg-amber-500/10 text-amber-400 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> LOW ATTENDANCE</span>}
                                                    </div>
                                                </td>
                                                <td className="p-6">
                                                    {student.classId ? (
                                                        <div className="flex items-center gap-3">
                                                            <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-black text-slate-300">
                                                                {student.classId.displayName || `${student.classId.grade} - ${student.classId.section}`}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-500 italic text-xs font-bold">Unassigned</span>
                                                    )}
                                                </td>
                                                <td className="p-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-slate-400">
                                                            <Users className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-300">{primaryGuardian?.name || 'Unknown'}</p>
                                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{primaryGuardian?.phone || 'No Data'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-6 text-right">
                                                    <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                                                        <button className="p-2 bg-white/5 hover:bg-primary hover:text-white rounded-lg transition-colors border border-white/5 tooltip group/btn relative" title="Dispatch SMS">
                                                            <MessageSquare className="w-4 h-4" />
                                                        </button>
                                                        <button className="p-2 bg-white/5 hover:bg-rose-500 hover:text-white rounded-lg transition-colors border border-white/5 group/btn relative" title="Collect Fee">
                                                            <IndianRupee className="w-4 h-4" />
                                                        </button>
                                                        <div className="w-[1px] h-4 bg-white/10 mx-1" />
                                                        <button title="More Options" className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/5 text-slate-400">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* Grid View */}
            {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {filteredStudents.length === 0 ? (
                        <div className="col-span-full py-20 text-center bg-card/20 rounded-[3rem] border-2 border-dashed border-white/10">
                            <AlertTriangle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                            <p className="text-slate-500 uppercase font-black text-xs tracking-widest">No intelligence found in database.</p>
                        </div>
                    ) : (
                        filteredStudents.map((student, i) => {
                            const { isNew, isDefaulter, lowAttendance } = getTaxonomyStates(student, i);
                            return (
                                <Card key={student._id || (student as any).id || i} className="p-8 border-white/20 shadow-2xl shadow-black/60 bg-card/40 backdrop-blur-xl rounded-[2.5rem] group hover:border-primary/40 transition-all duration-500 relative cursor-pointer flex flex-col justify-between min-h-[300px]" onClick={() => navigate(`/students/${student._id || (student as any).id}`)}>
                                    <div className="absolute top-0 right-0 p-6">
                                        <div className={`w-3 h-3 rounded-full shadow-[0_0_10px] ${student.status === 'ACTIVE' ? 'bg-emerald-500 shadow-emerald-500' : 'bg-rose-500 shadow-rose-500'}`} />
                                    </div>

                                    <div>
                                        <div className="w-16 h-16 rounded-[1.5rem] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black shadow-inner text-2xl mb-6">
                                            {student.userId?.firstName?.charAt(0) || 'U'}
                                        </div>
                                        <h3 className="text-2xl font-black text-foreground group-hover:text-primary transition-colors tracking-tight">
                                            {student.userId?.firstName} {student.userId?.lastName}
                                        </h3>
                                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mt-1">{student.admissionNumber}</p>

                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {isDefaulter && <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border border-rose-500/20 bg-rose-500/10 text-rose-400">Fee Alert</span>}
                                            {lowAttendance && <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border border-amber-500/20 bg-amber-500/10 text-amber-400">At-Risk</span>}
                                        </div>
                                    </div>

                                    <div className="pt-6 mt-6 border-t border-white/5 flex items-center justify-between">
                                        <div>
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Assigned Zone</p>
                                            <p className="font-bold text-slate-300 text-sm">{student.classId?.displayName || 'Pending Assignment'}</p>
                                        </div>
                                        <div className="w-10 h-10 bg-white/5 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-inner border border-white/5">
                                            <ChevronRight className="w-5 h-5" />
                                        </div>
                                    </div>
                                </Card>
                            );
                        })
                    )}
                </div>
            )}

            {/* Bulk Promote Safeguard Modal */}
            <AnimatePresence>
                {showPromoteDialog && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-lg bg-slate-900 border border-white/20 rounded-[2.5rem] shadow-2xl p-10 relative overflow-hidden"
                        >
                            {/* Warning Graphic */}
                            <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 blur-[50px] rounded-full pointer-events-none" />

                            <div className="flex items-center gap-4 text-rose-500 mb-6 border-b border-white/10 pb-6">
                                <div className="w-14 h-14 bg-rose-500/20 rounded-2xl flex items-center justify-center border border-rose-500/30">
                                    <AlertTriangle className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black uppercase tracking-tight">Bulk Promotion Gateway</h3>
                                    <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-rose-500/70">Restricted Operations</p>
                                </div>
                            </div>

                            <div className="space-y-6 text-slate-300 relative z-10">
                                <p className="font-medium text-sm leading-relaxed">
                                    You are about to execute a global sequential promotion. This will shift all students to their next academic grade mapping and lock historical records.
                                </p>

                                <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
                                        <Clock className="w-4 h-4" /> System Guard Verification
                                    </p>
                                    <p className="text-xs font-medium text-amber-500/80 mt-2">
                                        The current academic year must be formally sealed/locked before this action is authorized.
                                    </p>
                                </div>

                                <div className="pt-4">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Safeguard Override</label>
                                    <Input
                                        placeholder="Type PROMOTE to confirm"
                                        value={promoteConfirmText}
                                        onChange={(e) => setPromoteConfirmText(e.target.value)}
                                        className="mt-2 text-center text-rose-500 font-mono font-black text-lg tracking-[0.3em] uppercase bg-black/40 border-rose-500/30 focus:border-rose-500 h-14"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                                    <Button variant="outline" onClick={() => { setShowPromoteDialog(false); setPromoteConfirmText(''); }} className="bg-transparent border-white/20 text-slate-400 hover:text-white rounded-xl">Cancel</Button>
                                    <Button
                                        onClick={handleBulkPromote}
                                        disabled={promoteConfirmText !== 'PROMOTE'}
                                        className={`rounded-xl px-6 font-black uppercase text-xs tracking-widest ${promoteConfirmText === 'PROMOTE' ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/30' : 'bg-slate-800 text-slate-500'}`}
                                    >
                                        Execute Protocol
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};
