import React, { useState, useEffect, useRef } from 'react';
import {
   Upload,
   FileSpreadsheet,
   ArrowRight,
   CheckCircle2,
   AlertCircle,
   ChevronRight,
   Table,
   Settings2,
   Database,
   Cpu,
   X,
   HardDriveUpload,
   ArrowLeft,
   Sparkles,
   Link2
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import * as XLSX from 'xlsx';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

type ImportStep = 'UPLOAD' | 'MAPPING' | 'RESOLUTION' | 'VALIDATION' | 'IMPORTING' | 'RESULT';

// BUG 5 FIX: Refined keywords to prevent cross-field conflicts
// Keywords are now more specific and ordered by priority
const SYSTEM_FIELDS = [
   { key: 'firstName', label: 'First Name', required: true, keywords: ['first_name', 'firstname', 'fname', 's.name', 'student_name', 'student name'] },
   { key: 'lastName', label: 'Last Name', required: false, keywords: ['surname', 'last_name', 'lastname', 'lname', 'family_name'] },
   { key: 'admissionNumber', label: 'Admission ID', required: false, keywords: ['adm_id', 'admission', 'admission_no', 'enroll', 'reg_no', 'registration'] },
   { key: 'rollNumber', label: 'Roll Number', required: false, keywords: ['roll_no', 'rollno', 'roll number', 'roll'] },
   { key: 'gender', label: 'Gender', required: false, keywords: ['gender', 'sex'] },
   { key: 'dateOfBirth', label: 'D.O.B', required: false, keywords: ['dob', 'date_of_birth', 'birth', 'birthdate'] },
   { key: 'guardianName', label: 'Guardian Name', required: true, keywords: ['father_name', 'mother_name', 'parent_name', 'guardian_name', 'father', 'mother', 'guardian'] },
   { key: 'guardianPhone', label: 'Guardian Phone', required: true, keywords: ['father_mobile', 'mother_mobile', 'parent_phone', 'guardian_phone', 'mobile', 'phone', 'contact'] },
   { key: 'guardianEmail', label: 'Guardian Email', required: false, keywords: ['parent_email', 'guardian_email', 'father_email', 'mother_email', 'email'] },
   { key: 'classId', label: 'Class/Group', required: true, keywords: ['grade-sec', 'grade_sec', 'class', 'grade', 'section', 'group'] },
   { key: 'city', label: 'City', required: false, keywords: ['city', 'town'] },
   { key: 'address', label: 'Address', required: false, keywords: ['address', 'street', 'location'] },
];

export const StudentBulkImport = ({ onClose, onComplete }: { onClose: () => void, onComplete: () => void }) => {
   const [step, setStep] = useState<ImportStep>('UPLOAD');
   const [rawData, setRawData] = useState<any[]>([]);
   const [headers, setHeaders] = useState<string[]>([]);
   const [mapping, setMapping] = useState<Record<string, string>>({});
   const [classMap, setClassMap] = useState<Record<string, string>>({});
   const [branches, setBranches] = useState<any[]>([]);
   const [classes, setClasses] = useState<any[]>([]);
   const [academicYears, setAcademicYears] = useState<any[]>([]);
   const [config, setConfig] = useState({ branchId: '', academicYearId: '' });
   const [importResult, setImportResult] = useState<any>(null);
   const [isProcessing, setIsProcessing] = useState(false);

   useEffect(() => {
      const loadPrerequisites = async () => {
         try {
            const [bRes, cRes, ayRes] = await Promise.all([
               api.get('/tenant/branches'),
               api.get('/tenant/classes'),
               api.get('/tenant/academic-years')
            ]);
            setBranches(bRes.data.data);
            setClasses(cRes.data.data);
            setAcademicYears(ayRes.data.data);

            // Auto-select current AY if available
            const currentAy = ayRes.data.data.find((ay: any) => ay.isCurrent);
            if (currentAy) setConfig(prev => ({ ...prev, academicYearId: currentAy._id || currentAy.id }));
            if (bRes.data.data.length > 0) setConfig(prev => ({ ...prev, branchId: bRes.data.data[0]._id || bRes.data.data[0].id }));
         } catch (e) {
            toast.error('Failed to prepare data environment.');
         }
      };
      loadPrerequisites();
   }, []);

   const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (evt) => {
         const bstr = evt.target?.result;
         const wb = XLSX.read(bstr, { type: 'binary' });
         const wsname = wb.SheetNames[0];
         const ws = wb.Sheets[wsname];

         // BUG 2 FIX: Use defval '' to ensure ALL columns appear even if first row has empty cells
         // Without this, columns like Parent_Email (empty in row 1) would disappear from headers
         const data = XLSX.utils.sheet_to_json(ws, { defval: '' });

         if (data.length === 0) {
            return toast.error('Source file is empty.');
         }

         // BUG 2 FIX: Collect headers from ALL rows to ensure no column is missed
         const headerSet = new Set<string>();
         data.forEach(row => {
            Object.keys(row as any).forEach(key => headerSet.add(key));
         });
         const fileHeaders = Array.from(headerSet);

         setRawData(data);
         setHeaders(fileHeaders);

         // Smart Mapping with refined keyword matching
         const initialMap: Record<string, string> = {};
         const usedHeaders = new Set<string>(); // Track consumed headers to avoid duplicates

         SYSTEM_FIELDS.forEach(field => {
            // First try: exact match (case-insensitive)
            let match = fileHeaders.find(h =>
               !usedHeaders.has(h) && h.toLowerCase() === field.label.toLowerCase()
            );

            // Second try: keyword match with priority to unconsumed headers
            if (!match) {
               match = fileHeaders.find(h =>
                  !usedHeaders.has(h) &&
                  field.keywords.some(k => h.toLowerCase().replace(/[\s_-]+/g, '') === k.replace(/[\s_-]+/g, ''))
               );
            }

            // Third try: partial keyword match (fallback)
            if (!match) {
               match = fileHeaders.find(h =>
                  !usedHeaders.has(h) &&
                  field.keywords.some(k => h.toLowerCase().includes(k))
               );
            }

            if (match) {
               initialMap[field.key] = match;
               usedHeaders.add(match);
            }
         });
         setMapping(initialMap);
         setStep('MAPPING');
      };
      reader.readAsBinaryString(file);
   };

   const startResolution = () => {
      // Collect all unique class values from the sheet
      const classHeader = mapping['classId'];
      if (!classHeader) return toast.error('Please map the Class column first.');

      // BUG 1 FIX: Trim all unique class identifiers AND include ALL of them in classMap
      const uniqueClasses = Array.from(
         new Set(
            rawData
               .map(row => row[classHeader]?.toString()?.trim())
               .filter(Boolean) as string[]
         )
      );
      const initialClassMap: Record<string, string> = {};

      // Auto-match classes by string similarity
      uniqueClasses.forEach(uc => {
         const cleanUc = uc.toLowerCase().trim().replace(/\s+/g, '');
         const match = classes.find((c: any) => {
            const displayLabel = (c.displayName || `${c.grade} - ${c.section}`).toLowerCase().trim();
            const compactLabel = displayLabel.replace(/\s+/g, '');
            return displayLabel === uc.toLowerCase().trim() || compactLabel === cleanUc;
         });

         if (match) {
            initialClassMap[uc] = match._id || match.id;
         } else {
            // BUG 1 FIX: Add ALL classes to map, including unmatched ones with '' value
            // This ensures they appear in the Resolution UI for manual mapping
            initialClassMap[uc] = '';
         }
      });

      setClassMap(initialClassMap);
      setStep('RESOLUTION');
   };

   const handleImport = async () => {
      try {
         setIsProcessing(true);
         setStep('IMPORTING');

         // BUG 4 FIX: Set 5 minute timeout for large imports
         // 600 sequential DB operations can take 30-90 seconds
         const response = await api.post('/students/bulk-import', {
            data: rawData,
            mapping,
            classMap,
            config
         }, {
            timeout: 300000 // 5 minutes
         });

         setImportResult(response.data.data);
         setStep('RESULT');
      } catch (e: any) {
         const serverError = e.response?.data?.error?.message;
         toast.error(serverError || 'Import protocol failed.');
         setStep('VALIDATION');
      } finally {
         setIsProcessing(false);
      }
   };

   return (
      <div className="p-6 lg:p-10 max-w-[1600px] mx-auto space-y-10 animate-in fade-in duration-700">
         <Card className="w-full bg-card/40 backdrop-blur-3xl border-white/20 shadow-2xl rounded-[3rem] overflow-hidden flex flex-col relative">

            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

            {/* Header Module */}
            <div className="p-8 border-b border-white/10 flex items-center justify-between">
               <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 text-primary shadow-inner">
                     <Cpu className="w-8 h-8 animate-pulse" />
                  </div>
                  <div>
                     <h2 className="text-3xl font-black text-foreground uppercase tracking-tight italic flex items-center gap-3">
                        Smart Mapping <span className="text-primary text-sm not-italic font-bold tracking-widest bg-primary/10 px-3 py-1 rounded-full border border-primary/20">V2.0 Core</span>
                     </h2>
                     <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">Enterprise Intelligence Onboarding Protocol</p>
                  </div>
               </div>
               <button
                  onClick={onClose}
                  title="Close Import Wizard"
                  className="p-4 hover:bg-white/5 rounded-2xl border border-transparent hover:border-white/10 transition-all text-slate-500 hover:text-white"
               >
                  <X className="w-6 h-6" />
               </button>
            </div>

            {/* Wizard Navigation / Progress */}
            <div className="px-8 py-4 bg-white/5 border-b border-white/5 flex items-center gap-12 overflow-x-auto no-scrollbar">
               {[
                  { id: 'UPLOAD', label: 'Source', icon: Upload },
                  { id: 'MAPPING', label: 'Logic', icon: Table },
                  { id: 'RESOLUTION', label: 'Sectors', icon: Link2 },
                  { id: 'VALIDATION', label: 'Preview', icon: CheckCircle2 }
               ].map((s, idx) => (
                  <div key={s.id} className={`flex items-center gap-3 shrink-0 transition-opacity ${step === s.id ? 'opacity-100' : 'opacity-40'}`}>
                     <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${step === s.id ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-white/10 text-slate-400'}`}>
                        {idx + 1}
                     </div>
                     <span className="text-[10px] font-black uppercase tracking-widest">{s.label}</span>
                     {idx < 3 && <ChevronRight className="w-4 h-4 text-slate-700" />}
                  </div>
               ))}
            </div>

            {/* Content Module */}
            <div className="flex-1 overflow-y-auto p-8 relative">
               <AnimatePresence mode="wait">

                  {/* STEP: UPLOAD */}
                  {step === 'UPLOAD' && (
                     <motion.div key="upload" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="h-full flex flex-col items-center justify-center space-y-10 max-w-2xl mx-auto text-center">
                        <div className="relative group">
                           <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full group-hover:bg-primary/40 transition-all duration-700" />
                           <div className="relative w-40 h-40 bg-card border-2 border-dashed border-white/20 rounded-[3rem] flex items-center justify-center hover:border-primary/50 transition-all cursor-pointer overflow-hidden shadow-2xl">
                              <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                                 <HardDriveUpload className="w-16 h-16 text-primary mb-4" />
                                 <input
                                    type="file"
                                    title="Upload Excel or CSV file"
                                    accept=".xlsx, .xls, .csv"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                 />
                              </label>
                           </div>
                        </div>
                        <div className="space-y-4">
                           <h3 className="text-3xl font-black text-foreground uppercase tracking-tight">Ingest Source Data</h3>
                           <p className="text-slate-400 font-medium leading-relaxed">
                              Drag and drop your school's existing Roster (CSV/Excel).
                              Our intelligence core will automatically attempt to normalize the schema for bulk synchronization.
                           </p>
                        </div>
                     </motion.div>
                  )}

                  {/* STEP: MAPPING */}
                  {step === 'MAPPING' && (
                     <motion.div key="mapping" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                        <div className="flex flex-col lg:flex-row gap-8 items-start">
                           <div className="flex-1 space-y-8">
                              <div className="flex items-center gap-3 border-l-4 border-primary pl-4">
                                 <Settings2 className="w-6 h-6 text-primary" />
                                 <h3 className="text-xl font-black text-foreground uppercase tracking-widest italic">Core Logic Alignment</h3>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 {SYSTEM_FIELDS.map(field => (
                                    <div key={field.key} className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3 group hover:border-primary/30 transition-all">
                                       <div className="flex justify-between items-center">
                                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                             {field.required && <span className="w-1 h-3 bg-rose-500 rounded-full" />}
                                             {field.label}
                                          </span>
                                          {mapping[field.key] ? (
                                             <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                          ) : (
                                             <AlertCircle className="w-4 h-4 text-slate-600" />
                                          )}
                                       </div>
                                       <select
                                          title={`Map ${field.label}`}
                                          value={mapping[field.key] || ''}
                                          onChange={(e) => setMapping(prev => ({ ...prev, [field.key]: e.target.value }))}
                                          className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-xs font-bold text-slate-200 focus:border-primary outline-none transition-all"
                                       >
                                          <option value="" disabled className="bg-slate-900">Select Source Column</option>
                                          {headers.map(h => (
                                             <option key={h} value={h} className="bg-slate-900">{h}</option>
                                          ))}
                                       </select>
                                    </div>
                                 ))}
                              </div>
                           </div>

                           {/* Global Config Sidebar */}
                           <Card className="w-full lg:w-80 p-8 border-white/20 bg-slate-900 shadow-2xl rounded-[2.5rem] space-y-8 sticky top-0">
                              <h4 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-3 border-b border-white/5 pb-4">
                                 <Database className="w-5 h-5 text-primary" /> Globals
                              </h4>

                              <div className="space-y-6">
                                 <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Target Branch</label>
                                    <select
                                       title="Target Branch"
                                       value={config.branchId}
                                       onChange={(e) => setConfig(p => ({ ...p, branchId: e.target.value }))}
                                       className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-xs font-bold text-slate-300"
                                    >
                                       {branches.map(b => <option key={b._id || b.id} value={b._id || b.id}>{b.name}</option>)}
                                    </select>
                                 </div>
                                 <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Academic Year</label>
                                    <select
                                       title="Academic Year"
                                       value={config.academicYearId}
                                       onChange={(e) => setConfig(p => ({ ...p, academicYearId: e.target.value }))}
                                       className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-xs font-bold text-slate-300"
                                    >
                                       {academicYears.map(ay => <option key={ay._id || ay.id} value={ay._id || ay.id}>{ay.name}</option>)}
                                    </select>
                                 </div>
                              </div>

                              <Button
                                 className="w-full h-16 rounded-2xl font-black uppercase text-xs tracking-widest mt-3"
                                 onClick={startResolution}
                              >
                                 Resolve Sectors <ArrowRight className="w-4 h-4 ml-2" />
                              </Button>
                           </Card>
                        </div>
                     </motion.div>
                  )}

                  {/* STEP: RESOLUTION */}
                  {step === 'RESOLUTION' && (
                     <motion.div key="resolution" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10">
                        <div className="max-w-4xl mx-auto space-y-8">
                           <div className="flex items-center gap-3 border-l-4 border-emerald-500 pl-4">
                              <Link2 className="w-6 h-6 text-emerald-500" />
                              <h3 className="text-xl font-black text-foreground uppercase tracking-widest italic">Sector Intelligence Sync</h3>
                           </div>
                           <p className="text-slate-400 font-medium bg-emerald-500/5 p-6 border border-emerald-500/10 rounded-3xl">
                              We detected <span className="text-emerald-400 font-black">{Object.keys(classMap).length}</span> unique class groupings in your source file.
                              {Object.values(classMap).filter(v => v).length > 0 && (
                                 <span> Auto-matched <span className="text-emerald-400 font-black">{Object.values(classMap).filter(v => v).length}</span> sectors.</span>
                              )}
                              {' '}Please map {Object.values(classMap).filter(v => !v).length > 0 ? 'the remaining' : 'all'} to SchoolOS Class-Section entities.
                           </p>

                           <div className="grid grid-cols-1 gap-4">
                              {Object.keys(classMap).map(uc => (
                                 <Card key={uc} className={`p-6 border-white/10 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all ${classMap[uc] ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20 hover:bg-rose-500/10'}`}>
                                    <div className="space-y-1">
                                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Excel Source Value</p>
                                       <p className="text-xl font-black text-white flex items-center gap-3">
                                          {uc}
                                          {classMap[uc] ? (
                                             <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                          ) : (
                                             <AlertCircle className="w-5 h-5 text-rose-400 animate-pulse" />
                                          )}
                                       </p>
                                    </div>
                                    <ArrowRight className="hidden md:block w-6 h-6 text-slate-700" />
                                    <div className="w-full md:w-80">
                                       <select
                                          title={`Map Class ${uc}`}
                                          value={classMap[uc] || ''}
                                          onChange={(e) => setClassMap(prev => ({ ...prev, [uc]: e.target.value }))}
                                          className={`w-full h-14 bg-black/60 border rounded-2xl px-6 text-sm font-bold focus:border-emerald-500 outline-none shadow-xl transition-all ${classMap[uc] ? 'border-emerald-500/30 text-emerald-400' : 'border-rose-500/30 text-rose-400'}`}
                                       >
                                          <option value="" disabled className="bg-slate-900">Map to System Sector</option>
                                          {classes.map((c: any) => (
                                             <option key={c._id || c.id} value={c._id || c.id} className="bg-slate-900">
                                                {c.displayName || `${c.grade} - ${c.section}`}
                                             </option>
                                          ))}
                                       </select>
                                    </div>
                                 </Card>
                              ))}
                           </div>

                           <div className="flex flex-col items-end gap-3 pt-10">
                              {Object.keys(classMap).some(uc => !classMap[uc]) && (
                                 <span className="text-rose-400 text-[10px] font-black uppercase tracking-widest animate-pulse">
                                    ⚠ {Object.keys(classMap).filter(uc => !classMap[uc]).length} sectors remaining to be mapped
                                 </span>
                              )}
                              <Button
                                 disabled={Object.keys(classMap).some(uc => !classMap[uc])}
                                 className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-white/10 disabled:text-slate-500 h-16 px-12 rounded-2xl font-black text-white shadow-xl shadow-emerald-500/20 transition-all"
                                 onClick={() => setStep('VALIDATION')}
                              >
                                 Final Verification <ChevronRight className="w-4 h-4 ml-2" />
                              </Button>
                           </div>
                        </div>
                     </motion.div>
                  )}

                  {/* STEP: VALIDATION */}
                  {step === 'VALIDATION' && (
                     <motion.div key="validation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-10">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-3 border-l-4 border-primary pl-4">
                              <Sparkles className="w-6 h-6 text-primary" />
                              <h3 className="text-xl font-black text-foreground uppercase tracking-widest italic">Ready for Ignition</h3>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                           <Card className="p-6 bg-white/5 border-white/10 rounded-3xl text-center">
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Payload Size</p>
                              <p className="text-4xl font-black text-white">{rawData.length}</p>
                           </Card>
                           <Card className="p-6 bg-white/5 border-white/10 rounded-3xl text-center">
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Fields Active</p>
                              <p className="text-4xl font-black text-primary">{Object.keys(mapping).length}</p>
                           </Card>
                           <Card className="p-6 bg-white/5 border-white/10 rounded-3xl text-center">
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Mapped Sectors</p>
                              <p className="text-4xl font-black text-emerald-500">{Object.keys(classMap).length}</p>
                           </Card>
                           <Card className="p-6 bg-white/5 border-white/10 rounded-3xl text-center">
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Siblings Estimates</p>
                              <p className="text-4xl font-black text-indigo-400">Scan Pending</p>
                           </Card>
                        </div>

                        <div className="flex flex-col items-center justify-center py-20 space-y-8 bg-card/20 rounded-[3rem] border-2 border-dashed border-white/5">
                           <Button
                              className="h-24 px-20 rounded-[2.5rem] text-xl font-black uppercase tracking-widest shadow-[0_0_50px_rgba(var(--primary),0.4)] hover:scale-105 transition-transform"
                              onClick={handleImport}
                           >
                              Execute Sync Protocol
                           </Button>
                           <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em] flex items-center gap-3">
                              <ShieldCheck className="w-4 h-4" /> Atomic Rollback & Zero-Trust Verification Active
                           </p>
                        </div>
                     </motion.div>
                  )}

                  {/* STEP: IMPORTING */}
                  {step === 'IMPORTING' && (
                     <div className="h-full flex flex-col items-center justify-center space-y-8">
                        <div className="w-32 h-32 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-[0_0_40px_rgba(var(--primary),0.5)]" />
                        <div className="text-center space-y-4">
                           <h3 className="text-2xl font-black text-foreground uppercase tracking-widest italic animate-pulse">Syncing Intel Modules...</h3>
                           <p className="text-slate-500 font-medium">Please do not disconnect. Processing sequential entries & building Parent Linkages.</p>
                           <p className="text-slate-600 text-xs font-bold uppercase tracking-widest">This may take 1-2 minutes for large datasets</p>
                        </div>
                     </div>
                  )}

                  {/* STEP: RESULT */}
                  {step === 'RESULT' && (
                     <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="h-full flex flex-col items-center justify-center max-w-4xl mx-auto space-y-12">
                        <div className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500 shadow-[0_0_60px_rgba(16,185,129,0.2)]">
                           <CheckCircle2 className="w-12 h-12" />
                        </div>
                        <div className="text-center space-y-4">
                           <h2 className="text-5xl font-black text-foreground tracking-tight uppercase italic">{importResult?.success} Records Synchronized</h2>
                           <p className="text-slate-400 font-medium">The bulk enrollment project has reached 100% parity with local source files.</p>
                        </div>

                        {importResult?.failed > 0 && (
                           <Card className="w-full p-8 border-rose-500/20 bg-rose-500/5 rounded-[2.5rem] space-y-4">
                              <div className="flex items-center gap-3 text-rose-500 font-black uppercase text-xs tracking-widest">
                                 <AlertCircle className="w-5 h-5" /> {importResult.failed} Anomalies Detected
                              </div>
                              <div className="max-h-40 overflow-y-auto space-y-2 pr-4 custom-scrollbar">
                                 {importResult.errors.map((err: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center text-[10px] font-bold p-3 bg-black/40 rounded-xl">
                                       <span className="text-slate-300">#{err.row} - {err.name}</span>
                                       <span className="text-rose-400">{err.reason}</span>
                                    </div>
                                 ))}
                              </div>
                           </Card>
                        )}

                        <Button className="h-16 px-12 rounded-2xl font-black uppercase tracking-widest" onClick={() => { onComplete(); onClose(); }}>
                           Return to Command Center
                        </Button>
                     </motion.div>
                  )}

               </AnimatePresence>
            </div>

            {/* Global Action Footer (Conditional) */}
            {['MAPPING', 'RESOLUTION', 'VALIDATION'].includes(step) && (
               <div className="px-8 py-6 border-t border-white/5 bg-black/20 flex justify-between items-center">
                  <button
                     title="Go back to previous step"
                     onClick={() => {
                        if (step === 'MAPPING') setStep('UPLOAD');
                        if (step === 'RESOLUTION') setStep('MAPPING');
                        if (step === 'VALIDATION') setStep('RESOLUTION');
                     }}
                     className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all"
                  >
                     <ArrowLeft className="w-4 h-4" /> Previous Phase
                  </button>
               </div>
            )}

         </Card>
      </div>
   );
};

// Internal Sub-components
const ShieldCheck = ({ className }: { className?: string }) => (
   <svg className={className} fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="m9 12 2 2 4-4" /></svg>
);
