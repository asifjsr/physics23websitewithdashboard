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
  getDoc,
  setDoc,
  updateDoc, 
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { 
  ShieldCheck, 
  Users, 
  Calendar, 
  Bell, 
  Trash2, 
  Edit2, 
  Plus, 
  Loader2,
  Image as ImageIcon,
  Settings
} from 'lucide-react';
import { ConfirmModal } from '../../components/common/ConfirmModal';

export default function AdminPanel() {
  const { userData } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'events' | 'notices' | 'batchmates' | 'people' | 'settings'>('events');
  
  if (!userData || userData.role !== 'admin') {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <GlassCard className="text-center p-10 max-w-md border-rose-500/20">
          <ShieldCheck className="w-16 h-16 text-rose-500 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-rose-500 mb-2">Access Denied</h2>
          <p className="text-slate-400">You do not have administrative privileges to access this panel.</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">Admin Control Center</h1>
          <p className="text-slate-400">Manage the digital heartbeat of the entire batch.</p>
        </div>
        <div className="px-4 py-2 bg-indigo-600/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-black uppercase tracking-widest">
          Root Access
        </div>
      </header>
 
      <div className="flex flex-wrap gap-4 border-b border-white/5 pb-2">
        {[
          { id: 'events', label: 'Global Events', icon: <Calendar size={16} /> },
          { id: 'notices', label: 'Notices', icon: <Bell size={16} /> },
          { id: 'people', label: 'People Directory', icon: <Users size={16} /> },
          { id: 'batchmates', label: 'Legacy Directory', icon: <Users size={16} /> },
          { id: 'users', label: 'Student List', icon: <ShieldCheck size={16} /> },
          { id: 'settings', label: 'App Settings', icon: <Settings size={16} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-t-xl transition-all font-bold text-sm ${
              activeTab === tab.id 
                ? "bg-indigo-600/10 text-indigo-400 border-b-2 border-indigo-500" 
                : "text-slate-500 hover:text-white"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        {activeTab === 'events' && <AdminGlobalEvents />}
        {activeTab === 'notices' && <AdminNotices />}
        {activeTab === 'users' && <AdminUserList />}
        {activeTab === 'batchmates' && <AdminBatchmates />}
        {activeTab === 'people' && <AdminPeopleManagement />}
        {activeTab === 'settings' && <AdminSettings />}
      </div>
    </div>
  );
}

function AdminSettings() {
  const { appSettings } = useAuth();
  const [approvalRequired, setApprovalRequired] = useState(appSettings?.loginApprovalRequired || false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (appSettings) setApprovalRequired(appSettings.loginApprovalRequired);
  }, [appSettings]);

  const handleToggle = async () => {
    const newVal = !approvalRequired;
    setApprovalRequired(newVal);
    setUpdating(true);
    try {
      await setDoc(doc(db, 'settings', 'app'), { loginApprovalRequired: newVal }, { merge: true });
      alert(`Login approval requirement set to: ${newVal ? 'ON' : 'OFF'}`);
    } catch (error: any) {
      console.error("Error updating settings:", error);
      alert("Failed to update settings.");
      setApprovalRequired(!newVal); // revert
    } finally {
      setUpdating(false);
    }
  };

  return (
    <GlassCard className="border-none bg-white/[0.03]">
      <h3 className="text-xl font-bold mb-6">Application Configuration</h3>
      <div className="p-6 rounded-2xl bg-slate-900 border border-white/5 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-white mb-1">Require admin approval for login</h4>
            <p className="text-sm text-slate-500">When enabled, new users will be set to 'pending' and must be approved by an admin.</p>
          </div>
          <button 
            onClick={handleToggle}
            disabled={updating}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${approvalRequired ? 'bg-indigo-600' : 'bg-slate-700'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${approvalRequired ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>
    </GlassCard>
  );
}

const PEOPLE_DATA = [
  { studentId: "231701", name: "NAWSHIN KHAN", role: "Student", position: "", discipline: "Physics", bio: "", imageUrl: "", facebookUrl: "", linkedinUrl: "" },
  { studentId: "231703", name: "ANIKA TASNIM", role: "Student", position: "", discipline: "Physics", bio: "", imageUrl: "", facebookUrl: "", linkedinUrl: "" },
  { studentId: "231705", name: "APU KUMER PAL", role: "Student", position: "", discipline: "Physics", bio: "", imageUrl: "", facebookUrl: "", linkedinUrl: "" },
  { studentId: "231708", name: "MST. FARJANA MAHIN", role: "Student", position: "", discipline: "Physics", bio: "", imageUrl: "", facebookUrl: "", linkedinUrl: "" },
  { studentId: "231709", name: "MD. SAIFUL ISLAM MANIK", role: "Student", position: "", discipline: "Physics", bio: "", imageUrl: "", facebookUrl: "", linkedinUrl: "" },
  { studentId: "231710", name: "SEJANUR RAHMAN SEJAN", role: "Student", position: "", discipline: "Physics", bio: "", imageUrl: "", facebookUrl: "", linkedinUrl: "" },
  { studentId: "231711", name: "MST. TANIMA JANNAT HASHI", role: "Student", position: "", discipline: "Physics", bio: "", imageUrl: "", facebookUrl: "", linkedinUrl: "" },
  { studentId: "231713", name: "MD. SHAKIB", role: "Student", position: "Class Representative", discipline: "Physics", bio: "", imageUrl: "", facebookUrl: "", linkedinUrl: "" },
  { studentId: "231715", name: "JANNATULL SABDID", role: "Student", position: "", discipline: "Physics", bio: "", imageUrl: "", facebookUrl: "", linkedinUrl: "" },
  { studentId: "231718", name: "FARDIN AL ZAWAD FAHIM", role: "Student", position: "", discipline: "Physics", bio: "", imageUrl: "", facebookUrl: "", linkedinUrl: "" },
  { studentId: "231719", name: "MD. ASIF KHAN", role: "Student", position: "", discipline: "Physics", bio: "", imageUrl: "", facebookUrl: "", linkedinUrl: "" },
  { studentId: "231720", name: "MONOARUL ISLAM FAHIM", role: "Student", position: "", discipline: "Physics", bio: "", imageUrl: "", facebookUrl: "", linkedinUrl: "" },
  { studentId: "231722", name: "MAHIR MAHDI", role: "Student", position: "", discipline: "Physics", bio: "", imageUrl: "", facebookUrl: "", linkedinUrl: "" },
  { studentId: "231723", name: "AFIA ANISA", role: "Student", position: "", discipline: "Physics", bio: "", imageUrl: "", facebookUrl: "", linkedinUrl: "" },
  { studentId: "231729", name: "MST. MODINA KHATUN", role: "Student", position: "", discipline: "Physics", bio: "", imageUrl: "", facebookUrl: "", linkedinUrl: "" },
  { studentId: "231730", name: "MAHATHIR MOHAMMAD", role: "Student", position: "", discipline: "Physics", bio: "", imageUrl: "", facebookUrl: "", linkedinUrl: "" },
  { studentId: "231734", name: "TAHSIN AHMED MAHIM", role: "Student", position: "", discipline: "Physics", bio: "", imageUrl: "", facebookUrl: "", linkedinUrl: "" },
  { studentId: "231735", name: "SOHAN SARDER", role: "Student", position: "", discipline: "Physics", bio: "", imageUrl: "", facebookUrl: "", linkedinUrl: "" },
  { studentId: "231736", name: "JEET DAY", role: "Student", position: "", discipline: "Physics", bio: "", imageUrl: "", facebookUrl: "", linkedinUrl: "" },
  { studentId: "231737", name: "PROMA DAS RUPA", role: "Student", position: "", discipline: "Physics", bio: "", imageUrl: "", facebookUrl: "", linkedinUrl: "" },
  { studentId: "231739", name: "FAHAD BIN SHARAFAT", role: "Student", position: "", discipline: "Physics", bio: "", imageUrl: "", facebookUrl: "", linkedinUrl: "" },
  { studentId: "231740", name: "SANCHITA MONDAL", role: "Student", position: "", discipline: "Physics", bio: "", imageUrl: "", facebookUrl: "", linkedinUrl: "" },
  { studentId: "231741", name: "MAFUJUR RAHMAN", role: "Student", position: "", discipline: "Physics", bio: "", imageUrl: "", facebookUrl: "", linkedinUrl: "" },
  { studentId: "231742", name: "EZAZ MAHMUD", role: "Student", position: "", discipline: "Physics", bio: "", imageUrl: "", facebookUrl: "", linkedinUrl: "" },
  { studentId: "221703", name: "CHANDAN BALA", role: "Student", position: "", discipline: "Physics", bio: "", imageUrl: "", facebookUrl: "", linkedinUrl: "" },
  { studentId: "221740", name: "MD. TARIQUL ISLAM", role: "Student", position: "", discipline: "Physics", bio: "", imageUrl: "", facebookUrl: "", linkedinUrl: "" }
];

function AdminPeopleManagement() {
  const [people, setPeople] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const fetchPeople = async () => {
    try {
      const q = query(collection(db, 'people'), orderBy('studentId', 'asc'));
      const snapshot = await getDocs(q);
      setPeople(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPeople(); }, []);

  const handleUpdatePeopleData = async () => {
    if (!confirm("Are you sure you want to update all people data? This will overwrite or merge existing records.")) return;
    setUpdating(true);
    try {
      for (const person of PEOPLE_DATA) {
        console.log(`Processing studentId: ${person.studentId}`);
        const personRef = doc(db, 'people', person.studentId);
        
        // Fetch current doc to check if it exists (for createdAt)
        const snap = await getDoc(personRef);
        
        const personData: any = {
          ...person,
          updatedAt: serverTimestamp()
        };

        if (!snap.exists()) {
          personData.createdAt = serverTimestamp();
        }

        await setDoc(personRef, personData, { merge: true });
        console.log(`Updated Student ID: ${person.studentId}`);
      }

      alert("People data updated successfully.");
      fetchPeople();
    } catch (error: any) {
      console.error("Update error:", error);
      alert("Update failed: " + error.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = (id: string) => {
    setItemToDelete(id);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteDoc(doc(db, 'people', itemToDelete));
      setShowConfirmModal(false);
      setItemToDelete(null);
      fetchPeople();
    } catch (error: any) {
      console.error("Delete error:", error);
      alert("Delete failed: " + error.message);
    }
  };

  return (
    <GlassCard className="border-none bg-white/[0.03]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <h3 className="text-xl font-bold">People Management</h3>
          <p className="text-xs text-slate-500 italic">Manage the official directory records.</p>
        </div>
        <button 
          onClick={handleUpdatePeopleData}
          disabled={updating}
          className="flex items-center gap-2 px-4 py-3 bg-emerald-600 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all hover:bg-emerald-700 disabled:opacity-50"
        >
          {updating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          Update People Data
        </button>
      </div>

      {loading ? <Loader2 className="animate-spin mx-auto my-10 text-indigo-500" /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {people.map(p => (
            <div key={p.id} className="p-4 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-between group">
              <div>
                <h4 className="font-bold text-white text-sm mb-0.5">{p.name}</h4>
                <p className="text-[10px] font-mono text-slate-500">{p.studentId} • {p.role} {p.position && `• ${p.position}`}</p>
              </div>
              <button 
                onClick={() => handleDelete(p.id)} 
                className="p-2 hover:bg-rose-500/10 text-rose-500 rounded-lg transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {people.length === 0 && <p className="col-span-full text-center py-10 text-slate-600 italic">No records found. Click Update to populate.</p>}
        </div>
      )}

      <ConfirmModal
        isOpen={showConfirmModal}
        title="Delete Person Record"
        message="Are you sure you want to remove this person from the official directory?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowConfirmModal(false)}
      />
    </GlassCard>
  );
}

// Sub-component for Global Events
function AdminGlobalEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const fetchEvents = async () => {
    const q = query(collection(db, 'globalCalendarEvents'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setLoading(false);
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleDelete = (id: string) => {
    setItemToDelete(id);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteDoc(doc(db, 'globalCalendarEvents', itemToDelete));
      console.log("Document deleted successfully");
      setShowConfirmModal(false);
      setItemToDelete(null);
      fetchEvents();
    } catch (error: any) {
      console.error("Delete error:", error);
      alert("Delete failed: " + error.message);
    }
  };

  return (
    <GlassCard className="border-none bg-white/[0.03]">
      <div className="flex justify-between items-center mb-10">
        <h3 className="text-xl font-bold">Manage Global Events</h3>
        <p className="text-xs text-slate-500 italic">Shown to all students in the batch.</p>
      </div>

      {loading ? <Loader2 className="animate-spin mx-auto my-10" /> : (
        <div className="space-y-4">
          {events.map(e => (
            <div key={e.id} className="p-4 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white mb-1">{e.title}</h4>
                <p className="text-xs text-slate-500">{e.date} • {e.time} • Room: {e.room}</p>
              </div>
              <button onClick={() => handleDelete(e.id)} className="p-2 hover:bg-rose-500/10 text-rose-500 rounded-lg transition-all"><Trash2 size={16} /></button>
            </div>
          ))}
          {events.length === 0 && <p className="text-center py-10 text-slate-600">No global events found.</p>}
        </div>
      )}

      <ConfirmModal
        isOpen={showConfirmModal}
        title="Confirm Delete"
        message="Are you sure you want to delete this global event?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowConfirmModal(false)}
      />
    </GlassCard>
  );
}

// Sub-component for User List
function AdminUserList() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    };
    fetchUsers();
  }, []);

  return (
    <GlassCard className="border-none bg-white/[0.03]">
       <h3 className="text-xl font-bold mb-10">Student Directory</h3>
       {loading ? <Loader2 className="animate-spin mx-auto my-10" /> : (
         <div className="overflow-x-auto no-scrollbar">
           <table className="w-full text-left">
             <thead>
               <tr className="text-xs uppercase text-slate-500 border-b border-white/5">
                 <th className="py-4 font-bold">Name</th>
                 <th className="py-4 font-bold">Email</th>
                 <th className="py-4 font-bold">Role</th>
                 <th className="py-4 font-bold">Status</th>
                 <th className="py-4 font-bold">Joined</th>
               </tr>
             </thead>
             <tbody className="text-sm">
               {users.map((u) => (
                 <tr key={u.id} className="border-b border-white/5 bg-transparent hover:bg-white/[0.02]">
                   <td className="py-4 font-bold text-white">{u.name}</td>
                   <td className="py-4 text-slate-400">{u.email}</td>
                   <td className="py-4">
                     <select 
                       value={u.role || 'student'}
                       onChange={async (e) => {
                         await updateDoc(doc(db, 'users', u.id), { role: e.target.value });
                         alert("Role updated.");
                         window.location.reload(); 
                       }}
                       className={`px-3 py-1 rounded-full text-[10px] bg-slate-900 border border-white/10 text-white font-black uppercase appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                     >
                       <option value="student">Student</option>
                       <option value="cr">CR</option>
                       <option value="admin">Admin</option>
                     </select>
                   </td>
                   <td className="py-4">
                      <select 
                        value={u.status || 'approved'}
                        onChange={async (e) => {
                          await updateDoc(doc(db, 'users', u.id), { status: e.target.value });
                          alert("Status updated.");
                          window.location.reload();
                        }}
                        className={`px-3 py-1 rounded-full text-[10px] bg-slate-900 border border-white/10 ${
                          u.status === 'pending' ? 'text-amber-500' : u.status === 'rejected' ? 'text-rose-500' : 'text-emerald-500'
                        } font-black uppercase appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                      >
                        <option value="approved">Approved</option>
                        <option value="pending">Pending</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                   <td className="py-4 text-xs text-slate-500">{u.createdAt?.toDate().toLocaleDateString() || 'N/A'}</td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
       )}
    </GlassCard>
  );
}

// Sub-component for Batchmate Directory
function AdminBatchmates() {
  const [batchmates, setBatchmates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const fetchBatchmates = async () => {
    const q = query(collection(db, 'batchmates'), orderBy('rollId', 'asc'));
    const snapshot = await getDocs(q);
    setBatchmates(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setLoading(false);
  };

  useEffect(() => { fetchBatchmates(); }, []);

  const handleSeed = async () => {
    if (!confirm("This will seed the official directory with initial roll numbers. Continue?")) return;
    setIsSeeding(true);
    const data = [
      { r: "231701", n: "NAWSHIN KHAN" },
      { r: "231703", n: "ANIKA TASNIM" },
      { r: "231705", n: "APU KUMER PAL" },
      { r: "231708", n: "MST. FARJANA MAHIN" },
      { r: "231709", n: "MD. SAIFUL ISLAM MANIK" },
      { r: "231710", n: "SEJANUR RAHMAN SEJAN" },
      { r: "231711", n: "MST. TANIMA JANNAT HASHI" },
      { r: "231713", n: "MD. SHAKIB" },
      { r: "231715", n: "JANNATULL SABDID" },
      { r: "231718", n: "FARDIN AL ZAWAD FAHIM" },
      { r: "231719", n: "MD. ASIF KHAN" },
      { r: "231720", n: "MONOARUL ISLAM FAHIM" },
      { r: "231722", n: "MAHIR MAHDI" },
      { r: "231723", n: "AFIA ANISA" },
      { r: "231729", n: "MST.MODINA KHATUN" },
      { r: "231730", n: "MAHATHIR MOHAMMAD" },
      { r: "231734", n: "TAHSIN AHMED MAHIM" },
      { r: "231735", n: "SOHAN SARDER" },
      { r: "231736", n: "JEET DAY" },
      { r: "231737", n: "PROMA DAS RUPA" },
      { r: "231739", n: "FAHAD BIN SHARAFAT" },
      { r: "231740", n: "SANCHITA MONDAL" },
      { r: "231741", n: "MAFUJUR RAHMAN" },
      { r: "231742", n: "EZAZ MAHMUD" },
      { r: "221703", n: "CHANDAN BALA" },
      { r: "221740", n: "Md. Tariqul Islam" }
    ];

    try {
      for (const item of data) {
        // Simple check to avoid duplicates if seeding again
        const existing = batchmates.find(b => b.rollId === item.r);
        if (!existing) {
          await addDoc(collection(db, 'batchmates'), {
            rollId: item.r,
            name: item.n,
            department: "Physics",
            batch: item.r.startsWith('23') ? "2023" : "2022",
            createdAt: serverTimestamp()
          });
        }
      }
      alert("Seeding complete!");
      fetchBatchmates();
    } catch (err) {
      console.error(err);
      alert("Seeding failed.");
    } finally {
      setIsSeeding(false);
    }
  };

  const handleDelete = (id: string) => {
    setItemToDelete(id);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteDoc(doc(db, 'batchmates', itemToDelete));
      setShowConfirmModal(false);
      setItemToDelete(null);
      fetchBatchmates();
    } catch (error: any) {
      console.error("Delete error:", error);
      alert("Delete failed: " + error.message);
    }
  };

  return (
    <GlassCard className="border-none bg-white/[0.03]">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h3 className="text-xl font-bold">Official Batch Directory</h3>
          <p className="text-xs text-slate-500 italic">Manage the master list of all students in the batch.</p>
        </div>
        <button 
          onClick={handleSeed}
          disabled={isSeeding}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 text-xs font-black uppercase tracking-widest border border-indigo-500/20 rounded-xl transition-all"
        >
          {isSeeding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          Seed Official Directory
        </button>
      </div>

      {loading ? <Loader2 className="animate-spin mx-auto my-10" /> : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {batchmates.map(b => (
              <div key={b.id} className="p-4 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-between group">
                <div>
                  <h4 className="font-bold text-white text-sm mb-0.5">{b.name}</h4>
                  <p className="text-[10px] font-mono text-slate-500">{b.rollId} • {b.batch} Batch</p>
                </div>
                <button 
                  onClick={() => handleDelete(b.id)} 
                  className="p-2 hover:bg-rose-500/10 text-rose-500 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          {batchmates.length === 0 && <p className="text-center py-10 text-slate-600 italic">No batchmates found. Click Seed to populate.</p>}
        </div>
      )}

      <ConfirmModal
        isOpen={showConfirmModal}
        title="Delete Batchmate"
        message="Are you sure you want to remove this student from the official directory?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowConfirmModal(false)}
      />
    </GlassCard>
  );
}

// Placeholder for other sub-components
function AdminNotices() { return <p className="p-10 text-center opacity-50 italic">Notice management module coming soon...</p>; }
