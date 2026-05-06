import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
  isAdmin: boolean;
  isCEO: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (user) {
      const unsubscribeProfile = onSnapshot(doc(db, 'users', user.uid), async (docSnap) => {
        if (docSnap.exists()) {
          const profileData = docSnap.data();
          if (user.email === 'nataliariyadi37@gmail.com' && profileData.role !== 'superadmin') {
            try {
              const { updateDoc } = await import('firebase/firestore');
              await updateDoc(doc(db, 'users', user.uid), { role: 'superadmin' });
              return;
            } catch (e) {
              console.error("Failed to self-upgrade, continuing with current role", e);
            }
          }
          setProfile(profileData);
        }
        setLoading(false);
      }, (error) => {
        console.error("Profile snapshot error:", error);
        setLoading(false);
      });
      return () => unsubscribeProfile();
    }
  }, [user]);

  const isAdmin = profile?.role === 'superadmin' || profile?.role === 'ceo';
  const isCEO = profile?.role === 'ceo';

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, isCEO }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
