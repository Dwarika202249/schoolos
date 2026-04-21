import React, { useState, useEffect } from 'react';
import {
  Users,
  GraduationCap,
  IndianRupee,
  TrendingDown,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  BellRing,
  Activity,
  Sparkles,
  CalendarCheck,
  ClipboardX,
  RefreshCw,
  ArrowDownRight,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { TeacherDashboard } from './TeacherDashboard';

interface DashboardStats {
  students: { total: number; active: number; inactive: number };
  attendance: {
    totalClasses: number;
    classesMarkedToday: number;
    classesNotMarked: number;
    presentToday: number;
    absentToday: number;
    lateToday: number;
    attendancePercent: number | null;
  };
  finance: {
    totalIncome: number;
    totalOutstanding: number;
    defaulterCount: number;
    pendingInvoiceCount: number;
  };
  recentTransactions: any[];
}

const formatCurrency = (paise: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(paise / 100);

const formatCurrencyShort = (paise: number) => {
  const rupees = paise / 100;
  if (rupees >= 10000000) return `₹${(rupees / 10000000).toFixed(1)}Cr`;
  if (rupees >= 100000) return `₹${(rupees / 100000).toFixed(1)}L`;
  if (rupees >= 1000) return `₹${(rupees / 1000).toFixed(1)}K`;
  return `₹${rupees.toFixed(0)}`;
};

export const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await api.get('/tenant/dashboard/stats');
      setStats(res.data.data);
    } catch (error) {
      // Silently fail — show skeleton with zeros
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getBriefingText = () => {
    if (!stats) return 'Loading institutional intelligence...';
    const parts: string[] = [];
    if (stats.attendance.classesNotMarked > 0) {
      parts.push(`${stats.attendance.classesNotMarked} class${stats.attendance.classesNotMarked > 1 ? 'es' : ''} haven't marked attendance yet today`);
    } else if (stats.attendance.classesMarkedToday > 0) {
      parts.push(`All ${stats.attendance.classesMarkedToday} classes have marked attendance today`);
    }
    if (stats.finance.defaulterCount > 0) {
      parts.push(`${stats.finance.defaulterCount} outstanding invoices totalling ${formatCurrencyShort(stats.finance.totalOutstanding)}`);
    }
    if (parts.length === 0) return 'All systems nominal. No pending alerts.';
    return parts.join('. ') + '.';
  };

  const kpis = stats ? [
    {
      label: 'Monthly Realized',
      value: formatCurrencyShort(stats.finance.totalIncome),
      sub: `${stats.finance.pendingInvoiceCount} invoices pending`,
      icon: IndianRupee,
      color: 'text-emerald-500',
      hoverBorder: 'hover:border-emerald-500/40',
      glow: 'bg-emerald-500/10',
      badge: <span className="text-emerald-500 font-bold text-xs flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Total Collected</span>
    },
    {
      label: 'Outstanding Dues',
      value: formatCurrencyShort(stats.finance.totalOutstanding),
      sub: `${stats.finance.defaulterCount} defaulters`,
      icon: AlertTriangle,
      color: 'text-rose-500',
      hoverBorder: 'hover:border-rose-500/40',
      glow: 'bg-rose-500/10',
      badge: <Link to="/finance/invoices" className="text-rose-400 font-bold text-xs flex items-center gap-1 hover:text-rose-300 transition-colors"><ArrowUpRight className="w-3 h-3" /> View Invoices</Link>
    },
    {
      label: 'Today Attendance',
      value: stats.attendance.attendancePercent !== null ? `${stats.attendance.attendancePercent}%` : '—',
      sub: `${stats.attendance.presentToday} present · ${stats.attendance.absentToday} absent`,
      icon: CalendarCheck,
      color: 'text-primary',
      hoverBorder: 'hover:border-primary/40',
      glow: 'bg-primary/10',
      badge: stats.attendance.classesNotMarked > 0
        ? <span className="text-amber-400 font-bold text-xs flex items-center gap-1"><ClipboardX className="w-3 h-3" /> {stats.attendance.classesNotMarked} classes unmarked</span>
        : <span className="text-emerald-500 font-bold text-xs flex items-center gap-1"><Activity className="w-3 h-3" /> All classes marked</span>
    },
    {
      label: 'Total Enrollment',
      value: stats.students.total.toLocaleString(),
      sub: `${stats.students.active} active · ${stats.students.inactive} inactive`,
      icon: GraduationCap,
      color: 'text-slate-300',
      hoverBorder: 'hover:border-white/20',
      glow: 'bg-white/5',
      badge: <Link to="/students" className="text-slate-400 font-bold text-xs flex items-center gap-1 hover:text-white transition-colors"><Users className="w-3 h-3" /> View Roster</Link>
    },
  ] : [];

  if (user?.role === 'TEACHER') {
    return <TeacherDashboard />;
  }

  return (
    <div className="p-6 lg:p-10 max-w-[1600px] mx-auto space-y-10 animate-in fade-in duration-700">

      {/* Header & Morning Briefing */}
      <div className="flex flex-col lg:flex-row justify-between gap-8">
        <div>
          <h1 className="text-4xl lg:text-5xl font-black text-foreground tracking-tight uppercase italic drop-shadow-sm">Command Center</h1>
          <p className="text-slate-400 font-medium text-sm mt-2 tracking-wide">
            {greeting()}, <span className="text-white font-bold">{user?.firstName}</span>. Metrics updated in real-time.
          </p>
        </div>

        <div className="flex-1 max-w-2xl bg-primary/10 border border-primary/20 p-6 rounded-3xl flex items-start gap-4">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-1">Morning Briefing</h3>
            <p className="text-slate-300 font-medium leading-relaxed">
              {getBriefingText()}
            </p>
          </div>
          <button
            onClick={() => fetchStats(true)}
            title="Refresh"
            className="p-2 text-primary/60 hover:text-primary transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-8 border-white/10 bg-card/40 backdrop-blur-xl rounded-[2.5rem] min-h-[220px] animate-pulse">
              <div className="h-4 w-24 bg-white/10 rounded mb-4" />
              <div className="h-10 w-32 bg-white/10 rounded" />
            </Card>
          ))
        ) : kpis.map((kpi, i) => (
          <Card key={i} className={`p-8 border-white/10 shadow-2xl shadow-black/60 bg-card/40 backdrop-blur-xl rounded-[2.5rem] relative overflow-hidden group ${kpi.hoverBorder} transition-all duration-300 min-h-[220px] flex flex-col justify-between`}>
            <div className={`absolute top-0 right-0 w-32 h-32 ${kpi.glow} blur-3xl rounded-full group-hover:scale-150 transition-all duration-700`} />
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className={`text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ${kpi.color === 'text-rose-500' ? 'text-rose-500/80' : ''}`}>
                  {kpi.label}
                </p>
                <p className={`text-4xl font-black tracking-tighter mt-1 ${kpi.color}`}>
                  {kpi.value}
                </p>
              </div>
              <div className={`w-12 h-12 ${kpi.glow} rounded-2xl flex items-center justify-center ${kpi.color} shadow-inner border border-white/10`}>
                <kpi.icon className="w-6 h-6" />
              </div>
            </div>
            <div className="flex flex-col gap-2 mt-4 border-t border-white/5 pt-4 relative z-10">
              <p className="text-slate-500 text-xs font-medium">{kpi.sub}</p>
              {kpi.badge}
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Attendance Pulse Card */}
        <Card className="xl:col-span-2 p-10 border-white/10 shadow-2xl shadow-black/60 bg-card/40 backdrop-blur-xl rounded-[3rem]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-foreground uppercase tracking-widest italic">Today's Attendance Pulse</h3>
              <p className="text-slate-500 text-sm font-medium mt-1">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <Link to="/attendance" className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
              Open Roster <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="h-32 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          ) : stats ? (
            <div className="space-y-6">
              {/* Big attendance meter */}
              <div className="flex items-center gap-6">
                <div className="relative w-28 h-28 shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                    <circle
                      cx="50" cy="50" r="40" fill="none"
                      stroke="hsl(var(--primary))" strokeWidth="12"
                      strokeDasharray={`${(stats.attendance.attendancePercent ?? 0) * 2.513} 251.3`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-2xl font-black text-foreground">
                      {stats.attendance.attendancePercent ?? '—'}
                      {stats.attendance.attendancePercent !== null && <span className="text-sm">%</span>}
                    </span>
                  </div>
                </div>
                <div className="flex-1 grid grid-cols-3 gap-4">
                  {[
                    { label: 'Present', val: stats.attendance.presentToday, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { label: 'Absent', val: stats.attendance.absentToday, color: 'text-rose-500', bg: 'bg-rose-500/10' },
                    { label: 'Late', val: stats.attendance.lateToday, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                  ].map((s) => (
                    <div key={s.label} className={`p-4 rounded-2xl ${s.bg} text-center`}>
                      <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* Classes marked progress */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                  <span>Classes Marked Today</span>
                  <span>{stats.attendance.classesMarkedToday} / {stats.attendance.totalClasses}</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-700"
                    style={{ width: `${stats.attendance.totalClasses ? (stats.attendance.classesMarkedToday / stats.attendance.totalClasses) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          ) : null}
        </Card>

        {/* Recent Activity */}
        <Card className="p-8 border-white/10 shadow-2xl shadow-black/60 bg-card/40 backdrop-blur-xl rounded-[3rem]">
          <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-6">
            <BellRing className="w-5 h-5 text-slate-400" />
            <h3 className="text-lg font-black text-foreground uppercase tracking-widest italic">Recent Collections</h3>
          </div>
          <div className="space-y-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-4 animate-pulse">
                  <div className="w-8 h-8 rounded-xl bg-white/10 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-white/10 rounded w-3/4" />
                    <div className="h-2 bg-white/5 rounded w-1/2" />
                  </div>
                </div>
              ))
            ) : stats?.recentTransactions.length === 0 ? (
              <div className="py-8 text-center text-slate-600 font-medium text-sm">
                No transactions recorded yet.
              </div>
            ) : stats?.recentTransactions.map((tx: any, i: number) => (
              <div key={tx.id || tx._id || i} className="flex gap-4 group cursor-pointer hover:bg-white/5 p-3 -mx-3 rounded-2xl transition-all">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${tx.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                  {tx.type === 'INCOME' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-300 truncate">{tx.notes || tx.category?.replace(/_/g, ' ')}</p>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-0.5">
                    {new Date(tx.transactionDate || tx.createdAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
                <p className={`text-sm font-black shrink-0 ${tx.type === 'INCOME' ? 'text-emerald-500' : 'text-slate-400'}`}>
                  {formatCurrencyShort(tx.amount)}
                </p>
              </div>
            ))}
          </div>
          {stats && stats.recentTransactions.length > 0 && (
            <Link to="/finance" className="mt-6 block text-center text-xs font-black text-primary/60 hover:text-primary uppercase tracking-widest transition-colors">
              View Full Ledger →
            </Link>
          )}
        </Card>
      </div>
    </div>
  );
};
