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

const formatCurrency = (n) =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(n || 0);

export default function ContiList() {
  const [conti, setConti] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, 'conti'),
      where('utente', '==', user.uid),
      orderBy('nome', 'asc')
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setConti(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (e) => {
        console.error('ContiList denied:', e);
        setErr('⚠️ Permessi insufficienti');
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const eliminaConto = async (id) => {
    if (window.confirm('Vuoi davvero eliminare questo conto?')) {
      try {
        await deleteDoc(doc(db, 'conti', id));
      } catch (error) {
        console.error('Errore eliminazione:', error);
        alert('Errore durante l’eliminazione');
      }
    }
  };

  if (loading) return <div className="card skeleton" style={{ height: 120 }} />;
  if (err) return <div className="alert error">{err}</div>;
  if (!conti.length) return <div className="muted">Nessun conto configurato.</div>;

  return (
    <ul className="list">
      {conti.map((c) => (
        <li key={c.id} className="list-row">
          <div className="list-title">{c.nome || 'Conto'}</div>
          <div className="list-meta">{c.tipo || '—'}</div>
          <div className="badge">{formatCurrency(Number(c.saldo) || 0)}</div>
          <button
            onClick={() => eliminaConto(c.id)}
            className="btn-icon"
            title="Elimina conto"
            style={{ marginLeft: '1rem', color: '#c00', background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            🗑️
          </button>
        </li>
      ))}
    </ul>
  );
}
