import React from 'react';
import { Plus, Calendar, Layers, MapPin } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Table } from '../components/ui/Table';

export const AcademicConfig = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Academic Configuration</h1>
        <p className="text-slate-500 mt-1">Manage school structure, sessions and branches.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Academic Years */}
        <Card 
          title="Sessions" 
          subtitle="Define academic years"
          actions={<Button size="sm"><Plus className="w-4 h-4 mr-2" /> Add</Button>}
        >
          <Table 
            columns={[
              { header: 'Session Name', accessor: 'name' },
              { header: 'Status', accessor: (y: any) => y.isCurrent ? <span className="text-primary font-bold">Current</span> : 'Previous' },
              { header: '', accessor: () => <Button variant="ghost" size="sm">Edit</Button>, className: 'text-right' }
            ]}
            data={[
              { id: '1', name: '2024-25', isCurrent: true },
              { id: '2', name: '2023-24', isCurrent: false },
            ]}
          />
        </Card>

        {/* Classes/Sections */}
        <Card 
          title="Grades & Sections" 
          subtitle="Dynamic class structure"
          actions={<Button size="sm"><Plus className="w-4 h-4 mr-2" /> Add</Button>}
        >
          <Table 
            columns={[
              { header: 'Grade', accessor: 'grade' },
              { header: 'Section', accessor: 'section' },
              { header: 'Strength', accessor: 'strength' },
              { header: '', accessor: () => <Button variant="ghost" size="sm">Edit</Button>, className: 'text-right' }
            ]}
            data={[
              { id: '1', grade: 'Class 10', section: 'A', strength: '45/60' },
              { id: '2', grade: 'Class 10', section: 'B', strength: '42/60' },
              { id: '3', grade: 'Class 9', section: 'A', strength: '48/60' },
            ]}
          />
        </Card>
      </div>

      {/* Branches */}
      <Card 
        title="School Branches" 
        subtitle="Manage multiple campus locations"
        actions={<Button size="sm"><Plus className="w-4 h-4 mr-2" /> Add Branch</Button>}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-sm text-primary">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="px-2 py-1 bg-white border border-slate-100 rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-400">HQ</span>
            </div>
            <div>
              <h4 className="font-bold text-slate-900">Main Branch</h4>
              <p className="text-sm text-slate-500">North Campus, Delhi</p>
            </div>
            <Button variant="outline" size="sm" className="w-full">Manage Branch</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
