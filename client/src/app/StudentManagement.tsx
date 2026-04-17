import React from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Table } from '../components/ui/Table';
import { Input } from '../components/ui/Input';

interface Student {
  id: string;
  admissionNumber: string;
  name: string;
  grade: string;
  section: string;
  parentName: string;
  status: 'ACTIVE' | 'INACTIVE';
}

const mockStudents: Student[] = [
  { id: '1', admissionNumber: 'ADM2024001', name: 'Aarav Sharma', grade: '10', section: 'A', parentName: 'Rajesh Sharma', status: 'ACTIVE' },
  { id: '2', admissionNumber: 'ADM2024002', name: 'Isha Patel', grade: '9', section: 'B', parentName: 'Mahesh Patel', status: 'ACTIVE' },
  { id: '3', admissionNumber: 'ADM2024003', name: 'Vivaan Gupta', grade: '10', section: 'A', parentName: 'Sanjay Gupta', status: 'ACTIVE' },
];

export const StudentManagement = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Student Management</h1>
          <p className="text-slate-500 mt-1">Enroll, search and manage all students in your school.</p>
        </div>
        <Button className="sm:w-auto">
          <Plus className="w-5 h-5 mr-2" />
          Enroll New Student
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input 
            placeholder="Search students by name, ID or parent..." 
            icon={<Search className="w-5 h-5" />}
          />
        </div>
        <div className="flex gap-4">
          <Button variant="outline">
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </Button>
          <Button variant="secondary">
            Export
          </Button>
        </div>
      </div>

      {/* Student Table */}
      <Card className="p-0">
        <Table 
          columns={[
            { header: 'Admission ID', accessor: 'admissionNumber', className: 'font-bold text-slate-900' },
            { header: 'Student Name', accessor: 'name' },
            { header: 'Class', accessor: (s) => `Class ${s.grade} - ${s.section}` },
            { header: 'Parent Name', accessor: 'parentName' },
            { 
              header: 'Status', 
              accessor: (s) => (
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  s.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                }`}>
                  {s.status}
                </span>
              ) 
            },
            {
              header: '',
              accessor: () => (
                <Button variant="ghost" size="sm">Edit</Button>
              ),
              className: 'text-right'
            }
          ]}
          data={mockStudents}
        />
      </Card>
    </div>
  );
};
