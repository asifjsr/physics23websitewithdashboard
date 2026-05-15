import React, { useState, useEffect } from 'react';
import { GlassCard } from '../../components/common/GlassCard';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  limit 
} from 'firebase/firestore';
import { 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  Loader2,
  TrendingUp,
  FileText
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

import { DashboardCalendar } from '../../components/dashboard/DashboardCalendar';

interface RoutineItem {
  time: string;
  subject: string;
  room: string;
  status: string;
}

interface AssessmentItem {
  id: string;
  courseName: string;
  date: string;
  teacherName: string;
}

export default function DashboardHome() {
  const { user, userData } = useAuth();
  const [todayRoutine, setTodayRoutine] = useState<RoutineItem[]>([]);
  const [upcomingAssessments, setUpcomingAssessments] = useState<AssessmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fundBalance, setFundBalance] = useState(0);

  const isCR = userData?.role === 'cr' || userData?.role === 'admin';

  useEffect(() => {
    const fetchFund = async () => {
      if (!isCR) return;
      try {
        const q = query(collection(db, 'classFund'));
        const snap = await getDocs(q);
        const balance = snap.docs.reduce((acc, d) => {
          const data = d.data();
          return data.type === 'income' ? acc + data.amount : acc - data.amount;
        }, 0);
        setFundBalance(balance);
      } catch (err) {
        console.error(err);
      }
    };
    fetchFund();
  }, [isCR]);

  useEffect(() => {
    if (!user) return;
    
    const today = format(new Date(), 'EEEE');
    const q = query(
      collection(db, 'users', user.uid, 'routines'),
      where('day', '==', today)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const item = doc.data();
        return {
          time: item.time,
          subject: item.subject,
          room: item.room,
          status: 'Class'
        };
      }).sort((a, b) => a.time.localeCompare(b.time)) as RoutineItem[];
      setTodayRoutine(data);
      setLoading(false);
    }, (error) => {
      console.error("Error listening to today routine:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const fetchUpcomingAssessments = async () => {
      try {
        const q = query(
          collection(db, 'assessments'),
          orderBy('date', 'asc'),
          limit(3)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as AssessmentItem[];
        setUpcomingAssessments(data);
      } catch (err) {
        console.error("Error fetching assessments for dashboard:", err);
      }
    };

    fetchUpcomingAssessments();
  }, [user]);

  const stats = [
    { label: "Pending Tasks", value: "8", icon: <AlertCircle className="text-amber-400" />, sub: "3 due today" },
    { label: "Class Fund", value: `৳${fundBalance.toLocaleString()}`, icon: <TrendingUp className="text-emerald-400" />, sub: "Current Balance", hidden: !isCR },
    { label: "Chapters Done", value: "12/45", icon: <CheckCircle2 className="text-indigo-400" />, sub: "+2 this week" },
    { label: "Study Streak", value: "5 Days", icon: <Clock className="text-pink-400" />, sub: "Keep it up!" },
  ];

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-2">
          Hello, {userData?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-slate-400">Welcome back to your academic central. Ready to start studying?</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.filter(s => !s.hidden).map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <GlassCard className="border-none bg-white/[0.03]">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-slate-900 rounded-xl border border-white/5">
                  {s.icon}
                </div>
              </div>
              <p className="text-slate-400 text-sm font-medium mb-1">{s.label}</p>
              <h3 className="text-2xl font-black text-white mb-1">{s.value}</h3>
              <p className="text-xs text-slate-500">{s.sub}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Schedule */}
        <GlassCard className="lg:col-span-2 border-none bg-white/[0.03]">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" /> CLASS ROUTINE
            </h2>
            <Link to="/dashboard/routine" className="text-xs text-indigo-400 font-bold hover:underline">View All</Link>
          </div>
          
          <div className="space-y-4">
            {todayRoutine.length === 0 && !loading && (
              <div className="text-center py-10 text-slate-500 italic">No classes scheduled for today. Refreshing breeze!</div>
            )}
            {todayRoutine.map((item, i) => (
              <div key={i} className="flex items-center gap-6 p-4 rounded-2xl bg-slate-900/50 border border-white/5">
                <div className="text-sm font-bold text-slate-500 w-20">{item.time}</div>
                <div className="flex-1">
                  <h4 className="font-bold text-white">{item.subject}</h4>
                  <p className="text-xs text-slate-500">{item.room}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  item.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' :
                  item.status === 'Ongoing' ? 'bg-indigo-500/10 text-indigo-400 animate-pulse' :
                  'bg-slate-500/10 text-slate-500'
                }`}>
                  {item.status}
                </div>
              </div>
            ))}
            {loading && <div className="text-center py-4"><Loader2 className="animate-spin text-indigo-500" /></div>}
          </div>
        </GlassCard>

        {/* Upcoming Assessments */}
        <div className="space-y-6">
          <GlassCard className="border-none bg-indigo-600/5">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" /> Upcoming CTs
              </h2>
              <Link to="/dashboard/assessment" className="text-[10px] uppercase font-black text-indigo-400 hover:underline">Full List</Link>
            </div>
            
            <div className="space-y-4">
              {upcomingAssessments.length === 0 && (
                <p className="text-center py-6 text-xs text-slate-600 italic">No upcoming tests.</p>
              )}
              {upcomingAssessments.map((ct) => (
                <div key={ct.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-bold text-white">{ct.courseName}</h4>
                    <span className="text-[9px] font-black text-indigo-400 uppercase">{format(new Date(ct.date), 'MMM d')}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Users size={10} /> {ct.teacherName}
                  </p>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Dashboard Calendar */}
          <DashboardCalendar />
        </div>
      </div>
    </div>
  );
}
