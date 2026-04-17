import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
  Users
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import api from '../utils/api';
import toast from 'react-hot-toast';

export const StaffManagement = () => {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredStaff = staff.filter(member => {
    const fullName = `${member.userId?.firstName} ${member.userId?.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) || 
           member.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
           member.designation.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Staff Directory</h1>
          <p className="text-slate-500 font-medium">Manage your educators and administrative team.</p>
        </div>
        <Link to="/staff/add">
          <Button className="shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
            <UserPlus className="w-5 h-5 mr-2" />
            Add Staff Member
          </Button>
        </Link>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Staff', value: staff.length, color: 'bg-blue-50 text-blue-600' },
          { label: 'Teachers', value: staff.filter(s => s.designation.includes('TEACHER')).length, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Admin/Support', value: staff.filter(s => !s.designation.includes('TEACHER')).length, color: 'bg-purple-50 text-purple-600' },
          { label: 'On Leave', value: 0, color: 'bg-rose-50 text-rose-600' },
        ].map((stat, i) => (
          <Card key={i} className="p-4 border-none shadow-sm flex items-center justify-between">
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">{stat.label}</span>
            <span className={`px-3 py-1 rounded-full text-lg font-black ${stat.color}`}>{stat.value}</span>
          </Card>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input 
            placeholder="Search by name, ID, or designation..." 
            className="pl-10 h-12 bg-white border-slate-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="h-12 border-slate-200 text-slate-600 bg-white">
          <Filter className="w-5 h-5 mr-2" />
          Filter
        </Button>
      </div>

      {/* Staff Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 bg-slate-100 rounded-3xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {filteredStaff.map((member) => (
            <Card key={member.id} className="group relative overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-3xl p-6 bg-white hover:-translate-y-1">
              {/* Profile Bar */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-2xl text-primary border-2 border-white shadow-sm overflow-hidden group-hover:scale-105 transition-transform">
                    {member.userId?.avatarUrl ? (
                      <img src={member.userId.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      member.userId?.firstName?.charAt(0)
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-lg group-hover:text-primary transition-colors">
                        {member.userId?.firstName} {member.userId?.lastName}
                      </h3>
                      <BadgeCheck className="w-4 h-4 text-blue-500" />
                    </div>
                    <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-1">{member.employeeId}</p>
                  </div>
                </div>
                <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400" aria-label="More options">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              {/* Roles & Designation */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Building2 className="w-4 h-4" />
                  </div>
                  {member.designation.replace(/_/g, ' ')}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <Calendar className="w-4 h-4" />
                  </div>
                  {member.employmentType.replace(/_/g, ' ')}
                </div>
              </div>

              {/* Contact Quick Bar */}
              <div className="flex items-center gap-4 pt-4 border-t border-slate-50">
                <a href={`mailto:${member.userId?.email}`} className="flex-1 py-2 bg-slate-50 hover:bg-primary/10 rounded-xl text-slate-400 hover:text-primary transition-colors flex justify-center" aria-label="Send email">
                  <Mail className="w-5 h-5" />
                </a>
                <a href={`tel:${member.emergencyContact?.phone}`} className="flex-1 py-2 bg-slate-50 hover:bg-primary/10 rounded-xl text-slate-400 hover:text-primary transition-colors flex justify-center" aria-label="Call emergency contact">
                  <Phone className="w-5 h-5" />
                </a>
                <Link to={`/staff/${member.id}`} className="flex-1 py-2 bg-slate-900 text-white rounded-xl shadow-lg shadow-slate-200 flex justify-center hover:bg-slate-800 transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredStaff.length === 0 && (
        <Card className="p-16 border-dashed border-2 flex flex-col items-center text-center bg-transparent">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
            <Users className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No staff found</h3>
          <p className="text-slate-500 max-w-sm mb-6">Start building your team by adding your first teacher or administrator.</p>
          <Link to="/staff/add">
            <Button>
              <UserPlus className="w-5 h-5 mr-2" />
              Add Staff Member
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
};
