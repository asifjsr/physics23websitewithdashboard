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
import { Calculator, Plus, Trash2, Edit2, Check, X, Loader2 } from 'lucide-react';
import { ConfirmModal } from '../../components/common/ConfirmModal';

interface BackupRecord {
  id: string;
  courseName: string;
  section1Ct1: number;
  section1Ct2: number;
  section1BestCt: number;
  section1Attendance: number;
  section2Ct1: number;
  section2Ct2: number;
  section2BestCt: number;
  section2Attendance: number;
  ctAverage: number;
  attendanceAverage: number;
  totalBackupMark: number;
}

export default function BackupCounter() {
  const { user } = useAuth();
  const [records, setRecords] = useState<BackupRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Confirm Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Form State
  const [courseName, setCourseName] = useState("");
  const [s1Ct1, setS1Ct1] = useState(0);
  const [s1Ct2, setS1Ct2] = useState(0);
  const [s1Att, setS1Att] = useState(0);
  const [s2Ct1, setS2Ct1] = useState(0);
  const [s2Ct2, setS2Ct2] = useState(0);
  const [s2Att, setS2Att] = useState(0);

  const fetchData = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, 'users', user.uid, 'backupRecords'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as BackupRecord[];
      setRecords(data);
    } catch (error) {
      console.error("Error fetching records:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const calculateBackup = () => {
    const section1BestCt = Math.max(s1Ct1, s1Ct2);
    const section2BestCt = Math.max(s2Ct1, s2Ct2);

    const ctAverage = (section1BestCt + section2BestCt) / 2;
    const attendanceAverage = (s1Att + s2Att) / 2;
    const totalBackupMark = ctAverage + attendanceAverage;

    return {
      section1BestCt,
      section2BestCt,
      ctAverage: Number(ctAverage.toFixed(2)),
      attendanceAverage: Number(attendanceAverage.toFixed(2)),
      totalBackupMark: Number(totalBackupMark.toFixed(2))
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || submitting) return;

    if (s1Ct1 < 0 || s1Ct1 > 30 || s1Ct2 < 0 || s1Ct2 > 30 || s2Ct1 < 0 || s2Ct1 > 30 || s2Ct2 < 0 || s2Ct2 > 30) {
      alert("CT marks must be between 0 and 30");
      return;
    }
    if (s1Att < 0 || s1Att > 10 || s2Att < 0 || s2Att > 10) {
      alert("Attendance marks must be between 0 and 10");
      return;
    }

    setSubmitting(true);
    const result = calculateBackup();

    const recordData = {
      courseName,
      section1Ct1: s1Ct1,
      section1Ct2: s1Ct2,
      section1BestCt: result.section1BestCt,
      section1Attendance: s1Att,
      section2Ct1: s2Ct1,
      section2Ct2: s2Ct2,
      section2BestCt: result.section2BestCt,
      section2Attendance: s2Att,
      ctAverage: result.ctAverage,
      attendanceAverage: result.attendanceAverage,
      totalBackupMark: result.totalBackupMark,
      updatedAt: serverTimestamp(),
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, 'users', user.uid, 'backupRecords', editingId), recordData);
        console.log("Backup record updated successfully");
      } else {
        await addDoc(collection(db, 'users', user.uid, 'backupRecords'), {
          ...recordData,
          createdAt: serverTimestamp(),
        });
        console.log("Backup record saved");
      }
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error("Error saving backup record:", error.message || error);
      alert("Failed to save record: " + (error.message || "Unknown error"));
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setCourseName("");
    setS1Ct1(0); setS1Ct2(0); setS1Att(0);
    setS2Ct1(0); setS2Ct2(0); setS2Att(0);
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    setItemToDelete(id);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!user || !itemToDelete) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'backupRecords', itemToDelete));
      console.log("Document deleted successfully");
      setShowConfirmModal(false);
      setItemToDelete(null);
      fetchData();
    } catch (error: any) {
      console.error("Error deleting backup record:", error.message || error);
      alert("Failed to delete record: " + error.message);
    }
  };

  const handleEdit = (record: BackupRecord) => {
    setEditingId(record.id);
    setCourseName(record.courseName);
    setS1Ct1(record.section1Ct1);
    setS1Ct2(record.section1Ct2);
    setS1Att(record.section1Attendance);
    setS2Ct1(record.section2Ct1);
    setS2Ct2(record.section2Ct2);
    setS2Att(record.section2Attendance);
  };

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-black text-white mb-2">Backup Counter</h1>
        <p className="text-slate-400">Calculate and store your CT & Attendance backup marks course-wise.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <GlassCard className="lg:col-span-1 border-none bg-white/[0.03]">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            {editingId ? <Edit2 className="text-amber-400" /> : <Plus className="text-indigo-400" />}
            {editingId ? "Edit Record" : "Add Course Record"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Course Name</label>
              <input
                type="text"
                required
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500"
                value={courseName}
                onChange={e => setCourseName(e.target.value)}
              />
            </div>

            <div className="space-y-4 border-t border-white/5 pt-4">
              <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest">Section 1</h3>
              <div className="grid grid-cols-2 gap-4">
                <InputGroup label="CT 1" value={s1Ct1} onChange={setS1Ct1} max={30} />
                <InputGroup label="CT 2" value={s1Ct2} onChange={setS1Ct2} max={30} />
              </div>
              <InputGroup label="Attendance" value={s1Att} onChange={setS1Att} max={10} />
            </div>

            <div className="space-y-4 border-t border-white/5 pt-4">
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest">Section 2</h3>
              <div className="grid grid-cols-2 gap-4">
                <InputGroup label="CT 1" value={s2Ct1} onChange={setS2Ct1} max={30} />
                <InputGroup label="CT 2" value={s2Ct2} onChange={setS2Ct2} max={30} />
              </div>
              <InputGroup label="Attendance" value={s2Att} onChange={setS2Att} max={10} />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="animate-spin" /> : editingId ? <Check size={18} /> : <Plus size={18} />}
                {editingId ? "Update" : "Save Record"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-white/5 hover:bg-white/10 px-4 rounded-xl transition-all"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </form>
        </GlassCard>

        {/* List Section */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="border-none bg-white/[0.03] overflow-x-auto no-scrollbar">
            <h2 className="text-xl font-bold mb-6">Saved Records</h2>
            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-indigo-500" /></div>
            ) : records.length === 0 ? (
              <p className="text-center py-10 text-slate-500 italic">No records saved yet.</p>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs uppercase text-slate-500 border-b border-white/5">
                    <th className="py-4 font-bold">Course</th>
                    <th className="py-4 font-bold">S1 Best</th>
                    <th className="py-4 font-bold">S2 Best</th>
                    <th className="py-4 font-bold">CT Avg</th>
                    <th className="py-4 font-bold">Att Avg</th>
                    <th className="py-4 font-bold">Backup</th>
                    <th className="py-4 font-bold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {records.map((r) => (
                    <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 font-bold text-white">{r.courseName}</td>
                      <td className="py-4">{r.section1BestCt}</td>
                      <td className="py-4">{r.section2BestCt}</td>
                      <td className="py-4 text-indigo-400 font-bold">{r.ctAverage}</td>
                      <td className="py-4 text-emerald-400 font-bold">{r.attendanceAverage}</td>
                      <td className="py-4">
                        <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 font-black">
                          {r.totalBackupMark}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleEdit(r)} className="p-2 hover:bg-amber-500/10 text-amber-500 rounded-lg transition-all"><Edit2 size={16} /></button>
                          <button onClick={() => handleDelete(r.id)} className="p-2 hover:bg-rose-500/10 text-rose-500 rounded-lg transition-all"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </GlassCard>

          {/* Quick Summary Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <GlassCard className="bg-indigo-600/5 border-none">
              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Total Average Backup</h4>
              <h2 className="text-3xl font-black text-white">
                {records.length > 0 ? (records.reduce((acc, r) => acc + r.totalBackupMark, 0) / records.length).toFixed(2) : "0.00"}
              </h2>
            </GlassCard>
            <GlassCard className="bg-emerald-600/5 border-none">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">Courses Tracked</h4>
              <h2 className="text-3xl font-black text-white">{records.length}</h2>
            </GlassCard>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirmModal}
        title="Confirm Delete"
        message="Are you sure you want to delete this backup record?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowConfirmModal(false)}
      />
    </div>
  );
}

function InputGroup({ label, value, onChange, max }: { label: string, value: number, onChange: (v: number) => void, max: number }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-slate-500 uppercase pl-1">{label}</label>
      <input
        type="number"
        min={0}
        max={max}
        className="w-full bg-black/20 border border-white/5 rounded-lg py-2 px-3 text-sm focus:border-indigo-500 outline-none"
        value={value}
        onChange={e => onChange(Number(e.target.value))}
      />
    </div>
  );
}
