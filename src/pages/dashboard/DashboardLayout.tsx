import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Search, 
  Clock, 
  Sparkles, 
  BookOpen, 
  StickyNote, 
  CheckSquare, 
  TrendingUp, 
  Calculator, 
  Calendar, 
  User, 
  ShieldCheck, 
  LogOut,
  Menu,
  X,
  FileText,
  Users,
  Image as ImageIcon
} from 'lucide-react';
import { auth } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarLink {
  name: string;
  path: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
  crOnly?: boolean;
}

const SIDEBAR_LINKS: SidebarLink[] = [
  { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard /> },
  { name: 'Study Tracker', path: '/dashboard/tracker', icon: <Search /> },
  { name: 'Class Routine', path: '/dashboard/routine', icon: <Clock /> },
  { name: 'Assessments', path: '/dashboard/assessment', icon: <FileText /> },
  { name: 'Batch Members', path: '/dashboard/members', icon: <Users /> },
  { name: 'Batch Album', path: '/album', icon: <ImageIcon /> },
  { name: 'AI Assistant', path: '/dashboard/ai-planner', icon: <Sparkles /> },
  { name: 'Subjects', path: '/dashboard/subjects', icon: <BookOpen /> },
  { name: 'Notes', path: '/dashboard/notes', icon: <StickyNote /> },
  { name: 'Tasks', path: '/dashboard/tasks', icon: <CheckSquare /> },
  { name: 'Progress', path: '/dashboard/progress', icon: <TrendingUp /> },
  { name: 'Backup Counter', path: '/dashboard/backup', icon: <Calculator /> },
  { name: 'Class Calendar', path: '/dashboard/calendar', icon: <Calendar /> },
  { name: 'Money Management', path: '/dashboard/fund', icon: <TrendingUp />, crOnly: true },
  { name: 'Profile', path: '/dashboard/profile', icon: <User /> },
  { name: 'Admin Panel', path: '/dashboard/admin', icon: <ShieldCheck />, adminOnly: true },
];

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userData } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  const filteredLinks = SIDEBAR_LINKS.filter(link => {
    if (link.adminOnly && userData?.role !== 'admin') return false;
    if (link.crOnly && (userData?.role !== 'cr' && userData?.role !== 'admin')) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#050508] flex text-gray-200 overflow-hidden relative">
      {/* Atmospheric Background Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] glow-indigo blur-[80px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] glow-pink blur-[100px] pointer-events-none z-0"></div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {!isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
            onClick={() => setIsSidebarOpen(true)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed md:static inset-y-0 left-0 z-50 w-64 bg-white/[0.02] backdrop-blur-3xl border-r border-white/10 transition-transform duration-300 md:translate-x-0 overflow-hidden",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 h-full flex flex-col relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="bg-gradient-to-tr from-indigo-500 to-pink-500 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white uppercase">Physics 23 - TACHYON</span>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar">
            {filteredLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "flex items-center gap-4 px-4 py-2.5 rounded-xl transition-all group",
                  location.pathname === link.path 
                    ? "bg-white/5 border border-white/10 text-indigo-400 font-medium" 
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <span className={cn(
                  "shrink-0 transition-colors",
                  location.pathname === link.path ? "text-indigo-400" : "text-gray-500 group-hover:text-white"
                )}>
                  {React.cloneElement(link.icon as React.ReactElement, { size: 18 })}
                </span>
                <span className="text-[13px] font-medium">{link.name}</span>
              </Link>
            ))}
          </nav>

          <div className="pt-6 border-t border-white/10 mt-6">
            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-full border-2 border-indigo-500/50 p-0.5 overflow-hidden">
                {userData?.photoURL ? (
                  <img src={userData.photoURL} alt="Me" className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full bg-gray-700 rounded-full flex items-center justify-center text-xs font-bold">
                    {userData?.name?.charAt(0) || <User size={16} />}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate text-white">{userData?.name || 'User'}</div>
                <div className="text-[10px] uppercase tracking-wider text-indigo-400 font-bold">{userData?.role || 'Student'}</div>
              </div>
              <button 
                onClick={handleLogout}
                className="text-gray-500 hover:text-rose-400 transition-colors"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden z-10">
        {/* Top bar */}
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-transparent shrink-0">
          <button 
            className="md:hidden p-2 hover:bg-white/5 rounded-lg text-gray-400"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu size={20} />
          </button>
          
          <div className="flex-1 flex items-center justify-end gap-4">
            <div className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-lg hidden sm:flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              <span className="text-[11px] font-medium text-gray-300">Live Status: Academic Sync Active</span>
            </div>
          </div>
        </header>

        {/* Dynamic Content Area */}
        <main className="flex-1 overflow-y-auto p-8 md:p-8 no-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
};
