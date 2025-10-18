import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
} from 'recharts';

const dati = [
  { mese: '2025-01', saldo: 880 },
  { mese: '2025-02', saldo: 850 },
  { mese: '2025-03', saldo: 710 },
  { mese: '2025-04', saldo: 890 },
  { mese: '2025-05', saldo: 780 },
  { mese: '2025-06', saldo: 920 },
  { mese: '2025-07', saldo: 800 },
  { mese: '2025-08', saldo: 900 },
  { mese: '2025-09', saldo: 890 },
  { mese: '2025-10', saldo: 970 },
];

export default function GraficoSaldoMensile() {
  return (
    <div style={{ height: 300 }}>
      <h3>📊 Saldo Mensile Netto</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={dati}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mese" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="saldo" stroke="#0077cc" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
