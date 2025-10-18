import { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer,
} from 'recharts';

export default function GraficoEntrateUscite() {
  const [dati, setDati] = useState([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, 'transazioni'), where('utente', '==', user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const aggregati = {};

      snap.docs.forEach((doc) => {
        const { importo = 0, data } = doc.data();
        const mese = String(data || '').slice(0, 7); // YYYY-MM
        if (!mese) return;

        if (!aggregati[mese]) {
          aggregati[mese] = { mese, entrate: 0, uscite: 0 };
        }

        if (importo >= 0) {
          aggregati[mese].entrate += Number(importo);
        } else {
          aggregati[mese].uscite += Math.abs(Number(importo));
        }
      });

      const lista = Object.values(aggregati).sort((a, b) => a.mese.localeCompare(b.mese));
      setDati(lista);
    });

    return () => unsub();
  }, []);

  if (!dati.length) return <div className="muted">Nessuna transazione da visualizzare.</div>;

  return (
    <div style={{ height: 300 }}>
      <h3 style={{ marginBottom: '1rem' }}>📊 Entrate vs Uscite Mensili</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={dati}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mese" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="entrate" fill="#4CAF50" name="Entrate (€)" />
          <Bar dataKey="uscite" fill="#F44336" name="Uscite (€)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
