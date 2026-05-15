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
  onSnapshot
} from 'firebase/firestore';
import { Plus, Trash2, Clock, Calendar, Loader2, X, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import { ConfirmModal } from '../../components/common/ConfirmModal';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: any, operationType: OperationType, path: string | null) {
  console.error(`Firestore ${operationType} error at ${path}:`, error);
}

interface RoutineItem {
  id: string;
  day: string;
  subject: string;
  time: string;
  room: string;
  date?: string;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function Routine() {
  const { user } = useAuth();
  const [items, setItems] = useState<RoutineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form State
  const [day, setDay] = useState("Monday");
  const [subject, setSubject] = useState("");
  const [time, setTime] = useState("");
  const [room, setRoom] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Confirm Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'routines'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as RoutineItem[];
      data.sort((a, b) => a.time.localeCompare(b.time));
      setItems(data);
      setLoading(false);
    }, (error) => {
      console.error("Routine sync error:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || submitting) return;

    setSubmitting(true);
    try {
        await addDoc(collection(db, 'users', user.uid, 'routines'), {
          day,
          subject,
          time,
          room,
          createdAt: serverTimestamp(),
        });
        setShowAddModal(false);
        setSubject("");
        setTime("");
        setRoom("");
      } catch (error: any) {
      console.error("Error saving routine:", error.message || error);
      alert("Failed to save routine: " + (error.message || "Unknown error"));
    } finally {
      setSubmitting(false);
    }
  };

  const deleteItem = async (id: string) => {
    setItemToDelete(id);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!user || !itemToDelete) return;
    
    const path = `users/${user.uid}/routines/${itemToDelete}`;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'routines', itemToDelete));
      console.log("Document deleted successfully");
      setShowConfirmModal(false);
      setItemToDelete(null);
    } catch (error: any) {
      handleFirestoreError(error, OperationType.DELETE, path);
      alert("Failed to delete item: " + error.message);
    }
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">Class Routine</h1>
          <p className="text-slate-400">Your weekly academic schedule at a glance.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 py-3 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
        >
          <Plus size={20} /> Add Schedule
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        {DAYS.map(d => {
          const dayItems = items.filter(i => i.day === d);
          return (
            <div key={d} className="space-y-4">
              <div className="text-center py-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">{d.substring(0, 3)}</span>
              </div>
              
              <div className="space-y-3">
                {dayItems.length === 0 ? (
                  <div className="text-[10px] text-center py-4 text-slate-600 italic">No classes</div>
                ) : (
                  dayItems.map(item => (
                    <GlassCard key={item.id} className="p-3 bg-white/[0.02] border-white/5 relative group overflow-visible">
                      <button 
                        onClick={() => deleteItem(item.id)}
                        className="absolute top-1 right-1 p-1 bg-rose-500/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-600 shadow-lg"
                      >
                        <X size={10} />
                      </button>
                      <h4 className="text-xs font-bold text-white truncate mb-2">{item.subject}</h4>
                      {item.date && (
                        <div className="flex items-center gap-1.5 text-[9px] text-indigo-300 font-bold mb-1">
                          <Calendar size={10} /> {item.date}
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-[9px] text-slate-500 mb-1">
                        <Clock size={10} className="text-indigo-400" /> {item.time}
                      </div>
                      <div className="flex items-center gap-1.5 text-[9px] text-slate-500">
                        <MapPin size={10} className="text-emerald-400" /> {item.room}
                      </div>
                    </GlassCard>
                  ))
                )}
              </div>
            </div>
          );
        })}
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
                <h3 className="text-2xl font-black">Add Schedule</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/5 rounded-full"><X size={20} /></button>
              </div>

              <form onSubmit={handleAddItem} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Day</label>
                  <select 
                    className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 appearance-none"
                    value={day} onChange={e => setDay(e.target.value)}
                  >
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Subject</label>
                  <input
                    type="text" required
                    className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4"
                    placeholder="e.g. Thermodynamics"
                    value={subject} onChange={e => setSubject(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Time</label>
                    <input
                      type="text" required
                      className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4"
                      placeholder="e.g. 10:00 AM"
                      value={time} onChange={e => setTime(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Room</label>
                    <input
                      type="text" required
                      className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4"
                      placeholder="Room No"
                      value={room} onChange={e => setRoom(e.target.value)}
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 mt-4"
                >
                  {submitting ? <Loader2 className="animate-spin" /> : <Plus size={18} />}
                  Save Schedule
                </button>
              </form>
            </GlassCard>
          </motion.div>
        </div>
      )}

      <ConfirmModal
        isOpen={showConfirmModal}
        title="Confirm Delete"
        message="Are you sure you want to delete this entry from your routine?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowConfirmModal(false)}
      />
    </div>
  );
}
