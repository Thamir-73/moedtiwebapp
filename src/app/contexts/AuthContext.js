"use client";

import { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, db } from '../utils/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('authUser') : null;
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setAuthChecked(true);
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const cachedUserData = localStorage.getItem(`userData_${firebaseUser.uid}`);
        if (cachedUserData) {
          setUser(JSON.parse(cachedUserData));
          setAuthChecked(true);
        } else {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          try {
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              const userData = userDoc.data();
              const fullUserData = {
                ...firebaseUser,
                ...userData,
              };
              setUser(fullUserData);
              localStorage.setItem('authUser', JSON.stringify(fullUserData));
              localStorage.setItem(`userData_${firebaseUser.uid}`, JSON.stringify(fullUserData));
            } else {
              setUser(firebaseUser);
              localStorage.setItem('authUser', JSON.stringify(firebaseUser));
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
            setUser(firebaseUser);
            localStorage.setItem('authUser', JSON.stringify(firebaseUser));
          }
        }
      } else {
        setUser(null);
        localStorage.removeItem('authUser');
      }
      setAuthChecked(true);
    });

    return unsubscribe;
  }, []);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      localStorage.removeItem('authUser');
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('userData_')) {
          localStorage.removeItem(key);
        }
      });
      toast.success('تم تسجيل الخروج بنجاح');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('حدث خطأ أثناء تسجيل الخروج');
    }
  };

  const value = useMemo(() => ({ user, authChecked, signOut }), [user, authChecked]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);