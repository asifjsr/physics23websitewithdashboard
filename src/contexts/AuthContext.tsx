import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';

interface UserData {
  uid: string;
  email: string | null;
  name: string;
  role: 'student' | 'admin';
  status: 'approved' | 'pending' | 'rejected';
  department?: string;
  batch?: string;
  photoURL?: string;
  createdAt: any;
}

interface AppSettings {
  loginApprovalRequired: boolean;
}

interface AuthContextType {
  user: FirebaseUser | null;
  userData: UserData | null;
  appSettings: AppSettings | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  appSettings: null,
  loading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      // Fetch settings
      try {
        const settingsSnap = await getDoc(doc(db, 'settings', 'app'));
        if (settingsSnap.exists()) {
          setAppSettings(settingsSnap.data() as AppSettings);
        } else {
          // Default if not exists yet
          setAppSettings({ loginApprovalRequired: false });
        }
      } catch (error) {
        console.error("Error fetching app settings:", error);
        setAppSettings({ loginApprovalRequired: false });
      }

      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(docRef);
          if (userSnap.exists()) {
            setUserData({ uid: user.uid, ...userSnap.data() } as UserData);
          } else {
            setUserData(null);
          }
        } catch (error: any) {
          handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, userData, appSettings, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
