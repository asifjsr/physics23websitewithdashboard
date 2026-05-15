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
import { Plus, Trash2, CheckSquare, Square, Calendar, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ConfirmModal } from '../../components/common/ConfirmModal';

interface Task {
  id: string;
  title: string;
  due: string;
  done: boolean;
  priority: 'High' | 'Medium' | 'Low';
}

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form State
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [submitting, setSubmitting] = useState(false);

  // Confirm Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const fetchTasks = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, 'users', user.uid, 'tasks'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Task[];
      setTasks(data);
    } catch (error: any) {
      console.error("Error fetching tasks:", error.message || error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || submitting) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'users', user.uid, 'tasks'), {
        title,
        due,
        priority,
        done: false,
        createdAt: serverTimestamp(),
      });
      console.log("Task saved");
      setShowAddModal(false);
      setTitle("");
      setDue("");
      setPriority('Medium');
      fetchTasks();
    } catch (error: any) {
      console.error("Error saving task:", error.message || error);
      alert("Failed to save task: " + (error.message || "Unknown error"));
    } finally {
      setSubmitting(false);
    }
  };

  const toggleTask = async (task: Task) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid, 'tasks', task.id), {
        done: !task.done
      });
      console.log("Task updated successfully");
      fetchTasks();
    } catch (error: any) {
      console.error("Error updating task:", error.message || error);
    }
  };

  const deleteTask = async (id: string) => {
    setItemToDelete(id);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!user || !itemToDelete) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'tasks', itemToDelete));
      console.log("Document deleted successfully");
      setShowConfirmModal(false);
      setItemToDelete(null);
      fetchTasks();
    } catch (error: any) {
      console.error("Error deleting task:", error.message || error);
      alert("Failed to delete task: " + error.message);
    }
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">Tasks & To-Dos</h1>
          <p className="text-slate-400">Stay organized and never miss a deadline.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 py-3 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
        >
          <Plus size={20} /> New Task
        </button>
      </header>

      <div className="max-w-3xl">
        <GlassCard className="border-none bg-white/[0.03]">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-500" /></div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-20 opacity-50 italic">No tasks found. Add your first task above!</div>
          ) : (
            <div className="space-y-4">
              {tasks.map(t => (
                <motion.div 
                  layout
                  key={t.id} 
                  className={`group p-4 rounded-2xl border transition-all flex items-center gap-4 ${
                    t.done ? 'bg-indigo-500/5 border-indigo-500/10 opacity-60' : 'bg-slate-900/50 border-white/5'
                  }`}
                >
                  <button 
                    onClick={() => toggleTask(t)}
                    className={`shrink-0 transition-colors ${t.done ? 'text-indigo-400' : 'text-slate-500 hover:text-indigo-400'}`}
                  >
                    {t.done ? <CheckSquare size={24} /> : <Square size={24} />}
                  </button>
                  <div className="flex-1">
                    <h4 className={`font-bold transition-all ${t.done ? 'line-through text-slate-500' : 'text-white'}`}>
                      {t.title}
                    </h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-[10px] text-slate-500 font-bold">
                        <Calendar size={12} /> {t.due}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter ${
                        t.priority === 'High' ? 'bg-rose-500/10 text-rose-500' : 
                        t.priority === 'Medium' ? 'bg-amber-500/10 text-amber-500' :
                        'bg-slate-500/10 text-slate-500'
                      }`}>
                        {t.priority}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => deleteTask(t.id)}
                    className="p-2 hover:bg-rose-500/10 text-rose-500 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </GlassCard>
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
                <h3 className="text-2xl font-black">Add New Task</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/5 rounded-full"><X size={20} /></button>
              </div>

              <form onSubmit={handleAddTask} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Task Title</label>
                  <input
                    type="text" required
                    className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4"
                    placeholder="What needs to be done?"
                    value={title} onChange={e => setTitle(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Due Date/Time</label>
                    <input
                      type="text" required
                      className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4"
                      placeholder="e.g. 5:00 PM"
                      value={due} onChange={e => setDue(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Priority</label>
                    <select
                      className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 appearance-none"
                      value={priority} onChange={e => setPriority(e.target.value as any)}
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 mt-4"
                >
                  {submitting ? <Loader2 className="animate-spin" /> : <Plus size={18} />}
                  Save Task
                </button>
              </form>
            </GlassCard>
          </motion.div>
        </div>
      )}

      <ConfirmModal
        isOpen={showConfirmModal}
        title="Confirm Delete"
        message="Are you sure you want to delete this task?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowConfirmModal(false)}
      />
    </div>
  );
}
