import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  DollarSign,
  CreditCard,
  Download,
  AlertCircle,
  X,
  CheckCircle2,
  AlertTriangle,
  Plus,
  FileText,
  Users,
  ArrowUpRight,
  Sparkles,
  ChevronRight,
  CalendarDays,
} from 'lucide-react';
import api from '../utils/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import { generateFeeReceipt } from '../utils/receiptGenerator';
import toast from 'react-hot-toast';

type Tab = 'invoices' | 'defaulters';

const formatCurrency = (paise: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(paise / 100);

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    PAID: 'bg-emerald-500/10 text-emerald-500',
    PARTIAL: 'bg-amber-500/10 text-amber-500',
    UNPAID: 'bg-rose-500/10 text-rose-500',
    VOID: 'bg-slate-500/10 text-slate-400',
  };
  return `px-3 py-1 rounded-lg text-[10px] font-black uppercase ${map[status] || 'bg-slate-500/10 text-slate-400'}`;
};

export const InvoicesPage = () => {
  const { school } = useAuth();
  const [tab, setTab] = useState<Tab>('invoices');

  // ── Invoices tab state ──────────────────────────────────────────────────────
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // ── Defaulters tab state ────────────────────────────────────────────────────
  const [defaulters, setDefaulters] = useState<any[]>([]);
  const [loadingDefaulters, setLoadingDefaulters] = useState(false);
  const [defSearch, setDefSearch] = useState('');

  // ── Payment modal ───────────────────────────────────────────────────────────
  const [paymentModal, setPaymentModal] = useState<{ open: boolean; invoice: any }>({ open: false, invoice: null });
  const [paymentData, setPaymentData] = useState({ amount: '', paymentMethod: 'CASH', referenceId: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  // ── Individual invoice modal ────────────────────────────────────────────────
  const [invoiceModal, setInvoiceModal] = useState<{ open: boolean; studentId: string; studentName: string }>({
    open: false, studentId: '', studentName: ''
  });
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [newInvoiceData, setNewInvoiceData] = useState({
    academicYearId: '',
    categoryId: '',
    description: '',
    amount: '',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
  });
  const [generatingInvoice, setGeneratingInvoice] = useState(false);

  // ── Receipt downloading ─────────────────────────────────────────────────────
  const [downloadingReceipt, setDownloadingReceipt] = useState<string | null>(null);

  // ─── Fetch Functions ──────────────────────────────────────────────────────

  const fetchInvoices = useCallback(async () => {
    try {
      setLoadingInvoices(true);
      const res = await api.get('/tenant/finance/invoices', { params: { status: statusFilter } });
      setInvoices(res.data.data);
    } catch {
      toast.error('Failed to load invoices');
    } finally {
      setLoadingInvoices(false);
    }
  }, [statusFilter]);

  const fetchDefaulters = useCallback(async () => {
    try {
      setLoadingDefaulters(true);
      const res = await api.get('/tenant/finance/defaulters');
      setDefaulters(res.data.data);
    } catch {
      toast.error('Failed to load defaulters list');
    } finally {
      setLoadingDefaulters(false);
    }
  }, []);

  const fetchDropdownData = useCallback(async () => {
    try {
      const [yRes, cRes] = await Promise.all([
        api.get('/tenant/academic-years'),
        api.get('/tenant/finance/categories'),
      ]);
      setAcademicYears(yRes.data.data);
      setCategories(cRes.data.data);

      // Pre-select current year
      const current = yRes.data.data.find((y: any) => y.isCurrent);
      if (current) setNewInvoiceData(d => ({ ...d, academicYearId: current.id || current._id }));
    } catch {
      // Silently fail
    }
  }, []);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);
  useEffect(() => { if (tab === 'defaulters') fetchDefaulters(); }, [tab, fetchDefaulters]);
  useEffect(() => { fetchDropdownData(); }, [fetchDropdownData]);

  // ─── Handlers ────────────────────────────────────────────────────────────

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const invoiceId = paymentModal.invoice?.id || paymentModal.invoice?._id;
      const amountPaise = Math.round(parseFloat(paymentData.amount) * 100);

      await api.post('/tenant/finance/collect', {
        invoiceId,
        ...paymentData,
        amount: amountPaise
      });

      toast.success('Payment recorded!');
      setPaymentModal({ open: false, invoice: null });

      // Download receipt immediately
      await handleDownloadReceipt(invoiceId);

      fetchInvoices();
      if (tab === 'defaulters') fetchDefaulters();
    } catch {
      toast.error('Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadReceipt = async (invoiceId: string) => {
    setDownloadingReceipt(invoiceId);
    try {
      const res = await api.get(`/tenant/finance/invoices/${invoiceId}/receipt`);
      const { invoice, transactions } = res.data.data;
      generateFeeReceipt({ invoice, transactions, schoolName: school?.name || 'School' });
    } catch {
      toast.error('Could not generate receipt');
    } finally {
      setDownloadingReceipt(null);
    }
  };

  const handleGenerateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneratingInvoice(true);
    try {
      await api.post('/tenant/finance/invoices/generate-student', {
        studentId: invoiceModal.studentId,
        academicYearId: newInvoiceData.academicYearId,
        categoryId: newInvoiceData.categoryId || undefined,
        description: newInvoiceData.description || newInvoiceData.categoryId ? undefined : 'One-time Fee',
        amount: Math.round(parseFloat(newInvoiceData.amount) * 100),
        dueDate: newInvoiceData.dueDate,
      });
      toast.success(`Invoice generated for ${invoiceModal.studentName}`);
      setInvoiceModal({ open: false, studentId: '', studentName: '' });
      setNewInvoiceData(d => ({ ...d, amount: '', description: '', categoryId: '' }));
      fetchDefaulters();
      fetchInvoices();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to generate invoice');
    } finally {
      setGeneratingInvoice(false);
    }
  };

  // ─── Filtered Lists ───────────────────────────────────────────────────────

  const filteredInvoices = invoices.filter(inv =>
    inv.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
    inv.studentId?.admissionNumber?.toLowerCase().includes(search.toLowerCase()) ||
    `${inv.studentId?.userId?.firstName} ${inv.studentId?.userId?.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  const filteredDefaulters = defaulters.filter(d =>
    `${d.user?.firstName} ${d.user?.lastName}`.toLowerCase().includes(defSearch.toLowerCase()) ||
    d.student?.admissionNumber?.toLowerCase().includes(defSearch.toLowerCase()) ||
    d.class?.displayName?.toLowerCase().includes(defSearch.toLowerCase())
  );

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Billing & Collections</h1>
          <p className="text-slate-500 font-medium">Manage student billing, payments, and fee defaulters.</p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 p-1.5 bg-card border border-white/5 rounded-2xl w-fit">
        {([
          { key: 'invoices', label: 'All Invoices', icon: FileText },
          { key: 'defaulters', label: 'Defaulters', icon: AlertTriangle },
        ] as { key: Tab; label: string; icon: any }[]).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              tab === t.key ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-foreground'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
            {t.key === 'defaulters' && defaulters.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black">
                {defaulters.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ── INVOICES TAB ───────────────────────────────────────────────────── */}
        {tab === 'invoices' && (
          <motion.div key="invoices" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-6">

            {/* Filters Row */}
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative group flex-1 min-w-[220px] max-w-sm">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Search by name or ID..."
                  className="w-full bg-card border border-white/5 rounded-2xl pl-12 pr-6 py-3.5 text-sm outline-none focus:border-primary/40 transition-all font-bold"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <select
                title="Filter Status"
                className="bg-card border border-white/5 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:border-primary/40"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="UNPAID">Unpaid</option>
                <option value="PARTIAL">Partial</option>
                <option value="PAID">Paid</option>
              </select>
            </div>

            {/* Table */}
            <div className="bg-card border border-white/5 rounded-[2rem] overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/5 border-b border-white/5">
                    <th className="px-7 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Student</th>
                    <th className="px-7 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Invoice</th>
                    <th className="px-7 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Total</th>
                    <th className="px-7 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Due</th>
                    <th className="px-7 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Status</th>
                    <th className="px-7 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loadingInvoices ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-7 py-5"><div className="h-4 bg-white/5 rounded w-32" /></td>
                        <td className="px-7 py-5"><div className="h-4 bg-white/5 rounded w-24" /></td>
                        <td className="px-7 py-5"><div className="h-4 bg-white/5 rounded w-16" /></td>
                        <td className="px-7 py-5"><div className="h-4 bg-white/5 rounded w-16" /></td>
                        <td className="px-7 py-5"><div className="h-4 bg-white/5 rounded w-16" /></td>
                        <td className="px-7 py-5 text-right"><div className="h-8 bg-white/5 rounded-xl w-24 ml-auto" /></td>
                      </tr>
                    ))
                  ) : filteredInvoices.map(inv => (
                    <tr key={inv.id || inv._id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-7 py-5">
                        <p className="font-bold text-sm">{inv.studentId?.userId?.firstName} {inv.studentId?.userId?.lastName}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">{inv.studentId?.admissionNumber}</p>
                      </td>
                      <td className="px-7 py-5">
                        <p className="font-bold text-sm">{inv.invoiceNumber}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">{new Date(inv.issuedDate).toLocaleDateString('en-IN')}</p>
                      </td>
                      <td className="px-7 py-5 font-bold text-slate-300">{formatCurrency(inv.totalAmount)}</td>
                      <td className="px-7 py-5 font-black text-rose-500">{formatCurrency(inv.dueAmount)}</td>
                      <td className="px-7 py-5">
                        <span className={statusBadge(inv.status)}>{inv.status}</span>
                      </td>
                      <td className="px-7 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Receipt download */}
                          <button
                            title="Download Receipt"
                            onClick={() => handleDownloadReceipt(inv.id || inv._id)}
                            disabled={downloadingReceipt === (inv.id || inv._id)}
                            className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-all"
                          >
                            {downloadingReceipt === (inv.id || inv._id)
                              ? <div className="w-4 h-4 border-2 border-slate-500 border-t-primary rounded-full animate-spin" />
                              : <Download className="w-4 h-4" />
                            }
                          </button>
                          {/* Collect / Paid */}
                          <Button
                            variant={inv.status === 'PAID' ? 'outline' : 'primary'}
                            className="rounded-xl px-4 py-2 text-xs"
                            disabled={inv.status === 'PAID'}
                            onClick={() => {
                              if (inv.status !== 'PAID') {
                                setPaymentModal({ open: true, invoice: inv });
                                setPaymentData(d => ({ ...d, amount: (inv.dueAmount / 100).toString() }));
                              }
                            }}
                          >
                            {inv.status === 'PAID' ? <CheckCircle2 className="w-3.5 h-3.5" /> : 'Collect'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!loadingInvoices && filteredInvoices.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-7 py-16 text-center text-slate-500 font-medium">
                        No invoices found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* ── DEFAULTERS TAB ─────────────────────────────────────────────────── */}
        {tab === 'defaulters' && (
          <motion.div key="defaulters" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-6">

            {/* Summary strip */}
            {defaulters.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    label: 'Total Defaulters', value: defaulters.length, color: 'text-rose-500',
                    icon: Users, bg: 'bg-rose-500/10', border: 'border-rose-500/20'
                  },
                  {
                    label: 'Total Outstanding',
                    value: formatCurrency(defaulters.reduce((s, d) => s + d.totalDue, 0)),
                    color: 'text-amber-500', icon: DollarSign, bg: 'bg-amber-500/10', border: 'border-amber-500/20'
                  },
                  {
                    label: 'Avg. Overdue Days',
                    value: `${Math.round(defaulters.reduce((s, d) => s + (d.overdueDays || 0), 0) / (defaulters.length || 1))} days`,
                    color: 'text-primary', icon: CalendarDays, bg: 'bg-primary/10', border: 'border-primary/20'
                  },
                  {
                    label: 'Unpaid Invoices',
                    value: defaulters.reduce((s, d) => s + d.invoiceCount, 0),
                    color: 'text-slate-300', icon: FileText, bg: 'bg-white/5', border: 'border-white/10'
                  },
                ].map((stat, i) => (
                  <div key={i} className={`p-5 rounded-2xl bg-card border ${stat.border} flex items-center gap-4`}>
                    <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{stat.label}</p>
                      <p className={`text-lg font-black ${stat.color}`}>{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Search */}
            <div className="relative group max-w-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search defaulters..."
                className="w-full bg-card border border-white/5 rounded-2xl pl-12 pr-6 py-3.5 text-sm outline-none focus:border-primary/40 transition-all font-bold"
                value={defSearch}
                onChange={e => setDefSearch(e.target.value)}
              />
            </div>

            {/* Defaulters Table */}
            <div className="bg-card border border-white/5 rounded-[2rem] overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/5 border-b border-white/5">
                    <th className="px-7 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Student</th>
                    <th className="px-7 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Class</th>
                    <th className="px-7 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Invoices</th>
                    <th className="px-7 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Overdue Days</th>
                    <th className="px-7 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Total Due</th>
                    <th className="px-7 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loadingDefaulters ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        {Array.from({ length: 6 }).map((__, j) => (
                          <td key={j} className="px-7 py-5"><div className="h-4 bg-white/5 rounded" /></td>
                        ))}
                      </tr>
                    ))
                  ) : filteredDefaulters.map(d => (
                    <tr key={d._id || d.student?._id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-7 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 font-black text-sm shrink-0">
                            {(d.user?.firstName?.[0] || '?').toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-sm">{d.user?.firstName} {d.user?.lastName}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase">{d.student?.admissionNumber}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-7 py-5 font-bold text-sm text-slate-300">
                        {d.class?.displayName || (d.class?.grade ? `Class ${d.class.grade}` : '—')}
                      </td>
                      <td className="px-7 py-5">
                        <span className="px-2.5 py-1 bg-rose-500/10 text-rose-500 rounded-lg text-[10px] font-black">
                          {d.invoiceCount} pending
                        </span>
                      </td>
                      <td className="px-7 py-5">
                        <span className={`font-bold text-sm ${(d.overdueDays || 0) > 30 ? 'text-rose-500' : d.overdueDays > 0 ? 'text-amber-500' : 'text-slate-400'}`}>
                          {d.overdueDays || 0} days
                        </span>
                      </td>
                      <td className="px-7 py-5 text-right font-black text-rose-500 text-lg">
                        {formatCurrency(d.totalDue)}
                      </td>
                      <td className="px-7 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            title="Generate Invoice"
                            onClick={() => setInvoiceModal({ open: true, studentId: d._id || d.student?._id, studentName: `${d.user?.firstName} ${d.user?.lastName}` })}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all text-xs font-bold"
                          >
                            <Plus className="w-3.5 h-3.5" /> New Invoice
                          </button>
                          <button
                            title="View Invoices"
                            onClick={() => { setTab('invoices'); setSearch(d.user?.firstName || ''); }}
                            className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-all"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!loadingDefaulters && filteredDefaulters.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-7 py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                          </div>
                          <p className="text-emerald-500 font-black">No fee defaulters!</p>
                          <p className="text-slate-500 text-sm font-medium">All students are up to date with their payments.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PAYMENT MODAL ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {paymentModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setPaymentModal({ open: false, invoice: null })} />
            <motion.form
              onSubmit={handlePayment}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative w-full max-w-lg bg-card border border-white/10 p-10 rounded-[3rem] shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <CreditCard className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black">Record Payment</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{paymentModal.invoice?.invoiceNumber}</p>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      {paymentModal.invoice?.studentId?.userId?.firstName} {paymentModal.invoice?.studentId?.userId?.lastName}
                    </p>
                  </div>
                </div>
                <button title="Close" type="button" onClick={() => setPaymentModal({ open: false, invoice: null })} className="p-2 hover:bg-white/5 rounded-xl text-slate-500">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Due amount pill */}
              <div className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-2xl flex items-center justify-between">
                <span className="text-sm font-bold text-slate-400">Balance Due</span>
                <span className="text-xl font-black text-rose-500">{formatCurrency(paymentModal.invoice?.dueAmount || 0)}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Input
                    label="Collection Amount (₹)"
                    type="number"
                    value={paymentData.amount}
                    onChange={e => setPaymentData({ ...paymentData, amount: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Payment Method</label>
                  <select
                    title="Payment Method"
                    className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-primary/40"
                    value={paymentData.paymentMethod}
                    onChange={e => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
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
                  onChange={e => setPaymentData({ ...paymentData, referenceId: e.target.value })}
                />
              </div>
              <Input
                label="Internal Notes"
                placeholder="e.g. Received by Parent"
                value={paymentData.notes}
                onChange={e => setPaymentData({ ...paymentData, notes: e.target.value })}
              />

              <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl flex items-center gap-2 text-xs text-primary font-bold">
                <Download className="w-4 h-4 shrink-0" />
                Receipt PDF will download automatically after payment.
              </div>

              <div className="flex gap-4 pt-2">
                <Button variant="outline" type="button" className="flex-1 py-6 rounded-2xl" onClick={() => setPaymentModal({ open: false, invoice: null })}>Cancel</Button>
                <Button type="submit" isLoading={submitting} className="flex-1 py-6 rounded-2xl font-black shadow-xl shadow-emerald-500/20 bg-emerald-500 hover:bg-emerald-600">
                  Verify & Collect
                </Button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* ── GENERATE INVOICE MODAL ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {invoiceModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setInvoiceModal({ open: false, studentId: '', studentName: '' })} />
            <motion.form
              onSubmit={handleGenerateInvoice}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative w-full max-w-md bg-card border border-white/10 p-8 rounded-[2.5rem] shadow-2xl space-y-5"
            >
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black">Generate Invoice</h3>
                  <p className="text-sm text-slate-400 font-medium truncate max-w-[200px]">{invoiceModal.studentName}</p>
                </div>
              </div>

              {/* Academic Year */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Academic Year</label>
                <select
                  title="Academic Year"
                  className="w-full bg-card border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-primary/50"
                  value={newInvoiceData.academicYearId}
                  onChange={e => setNewInvoiceData(d => ({ ...d, academicYearId: e.target.value }))}
                  required
                >
                  <option value="">Select Year</option>
                  {academicYears.map(y => (
                    <option key={y.id || y._id} value={y.id || y._id}>{y.name} {y.isCurrent ? '(Current)' : ''}</option>
                  ))}
                </select>
              </div>

              {/* Fee Category */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Fee Category (Optional)</label>
                <select
                  title="Fee Category"
                  className="w-full bg-card border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-primary/50"
                  value={newInvoiceData.categoryId}
                  onChange={e => setNewInvoiceData(d => ({ ...d, categoryId: e.target.value }))}
                >
                  <option value="">No Category</option>
                  {categories.map(c => (
                    <option key={c.id || c._id} value={c.id || c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <Input
                label="Description"
                placeholder="e.g. Exam Fee, Late Fee, Transport..."
                value={newInvoiceData.description}
                onChange={e => setNewInvoiceData(d => ({ ...d, description: e.target.value }))}
              />

              {/* Amount */}
              <Input
                label="Amount (₹)"
                type="number"
                placeholder="0.00"
                value={newInvoiceData.amount}
                onChange={e => setNewInvoiceData(d => ({ ...d, amount: e.target.value }))}
                required
              />

              {/* Due Date */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Due Date</label>
                <div className="relative">
                  <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="date"
                    className="w-full bg-card border border-white/5 rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-white outline-none focus:border-primary/50"
                    value={newInvoiceData.dueDate}
                    onChange={e => setNewInvoiceData(d => ({ ...d, dueDate: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <Button variant="outline" type="button" className="flex-1 py-5 rounded-2xl" onClick={() => setInvoiceModal({ open: false, studentId: '', studentName: '' })}>Cancel</Button>
                <Button type="submit" isLoading={generatingInvoice} className="flex-1 py-5 rounded-2xl font-black shadow-lg shadow-primary/20">
                  Generate
                </Button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
