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
  orderBy,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { Plus, Trash2, CheckCircle2, Circle, Loader2, X } from 'lucide-react';
import { motion } from 'motion/react';
import { ConfirmModal } from '../../components/common/ConfirmModal';

interface Chapter {
  title: string;
  done: boolean;
}

interface StudySubject {
  id: string;
  name: string;
  chapters: Chapter[];
}

export default function StudyTracker() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<StudySubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSubName, setNewSubName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Confirm Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const fetchSubjects = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, 'users', user.uid, 'studyProgress'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as StudySubject[];
      setSubjects(data);
    } catch (error: any) {
      console.error("Error fetching study progress:", error.message || error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, [user]);

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || submitting || !newSubName.trim()) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'users', user.uid, 'studyProgress'), {
        name: newSubName,
        chapters: [],
        createdAt: serverTimestamp(),
      });
      console.log("Study subject saved successfully");
      setShowAddModal(false);
      setNewSubName("");
      fetchSubjects();
    } catch (error: any) {
      console.error("Error saving subject:", error.message || error);
    } finally {
      setSubmitting(false);
    }
  };

  const addChapter = async (subjectId: string) => {
    const title = prompt("Enter chapter name:");
    if (!title || !user) return;

    try {
      const subRef = doc(db, 'users', user.uid, 'studyProgress', subjectId);
      await updateDoc(subRef, {
        chapters: arrayUnion({ title, done: false })
      });
      console.log("Chapter added successfully");
      fetchSubjects();
    } catch (error: any) {
      console.error("Error adding chapter:", error.message || error);
    }
  };

  const toggleChapter = async (subjectId: string, chapterIndex: number) => {
    if (!user) return;
    try {
      const subject = subjects.find(s => s.id === subjectId);
      if (!subject) return;

      const updatedChapters = [...subject.chapters];
      updatedChapters[chapterIndex].done = !updatedChapters[chapterIndex].done;

      await updateDoc(doc(db, 'users', user.uid, 'studyProgress', subjectId), {
        chapters: updatedChapters
      });
      console.log("Chapter status updated");
      fetchSubjects();
    } catch (error: any) {
      console.error("Error toggling chapter:", error.message || error);
    }
  };

  const deleteSubject = async (id: string) => {
    setItemToDelete(id);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!user || !itemToDelete) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'studyProgress', itemToDelete));
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
          <h1 className="text-3xl font-black text-white mb-2">Study Tracker</h1>
          <p className="text-slate-400">Monitor your syllabus progress subject-wise.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 py-3 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
        >
          <Plus size={20} /> New Subject
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-20"><Loader2 className="animate-spin text-indigo-500" /></div>
        ) : subjects.length === 0 ? (
          <div className="col-span-full text-center py-20 opacity-50 italic">No study subjects tracked yet.</div>
        ) : (
          subjects.map(s => {
            const completed = s.chapters.filter(c => c.done).length;
            const total = s.chapters.length;
            const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

            return (
              <GlassCard key={s.id} className="border-none bg-white/[0.03]">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-bold">{s.name}</h3>
                  <button 
                    onClick={() => deleteSubject(s.id)}
                    className="text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                      <span className="text-slate-500">Overall Progress</span>
                      <span className="text-indigo-400">{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  <div className="pt-4 space-y-3 max-h-[200px] overflow-y-auto no-scrollbar">
                    {s.chapters.map((ch, i) => (
                      <div 
                        key={i} 
                        onClick={() => toggleChapter(s.id, i)}
                        className="flex items-center gap-3 group cursor-pointer"
                      >
                        {ch.done ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Circle size={18} className="text-slate-600 group-hover:text-indigo-400" />}
                        <span className={`text-sm transition-all ${ch.done ? 'text-slate-300' : 'text-slate-500'}`}>{ch.title}</span>
                      </div>
                    ))}
                    {s.chapters.length === 0 && (
                      <div className="text-xs text-slate-600 italic py-2">No chapters added.</div>
                    )}
                  </div>

                  <button 
                    onClick={() => addChapter(s.id)}
                    className="w-full py-3 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 rounded-xl text-xs font-bold transition-all mt-4 border border-indigo-500/10"
                  >
                    Add Chapter
                  </button>
                </div>
              </GlassCard>
            )
          })
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm"
          >
            <GlassCard className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black">New Subject</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/5 rounded-full"><X size={20} /></button>
              </div>

              <form onSubmit={handleAddSubject} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Subject Name</label>
                  <input
                    type="text" required autoFocus
                    className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4"
                    placeholder="e.g. Algorithms"
                    value={newSubName} onChange={e => setNewSubName(e.target.value)}
                  />
                </div>

                <button 
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 mt-4"
                >
                  {submitting ? <Loader2 className="animate-spin" /> : <Plus size={18} />}
                  Add Subject
                </button>
              </form>
            </GlassCard>
          </motion.div>
        </div>
      )}

      <ConfirmModal
        isOpen={showConfirmModal}
        title="Confirm Delete"
        message="Are you sure you want to delete this subject and all its progress?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowConfirmModal(false)}
      />
    </div>
  );
}
