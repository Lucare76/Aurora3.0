import { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';

const formatCurrency = (n) =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(n || 0);

export default function BudgetList() {
  const [budget, setBudget] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, 'budget'),
      where('utente', '==', user.uid),
      orderBy('mese', 'desc')
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setBudget(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (e) => {
        console.error('BudgetList denied:', e);
        setErr('⚠️ Permessi insufficienti');
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  if (loading) return <div className="card skeleton" style={{ height: 120 }} />;
  if (err) return <div className="alert error">{err}</div>;
  if (!budget.length) return <div className="muted">Nessun budget impostato.</div>;

  return (
    <ul className="list">
      {budget.map((b) => (
        <li key={b.id} className="list-row">
          <div className="list-title">{b.categoria || '—'}</div>
          <div className="list-meta">{b.mese || '—'}</div>
          <div className="badge">{formatCurrency(Number(b.importo) || 0)}</div>
        </li>
      ))}
    </ul>
  );
}
