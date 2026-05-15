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
  updateDoc, 
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { Plus, Trash2, Book, Code, FunctionSquare, Binary, Loader2, X, GraduationCap } from 'lucide-react';
import { motion } from 'motion/react';
import { ConfirmModal } from '../../components/common/ConfirmModal';

interface Subject {
  id: string;
  name: string;
  code: string;
  credit: number;
  teacher: string;
}

export default function Subjects() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form State
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [credit, setCredit] = useState(3);
  const [teacher, setTeacher] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Confirm Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const fetchSubjects = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, 'users', user.uid, 'subjects'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Subject[];
      setSubjects(data);
    } catch (error: any) {
      console.error("Error fetching subjects:", error.message || error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, [user]);

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || submitting) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'users', user.uid, 'subjects'), {
        name,
        code,
        credit,
        teacher,
        createdAt: serverTimestamp(),
      });
      console.log("Subject saved successfully");
      setShowAddModal(false);
      setName("");
      setCode("");
      setCredit(3);
      setTeacher("");
      fetchSubjects();
    } catch (error: any) {
      console.error("Error saving subject:", error.message || error);
      alert("Failed to save subject: " + (error.message || "Unknown error"));
    } finally {
      setSubmitting(false);
    }
  };

  const deleteSubject = async (id: string) => {
    setItemToDelete(id);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!user || !itemToDelete) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'subjects', itemToDelete));
      console.log("Document deleted successfully");
      setShowConfirmModal(false);
      setItemToDelete(null);
      fetchSubjects();
    } catch (error: any) {
      console.error("Error deleting subject:", error.message || error);
      alert("Failed to delete subject: " + error.message);
    }
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">Subject Organizer</h1>
          <p className="text-slate-400">Manage your courses and instructor information.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 py-3 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
        >
          <Plus size={20} /> Add Subject
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-20"><Loader2 className="animate-spin text-indigo-500" /></div>
        ) : subjects.length === 0 ? (
          <div className="col-span-full text-center py-20 opacity-50 italic">No subjects found. Add your first subject!</div>
        ) : (
          subjects.map(s => (
            <GlassCard key={s.id} className="border-white/5 bg-white/[0.02] p-6 hover:border-indigo-500/30 transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className="bg-indigo-500/10 p-3 rounded-xl">
                  <Book className="text-indigo-400 w-6 h-6" />
                </div>
                <button 
                  onClick={() => deleteSubject(s.id)}
                  className="p-2 hover:bg-rose-500/10 text-rose-500 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <h3 className="text-xl font-bold text-white mb-1">{s.name}</h3>
              <p className="text-xs text-indigo-400 font-black uppercase tracking-widest mb-4">{s.code}</p>
              
              <div className="space-y-3 pt-4 border-t border-white/5">
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <GraduationCap size={16} className="text-emerald-400" /> 
                  <span className="font-medium">{s.teacher}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <FunctionSquare size={16} className="text-amber-400" /> 
                  <span className="font-medium">{s.credit} Credits</span>
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md"
          >
            <GlassCard className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black">Add New Subject</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/5 rounded-full"><X size={20} /></button>
              </div>

              <form onSubmit={handleAddSubject} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Subject Name</label>
                  <input
                    type="text" required
                    className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4"
                    placeholder="e.g. Quantum Mechanics"
                    value={name} onChange={e => setName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Course Code</label>
                    <input
                      type="text" required
                      className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4"
                      placeholder="e.g. PHY-2301"
                      value={code} onChange={e => setCode(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Credits</label>
                    <input
                      type="number" required step="0.5"
                      className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4"
                      value={credit} onChange={e => setCredit(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Instructor / Teacher</label>
                  <input
                    type="text" required
                    className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4"
                    placeholder="Instructor Name"
                    value={teacher} onChange={e => setTeacher(e.target.value)}
                  />
                </div>

                <button 
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 mt-4"
                >
                  {submitting ? <Loader2 className="animate-spin" /> : <Plus size={18} />}
                  Save Subject
                </button>
              </form>
            </GlassCard>
          </motion.div>
        </div>
      )}

      <ConfirmModal
        isOpen={showConfirmModal}
        title="Confirm Delete"
        message="Are you sure you want to delete this subject?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowConfirmModal(false)}
      />
    </div>
  );
}
