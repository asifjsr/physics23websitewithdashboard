/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { DashboardLayout } from './pages/dashboard/DashboardLayout';

import Home from './pages/public/Home';
import People from './pages/public/People';
import Album from './pages/public/Album';
import About from './pages/public/About';
import Contact from './pages/public/Contact';
import Login from './pages/public/Login';

import DashboardHome from './pages/dashboard/DashboardHome';
import BackupCounter from './pages/dashboard/BackupCounter';
import ClassCalendar from './pages/dashboard/ClassCalendar';
import AdminPanel from './pages/dashboard/AdminPanel';
import StudyTracker from './pages/dashboard/StudyTracker';
import Tasks from './pages/dashboard/Tasks';
import AIPlanner from './pages/dashboard/AIPlanner';
import Profile from './pages/dashboard/Profile';
import Routine from './pages/dashboard/Routine';
import Subjects from './pages/dashboard/Subjects';
import Notes from './pages/dashboard/Notes';
import ClassFund from './pages/dashboard/ClassFund';
import Assessment from './pages/dashboard/Assessment';
import Members from './pages/dashboard/Members';
import { Progress } from './pages/dashboard/Placeholders';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="animated-bg min-h-screen">
          <Routes>
            {/* Public Routes with Navbar */}
            <Route path="/" element={<><Navbar /><Home /></>} />
            <Route path="/people" element={<><Navbar /><People /></>} />
            <Route path="/album" element={<><Navbar /><Album /></>} />
            <Route path="/about" element={<><Navbar /><About /></>} />
            <Route path="/contact" element={<><Navbar /><Contact /></>} />
            <Route path="/login" element={<><Navbar /><Login /></>} />

            {/* Protected Dashboard Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout><DashboardHome /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/tracker" element={<ProtectedRoute><DashboardLayout><StudyTracker /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/routine" element={<ProtectedRoute><DashboardLayout><Routine /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/ai-planner" element={<ProtectedRoute><DashboardLayout><AIPlanner /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/subjects" element={<ProtectedRoute><DashboardLayout><Subjects /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/notes" element={<ProtectedRoute><DashboardLayout><Notes /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/tasks" element={<ProtectedRoute><DashboardLayout><Tasks /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/progress" element={<ProtectedRoute><DashboardLayout><Progress /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/backup" element={<ProtectedRoute><DashboardLayout><BackupCounter /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/calendar" element={<ProtectedRoute><DashboardLayout><ClassCalendar /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/fund" element={<ProtectedRoute><DashboardLayout><ClassFund /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/assessment" element={<ProtectedRoute><DashboardLayout><Assessment /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/members" element={<ProtectedRoute><DashboardLayout><Members /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/profile" element={<ProtectedRoute><DashboardLayout><Profile /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/admin" element={<ProtectedRoute adminOnly><DashboardLayout><AdminPanel /></DashboardLayout></ProtectedRoute>} />

            {/* Redirect any unknown routes to home */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

