import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  getRedirectResult
} from 'firebase/auth';
import { auth } from '../firebase'; // from your firebase.js
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRedirectResult(auth).catch(() => {
      // Prevent Firebase from attempting to resume a redirect session
    });
  }, []);

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence).then(() => {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        const db = getFirestore();

        if (currentUser) {
          const fetchUserProfile = async () => {
            try {
              const profileRef = doc(db, "users", currentUser.uid, "profile", "identity");
              const prefsRef = doc(db, "users", currentUser.uid, "stayPreferences", "preferences");
              const [profileSnap, prefsSnap] = await Promise.all([getDoc(profileRef), getDoc(prefsRef)]);

              const profileData = profileSnap.exists() ? profileSnap.data() : {};
              const stayPreferences = prefsSnap.exists() ? prefsSnap.data() : {};

              const userWithProfile = {
                ...currentUser,
                profile: {
                  ...profileData,
                  stayPreferences,
                },
                fullName: profileData.fullName || null,
              };
              console.log("User with profile in AuthContext:", userWithProfile);
              setUser(userWithProfile);
              localStorage.setItem("authUser", JSON.stringify(userWithProfile));
            } catch (error) {
              console.error("Error fetching user profile:", error);
              setUser(currentUser);
              localStorage.setItem("authUser", JSON.stringify(currentUser));
            }
          };
          fetchUserProfile();
        } else {
          setUser(null);
          localStorage.removeItem("authUser");
        }

        setLoading(false);
      });

      return () => unsubscribe();
    });
  }, []);

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'forceLogout') {
        signOut(auth).then(() => {
          setUser(null);
        });
      }
      if (event.key === 'forceLogin') {
        window.location.reload();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
  const signInWithFacebook = () => signInWithPopup(auth, facebookProvider);
  const signInWithEmail = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const signUpWithEmail = (email, password) => createUserWithEmailAndPassword(auth, email, password);
  const logout = () => {
    localStorage.setItem('forceLogout', Date.now());
    signOut(auth).then(() => {
      setUser(null);
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile: user?.profile,
      loading,
      signInWithGoogle,
      signInWithFacebook,
      signInWithEmail,
      signUpWithEmail,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};