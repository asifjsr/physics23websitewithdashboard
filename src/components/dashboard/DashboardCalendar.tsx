import React, { useState, useEffect } from 'react';
import { GlassCard } from '../common/GlassCard';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameDay, 
  eachDayOfInterval,
  isSameMonth
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

interface Event {
  id: string;
  title: string;
  date: string;
  type: string;
}

export function DashboardCalendar() {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [dayTasks, setDayTasks] = useState<any[]>([]);
  const [dayClasses, setDayClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, 'users', user.uid, 'calendarEvents'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Event[];
        setEvents(data);
      } catch (error) {
        console.error("Error fetching dashboard events:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [user]);

  useEffect(() => {
    const fetchDayInfo = async () => {
      if (!user) return;
      
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const dayName = format(selectedDate, 'EEEE');
      
      try {
        // Fetch tasks for this day
        const tq = query(collection(db, 'users', user.uid, 'tasks'), where('due', '==', dateStr));
        const tSnapshot = await getDocs(tq);
        setDayTasks(tSnapshot.docs.map(d => d.data()));

        // Fetch classes for this day
        const cq = query(collection(db, 'users', user.uid, 'routines'), where('day', '==', dayName));
        const cSnapshot = await getDocs(cq);
        setDayClasses(cSnapshot.docs.map(d => d.data()));
      } catch (err) {
        console.error("Error fetching day info:", err);
      }
    };
    fetchDayInfo();
  }, [user, selectedDate]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <GlassCard className="border-none bg-white/[0.03] p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <CalendarIcon size={18} className="text-indigo-400" /> Calendar
        </h3>
        <div className="flex gap-2">
          <button onClick={() => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() - 1))} className="p-1.5 hover:bg-white/5 rounded-lg transition-all"><ChevronLeft size={16} /></button>
          <span className="text-xs font-bold text-slate-400 min-w-20 text-center">{format(currentMonth, 'MMM yyyy')}</span>
          <button onClick={() => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() + 1))} className="p-1.5 hover:bg-white/5 rounded-lg transition-all"><ChevronRight size={16} /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} className="text-center text-[10px] font-black text-slate-500 py-1">{d.charAt(0)}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, i) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const hasEvent = events.some(e => e.date === dateStr);
          const isToday = isSameDay(day, new Date());
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, monthStart);

          return (
            <button 
              key={i}
              onClick={() => setSelectedDate(day)}
              className={cn(
                "aspect-square rounded-lg flex flex-col items-center justify-center relative text-xs font-bold transition-all",
                !isCurrentMonth ? "opacity-10 text-slate-700" : "text-slate-400",
                isToday ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30" : "hover:bg-white/5",
                isSelected && "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
              )}
            >
              {format(day, 'd')}
              {hasEvent && !isSelected && (
                <div className="absolute bottom-1 w-1 h-1 rounded-full bg-indigo-400" />
              )}
            </button>
          );
        })}
      </div>
      
      <div className="mt-8 pt-6 border-t border-white/5 flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            {isSameDay(selectedDate, new Date()) ? "Work View: Today" : `Work View: ${format(selectedDate, 'MMM d')}`}
          </p>
          <div className="h-1 w-10 bg-indigo-500/30 rounded-full" />
        </div>

        <div className="space-y-3">
          {/* Classes */}
          {dayClasses.map((c, i) => (
            <div key={`class-${i}`} className="flex items-center gap-3 p-2 bg-white/[0.02] rounded-xl border border-white/5">
              <div className="w-1 h-8 bg-emerald-500 rounded-full" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white font-bold truncate">{c.subject}</p>
                <p className="text-[10px] text-slate-500 flex items-center gap-1">
                  {c.time} • Room {c.room}
                </p>
              </div>
            </div>
          ))}

          {/* Tasks */}
          {dayTasks.map((t, i) => (
            <div key={`task-${i}`} className="flex items-center gap-3 p-2 bg-white/[0.02] rounded-xl border border-white/5">
              <div className="w-1 h-8 bg-indigo-500 rounded-full" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white font-bold truncate">{t.title}</p>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Due Date</p>
              </div>
            </div>
          ))}

          {dayClasses.length === 0 && dayTasks.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-xs text-slate-600 italic">No scheduled activities for this day.</p>
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
