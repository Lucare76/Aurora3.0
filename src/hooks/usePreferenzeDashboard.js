// src/hooks/usePreferenzeDashboard.js
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const usePreferenzeDashboard = () => {
  const [preferenze, setPreferenze] = useState({
    meteo: true,
    compleanni: true,
  });

  useEffect(() => {
    const off = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      try {
        const ref = doc(db, 'Aurora', user.uid, 'preferenze', 'dashboard');
        const snap = await getDoc(ref);
        if (snap.exists()) setPreferenze(snap.data());
      } catch (e) {
        console.error('Errore preferenze dashboard:', e);
      }
    });
    return () => off();
  }, []);

  return preferenze;
};

export default usePreferenzeDashboard;
