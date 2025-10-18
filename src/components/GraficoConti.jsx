import { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA66CC', '#FF4444'];

export default function GraficoConti() {
  const [dati, setDati] = useState([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, 'conti'), where('utente', '==', user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const aggregati = {};
      snap.docs.forEach((doc) => {
        const { tipo = 'Altro', saldo = 0 } = doc.data();
        aggregati[tipo] = (aggregati[tipo] || 0) + Number(saldo);
      });

      const lista = Object.entries(aggregati).map(([tipo, saldo]) => ({
        tipo,
        saldo,
      }));

      setDati(lista);
    });

    return () => unsub();
  }, []);

  if (!dati.length) return <div className="muted">Nessun conto da visualizzare.</div>;

  return (
    <div style={{ height: 300 }}>
      <h3 style={{ marginBottom: '1rem' }}>📊 Distribuzione Saldi per Tipo di Conto</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={dati}
            dataKey="saldo"
            nameKey="tipo"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label
          >
            {dati.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
