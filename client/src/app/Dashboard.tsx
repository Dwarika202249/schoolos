import React from 'react';
import { 
  Users, 
  GraduationCap, 
  Building2, 
  IndianRupee,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const stats = [
  { name: 'Total Students', value: '1,248', icon: GraduationCap, change: '+4.75%', changeType: 'increase' },
  { name: 'Total Teachers', value: '84', icon: Users, change: '+2.1%', changeType: 'increase' },
  { name: 'Branches', value: '3', icon: Building2, change: '0%', changeType: 'neutral' },
  { name: 'Collection', value: '₹4.2M', icon: IndianRupee, change: '+12.5%', changeType: 'increase' },
];

export const Dashboard = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Overview</h1>
        <p className="text-slate-500 mt-1">Welcome back, Admin. Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="p-2 bg-slate-50 rounded-lg text-primary">
                <stat.icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                stat.changeType === 'increase' ? 'text-emerald-600' : 'text-slate-500'
              }`}>
                {stat.change}
                {stat.changeType === 'increase' ? <ArrowUpRight className="w-4 h-4" /> : null}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-slate-500">{stat.name}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 aspect-video bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center justify-center border-dashed border-2">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-slate-400 mt-2 font-medium">Fee Collection Trends (Coming Soon)</p>
          </div>
        </div>
        <div className="aspect-square bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center justify-center border-dashed border-2">
          <div className="text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-slate-400 mt-2 font-medium">Recent Activity</p>
          </div>
        </div>
      </div>
    </div>
  );
};
