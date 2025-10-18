import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

const dati = [
  { mese: '2025-01', importo: 320 },
  { mese: '2025-02', importo: 450 },
  { mese: '2025-03', importo: 390 },
  { mese: '2025-04', importo: 510 },
  { mese: '2025-05', importo: 470 },
  { mese: '2025-06', importo: 430 },
  { mese: '2025-07', importo: 480 },
  { mese: '2025-08', importo: 520 },
  { mese: '2025-09', importo: 490 },
  { mese: '2025-10', importo: 530 },
];

export default function GraficoSpeseMensili() {
  return (
    <div style={{ height: 300 }}>
      <h3>📊 Andamento Spese Mensili</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={dati}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mese" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="importo" stroke="#0077cc" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
