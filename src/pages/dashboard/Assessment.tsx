import React, { useState, useEffect } from 'react';
import { GlassCard } from '../../components/common/GlassCard';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { Plus, Trash2, Calendar, FileText, User, Loader2, X, Link as LinkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { ConfirmModal } from '../../components/common/ConfirmModal';

interface Assessment {
  id: string;
  courseName: string;
  section: string;
  teacherName: string;
  date: string;
  materialLink: string;
  createdAt: any;
}

export default function Assessment() {
  const { user, userData } = useAuth();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Confirm Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    courseName: '',
    section: '',
    teacherName: '',
    date: '',
    materialLink: ''
  });

  const isCR = userData?.role === 'cr' || userData?.role === 'admin';

  useEffect(() => {
    const q = query(collection(db, 'assessments'), orderBy('date', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Assessment[];
      setAssessments(data);
      setLoading(false);
    }, (error) => {
      console.error("Assessment sync error:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || submitting) return;
    setSubmitting(true);

    try {
      await addDoc(collection(db, 'assessments'), {
        ...formData,
        createdAt: serverTimestamp(),
        addedBy: userData?.name || user.email
      });
      setShowAddModal(false);
      setFormData({ courseName: '', section: '', teacherName: '', date: '', materialLink: '' });
    } catch (error) {
      console.error("Error adding assessment:", error);
      alert("Failed to add assessment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!isCR) return;
    setItemToDelete(id);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteDoc(doc(db, 'assessments', itemToDelete));
      console.log("Document deleted successfully");
      setShowConfirmModal(false);
      setItemToDelete(null);
    } catch (error: any) {
      console.error("Delete error:", error);
      alert("Delete failed: " + error.message);
    }
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">Assessments & CTs</h1>
          <p className="text-slate-400">Class Test schedules, materials, and teacher info.</p>
        </div>
        {isCR && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 py-3 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
          >
            <Plus size={20} /> Add Assessment
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assessments.map((item) => (
          <GlassCard key={item.id} className="border-none bg-white/[0.03] group relative">
            {isCR && (
              <button 
                onClick={() => handleDelete(item.id)}
                className="absolute top-4 right-4 p-2 bg-rose-500/10 text-rose-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white"
              >
                <Trash2 size={14} />
              </button>
            )}
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-500/20 rounded-2xl">
                  <FileText className="text-indigo-400" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-white uppercase tracking-tight">{item.courseName}</h3>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Section {item.section}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                    <User size={10} /> TEACHER
                  </p>
                  <p className="text-xs text-slate-300 font-bold">{item.teacherName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                    <Calendar size={10} /> DATE
                  </p>
                  <p className="text-xs text-slate-300 font-bold">{item.date}</p>
                </div>
              </div>

              {item.materialLink && (
                <a 
                  href={item.materialLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 hover:bg-indigo-600 transition-all rounded-xl text-xs font-bold text-white border border-white/5"
                >
                  <LinkIcon size={14} /> View Study Materials
                </a>
              )}
            </div>
          </GlassCard>
        ))}
        {assessments.length === 0 && !loading && (
          <div className="col-span-full py-20 text-center text-slate-600 italic border-2 border-dashed border-white/5 rounded-3xl">
            No assessments or CTs scheduled yet.
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md"
          >
            <GlassCard className="p-8 border-none bg-slate-900 shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-white">New Assessment</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/5 rounded-full text-slate-500"><X size={20} /></button>
              </div>

              <form onSubmit={handleAdd} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Course Name</label>
                    <input 
                      type="text" required placeholder="e.g. Physics II"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-white"
                      value={formData.courseName} onChange={e => setFormData({...formData, courseName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Section</label>
                    <input 
                      type="text" required placeholder="A/B"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-white"
                      value={formData.section} onChange={e => setFormData({...formData, section: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Teacher Name</label>
                  <input 
                    type="text" required placeholder="Full Name"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-white"
                    value={formData.teacherName} onChange={e => setFormData({...formData, teacherName: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">CT Date</label>
                  <input 
                    type="date" required
                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-white"
                    value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Material Link (Optional)</label>
                  <input 
                    type="url" placeholder="Google Drive/PDF link"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-white font-mono text-xs"
                    value={formData.materialLink} onChange={e => setFormData({...formData, materialLink: e.target.value})}
                  />
                </div>

                <button 
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 mt-4 shadow-xl shadow-indigo-500/20"
                >
                  {submitting ? <Loader2 className="animate-spin" /> : <Plus size={18} />}
                  Add Record
                </button>
              </form>
            </GlassCard>
          </motion.div>
        </div>
      )}

      <ConfirmModal
        isOpen={showConfirmModal}
        title="Confirm Delete"
        message="Are you sure you want to delete this assessment record?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowConfirmModal(false)}
      />
    </div>
  );
}
