import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../../components/common/GlassCard';
import { Mail, Lock, User as UserIcon, LogIn, UserPlus, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../../lib/firebase';
import { cn } from '../../lib/utils';

export default function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = React.useState(true);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleFirebaseError = (err: any) => {
    console.error("Auth error:", err.code, err);
    switch (err.code) {
      case 'auth/wrong-password':
        return "Wrong password. Please try again.";
      case 'auth/user-not-found':
        return "No user found with this email.";
      case 'auth/weak-password':
        return "The password is too weak. Use at least 6 characters.";
      case 'auth/email-already-in-use':
        return "This email is already registered.";
      case 'auth/unauthorized-domain':
        return "Unauthorized Domain: Please add this URL to your Firebase Console 'Authorized domains' list.";
      case 'auth/operation-not-allowed':
        return "Authentication Method Disabled: Enable Email/Password or Google Login in your Firebase Console.";
      case 'unavailable':
      case 'auth/network-request-failed':
        return "Network Error: Check your internet connection or ensure Firestore/Auth is enabled in Firebase Console.";
      case 'auth/invalid-email':
        return "Please enter a valid email address.";
      default:
        return err.message || "An authentication error occurred.";
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Get settings first
      const settingsRef = doc(db, 'settings', 'app');
      let settingsSnap = await getDoc(settingsRef);
      let approvalRequired = false;
      
      if (!settingsSnap.exists()) {
        await setDoc(settingsRef, { loginApprovalRequired: false });
      } else {
        approvalRequired = settingsSnap.data()?.loginApprovalRequired || false;
      }

      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      const now = serverTimestamp();
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          name: user.displayName || "Unknown User",
          email: user.email,
          photoURL: user.photoURL,
          role: 'student',
          status: approvalRequired ? 'pending' : 'approved',
          createdAt: now,
          lastLoginAt: now
        }, { merge: true });
      } else {
        await setDoc(userRef, {
          lastLoginAt: now
        }, { merge: true });
      }
      
      console.log("User document created/updated:", user.uid);
      navigate('/dashboard');
    } catch (err: any) {
      setError(handleFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Get settings first
      const settingsRef = doc(db, 'settings', 'app');
      let settingsSnap = await getDoc(settingsRef);
      let approvalRequired = false;
      
      if (!settingsSnap.exists()) {
        await setDoc(settingsRef, { loginApprovalRequired: false });
      } else {
        approvalRequired = settingsSnap.data()?.loginApprovalRequired || false;
      }

      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        await setDoc(doc(db, 'users', user.uid), {
          lastLoginAt: serverTimestamp()
        }, { merge: true });
        
        console.log("User document created/updated:", user.uid);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update Auth Profile
        await updateProfile(user, { displayName: name });

        // Create Firestore Profile
        const now = serverTimestamp();
        await setDoc(doc(db, 'users', user.uid), {
          name,
          email,
          photoURL: null,
          role: 'student',
          status: approvalRequired ? 'pending' : 'approved',
          createdAt: now,
          lastLoginAt: now
        }, { merge: true });
        
        console.log("User document created/updated:", user.uid);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(handleFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-20 px-4 min-h-screen flex items-center justify-center">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-emerald-600/10 blur-[100px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <GlassCard className="p-8">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-black mb-2">{isLogin ? 'Welcome Back' : 'Join ClassVerse'}</h1>
            <p className="text-slate-400">
              {isLogin ? 'Login to access your dashboard' : 'Create an account to start tracking'}
            </p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-4">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="text"
                      required
                      className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-4">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  required
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                  placeholder="john@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-4">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Password</label>
                {isLogin && (
                  <button type="button" className="text-xs text-indigo-400 hover:underline font-bold">Forgot?</button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  required
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed py-4 rounded-2xl font-black text-lg shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 group mt-4"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isLogin ? (
                <LogIn className="w-5 h-5" />
              ) : (
                <UserPlus className="w-5 h-5" />
              )}
              {loading ? 'Authenticating...' : isLogin ? 'Login Now' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#050508] px-2 text-slate-500 font-bold">Or continue with</span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white/5 hover:bg-white/10 border border-white/10 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              Login with Google
            </button>
          </div>

          <div className="mt-8 text-center border-t border-white/5 pt-8">
            <p className="text-slate-400 mb-4">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </p>
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              {isLogin ? 'Sign up for free' : 'Back to login'}
            </button>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
