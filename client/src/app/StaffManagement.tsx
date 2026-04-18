import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  UserPlus, 
  Search, 
  Filter, 
  MoreVertical, 
  Mail, 
  Phone, 
  BadgeCheck,
  Building2,
  Calendar,
  ChevronRight,
  Users,
  AlertCircle,
  LayoutGrid,
  List as ListIcon,
  ToggleLeft,
  ToggleRight,
  Trash2,
  UserCog,
  ShieldCheck,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export const StaffManagement = () => {
  const navigate = useNavigate();
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedDesignation, setSelectedDesignation] = useState('ALL');

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await api.get('/staff');
      setStaff(response.data.data);
    } catch (error) {
      toast.error('Failed to load staff directory');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await api.patch(`/staff/${id}/status`, { isActive: !currentStatus });
      toast.success(`Staff member ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchStaff();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const filteredStaff = staff.filter(member => {
    const fullName = `${member.userId?.firstName} ${member.userId?.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || 
                         member.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.designation.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDesignation = selectedDesignation === 'ALL' || member.designation === selectedDesignation;
    
    return matchesSearch && matchesDesignation;
  });

  const designations = ['ALL', ...new Set(staff.map(s => s.designation))];

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 overflow-visible pointer-events-auto">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
               <Users className="w-6 h-6" />
            </div>
            <h1 className="text-4xl font-black text-foreground tracking-tight">Staff Management</h1>
          </div>
          <p className="text-slate-500 font-medium ml-1">Manage and track your school staff members from one place.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 bg-card/40 backdrop-blur-xl p-2 rounded-2xl shadow-sm border border-white/5">
          <button 
            onClick={() => setViewMode('grid')}
            title="Grid View"
            className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:bg-white/5'}`}
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            title="List View"
            className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:bg-white/5'}`}
          >
            <ListIcon className="w-5 h-5" />
          </button>
          <div className="w-[1px] h-8 bg-white/10 mx-1" />
          <Link to="/staff/add">
            <Button className="rounded-xl px-6 h-11 shadow-lg shadow-primary/10">
              <UserPlus className="w-4 h-4 mr-2" />
              Add New Staff
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Staff', value: staff.length, sub: 'Team Strength', icon: ShieldCheck, color: 'primary' },
          { label: 'Active Now', value: staff.filter(s => s.isActive).length, sub: 'Available', icon: BadgeCheck, color: 'emerald' },
          { label: 'Inactive', value: staff.filter(s => !s.isActive).length, sub: 'On Hold', icon: AlertCircle, color: 'rose' },
          { label: 'Teachers', value: staff.filter(s => s.designation.includes('TEACHER')).length, sub: 'Faculty Members', icon: UserCog, color: 'indigo' },
        ].map((stat, i) => (
          <Card key={i} className="p-6 border-white/10 shadow-2xl shadow-black/40 bg-card/40 backdrop-blur-xl overflow-hidden relative group hover:border-primary/30 transition-all duration-300">
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-${stat.color}-500 opacity-5 rounded-full group-hover:scale-125 transition-transform duration-500`} />
            <div className="flex justify-between items-start relative z-10">
               <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{stat.label}</p>
                  <p className="text-3xl font-black text-foreground tracking-tight">{stat.value}</p>
                  <p className="text-[10px] font-bold text-slate-400">{stat.sub}</p>
               </div>
               <div className={`w-10 h-10 rounded-xl bg-${stat.color}-500/10 flex items-center justify-center text-${stat.color}-500 border border-${stat.color}-500/20`}>
                  <stat.icon className="w-5 h-5" />
               </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Search & Tool Bar */}
      <div className="flex flex-col md:flex-row gap-4 text-foreground">
        <div className="flex-1">
          <Input 
            placeholder="Search by name, ID, or job role..." 
            className="h-14"
            inputClassName="bg-card/40 backdrop-blur-xl border-white/5 shadow-sm rounded-3xl"
            icon={<Search className="h-5 w-5" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
           <select 
             value={selectedDesignation}
             onChange={(e) => setSelectedDesignation(e.target.value)}
             className="h-14 bg-card/40 backdrop-blur-xl border-white/5 shadow-sm rounded-3xl px-8 font-black text-xs uppercase tracking-widest text-slate-400 outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer min-w-[200px]"
             title="Filter by Role"
           >
              {designations.map(d => (
                <option key={d} value={d} className="bg-slate-900">{d === 'ALL' ? 'Show All Roles' : d.replace(/_/g, ' ')}</option>
              ))}
           </select>
           <Button variant="outline" className="h-14 w-14 rounded-3xl bg-card/40 backdrop-blur-xl border-white/10 shadow-sm flex items-center justify-center">
              <Filter className="w-5 h-5 text-slate-400" />
           </Button>
        </div>
      </div>

      {/* Main Directory Area */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative">
          <AnimatePresence>
            {loading ? (
              [1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-72 bg-slate-100 rounded-[2.5rem] animate-pulse" />)
            ) : filteredStaff.map((member) => (
              <motion.div
                key={member.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Card className={`group border-white/15 shadow-2xl shadow-black/60 hover:border-primary/40 transition-all duration-500 rounded-[2.5rem] p-8 bg-card/40 backdrop-blur-xl h-full relative overflow-hidden ${!member.isActive ? 'opacity-70 grayscale-[0.5]' : ''}`}>
                  {!member.isActive && (
                    <div className="absolute top-0 right-0 p-4">
                       <span className="bg-rose-500 text-white text-[8px] font-black uppercase px-2 py-1 rounded-lg shadow-lg">Inactive</span>
                    </div>
                  )}
                  
                  {/* Action Dropdown Portal - Simpler for now */}
                  <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button 
                       onClick={(e) => { e.preventDefault(); handleToggleStatus(member.id, member.isActive); }}
                       className={`p-2 rounded-xl text-white shadow-xl transition-all ${member.isActive ? 'bg-rose-500 hover:bg-rose-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
                       title={member.isActive ? 'Deactivate' : 'Activate'}
                     >
                        {member.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                     </button>
                  </div>

                  <div className="flex flex-col items-center text-center space-y-4 pt-4">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-[2rem] bg-white/5 flex items-center justify-center font-black text-3xl text-primary shadow-inner overflow-hidden border-2 border-white/20 group-hover:scale-110 transition-transform duration-500 group-hover:border-primary/40">
                         {member.userId?.avatarUrl ? (
                           <img src={member.userId.avatarUrl} alt="" className="w-full h-full object-cover" />
                         ) : (
                           member.userId?.firstName?.charAt(0)
                         )}
                      </div>
                      {member.isActive && (
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white/10 backdrop-blur-md rounded-xl shadow-lg flex items-center justify-center border border-white/20">
                           <ShieldCheck className="w-5 h-5 text-emerald-500" />
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="text-xl font-black text-foreground tracking-tight group-hover:text-primary transition-colors">
                        {member.userId?.firstName} {member.userId?.lastName}
                      </h3>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{member.designation.replace(/_/g, ' ')}</p>
                    </div>

                    <div className="flex gap-2 pt-2">
                       <span className="px-3 py-1 bg-white/5 text-slate-400 text-[8px] font-black rounded-lg border border-white/10 uppercase tracking-widest">{member.employeeId}</span>
                       <span className="px-3 py-1 bg-primary/10 text-primary text-[8px] font-black rounded-lg border border-primary/20 uppercase tracking-widest">{member.employmentType.replace(/_/g, ' ')}</span>
                    </div>

                    <div className="w-full h-[1px] bg-white/5" />

                    <div className="flex items-center justify-between w-full pt-2">
                       <div className="flex gap-2">
                          <a href={`mailto:${member.userId?.email}`} title="Send Email" className="w-10 h-10 bg-white/10 hover:bg-primary/20 text-slate-500 hover:text-primary rounded-xl flex items-center justify-center transition-all border border-white/15">
                             <Mail className="w-4 h-4" />
                          </a>
                          <a href={`tel:${member.emergencyContact?.phone}`} title="Call Emergency" className="w-10 h-10 bg-white/10 hover:bg-emerald-500/20 text-slate-500 hover:text-emerald-500 rounded-xl flex items-center justify-center transition-all border border-white/15">
                             <Phone className="w-4 h-4" />
                          </a>
                       </div>
                       <button 
                         onClick={() => navigate(`/staff/${member.id}`)}
                         title="View Profile"
                         className="w-10 h-10 bg-primary/10 text-primary rounded-xl border border-primary/20 flex items-center justify-center hover:bg-primary hover:text-white hover:shadow-xl hover:shadow-primary/30 transition-all group/btn"
                       >
                          <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-0.5 transition-transform" />
                       </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        /* List Mode View */
        <Card className="border-none shadow-sm rounded-[2.5rem] bg-card/40 backdrop-blur-xl overflow-hidden">
          <table className="w-full text-left font-sans">
            <thead className="bg-white/5 border-b border-white/5">
              <tr>
                <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Member</th>
                <th className="px-6 py-6 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Job Role</th>
                <th className="px-6 py-6 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Branch / Dept</th>
                <th className="px-6 py-6 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Status</th>
                <th className="px-6 py-6 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
               {loading ? (
                 [1,2,3,4,5].map(i => <tr key={i} className="h-20 animate-pulse bg-white/5" />)
               ) : filteredStaff.map((member) => (
                 <tr key={member.id} className="hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => navigate(`/staff/${member.id}`)}>
                    <td className="px-10 py-5">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center font-black text-primary text-lg shadow-inner">
                             {member.userId?.firstName?.charAt(0)}
                          </div>
                          <div>
                             <p className="font-bold text-foreground">{member.userId?.firstName} {member.userId?.lastName}</p>
                             <p className="text-[10px] font-bold text-slate-500 tracking-widest">{member.employeeId}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-5">
                       <span className="text-xs font-bold text-slate-400 bg-white/5 border border-white/5 px-3 py-1.5 rounded-xl shadow-sm italic">{member.designation.replace(/_/g, ' ')}</span>
                    </td>
                    <td className="px-6 py-5">
                       <div className="space-y-1">
                          <p className="text-xs font-black text-foreground">{member.branchId?.name || 'Main Campus'}</p>
                          <p className="text-[10px] font-bold text-slate-500">{member.department || 'Academic'}</p>
                       </div>
                    </td>
                    <td className="px-6 py-5">
                       <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${member.isActive ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                          {member.isActive ? 'Active' : 'Inactive'}
                       </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                       <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-xl bg-white/5 border-white/10" onClick={(e) => { e.stopPropagation(); navigate(`/staff/edit/${member.id}`); }}>
                             <UserCog className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className={`h-9 w-9 p-0 rounded-xl bg-white/5 border-white/10 ${member.isActive ? 'text-rose-500 hover:bg-rose-500/10' : 'text-emerald-500 hover:bg-emerald-500/10'}`}
                            onClick={(e) => { e.stopPropagation(); handleToggleStatus(member.id, member.isActive); }}
                          >
                             {member.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                          </Button>
                       </div>
                    </td>
                 </tr>
               ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Empty State */}
      {!loading && filteredStaff.length === 0 && (
        <Card className="p-20 border-dashed border-2 flex flex-col items-center text-center bg-transparent border-white/5">
          <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner">
            <Users className="w-12 h-12 text-slate-500" />
          </div>
          <h3 className="text-2xl font-black text-foreground mb-2 uppercase tracking-tight">No staff members found</h3>
          <p className="text-slate-500 max-w-sm mb-8 font-medium italic text-sm">You haven't added any staff members yet. Click the button below to get started.</p>
          <Link to="/staff/add">
            <Button size="lg" className="rounded-2xl px-10 py-7 shadow-2xl shadow-primary/20">
              <UserPlus className="w-5 h-5 mr-2" />
              Add Your First Member
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
};
