import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  User as FirebaseUser,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signInWithGoogle: (role: UserRole) => Promise<void>;
  signInWithPhone: (phoneNumber: string, role: UserRole) => Promise<ConfirmationResult>;
  verifyOTP: (confirmationResult: ConfirmationResult, otp: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user profile from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUser(userDoc.data() as UserProfile);
        } else {
          // If user exists in Auth but not in Firestore, we might be in the middle of signup
          // or data is missing. We'll handle this in the sign-in methods.
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const syncUserToFirestore = async (firebaseUser: FirebaseUser, role: UserRole) => {
    const userProfile: UserProfile = {
      uid: firebaseUser.uid,
      name: firebaseUser.displayName || firebaseUser.phoneNumber || 'User',
      email: firebaseUser.email || '',
      role,
      language: 'en',
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), {
      ...userProfile,
      phoneNumber: firebaseUser.phoneNumber || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });

    setUser(userProfile);
  };

  const signInWithGoogle = async (role: UserRole) => {
    const result = await signInWithPopup(auth, googleProvider);
    await syncUserToFirestore(result.user, role);
  };

  const signInWithPhone = async (phoneNumber: string, _role: UserRole) => {
    const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible'
    });
    return await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
  };

  const verifyOTP = async (confirmationResult: ConfirmationResult, otp: string, role: UserRole) => {
    const result = await confirmationResult.confirm(otp);
    await syncUserToFirestore(result.user, role);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInWithPhone, verifyOTP, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
