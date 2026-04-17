import React from 'react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { User, Phone, Mail, MapPin, Calendar, CreditCard } from 'lucide-react';

export const StudentEnrollment = () => {
  return (
    <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">New Enrollment</h1>
        <p className="text-slate-500 mt-1">Register a new student and create their portal account.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Personal Information */}
          <Card title="Personal Details" subtitle="Basic identity information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="First Name" placeholder="e.g. Rahul" icon={<User className="w-5 h-5" />} />
              <Input label="Last Name" placeholder="e.g. Kumar" />
              <Input label="Date of Birth" type="date" icon={<Calendar className="w-5 h-5" />} />
              <Select 
                label="Gender" 
                options={[
                  { label: 'Select Gender', value: '' },
                  { label: 'Male', value: 'MALE' },
                  { label: 'Female', value: 'FEMALE' },
                  { label: 'Other', value: 'OTHER' }
                ]} 
              />
              <Select 
                label="Blood Group" 
                options={[
                  { label: 'Unknown', value: 'Unknown' },
                  { label: 'A+', value: 'A+' },
                  { label: 'O+', value: 'O+' },
                  { label: 'B+', value: 'B+' }
                ]} 
              />
              <Input label="Nationality" placeholder="Indian" />
            </div>
          </Card>

          {/* Academic Placement */}
          <Card title="Academic Placement" subtitle="Branch and class assignment">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select 
                label="Target Branch" 
                options={[{ label: 'Main Branch', value: 'main' }]} 
              />
              <Select 
                label="Admission Class" 
                options={[
                  { label: 'Class 10 - A', value: '10-A' },
                  { label: 'Class 10 - B', value: '10-B' },
                  { label: 'Class 9 - A', value: '9-A' }
                ]} 
              />
              <Input label="Admission Number" placeholder="Auto-generated if empty" icon={<CreditCard className="w-5 h-5" />} />
              <Input label="Admission Date" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
          </Card>

          {/* Contact Details */}
          <Card title="Contact & Address" subtitle="Residential and communication details">
            <div className="space-y-6">
              <Input label="Address Line 1" placeholder="House no, Street..." icon={<MapPin className="w-5 h-5" />} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input label="City" placeholder="New Delhi" />
                <Input label="State" placeholder="Delhi" />
                <Input label="Pincode" placeholder="110001" />
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar for Account & Actions */}
        <div className="space-y-8">
          <Card title="Portal Account" subtitle="Student login credentials">
            <div className="space-y-6">
              <Input label="Account Email" placeholder="student@school.com" icon={<Mail className="w-5 h-5" />} />
              <Input label="Initial Password" type="password" placeholder="••••••••" />
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-xs text-amber-700 font-medium leading-relaxed">
                  Student will be prompted to change this password on their first login.
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-slate-900 border-none">
            <div className="space-y-4">
              <Button className="w-full py-4 text-base" size="lg">Complete Enrollment</Button>
              <Button variant="ghost" className="w-full text-slate-400 hover:text-white hover:bg-slate-800">Save Draft</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
