import React, { useState, useEffect } from 'react';
import { GlassCard } from '../../components/common/GlassCard';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, X, Trash2, Camera, Loader2, Image as ImageIcon } from 'lucide-react';
import { ConfirmModal } from '../../components/common/ConfirmModal';

const CATEGORIES = ["All", "Class", "CT", "Tour", "Event", "Random"];

interface AlbumImage {
  id: string;
  category: string;
  src: string;
  title: string;
  addedBy?: string;
  createdAt?: any;
}

export default function Album() {
  const { userData } = useAuth();
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedImage, setSelectedImage] = useState<null | AlbumImage>(null);
  const [images, setImages] = useState<AlbumImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Confirm Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    src: '',
    category: 'Class'
  });

  const isCR = userData?.role === 'cr' || userData?.role === 'admin';

  useEffect(() => {
    const q = query(collection(db, 'album'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as AlbumImage[];
      setImages(data);
      setLoading(false);
    }, (error) => {
      console.error("Album sync error:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCR || submitting) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'album'), {
        ...formData,
        createdAt: serverTimestamp(),
        addedBy: userData?.name || 'Admin'
      });
      setShowAddModal(false);
      setFormData({ title: '', src: '', category: 'Class' });
    } catch (error) {
      console.error("Error adding to album:", error);
      alert("Failed to add image.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!isCR) return;
    setItemToDelete(id);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteDoc(doc(db, 'album', itemToDelete));
      console.log("Document deleted successfully");
      setShowConfirmModal(false);
      setItemToDelete(null);
    } catch (error: any) {
      console.error("Delete error:", error);
      alert("Delete failed: " + error.message);
    }
  };

  const filtered = activeCategory === "All" 
    ? images 
    : images.filter(img => img.category === activeCategory);

  return (
    <div className="pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter">Memories Captured</h1>
            <p className="text-slate-400 font-medium">Digital gallery for Physics 23 - Tachyon.</p>
          </div>
          {isCR && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 py-3 px-6 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-500/20"
            >
              <Plus size={20} /> Add Memory
            </button>
          )}
        </header>
        
        <div className="flex flex-wrap gap-2 mb-10 overflow-x-auto no-scrollbar pb-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-semibold transition-all border shrink-0",
                activeCategory === cat 
                  ? "bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-500/20" 
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-indigo-500" size={40} />
            <p className="text-slate-500 font-bold animate-pulse">Developing memories...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filtered.map((img) => (
                <motion.div
                  key={img.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => setSelectedImage(img)}
                  className="cursor-pointer group relative"
                >
                  <GlassCard className="p-0 overflow-hidden group border-none bg-white/[0.02]">
                    <div className="relative aspect-video overflow-hidden">
                      <img 
                        src={img.src} 
                        alt={img.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-white lg:text-lg">{img.title}</span>
                          <span className="text-[10px] text-slate-300 flex items-center gap-1">
                            <Camera size={10} /> By {img.addedBy || 'Member'}
                          </span>
                        </div>
                      </div>
                      
                      {isCR && (
                        <button 
                          onClick={(e) => handleDelete(e, img.id)}
                          className="absolute top-4 right-4 p-2 bg-rose-500/80 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-600"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <div className="p-4 flex justify-between items-center bg-white/[0.01]">
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">{img.category}</span>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {filtered.length === 0 && !loading && (
          <div className="col-span-full py-32 text-center text-slate-600 italic border-2 border-dashed border-white/5 rounded-[40px]">
             Gallery is empty for this category.
          </div>
        )}

        {/* Add Modal */}
        <AnimatePresence>
          {showAddModal && (
            <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md">
                <GlassCard className="p-8 border-none bg-slate-900 shadow-2xl">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black text-white">Add Memory</h2>
                    <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/5 rounded-full"><X /></button>
                  </div>
                  
                  <form onSubmit={handleAdd} className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Title / Occasion</label>
                      <input 
                        required type="text" value={formData.title}
                        onChange={e => setFormData({...formData, title: e.target.value})}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-white"
                        placeholder="e.g. Picnic at Cox's Bazar"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Image URL</label>
                      <input 
                        required type="url" value={formData.src}
                        onChange={e => setFormData({...formData, src: e.target.value})}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-white font-mono text-xs"
                        placeholder="Paste direct image link..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
                      <select 
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value})}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-white"
                      >
                        {CATEGORIES.filter(c => c !== "All").map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <button 
                      type="submit" disabled={submitting}
                      className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 rounded-2xl font-black text-white flex items-center justify-center gap-2 mt-4 shadow-xl shadow-indigo-500/20"
                    >
                      {submitting ? <Loader2 className="animate-spin" /> : <ImageIcon size={20} />}
                      Post Memory
                    </button>
                  </form>
                </GlassCard>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Lightbox */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImage(null)}
              className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 md:p-10"
            >
              <button 
                className="absolute top-8 right-8 p-3 bg-white/5 hover:bg-white/10 rounded-full text-white z-10"
                onClick={() => setSelectedImage(null)}
              >
                <X size={32} />
              </button>

              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative max-w-5xl w-full"
                onClick={e => e.stopPropagation()}
              >
                <img 
                  src={selectedImage.src} 
                  alt={selectedImage.title} 
                  className="w-full h-auto max-h-[80vh] object-contain rounded-2xl shadow-2xl" 
                />
                <div className="mt-8 text-center">
                  <h2 className="text-3xl font-black text-white mb-2">{selectedImage.title}</h2>
                  <div className="flex items-center justify-center gap-4 text-slate-400">
                    <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-bold text-indigo-400 uppercase tracking-widest">{selectedImage.category}</span>
                    <span className="text-xs">Added by {selectedImage.addedBy || 'Member'}</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ConfirmModal
          isOpen={showConfirmModal}
          title="Confirm Delete"
          message="Are you sure you want to delete this memory from the album?"
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowConfirmModal(false)}
        />
      </div>
    </div>
  );
}
