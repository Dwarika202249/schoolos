import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  IndianRupee, 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  Users, 
  Wallet,
  Calendar,
  Layers,
  Search,
  Plus
} from 'lucide-react';
import api from '../utils/api';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export const FinanceDashboard = () => {
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalOutstanding: 0,
    totalPayrollExpenses: 0
  });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStatsAndHistory = async () => {
    try {
      const [statsRes, historyRes] = await Promise.all([
        api.get('/tenant/finance/stats'),
        api.get('/tenant/finance/transactions')
      ]);
      setStats(statsRes.data.data);
      setTransactions(historyRes.data.data);
    } catch (error) {
      toast.error('Failed to load financial records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatsAndHistory();
  }, []);

  const formatCurrency = (paise: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(paise / 100);
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-4">
             Financial Command Center
          </div>
          <h1 className="text-4xl font-black tracking-tight underline decoration-primary/30 underline-offset-8">Finance & Payroll</h1>
          <p className="text-slate-500 font-medium mt-3">Monitor revenue streams, institutional expenses, and payroll pipelines.</p>
        </div>
        <div className="flex gap-3">
           <Button variant="outline" className="rounded-2xl px-6 py-6 border-white/5 hover:bg-white/5">
              <Calendar className="w-4 h-4 mr-2" /> Financial Year
           </Button>
           <Link to="/finance/invoices">
            <Button className="rounded-2xl px-8 py-6 shadow-2xl shadow-primary/30">
                <Plus className="w-4 h-4 mr-2" /> Collect Fee
            </Button>
           </Link>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           { label: "Total Collection", val: stats.totalIncome, icon: IndianRupee, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", trend: "+12%" },
           { label: "Outstanding Dues", val: stats.totalOutstanding, icon: Wallet, color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20", trend: "-5%" },
           { label: "Payroll Expenses", val: stats.totalPayrollExpenses, icon: Users, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20", trend: "Steady" }
         ].map((stat, i) => (
           <motion.div 
             key={i} 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: i * 0.1 }}
             className={`p-8 rounded-[2.5rem] bg-card border ${stat.border} relative overflow-hidden group`}
           >
              <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                 <stat.icon className="w-40 h-40" />
              </div>
              <div className="flex justify-between items-start mb-6">
                 <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`w-7 h-7 ${stat.color}`} />
                 </div>
                 <div className={`px-3 py-1 rounded-full ${stat.bg} ${stat.color} text-[10px] font-black`}>
                    {stat.trend}
                 </div>
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black">{formatCurrency(stat.val)}</h3>
           </motion.div>
         ))}
      </div>

      {/* Action Modules */}
      <div className="grid lg:grid-cols-3 gap-8">
         <div className="lg:col-span-1 space-y-4">
            <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Operations</h4>
            {[
              { title: "Fee Management", desc: "Configuration", icon: Layers, link: "/finance/fees" },
              { title: "Staff Payroll", desc: "Salaries & Payouts", icon: Users, link: "/finance/payroll" },
              { title: "Invoice Directory", desc: "Billing & Collections", icon: Wallet, link: "/finance/invoices" }
            ].map((module, i) => (
              <Link to={module.link} key={i} className="block w-full">
                <motion.div 
                    whileHover={{ x: 8 }}
                    className="w-full text-left p-6 rounded-3xl bg-card border border-white/5 hover:border-primary/30 transition-all flex items-center justify-between group"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            <module.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-bold">{module.title}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{module.desc}</p>
                        </div>
                    </div>
                    <ArrowUpRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                </motion.div>
              </Link>
            ))}
         </div>

         {/* Transactions Feed */}
         <div className="lg:col-span-2 bg-card border border-white/5 rounded-[2.5rem] p-8">
            <div className="flex justify-between items-center mb-10">
               <div>
                  <h3 className="text-xl font-black">Recent Activity</h3>
                  <p className="text-xs text-slate-500 font-medium tracking-wide">Real-time ledger updates from all campuses.</p>
               </div>
               <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Search ledger..."
                    className="bg-white/5 border border-white/5 rounded-2xl pl-12 pr-6 py-3 text-sm outline-none focus:border-primary/30 transition-all w-64"
                  />
               </div>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
               {transactions.map((tx) => (
                 <div key={tx._id} className="flex items-center justify-between p-4 rounded-2xl border border-white/5 hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-4">
                       <div className={`w-10 h-10 rounded-xl ${tx.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'} flex items-center justify-center`}>
                          {tx.type === 'INCOME' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                       </div>
                       <div>
                          <p className="text-sm font-bold">{tx.notes || tx.category.replace('_', ' ')}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            {new Date(tx.transactionDate).toLocaleDateString()} • {tx.paymentMethod}
                          </p>
                       </div>
                    </div>
                    <p className={`font-black ${tx.type === 'INCOME' ? 'text-emerald-500' : 'text-slate-300'}`}>
                       {tx.type === 'INCOME' ? "+" : "-"}{formatCurrency(tx.amount)}
                    </p>
                 </div>
               ))}
               {transactions.length === 0 && (
                 <div className="py-20 text-center text-slate-600 font-medium">
                    No transactions recorded in the current period.
                 </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};
