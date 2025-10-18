// src/components/CompleanniOggi.jsx
import { useEffect, useRef, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';

export default function CompleanniOggi() {
  const [rows, setRows] = useState([]);
  const unsubRef = useRef(null);

  useEffect(() => {
    const off = onAuthStateChanged(auth, (user) => {
      if (!user) return;
      const ref = collection(db, 'Aurora', user.uid, 'compleanni'); // 🔒 namespace utente
      unsubRef.current?.();
      unsubRef.current = onSnapshot(ref, (snap) => {
        const today = new Date();
        const m = today.getMonth() + 1;
        const d = today.getDate();
        const list = snap.docs
          .map(x => ({ id: x.id, ...x.data() }))
          .filter(p => {
            const dob = String(p.dataNascita || '');
            const mm = Number(dob.slice(5,7));
            const dd = Number(dob.slice(8,10));
            return mm === m && dd === d;
          });
        setRows(list);
      }, (e) => console.error('CompleanniOggi denied:', e));
    });
    return () => { off(); unsubRef.current?.(); };
  }, []);

  if (!rows.length) return <div className="card" style={{ padding: 12 }}><h3>Compleanni</h3><div className="muted">Nessun compleanno oggi.</div></div>;

  return (
    <div className="card" style={{ padding: 12 }}>
      <h3>Compleanni di oggi 🎉</h3>
      <ul className="list">
        {rows.map(p => (<li key={p.id} className="list-row">{p.nome || '—'}</li>))}
      </ul>
    </div>
  );
}
