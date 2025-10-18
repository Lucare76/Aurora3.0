// src/components/GraficoSpeseCategoria.jsx
import { useEffect, useRef, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { auth, db } from '../firebase';

export default function GraficoSpeseCategoria() {
  const [data, setData] = useState([]); // [{categoria, totale}]
  const unsubRef = useRef(null);

  useEffect(() => {
    const off = onAuthStateChanged(auth, (user) => {
      if (!user) return;

      const q = query(
        collection(db, 'transazioni'),
        where('utente', '==', user.uid)
      );

      unsubRef.current?.();
      unsubRef.current = onSnapshot(q, (snap) => {
        const map = new Map();
        for (const d of snap.docs) {
          const t = d.data();
          const cat = String(t.categoria || 'Altro');
          const v   = Number(t.importo) || 0;
          if (v < 0) map.set(cat, (map.get(cat) || 0) + Math.abs(v));
        }
        setData(Array.from(map, ([categoria, totale]) => ({ categoria, totale })));
      }, (e) => console.error('GraficoSpeseCategoria denied:', e));
    });
    return () => { off(); unsubRef.current?.(); };
  }, []);

  // placeholder: sostituisci con un pie/bar chart
  return (
    <div className="card" style={{ padding: 12 }}>
      <h3>Spese per categoria</h3>
      <pre style={{ fontSize: 12, whiteSpace: 'pre-wrap' }}>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
