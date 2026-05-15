import React, { useState, useEffect } from 'react';
import { GlassCard } from '../../components/common/GlassCard';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp,
  doc,
  getDoc
} from 'firebase/firestore';
import { 
  Wallet, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Loader2, 
  History, 
  DollarSign,
  TrendingUp,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  category: string;
  date: any;
  addedBy: string;
}

export default function ClassFund() {
  const { user, userData } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Subscription');

  const isCR = userData?.role === 'cr' || userData?.role === 'admin';

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  const fetchTransactions = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, 'classFund'), orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Transaction[];
      setTransactions(data);
    } catch (err) {
      console.error("Error fetching fund data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || submitting) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'classFund'), {
        amount: parseFloat(amount),
        type,
        description,
        category,
        date: serverTimestamp(),
        addedBy: userData?.name || user.email
      });
      setShowAddModal(false);
      setAmount('');
      setDescription('');
      fetchTransactions();
    } catch (err) {
      console.error("Error adding transaction:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const totalBalance = transactions.reduce((acc, curr) => {
    return curr.type === 'income' ? acc + curr.amount : acc - curr.amount;
  }, 0);

  const totalIncome = transactions.reduce((acc, curr) => curr.type === 'income' ? acc + curr.amount : acc, 0);
  const totalExpense = transactions.reduce((acc, curr) => curr.type === 'expense' ? acc + curr.amount : acc, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-indigo-500" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">Class Fund</h1>
          <p className="text-slate-400">Class Representative (CR) Money Management Portal.</p>
        </div>
        {isCR && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 py-3 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
          >
            <Plus size={20} /> Add Entry
          </button>
        )}
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="border-none bg-indigo-600">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-2xl">
              <Wallet className="text-white" size={24} />
            </div>
            <TrendingUp className="text-white/40" size={20} />
          </div>
          <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1">Total Balance</p>
          <h3 className="text-3xl font-black text-white">৳{totalBalance.toLocaleString()}</h3>
        </GlassCard>

        <GlassCard className="border-none bg-emerald-500/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-500/20 rounded-xl">
              <ArrowUpRight className="text-emerald-400" size={18} />
            </div>
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">Total Income</span>
          </div>
          <h3 className="text-2xl font-black text-white">৳{totalIncome.toLocaleString()}</h3>
        </GlassCard>

        <GlassCard className="border-none bg-rose-500/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-rose-500/20 rounded-xl">
              <ArrowDownLeft className="text-rose-400" size={18} />
            </div>
            <span className="text-rose-400 text-xs font-bold uppercase tracking-widest">Total Expense</span>
          </div>
          <h3 className="text-2xl font-black text-white">৳{totalExpense.toLocaleString()}</h3>
        </GlassCard>
      </div>

      {/* Transactions List */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <History size={18} className="text-slate-500" />
          <h2 className="text-xl font-bold text-white">Recent Transactions</h2>
        </div>

        <GlassCard className="p-0 border-none bg-white/[0.02] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Description</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Category</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-white/[0.01] transition-all group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white mb-0.5">{t.description}</span>
                        <span className="text-[10px] text-slate-500">Added by {t.addedBy}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-lg bg-white/5 text-[10px] font-bold text-slate-400 border border-white/5 capitalize">
                        {t.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {t.date?.seconds ? format(new Date(t.date.seconds * 1000), 'MMM d, yyyy') : 'Pending...'}
                    </td>
                    <td className={`px-6 py-4 text-right font-black ${
                      t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {t.type === 'income' ? '+' : '-'}৳{t.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500 italic">No transactions recorded yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md"
            >
              <GlassCard className="p-8 border-none bg-slate-900 shadow-2xl">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 rounded-xl">
                      <DollarSign className="text-indigo-400" size={20} />
                    </div>
                    <h3 className="text-2xl font-black text-white">Add Entry</h3>
                  </div>
                  <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/5 rounded-full text-slate-500"><X size={20} /></button>
                </div>

                <form onSubmit={handleAdd} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      type="button"
                      onClick={() => setType('income')}
                      className={`py-3 rounded-xl font-bold flex items-center justify-center gap-2 border-2 transition-all ${
                        type === 'income' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-transparent border-white/5 text-slate-500'
                      }`}
                    >
                      <ArrowUpRight size={18} /> Income
                    </button>
                    <button 
                      type="button"
                      onClick={() => setType('expense')}
                      className={`py-3 rounded-xl font-bold flex items-center justify-center gap-2 border-2 transition-all ${
                        type === 'expense' ? 'bg-rose-500/20 border-rose-500 text-rose-400' : 'bg-transparent border-white/5 text-slate-500'
                      }`}
                    >
                      <ArrowDownLeft size={18} /> Expense
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Amount (৳)</label>
                    <input 
                      type="number" required placeholder="0.00"
                      className="w-full bg-slate-950 border border-white/10 rounded-2xl py-4 px-6 text-white font-bold text-lg"
                      value={amount} onChange={e => setAmount(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Description</label>
                    <input 
                      type="text" required placeholder="e.g. Monthly Batch Fee"
                      className="w-full bg-slate-950 border border-white/10 rounded-2xl py-4 px-6 text-white"
                      value={description} onChange={e => setDescription(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Category</label>
                    <select 
                      className="w-full bg-slate-950 border border-white/10 rounded-2xl py-4 px-6 text-white appearance-none"
                      value={category} onChange={e => setCategory(e.target.value)}
                    >
                      <option>Subscription</option>
                      <option>Picnic</option>
                      <option>Industrial Tour</option>
                      <option>Equipment</option>
                      <option>Others</option>
                    </select>
                  </div>

                  <button 
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 mt-4 shadow-xl shadow-indigo-500/20 transition-all uppercase tracking-widest text-sm"
                  >
                    {submitting ? <Loader2 className="animate-spin" /> : <Plus size={18} />}
                    Record Transaction
                  </button>
                </form>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
