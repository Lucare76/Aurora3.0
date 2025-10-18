import { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
} from 'firebase/firestore';

export default function ObiettiviList() {
  const [obiettivi, setObiettivi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, 'obiettivi'),
      where('utente', '==', user.uid),
      orderBy('deadline', 'asc')
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setObiettivi(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (e) => {
        console.error('ObiettiviList denied:', e);
        setErr('⚠️ Permessi insufficienti');
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const eliminaObiettivo = async (id) => {
    if (window.confirm('Vuoi davvero eliminare questo obiettivo?')) {
      try {
        await deleteDoc(doc(db, 'obiettivi', id));
      } catch (error) {
        console.error('Errore eliminazione:', error);
        alert('Errore durante l’eliminazione');
      }
    }
  };

  if (loading) return <div className="card skeleton" style={{ height: 120 }} />;
  if (err) return <div className="alert error">{err}</div>;
  if (!obiettivi.length) return <div className="muted">Nessun obiettivo impostato.</div>;

  return (
    <ul className="list">
      {obiettivi.map((o) => (
        <li key={o.id} className="list-row">
          <div className="list-title">{o.titolo || 'Obiettivo'}</div>
          <div className="list-meta">{String(o.deadline || '').slice(0, 10) || '—'}</div>
          <div className="badge">{o.stato || 'attivo'}</div>
          <button
            onClick={() => eliminaObiettivo(o.id)}
            className="btn-icon"
            title="Elimina obiettivo"
            style={{ marginLeft: '1rem', color: '#c00', background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            🗑️
          </button>
        </li>
      ))}
    </ul>
  );
}
