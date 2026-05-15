import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { user, userData, appSettings, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Admin bypass: approved admins always get in
  const isApprovedAdmin = userData?.role === 'admin' && userData?.status === 'approved';

  if (adminOnly && !isApprovedAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 text-center">
        <div className="max-w-md p-8 rounded-3xl bg-rose-500/10 border border-rose-500/20">
          <h2 className="text-2xl font-black text-rose-500 mb-2">Access Denied</h2>
          <p className="text-slate-400">This area is reserved for approved administrators only.</p>
        </div>
      </div>
    );
  }

  // If already approved admin, allow anywhere
  if (isApprovedAdmin) {
    return <>{children}</>;
  }

  // Handle Login Approval Requirement for others
  if (appSettings?.loginApprovalRequired) {
    if (!userData || userData.status === 'pending') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 text-center">
          <div className="max-w-md p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
            <Loader2 className="w-12 h-12 text-amber-500 mx-auto mb-6 animate-pulse" />
            <h2 className="text-xl font-black text-white mb-4">Account Pending Approval</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Your account is pending admin approval. You will gain access once an administrator verifies your identity.
            </p>
          </div>
        </div>
      );
    }
    if (userData.status === 'rejected') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 text-center">
          <div className="max-w-md p-8 rounded-3xl bg-rose-500/10 border border-rose-500/20 backdrop-blur-xl">
            <h2 className="text-xl font-black text-rose-500 mb-4">Request Rejected</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Your account request was rejected. Please contact the batch administrator if you believe this is an error.
            </p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};
