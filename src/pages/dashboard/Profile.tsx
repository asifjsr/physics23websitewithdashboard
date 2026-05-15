import React, { useState } from 'react';
import { GlassCard } from '../../components/common/GlassCard';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { User, Mail, Shield, Building, GraduationCap, Calendar, Edit3, Camera, Save, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Profile() {
  const { user, userData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: userData?.name || '',
    photoURL: userData?.photoURL || '',
    phone: userData?.phone || '',
    rollId: userData?.rollId || '',
    bio: userData?.bio || ''
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        ...formData,
        updatedAt: new Date()
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">My Profile</h1>
          <p className="text-slate-400">View and update your personal batch information.</p>
        </div>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-500/20"
          >
            <Edit3 size={18} /> Edit Profile
          </button>
        )}
      </header>

      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <GlassCard className="text-center p-8 bg-indigo-600/5 border-none relative overflow-hidden">
              <div className="relative z-10">
                <div className="w-32 h-32 rounded-full mx-auto mb-6 relative group border-4 border-white/5 p-1">
                  {userData?.photoURL || formData.photoURL ? (
                    <img 
                      src={formData.photoURL || userData?.photoURL} 
                      alt="Profile" 
                      className="w-full h-full rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-indigo-600 flex items-center justify-center font-black text-4xl">
                      {userData?.name?.charAt(0) || <User size={40} />}
                    </div>
                  )}
                  {isEditing && (
                    <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="text-white" size={24} />
                    </div>
                  )}
                </div>
                <h2 className="text-xl font-bold text-white mb-1">{userData?.name || 'Loading...'}</h2>
                <div className="inline-block px-3 py-1 rounded-full bg-indigo-500/10 text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">
                  {userData?.role || 'Student'}
                </div>
                
                <div className="space-y-4 pt-6 border-t border-white/5 text-left">
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <Mail size={14} className="text-indigo-400 shrink-0" /> 
                    <span className="truncate">{userData?.email}</span>
                  </div>
                  {userData?.phone && (
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <User size={14} className="text-indigo-400 shrink-0" /> 
                      <span>{userData.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          </div>

          <div className="md:col-span-2 space-y-6">
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <GlassCard className="bg-white/[0.03] border-none p-8">
                    <form onSubmit={handleUpdate} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase">Full Name</label>
                          <input 
                            type="text" value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-white text-sm"
                            placeholder="Your Name"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase">Profile Picture URL</label>
                          <input 
                            type="url" value={formData.photoURL}
                            onChange={e => setFormData({...formData, photoURL: e.target.value})}
                            className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-white text-sm"
                            placeholder="https://example.com/photo.jpg"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase">Phone Number</label>
                          <input 
                            type="text" value={formData.phone}
                            onChange={e => setFormData({...formData, phone: e.target.value})}
                            className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-white text-sm"
                            placeholder="+8801..."
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase">Roll ID</label>
                          <input 
                            type="text" value={formData.rollId}
                            onChange={e => setFormData({...formData, rollId: e.target.value})}
                            className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-white text-sm"
                            placeholder="e.g. 231701"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase">Academic Bio</label>
                          <input 
                            type="text" value={formData.bio}
                            onChange={e => setFormData({...formData, bio: e.target.value})}
                            className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-white text-sm"
                            placeholder="Student of Tachyon"
                          />
                        </div>
                      </div>

                      <div className="flex gap-4 pt-4">
                        <button 
                          type="submit" disabled={loading}
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700 py-4 rounded-xl font-bold flex items-center justify-center gap-2"
                        >
                          {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                          Save Changes
                        </button>
                        <button 
                          type="button" onClick={() => setIsEditing(false)}
                          className="px-8 bg-white/5 hover:bg-white/10 rounded-xl font-bold"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </GlassCard>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  <GlassCard className="bg-white/[0.03] border-none">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-indigo-400">
                      <Shield size={18} /> Batch Credentials
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <InfoItem icon={<User />} label="Roll ID" value={userData?.rollId || "Not set"} />
                      <InfoItem icon={<Building />} label="Department" value={userData?.department || "Physics"} />
                      <InfoItem icon={<GraduationCap />} label="Batch" value={userData?.batch || "2023"} />
                      <InfoItem icon={<Calendar />} label="Registration" value={userData?.createdAt ? 
                        (typeof userData.createdAt.toDate === 'function' ? userData.createdAt.toDate().toLocaleDateString() : 'N/A') 
                        : "N/A"} 
                      />
                    </div>
                  </GlassCard>

                  {userData?.bio && (
                    <GlassCard className="bg-white/[0.03] border-none">
                      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">About Me</h3>
                      <p className="text-slate-300 leading-relaxed italic">"{userData.bio}"</p>
                    </GlassCard>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex gap-4">
      <div className="w-12 h-12 rounded-2xl bg-indigo-500/5 border border-white/5 flex items-center justify-center text-indigo-400 shrink-0">
        {React.cloneElement(icon, { size: 20 })}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-sm font-bold text-white">{value}</p>
      </div>
    </div>
  );
}
