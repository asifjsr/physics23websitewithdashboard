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
import { Plus, Trash2, FileText, Search, Loader2, X, MoreVertical, Edit3 } from 'lucide-react';
import { motion } from 'motion/react';
import { ConfirmModal } from '../../components/common/ConfirmModal';

interface Note {
  id: string;
  title: string;
  content: string;
  subject: string;
  date: string;
}

export default function Notes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [subject, setSubject] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Confirm Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const fetchNotes = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, 'users', user.uid, 'notes'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Note[];
      setNotes(data);
    } catch (error: any) {
      console.error("Error fetching notes:", error.message || error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [user]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || submitting) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'users', user.uid, 'notes'), {
        title,
        content,
        subject,
        createdAt: serverTimestamp(),
        date: new Date().toLocaleDateString(),
      });
      console.log("Note saved");
      setShowAddModal(false);
      setTitle("");
      setContent("");
      setSubject("");
      fetchNotes();
    } catch (error: any) {
      console.error("Error saving note:", error.message || error);
      alert("Failed to save note: " + (error.message || "Unknown error"));
    } finally {
      setSubmitting(false);
    }
  };

  const deleteNote = async (id: string) => {
    setItemToDelete(id);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!user || !itemToDelete) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'notes', itemToDelete));
      console.log("Document deleted successfully");
      setShowConfirmModal(false);
      setItemToDelete(null);
      fetchNotes();
    } catch (error: any) {
      console.error("Error deleting note:", error.message || error);
      alert("Failed to delete note: " + error.message);
    }
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-10">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">Course Notes</h1>
          <p className="text-slate-400">Digital space for your academic findings and lecture notes.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 py-3 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
        >
          <Plus size={20} /> Create Note
        </button>
      </header>

      <div className="flex flex-col md:flex-row gap-6 items-center mb-8">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
          <input 
            type="text"
            placeholder="Search notes by title or subject..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-20"><Loader2 className="animate-spin text-indigo-500" /></div>
        ) : filteredNotes.length === 0 ? (
          <div className="col-span-full text-center py-20 opacity-50 italic">
            {searchQuery ? "No notes matching your search." : "No notes yet. Start writing your first note!"}
          </div>
        ) : (
          filteredNotes.map(n => (
            <GlassCard key={n.id} className="border-white/5 bg-white/[0.02] p-8 hover:border-indigo-500/30 transition-all group overflow-visible">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2 block">{n.subject}</span>
                  <h3 className="text-2xl font-bold text-white">{n.title}</h3>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => deleteNote(n.id)}
                    className="p-2 hover:bg-rose-500/10 text-rose-500 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              
              <div className="text-sm text-slate-400 line-clamp-3 mb-6 font-medium leading-relaxed">
                {n.content}
              </div>
              
              <div className="flex items-center justify-between pt-6 border-t border-white/5">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <FileText size={14} />
                  {n.date}
                </div>
                <button className="text-xs font-bold text-indigo-400 hover:underline">Read More</button>
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
            className="w-full max-w-2xl"
          >
            <GlassCard className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black">Create Note</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/5 rounded-full"><X size={20} /></button>
              </div>

              <form onSubmit={handleAddNote} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Title</label>
                    <input
                      type="text" required
                      className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4"
                      placeholder="Lecture Title"
                      value={title} onChange={e => setTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Subject</label>
                    <input
                      type="text" required
                      className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4"
                      placeholder="e.g. Astrophysics"
                      value={subject} onChange={e => setSubject(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Content</label>
                  <textarea
                    rows={8} required
                    className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 resize-none"
                    placeholder="Write your notes here..."
                    value={content} onChange={e => setContent(e.target.value)}
                  />
                </div>

                <button 
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 mt-4"
                >
                  {submitting ? <Loader2 className="animate-spin" /> : <Plus size={18} />}
                  Save Note
                </button>
              </form>
            </GlassCard>
          </motion.div>
        </div>
      )}

      <ConfirmModal
        isOpen={showConfirmModal}
        title="Confirm Delete"
        message="Are you sure you want to delete this note?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowConfirmModal(false)}
      />
    </div>
  );
}
