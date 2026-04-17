import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  DollarSign, 
  ChevronRight, 
  CreditCard,
  Download,
  AlertCircle,
  X,
  CheckCircle2
} from 'lucide-react';
import api from '../utils/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import toast from 'react-hot-toast';

export const InvoicesPage = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Payment Modal State
  const [paymentModal, setPaymentModal] = useState<{ open: boolean; invoice: any }>({
    open: false,
    invoice: null
  });
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentMethod: 'CASH',
    referenceId: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchInvoices = async () => {
    try {
      const response = await api.get('/tenant/finance/invoices', {
        params: { status: statusFilter }
      });
      setInvoices(response.data.data);
    } catch (error) {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/tenant/finance/collect', {
        invoiceId: paymentModal.invoice._id,
        ...paymentData,
        amount: Math.round(parseFloat(paymentData.amount) * 100)
      });
      toast.success('Payment recorded successfully');
      setPaymentModal({ open: false, invoice: null });
      fetchInvoices();
    } catch (error) {
      toast.error('Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
    inv.studentId?.admissionNumber?.toLowerCase().includes(search.toLowerCase()) ||
    `${inv.studentId?.userId?.firstName} ${inv.studentId?.userId?.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  const formatCurrency = (paise: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(paise / 100);
  };

  if (loading) return null;

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Invoice Directory</h1>
          <p className="text-slate-500 font-medium">Manage student billing, partial payments and overdue arrears.</p>
        </div>
        <div className="flex gap-4">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search by ID or Name..."
                className="bg-card border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-sm w-[300px] outline-none focus:border-primary/40 transition-all font-bold"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
           </div>
           <select 
             title="Filter Status"
             className="bg-card border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-primary/40"
             value={statusFilter}
             onChange={e => setStatusFilter(e.target.value)}
           >
              <option value="">All Statuses</option>
              <option value="UNPAID">Unpaid</option>
              <option value="PARTIAL">Partial</option>
              <option value="PAID">Paid</option>
           </select>
        </div>
      </div>

      {/* Grid */}
      <div className="bg-card border border-white/5 rounded-[2.5rem] overflow-hidden">
         <table className="w-full text-left">
            <thead>
               <tr className="bg-white/5 border-b border-white/5">
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest">Student / ID</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest">Invoice</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest">Due Amount</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Action</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
               {filteredInvoices.map((inv) => (
                 <tr key={inv._id} className="group hover:bg-white/5 transition-colors">
                    <td className="px-8 py-6">
                       <p className="font-bold">{inv.studentId?.userId?.firstName} {inv.studentId?.userId?.lastName}</p>
                       <p className="text-[10px] font-bold text-slate-500 uppercase">{inv.studentId?.admissionNumber}</p>
                    </td>
                    <td className="px-8 py-6">
                       <p className="font-bold text-sm">{inv.invoiceNumber}</p>
                       <p className="text-[10px] font-bold text-slate-500 uppercase">{new Date(inv.issuedDate).toLocaleDateString()}</p>
                    </td>
                    <td className="px-8 py-6 font-black text-rose-500">
                       {formatCurrency(inv.dueAmount)}
                    </td>
                    <td className="px-8 py-6">
                       <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${
                         inv.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-500' :
                         inv.status === 'PARTIAL' ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'
                       }`}>
                          {inv.status}
                       </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <Button 
                         variant={inv.status === 'PAID' ? 'outline' : 'primary'} 
                         className="rounded-xl px-4 py-2 text-xs"
                         disabled={inv.status === 'PAID'}
                         onClick={() => {
                            setPaymentModal({ open: true, invoice: inv });
                            setPaymentData({ ...paymentData, amount: (inv.dueAmount / 100).toString() });
                         }}
                       >
                          {inv.status === 'PAID' ? 'Receipt' : 'Collect Fee'}
                       </Button>
                    </td>
                 </tr>
               ))}
               {filteredInvoices.length === 0 && (
                 <tr>
                    <td colSpan={5} className="px-8 py-20 text-center text-slate-500 font-medium">
                       No invoices found matching your criteria.
                    </td>
                 </tr>
               )}
            </tbody>
         </table>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {paymentModal.open && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setPaymentModal({ open: false, invoice: null })} />
              <motion.form 
                onSubmit={handlePayment}
                initial={{ scale: 0.9, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }}
                className="relative w-full max-w-lg bg-card border border-white/10 p-10 rounded-[3rem] shadow-2xl space-y-8"
              >
                 <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                       <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                          <CreditCard className="w-7 h-7" />
                       </div>
                       <div>
                          <h3 className="text-2xl font-black">Record Payment</h3>
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{paymentModal.invoice?.invoiceNumber}</p>
                       </div>
                    </div>
                    <button title="Close" type="button" onClick={() => setPaymentModal({ open: false, invoice: null })} className="p-2 hover:bg-white/5 rounded-xl text-slate-500"><X className="w-6 h-6" /></button>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                       <Input 
                         label="Collection Amount (₹)" 
                         type="number" 
                         value={paymentData.amount} 
                         onChange={e => setPaymentData({...paymentData, amount: e.target.value})}
                         required 
                       />
                    </div>
                    
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Payment Method</label>
                       <select 
                         title="Payment Method"
                         className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-primary/40"
                         value={paymentData.paymentMethod}
                         onChange={e => setPaymentData({...paymentData, paymentMethod: e.target.value})}
                       >
                          <option value="CASH">Cash</option>
                          <option value="BANK_TRANSFER">Bank Transfer</option>
                          <option value="UPI">UPI / QR</option>
                          <option value="CHEQUE">Cheque</option>
                       </select>
                    </div>

                    <Input 
                      label="Ref / Trans ID" 
                      placeholder="Optional"
                      value={paymentData.referenceId}
                      onChange={e => setPaymentData({...paymentData, referenceId: e.target.value})}
                    />
                 </div>

                 <Input 
                    label="Internal Notes" 
                    placeholder="e.g. Received by Parent"
                    value={paymentData.notes}
                    onChange={e => setPaymentData({...paymentData, notes: e.target.value})}
                 />

                 <div className="flex gap-4 pt-4">
                    <Button variant="outline" type="button" className="flex-1 py-6 rounded-2xl" onClick={() => setPaymentModal({ open: false, invoice: null })}>Cancel</Button>
                    <Button type="submit" isLoading={submitting} className="flex-1 py-6 rounded-2xl font-black shadow-xl shadow-emerald-500/20 bg-emerald-500 hover:bg-emerald-600">
                       Verify & Collect
                    </Button>
                 </div>
              </motion.form>
           </div>
        )}
      </AnimatePresence>
    </div>
  );
};
