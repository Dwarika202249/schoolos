import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers,
  Plus,
  Settings2,
  CheckCircle2,
  Trash2,
  Edit2,
  AlertCircle,
  Building2,
  BookOpen,
  DollarSign
} from 'lucide-react';
import api from '../utils/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import toast from 'react-hot-toast';

export const FeeManagement = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [structures, setStructures] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showStructureModal, setShowStructureModal] = useState(false);

  const [newCategory, setNewCategory] = useState({ name: '', isMandatory: true });
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [newStructure, setNewStructure] = useState({
    categoryId: '',
    classId: '',
    academicYearId: '',
    amount: '',
    frequency: 'MONTHLY'
  });

  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; category: any }>({
    open: false,
    category: null
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    try {
      const [cats, structs, cls, years] = await Promise.all([
        api.get('/tenant/finance/categories'),
        api.get('/tenant/finance/structures'),
        api.get('/tenant/classes'),
        api.get('/tenant/academic-years')
      ]);
      setCategories(cats.data.data);
      setStructures(structs.data.data);
      setClasses(cls.data.data);
      setAcademicYears(years.data.data);
    } catch (error) {
      toast.error('Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        const categoryId = editingCategory._id || editingCategory.id;
        if (!categoryId) {
          toast.error('Invalid category identifier');
          return;
        }
        await api.patch(`/tenant/finance/categories/${categoryId}`, newCategory);
        toast.success('Category updated');
      } else {
        await api.post('/tenant/finance/categories', newCategory);
        toast.success('Fee category created');
      }
      setShowCategoryModal(false);
      setEditingCategory(null);
      setNewCategory({ name: '', isMandatory: true });
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save category');
    }
  };

  const handleCreateStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Convert amount to paise
      const payload = {
        ...newStructure,
        amount: Math.round(parseFloat(newStructure.amount) * 100)
      };
      await api.post('/tenant/finance/structures', payload);
      toast.success('Fee structure defined');
      setShowStructureModal(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to define structure');
    }
  };

  const handleDeleteCategory = async () => {
    const categoryId = deleteConfirm.category?._id || deleteConfirm.category?.id;
    if (!categoryId) {
      toast.error('Invalid category identifier');
      return;
    }

    setIsDeleting(true);
    try {
      await api.delete(`/tenant/finance/categories/${categoryId}`);
      toast.success('Category removed');
      setDeleteConfirm({ open: false, category: null });
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Delete failed');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return null;

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Fee Settings</h1>
          <p className="text-slate-500 font-medium">Define pricing and categories for your institution.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setShowCategoryModal(true)} className="rounded-2xl px-6 py-6 border-white/5 hover:bg-white/5">
            <Plus className="w-4 h-4 mr-2" /> New Category
          </Button>
          <Button onClick={() => {
            setEditingCategory(null);
            setNewCategory({ name: '', isMandatory: true });
            setShowStructureModal(true);
          }} className="rounded-2xl px-8 py-6 shadow-xl shadow-primary/20">
            <Settings2 className="w-4 h-4 mr-2" /> Configure Pricing
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Categories Section */}
        <section className="space-y-6">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Layers className="w-4 h-4" /> Active Categories
          </h3>
          <div className="grid gap-3">
            {categories.map((cat) => (
              <div key={cat.id || cat._id} className="p-5 rounded-3xl bg-card border border-white/5 flex items-center justify-between group hover:border-primary/20 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold">{cat.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">{cat.isMandatory ? 'Required for all' : 'Optional'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button
                    title="Edit Category"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingCategory(cat);
                      setNewCategory({ name: cat.name, isMandatory: cat.isMandatory });
                      setShowCategoryModal(true);
                    }}
                    className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    title="Delete Category"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirm({ open: true, category: cat });
                    }}
                    className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Structures Table */}
        <section className="space-y-6">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <BookOpen className="w-4 h-4" /> Class Pricing
          </h3>
          <div className="bg-card border border-white/5 rounded-[2rem] overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 border-b border-white/5">
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500">Class</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500">Category</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {structures.map((struct) => (
                  <tr key={struct.id || struct._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-slate-300">{struct.classId?.displayName || struct.classId?.name}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-300">{struct.categoryId?.name}</td>
                    <td className="px-6 py-4 text-sm font-black text-primary text-right">
                      {(struct.amount / 100).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
                {structures.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-slate-500 font-medium">
                      No pricing structures defined yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Category Modal */}
      <AnimatePresence>
        {showCategoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowCategoryModal(false)} />
            <motion.form
              onSubmit={handleSaveCategory}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative w-full max-w-md bg-card border border-white/10 p-8 rounded-[2.5rem] shadow-2xl space-y-6"
            >
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                  {editingCategory ? <Edit2 className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                </div>
                <h3 className="text-xl font-black">{editingCategory ? 'Edit Category' : 'Add Fee Category'}</h3>
              </div>
              <Input label="Category Name" placeholder="e.g. Tuition Fee" value={newCategory.name} onChange={e => setNewCategory({ ...newCategory, name: e.target.value })} required />
              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5 cursor-pointer" onClick={() => setNewCategory({ ...newCategory, isMandatory: !newCategory.isMandatory })}>
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${newCategory.isMandatory ? 'bg-primary border-primary' : 'border-slate-700'}`}>
                  {newCategory.isMandatory && <CheckCircle2 className="w-4 h-4 text-white" />}
                </div>
                <span className="text-sm font-bold">Mandatory for all students</span>
              </div>
              <div className="flex gap-4 pt-4">
                <Button variant="outline" type="button" className="flex-1 py-6 rounded-2xl" onClick={() => {
                  setShowCategoryModal(false);
                  setEditingCategory(null);
                  setNewCategory({ name: '', isMandatory: true });
                }}>Cancel</Button>
                <Button type="submit" className="flex-1 py-6 rounded-2xl font-black shadow-lg shadow-primary/20">{editingCategory ? 'Update' : 'Create'}</Button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* Structure Modal */}
      <AnimatePresence>
        {showStructureModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowStructureModal(false)} />
            <motion.form
              onSubmit={handleCreateStructure}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative w-full max-w-md bg-card border border-white/10 p-8 rounded-[2.5rem] shadow-2xl space-y-6"
            >
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                  <Settings2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black">Define Pricing</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-slate-500 ml-1">Academic Year</label>
                  <select
                    title="Academic Year"
                    className="w-full bg-card border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-primary/50 transition-all"
                    value={newStructure.academicYearId}
                    onChange={e => setNewStructure({ ...newStructure, academicYearId: e.target.value })}
                    required
                  >
                    <option value="">Select Year</option>
                    {academicYears.map((y) => <option key={y.id || y._id} value={y.id || y._id}>{y.name}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-slate-500 ml-1">Fee Category</label>
                  <select
                    title="Fee Category"
                    className="w-full bg-card border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-primary/50 transition-all"
                    value={newStructure.categoryId}
                    onChange={e => setNewStructure({ ...newStructure, categoryId: e.target.value })}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => <option key={c.id || c._id} value={c.id || c._id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-slate-500 ml-1">Target Class</label>
                  <select
                    title="Class"
                    className="w-full bg-card border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-primary/50 transition-all"
                    value={newStructure.classId}
                    onChange={e => setNewStructure({ ...newStructure, classId: e.target.value })}
                    required
                  >
                    <option value="">Select Class</option>
                    {classes.map((c) => <option key={c.id || c._id} value={c.id || c._id}>{c.displayName}</option>)}
                  </select>
                </div>

                <Input
                  label="Amount (Per Month)"
                  type="number"
                  placeholder="5000"
                  value={newStructure.amount}
                  onChange={e => setNewStructure({ ...newStructure, amount: e.target.value })}
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button variant="outline" type="button" className="flex-1 py-6 rounded-2xl" onClick={() => setShowStructureModal(false)}>Cancel</Button>
                <Button type="submit" className="flex-1 py-6 rounded-2xl font-black shadow-lg shadow-primary/20">Save Rule</Button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={deleteConfirm.open}
        onClose={() => !isDeleting && setDeleteConfirm({ open: false, category: null })}
        onConfirm={handleDeleteCategory}
        isLoading={isDeleting}
        title="Remove Fee Category?"
        message={`Are you sure you want to delete "${deleteConfirm.category?.name}"? You cannot delete categories that are already linked to active pricing rules.`}
        confirmText="Remove Category"
      />
    </div>
  );
};
