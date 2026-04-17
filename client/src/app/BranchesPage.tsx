import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Plus, 
  MapPin, 
  Phone, 
  Trash2, 
  Edit3, 
  Star,
  Activity,
  ArrowRight
} from 'lucide-react';
import api from '../utils/api';
import { Button } from '../components/ui/Button';
import { BranchModal } from '../components/BranchModal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import toast from 'react-hot-toast';

export const BranchesPage = () => {
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; branch: any }>({
    open: false,
    branch: null
  });

  const fetchBranches = async () => {
    try {
      const response = await api.get('/tenant/branches');
      setBranches(response.data.data);
    } catch (error) {
      toast.error('Failed to load campuses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleDelete = async () => {
    if (!deleteConfirm.branch) return;
    try {
      await api.delete(`/tenant/branches/${deleteConfirm.branch._id}`);
      toast.success('Branch removed');
      fetchBranches();
      setDeleteConfirm({ open: false, branch: null });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-4">
             Network Overview
          </div>
          <h1 className="text-4xl font-black tracking-tight">Campus Repository</h1>
          <p className="text-slate-500 font-medium mt-1">Manage and monitor all physical branches under your institution.</p>
        </div>
        <Button 
          onClick={() => { setSelectedBranch(null); setModalOpen(true); }}
          className="rounded-2xl px-8 py-6 shadow-2xl shadow-primary/20 hover:scale-105 transition-transform"
        >
          <Plus className="w-5 h-5 mr-2" /> Add New Campus
        </Button>
      </div>

      {/* Stats Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
         {[
           { label: "Total Branches", val: branches.length, icon: Building2 },
           { label: "Active Nodes", val: branches.filter(b => b.isActive).length, icon: Activity },
           { label: "Headquarters", val: 1, icon: Star }
         ].map((stat, i) => (
           <div key={`stat-card-${i}`} className="p-6 rounded-3xl bg-card border border-white/5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                 <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                 <p className="text-2xl font-black">{stat.val}</p>
              </div>
           </div>
         ))}
      </div>

      {/* Branches Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {branches.map((branch, idx) => (
          <motion.div 
            key={branch._id || `branch-node-${idx}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
              relative group p-8 rounded-[2.5rem] border transition-all duration-500 overflow-hidden
              ${branch.isHeadquarters 
                ? 'bg-gradient-to-br from-primary/10 via-card to-card border-primary/20 shadow-xl' 
                : 'bg-card border-white/5 hover:border-white/10 shadow-lg'}
            `}
          >
            {/* HQ Indicator */}
            {branch.isHeadquarters && (
              <div className="absolute top-8 right-8 flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary text-white text-[10px] font-black tracking-widest uppercase shadow-xl shadow-primary/20">
                <Star className="w-3 h-3 fill-current" /> Headquarters
              </div>
            )}

            <div className="flex items-start justify-between mb-8">
               <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-black tracking-tight">{branch.name}</h3>
                    <span className="text-[10px] font-mono font-bold bg-white/5 px-2 py-0.5 rounded border border-white/5 text-slate-400">
                      {branch.code}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                     <MapPin className="w-4 h-4" />
                     {branch.address?.city}, {branch.address?.state}
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-10 pb-8 border-b border-white/5">
                <div className="space-y-1">
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Official Link</p>
                   <p className="text-sm font-bold text-slate-300 truncate">{branch.email || 'N/A'}</p>
                </div>
                <div className="space-y-1 text-right">
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Primary Hub</p>
                   <p className="text-sm font-bold text-slate-300">{branch.phone || 'N/A'}</p>
                </div>
            </div>

            <div className="flex items-center justify-between">
               <div className="flex gap-2">
                  <button 
                    onClick={() => { setSelectedBranch(branch); setModalOpen(true); }}
                    className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-primary/20 hover:border-primary/20 hover:text-primary transition-all group/btn"
                    title="Edit Campus"
                  >
                    <Edit3 className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                  </button>
                  <button 
                    onClick={() => setDeleteConfirm({ open: true, branch })}
                    className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-red-500/20 hover:border-red-500/20 hover:text-red-500 transition-all group/btn"
                    title="Remove Campus"
                    disabled={branch.isHeadquarters}
                  >
                    <Trash2 className={`w-5 h-5 group-hover/btn:scale-110 transition-transform ${branch.isHeadquarters ? 'opacity-20' : ''}`} />
                  </button>
               </div>
               <div className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/5 font-bold text-xs text-slate-400">
                  Manage Sub-units <ArrowRight className="w-4 h-4" />
               </div>
            </div>
          </motion.div>
        ))}

        {/* Add Empty State Card */}
        <motion.button 
          whileHover={{ scale: 1.01 }}
          onClick={() => { setSelectedBranch(null); setModalOpen(true); }}
          className="border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-slate-500 hover:border-primary/20 hover:bg-primary/5 transition-all group"
        >
           <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
              <Plus className="w-8 h-8" />
           </div>
           <p className="font-bold text-lg">Add Another Component</p>
           <p className="text-sm font-medium opacity-60">Expand your school network infrastructure</p>
        </motion.button>
      </div>

      <BranchModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSuccess={fetchBranches}
        branch={selectedBranch}
      />

      <ConfirmModal 
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, branch: null })}
        onConfirm={handleDelete}
        title="Remove Campus?"
        message={`Are you sure you want to permanently delete the ${deleteConfirm.branch?.name} branch? All student and staff records tied exclusively to this node will be archived.`}
        confirmText="Remove Node"
      />
    </div>
  );
};
