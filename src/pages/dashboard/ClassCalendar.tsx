import React, { useState, useEffect } from 'react';
import { GlassCard } from '../../components/common/GlassCard';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp,
  orderBy,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval 
} from 'date-fns';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus, 
  Clock, 
  MapPin, 
  Info,
  Loader2,
  Bell,
  X,
  Trash2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';
import { ConfirmModal } from '../../components/common/ConfirmModal';

interface Event {
  id: string;
  title: string;
  courseName: string;
  type: 'Class' | 'CT' | 'Exam' | 'Assignment' | 'Event';
  date: string;
  time: string;
  room: string;
  description: string;
  isGlobal?: boolean;
}

export default function ClassCalendar() {
  const { user, userData } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [newTitle, setNewTitle] = useState("");
  const [newCourse, setNewCourse] = useState("");
  const [newType, setNewType] = useState<Event['type']>('Class');
  const [newTime, setNewTime] = useState("");
  const [newRoom, setNewRoom] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Confirm Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string, isGlobal: boolean } | null>(null);

  const fetchEvents = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Personal events
      const personalQ = query(collection(db, 'users', user.uid, 'calendarEvents'));
      const personalSnapshot = await getDocs(personalQ);
      const personalData = personalSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        isGlobal: false
      })) as Event[];

      // Global events (admin created)
      const globalQ = query(collection(db, 'globalCalendarEvents'));
      const globalSnapshot = await getDocs(globalQ);
      const globalData = globalSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        isGlobal: true
      })) as Event[];

      setEvents([...personalData, ...globalData]);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [user]);

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isAdding) return;

    setIsAdding(true);
    const eventData = {
      title: newTitle,
      courseName: newCourse,
      type: newType,
      date: format(selectedDate, 'yyyy-MM-dd'),
      time: newTime,
      room: newRoom,
      description: newDesc,
      createdAt: serverTimestamp()
    };

    try {
      await addDoc(collection(db, 'users', user.uid, 'calendarEvents'), eventData);
      console.log("Calendar event saved");
      setEvents([...events, { id: Math.random().toString(), ...eventData, isGlobal: false }]);
      setShowAddModal(false);
      resetForm();
    } catch (error: any) {
      console.error("Error adding calendar event:", error.message || error);
      alert("Failed to add event: " + (error.message || "Unknown error"));
    } finally {
      setIsAdding(false);
    }
  };

  const resetForm = () => {
    setNewTitle("");
    setNewCourse("");
    setNewType('Class');
    setNewTime("");
    setNewRoom("");
    setNewDesc("");
  };

  const handleDeleteEvent = (id: string, isGlobal: boolean) => {
    setItemToDelete({ id, isGlobal });
    setShowConfirmModal(true);
    console.log("Delete modal opened");
  };

  const handleConfirmDelete = async () => {
    if (!user || !itemToDelete) return;
    try {
      const collectionName = itemToDelete.isGlobal ? 'globalCalendarEvents' : `users/${user.uid}/calendarEvents`;
      await deleteDoc(doc(db, collectionName, itemToDelete.id));
      console.log("Delete confirmed");
      console.log("Document deleted successfully");
      setShowConfirmModal(false);
      setItemToDelete(null);
      fetchEvents();
    } catch (error: any) {
      console.error("Error deleting event:", error.message || error);
      alert("Failed to delete event: " + error.message);
    }
  };

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-white">{format(currentMonth, 'MMMM yyyy')}</h2>
          <p className="text-slate-500 text-sm">Schedule for the month</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={() => setCurrentMonth(new Date())}
            className="px-4 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition-all"
          >
            Today
          </button>
          <button 
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <div className="grid grid-cols-7 mb-4">
        {days.map(day => (
          <div key={day} className="text-center text-[10px] uppercase font-black text-slate-500 tracking-widest py-2">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, i) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayEvents = events.filter(e => e.date === dateStr);
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isToday = isSameDay(day, new Date());

          return (
            <div 
              key={i}
              onClick={() => setSelectedDate(day)}
              className={cn(
                "min-h-[100px] p-2 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col gap-1",
                !isCurrentMonth ? "bg-transparent border-transparent opacity-20" : 
                isSelected ? "bg-indigo-600/10 border-indigo-500/50" : 
                "bg-white/[0.02] border-white/5 hover:bg-white/[0.05]",
                isToday && "ring-1 ring-indigo-400 ring-offset-2 ring-offset-slate-950"
              )}
            >
              <span className={cn(
                "text-sm font-bold ml-auto",
                isToday ? "text-indigo-400" : "text-slate-500"
              )}>
                {format(day, 'd')}
              </span>
              
              <div className="space-y-1 mt-1 overflow-y-auto max-h-[60px] no-scrollbar">
                {dayEvents.map(e => (
                  <div 
                    key={e.id}
                    className={cn(
                      "text-[9px] px-2 py-0.5 rounded-lg font-bold truncate",
                      e.type === 'CT' ? "bg-amber-500/20 text-amber-500" :
                      e.type === 'Exam' ? "bg-rose-500/20 text-rose-500" :
                      e.type === 'Assignment' ? "bg-emerald-500/20 text-emerald-400" :
                      e.type === 'Class' ? "bg-indigo-500/20 text-indigo-400" :
                      "bg-slate-500/20 text-slate-400"
                    )}
                  >
                    {e.title}
                  </div>
                ))}
              </div>

              {isSelected && (
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const selectedDateEvents = events.filter(e => e.date === format(selectedDate, 'yyyy-MM-dd'));

  return (
    <div className="space-y-10">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">Class Calendar</h1>
          <p className="text-slate-400">Track classes, CTs, and assignments in one place.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 py-3 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all sm:w-auto"
        >
          <Plus size={20} /> Add Event
        </button>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Calendar View */}
        <GlassCard className="xl:col-span-3 border-none bg-white/[0.03]">
          {renderHeader()}
          {renderDays()}
          {renderCells()}
        </GlassCard>

        {/* Selected Date Details */}
        <div className="xl:col-span-1 space-y-6">
          <GlassCard className="border-none bg-indigo-600/5 h-full min-h-[400px]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-white">{format(selectedDate, 'd MMMM')}</h3>
                <p className="text-xs text-slate-500 uppercase tracking-widest">{format(selectedDate, 'EEEE')}</p>
              </div>
              <CalendarIcon className="text-indigo-500 opacity-20 w-10 h-10" />
            </div>

            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-indigo-500" /></div>
            ) : selectedDateEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                <CalendarIcon size={40} className="mb-4 text-slate-500" />
                <p className="text-sm font-medium">No events for this day</p>
                <button onClick={() => setShowAddModal(true)} className="mt-4 text-xs text-indigo-400 font-bold hover:underline">Add something?</button>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedDateEvents.map(e => (
                  <div key={e.id} className="p-4 rounded-2xl bg-slate-900 border border-white/5 relative group">
                    {e.isGlobal && (
                      <div className="absolute top-2 right-2 text-[8px] font-black text-indigo-400 bg-indigo-400/10 px-1.5 py-0.5 rounded-full uppercase tracking-tighter">
                        Batch Global
                      </div>
                    )}
                    <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                       <span className={cn(
                         "w-2 h-2 rounded-full",
                         e.type === 'CT' ? "bg-amber-500" :
                         e.type === 'Exam' ? "bg-rose-500" :
                         "bg-indigo-500"
                       )} />
                       {e.title}
                       {(!e.isGlobal || userData?.role === 'admin') && (
                         <button 
                           onClick={() => handleDeleteEvent(e.id, e.isGlobal || false)}
                           className="ml-auto p-1 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all"
                         >
                           <Trash2 size={14} />
                         </button>
                       )}
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Clock size={12} className="text-indigo-400" /> {e.time}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <MapPin size={12} className="text-emerald-400" /> Room: {e.room}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <CalendarIcon size={12} className="text-indigo-400" /> {e.courseName}
                      </div>
                    </div>
                    {e.description && (
                      <div className="mt-4 pt-4 border-t border-white/5 text-[11px] text-slate-500 leading-relaxed italic">
                        "{e.description}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg"
          >
            <GlassCard className="p-8">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-black">New Event</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/5 rounded-full"><X size={20} /></button>
              </div>

              <form onSubmit={handleAddEvent} className="space-y-5">
                 <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-500 uppercase">Event Title</label>
                   <input 
                     type="text" required
                     placeholder="e.g. Physics CT-1"
                     className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4"
                     value={newTitle} onChange={e => setNewTitle(e.target.value)}
                   />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-500 uppercase">Course</label>
                     <input 
                       type="text" required
                       placeholder="Course Name"
                       className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4"
                       value={newCourse} onChange={e => setNewCourse(e.target.value)}
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-500 uppercase">Type</label>
                     <select 
                       className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 appearance-none"
                       value={newType} onChange={e => setNewType(e.target.value as Event['type'])}
                     >
                       {['Class', 'CT', 'Exam', 'Assignment', 'Event'].map(t => <option key={t} value={t}>{t}</option>)}
                     </select>
                   </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-500 uppercase">Time</label>
                     <input 
                       type="time" required
                       className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4"
                       value={newTime} onChange={e => setNewTime(e.target.value)}
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-500 uppercase">Room</label>
                     <input 
                       type="text" placeholder="e.g. 302"
                       className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4"
                       value={newRoom} onChange={e => setNewRoom(e.target.value)}
                     />
                   </div>
                 </div>

                 <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
                   <textarea 
                     rows={3}
                     placeholder="Additional information..."
                     className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 resize-none"
                     value={newDesc} onChange={e => setNewDesc(e.target.value)}
                   />
                 </div>

                 <button 
                  disabled={isAdding}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 mt-4"
                 >
                   {isAdding ? <Loader2 className="animate-spin" /> : <Plus size={18} />}
                   Create Event
                 </button>
              </form>
            </GlassCard>
          </motion.div>
        </div>
      )}

      <ConfirmModal
        isOpen={showConfirmModal}
        title="Confirm Delete"
        message="Are you sure you want to delete this event?"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setShowConfirmModal(false);
          console.log("Delete cancelled");
        }}
      />
    </div>
  );
}
