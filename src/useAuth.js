// src/hooks/useAuth.js
import { useState, useEffect } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";

const useAuth = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const auth = getAuth();

  // Sign up new users
  const signUp = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  // Sign in existing users
  const signIn = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Sign out users
  const signOutUser = () => {
    return signOut(auth);
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
    });
    return unsubscribe; // Cleanup subscription on unmount
  }, []);

  return { currentUser, signUp, signIn, signOutUser };
};

export default useAuth;