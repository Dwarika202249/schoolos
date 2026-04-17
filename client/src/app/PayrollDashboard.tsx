import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  CreditCard, 
  Stamp, 
  ChevronRight, 
  Calendar, 
  DollarSign,
  Briefcase,
  AlertCircle,
  X,
  CheckCircle2
} from 'lucide-react';
import api from '../utils/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import toast from 'react-hot-toast';

export const PayrollDashboard = () => {
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [filter, setFilter] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });

  // Payout Modal State
  const [payoutModal, setPayoutModal] = useState<{ open: boolean; payroll: any }>({
    open: false,
    payroll: null
  });
  const [payoutData, setPayoutData] = useState({
    paymentMethod: 'BANK_TRANSFER',
    referenceId: ''
  });
  const [paying, setPaying] = useState(false);

  const fetchData = async () => {
    try {
      const [pRes, sRes] = await Promise.all([
        api.get('/tenant/finance/payroll', { params: filter }),
        api.get('/tenant/staff')
      ]);
      setPayrolls(pRes.data.data);
      setStaffList(sRes.data.data);
    } catch (error) {
      toast.error('Failed to load payroll pipeline');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter]);

  const handleProcessPayroll = async () => {
    setProcessing(true);
    try {
      await api.post('/tenant/finance/payroll/process', filter);
      toast.success(`Payroll generated for ${new Date(0, filter.month - 1).toLocaleString('en', { month: 'long' })}`);
      fetchData();
    } catch (error) {
      toast.error('Payroll generation failed');
    } finally {
      setProcessing(false);
    }
  };

  const handlePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaying(true);
    try {
      await api.post('/tenant/finance/payroll/payout', {
        payrollId: payoutModal.payroll._id,
        ...payoutData
      });
      toast.success('Salary disbursed successfully');
      setPayoutModal({ open: false, payroll: null });
      fetchData();
    } catch (error) {
      toast.error('Payout failed');
    } finally {
      setPaying(false);
    }
  };

  const formatCurrency = (paise: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(paise / 100);
  };

  const getPayrollForStaff = (staffId: string) => {
    return payrolls.find(p => p.staffId?._id === staffId || p.staffId === staffId);
  };

  if (loading) return null;

  const totalDraft = payrolls
    .filter(p => p.status === 'DRAFT' || p.status === 'PROCESSED')
    .reduce((sum, p) => sum + p.netSalary, 0);

  const totalPaid = payrolls
    .filter(p => p.status === 'PAID')
    .reduce((sum, p) => sum + p.netSalary, 0);

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Staff Payroll</h1>
          <p className="text-slate-500 font-medium">Manage monthly salary disbursements and payroll configurations.</p>
        </div>
        <div className="flex gap-3">
           <div className="flex bg-card border border-white/5 rounded-2xl p-1">
              <select 
                title="Select Month"
                className="bg-transparent text-sm font-bold px-4 py-2 outline-none"
                value={filter.month}
                onChange={e => setFilter({...filter, month: parseInt(e.target.value)})}
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('en', { month: 'long' })}</option>
                ))}
              </select>
           </div>
           <Button 
             onClick={handleProcessPayroll} 
             isLoading={processing}
             className="rounded-2xl px-8 py-6 shadow-xl shadow-primary/20"
           >
              <Stamp className="w-4 h-4 mr-2" /> Generate Monthly Drafts
           </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         {[
           { label: "Active Staff", val: staffList.length, icon: Users },
           { label: "Draft Payroll", val: formatCurrency(totalDraft), icon: Briefcase },
           { label: "Total Disbursed", val: formatCurrency(totalPaid), icon: CreditCard },
           { label: "Pending Payouts", val: payrolls.filter(p => p.status !== 'PAID').length, icon: Calendar }
         ].map((stat, i) => (
           <div key={i} className="p-6 rounded-3xl bg-card border border-white/5">
              <stat.icon className="w-5 h-5 text-primary mb-3" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{stat.label}</p>
              <p className="text-xl font-black">{stat.val}</p>
           </div>
         ))}
      </div>

      {/* Staff Pipeline */}
      <div className="bg-card border border-white/5 rounded-[2.5rem] overflow-hidden">
         <div className="p-8 border-b border-white/5 flex justify-between items-center">
            <h3 className="text-lg font-bold">Payroll Pipeline — {new Date(0, filter.month - 1).toLocaleString('en', { month: 'long' })} {filter.year}</h3>
            <div className="flex gap-2">
               <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest">Paid</span>
               <span className="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-widest">Draft</span>
               <span className="px-3 py-1 rounded-lg bg-white/5 text-slate-500 text-[10px] font-black uppercase tracking-widest">No Config</span>
            </div>
         </div>
         <div className="divide-y divide-white/5 pb-4">
            {staffList.map((staff) => {
              const payroll = getPayrollForStaff(staff._id);
              return (
                <div key={staff._id} className="p-6 hover:bg-white/5 transition-all group flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 overflow-hidden border border-white/5 flex items-center justify-center text-slate-500 font-black uppercase">
                        {staff.userId?.firstName?.slice(0, 1)}{staff.userId?.lastName?.slice(0, 1)}
                      </div>
                      <div>
                         <p className="font-bold">{staff.userId?.firstName} {staff.userId?.lastName}</p>
                         <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{staff.designation || 'Staff Member'}</p>
                      </div>
                   </div>

                   <div className="flex items-center gap-10">
                       <div className="text-right">
                          <p className="text-[10px] font-black uppercase tracking-tight text-slate-500">Gross Payout</p>
                          <p className="font-bold text-sm">{payroll ? formatCurrency(payroll.netSalary) : '₹ --'}</p>
                       </div>
                       
                       {!payroll ? (
                         <span className="px-4 py-1.5 rounded-xl bg-white/5 text-slate-500 text-[10px] font-black uppercase tracking-widest border border-white/5">
                            Configuration Needed
                         </span>
                       ) : (
                         <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                           payroll.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                         }`}>
                            {payroll.status}
                         </span>
                       )}

                       <Button 
                         variant={payroll?.status === 'PAID' ? 'outline' : 'primary'} 
                         className="rounded-xl px-4 py-2 text-xs"
                         disabled={!payroll || payroll.status === 'PAID'}
                         onClick={() => setPayoutModal({ open: true, payroll })}
                       >
                          {payroll?.status === 'PAID' ? 'View Slip' : 'Disburse Salary'}
                       </Button>
                   </div>
                </div>
              );
            })}
         </div>
      </div>

      {/* Payout Modal */}
      <AnimatePresence>
        {payoutModal.open && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setPayoutModal({ open: false, payroll: null })} />
              <motion.form 
                onSubmit={handlePayout}
                initial={{ scale: 0.9, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }}
                className="relative w-full max-w-md bg-card border border-white/10 p-10 rounded-[3rem] shadow-2xl space-y-8"
              >
                 <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                       <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                          <Stamp className="w-7 h-7" />
                       </div>
                       <div>
                          <h3 className="text-2xl font-black">Disburse Salary</h3>
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                            {payoutModal.payroll?.staffId?.userId?.firstName} • {new Date(0, payoutModal.payroll?.month - 1).toLocaleString('en', { month: 'short' })}
                          </p>
                       </div>
                    </div>
                    <button title="Close" type="button" onClick={() => setPayoutModal({ open: false, payroll: null })} className="p-2 hover:bg-white/5 rounded-xl text-slate-500"><X className="w-6 h-6" /></button>
                 </div>

                 <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                       <span className="text-slate-500 font-bold uppercase text-[10px]">Net Payout</span>
                       <span className="font-black text-primary text-xl">{formatCurrency(payoutModal.payroll?.netSalary)}</span>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="space-y-1.5 text-left">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Payment Channel</label>
                       <select 
                         title="Payment Method"
                         className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-primary/40"
                         value={payoutData.paymentMethod}
                         onChange={e => setPayoutData({...payoutData, paymentMethod: e.target.value})}
                       >
                          <option value="BANK_TRANSFER">Bank Transfer</option>
                          <option value="CASH">Cash Payment</option>
                          <option value="UPI">UPI / Digital</option>
                          <option value="CHEQUE">Corporate Cheque</option>
                       </select>
                    </div>

                    <Input 
                      label="Reference / Receipt #" 
                      placeholder="Optional"
                      value={payoutData.referenceId}
                      onChange={e => setPayoutData({...payoutData, referenceId: e.target.value})}
                    />
                 </div>

                 <div className="flex gap-4 pt-2">
                    <Button variant="outline" type="button" className="flex-1 py-6 rounded-2xl" onClick={() => setPayoutModal({ open: false, payroll: null })}>Cancel</Button>
                    <Button type="submit" isLoading={paying} className="flex-1 py-6 rounded-2xl font-black shadow-xl shadow-primary/20">
                       Confirm Payout
                    </Button>
                 </div>
              </motion.form>
           </div>
        )}
      </AnimatePresence>
    </div>
  );
};
