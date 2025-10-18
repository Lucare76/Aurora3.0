import { useEffect, useMemo, useState } from 'react';
import { db, auth } from '../firebase';
import {
  collection,
  query as fsQuery,
  where,
  getDocs,
  getDoc,
  setDoc,
  doc,
} from 'firebase/firestore';
import MeteoWidget from '../components/MeteoWidget';

// Utilità formattazione
const fmtEUR = (n) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(Number(n) || 0);
const yyyymm = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

const Dashboard = () => {
  const [user, setUser] = useState(null);

  const [meseCorrente, setMeseCorrente] = useState(() => yyyymm(new Date()));
  const [entrate, setEntrate] = useState(0);
  const [uscite, setUscite] = useState(0);

  const [budgetInput, setBudgetInput] = useState('');
  const [budgetSalvato, setBudgetSalvato] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Saluto contestuale
  const saluto = useMemo(() => {
    const h = new Date().getHours();
    if (h < 5) return 'Buona notte';
    if (h < 12) return 'Buongiorno';
    if (h < 18) return 'Buon pomeriggio';
    return 'Buonasera';
  }, []);

  // Auth listener
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => setUser(u || null));
    return () => unsub();
  }, []);

  // Carica KPI (entrate/uscite) e budget quando cambiano utente o mese
  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        // ---- Transazioni: compatibile sia con collezione root che sottocollezione Aurora/{uid}/transazioni
        const qRoot = fsQuery(collection(db, 'transazioni'), where('utente', '==', user.uid));
        const snapRoot = await getDocs(qRoot);
        const root = snapRoot.docs.map((d) => ({ id: d.id, ...d.data() }));

        const subRef = collection(db, 'Aurora', user.uid, 'transazioni');
        const snapSub = await getDocs(subRef);
        const sub = snapSub.docs.map((d) => ({ id: d.id, ...d.data() }));

        const tutte = [...root, ...sub];

        let eTot = 0;
        let uTot = 0;
        for (const t of tutte) {
          const m = String(t.data || '').slice(0, 7);
          const imp = typeof t.importo === 'number' ? t.importo : Number(t.importo || 0);
          if (m !== meseCorrente || isNaN(imp)) continue;
          if (imp > 0) eTot += imp; else uTot += Math.abs(imp);
        }
        setEntrate(eTot);
        setUscite(uTot);

        // ---- Budget: id document `${uid}_${YYYY-MM}` → usa getDoc diretto
        const budgetId = `${user.uid}_${meseCorrente}`;
        const budgetRef = doc(db, 'budget', budgetId);
        const budgetSnap = await getDoc(budgetRef);
        setBudgetSalvato(budgetSnap.exists() ? Number(budgetSnap.data()?.importo || 0) : null);
      } catch (e) {
        console.error('Errore caricamento dashboard:', e);
        setError('Impossibile caricare i dati. Riprova.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user, meseCorrente]);

  const salvaBudget = async () => {
    if (!user) return;
    const val = Number(parseFloat(budgetInput));
    if (!isFinite(val) || val <= 0) {
      alert('Inserisci un importo budget valido (> 0).');
      return;
    }
    setSaving(true);
    try {
      const id = `${user.uid}_${meseCorrente}`;
      await setDoc(doc(db, 'budget', id), {
        importo: val,
        mese: meseCorrente,
        utente: user.uid,
        updatedAt: new Date().toISOString(),
      });
      setBudgetSalvato(val);
      setBudgetInput('');
    } catch (e) {
      console.error('Errore salvataggio budget:', e);
      alert('Salvataggio non riuscito.');
    } finally {
      setSaving(false);
    }
  };

  // Calcoli derivati
  const risorseDisponibili = useMemo(() => {
    return budgetSalvato != null ? budgetSalvato - uscite : entrate - uscite;
  }, [budgetSalvato, entrate, uscite]);

  const progressBudget = useMemo(() => {
    if (budgetSalvato == null || budgetSalvato <= 0) return null;
    const pct = Math.min(100, Math.max(0, (uscite / budgetSalvato) * 100));
    return { pct, label: `${pct.toFixed(0)}% del budget speso` };
  }, [budgetSalvato, uscite]);

  return (
    <div style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
        <div>
          <h2 style={{ margin: 0 }}>{saluto}{user ? `, ${user.displayName || user.email}` : ''} 👋</h2>
          <div style={{ color: '#667085', marginTop: 4 }}>Mese corrente: <strong>{meseCorrente}</strong></div>
        </div>
        <div>
          <label style={{ fontSize: 12, color: '#667085' }}>Cambia mese</label><br />
          <input
            type="month"
            value={meseCorrente}
            onChange={(e) => setMeseCorrente(e.target.value)}
            style={{ padding: '0.4rem 0.5rem', border: '1px solid #d0d5dd', borderRadius: 8 }}
          />
        </div>
      </header>

      {/* KPI */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12, marginTop: 20 }}>
        <div className="card" style={{ padding: 16, borderRadius: 12, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: 12, color: '#667085' }}>Risorse disponibili</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: risorseDisponibili >= 0 ? '#066a2b' : '#b42318' }}>{fmtEUR(risorseDisponibili)}</div>
          <div style={{ fontSize: 12, color: '#98a2b3' }}>{budgetSalvato != null ? 'Budget − Uscite' : 'Entrate − Uscite'}</div>
        </div>
        <div className="card" style={{ padding: 16, borderRadius: 12, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: 12, color: '#667085' }}>Entrate totali</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#066a2b' }}>{fmtEUR(entrate)}</div>
          <div style={{ fontSize: 12, color: '#98a2b3' }}>Somma importi positivi</div>
        </div>
        <div className="card" style={{ padding: 16, borderRadius: 12, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: 12, color: '#667085' }}>Uscite totali</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#b42318' }}>{fmtEUR(uscite)}</div>
          <div style={{ fontSize: 12, color: '#98a2b3' }}>Somma importi negativi (assoluto)</div>
        </div>
        <div className="card" style={{ padding: 16, borderRadius: 12, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: 12, color: '#667085' }}>Budget mese</div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>{fmtEUR(budgetSalvato ?? 0)}</div>
          {progressBudget && (
            <div style={{ marginTop: 8 }}>
              <div style={{ height: 8, background: '#f2f4f7', borderRadius: 999 }}>
                <div style={{ width: `${progressBudget.pct}%`, height: '100%', background: progressBudget.pct < 85 ? '#16a34a' : '#dc2626', borderRadius: 999, transition: 'width .2s' }} />
              </div>
              <div style={{ fontSize: 12, color: '#98a2b3', marginTop: 4 }}>{progressBudget.label}</div>
            </div>
          )}
        </div>
      </section>

      {error && (
        <div style={{ marginTop: 16, padding: 12, background: '#fef3f2', border: '1px solid #fecdca', color: '#b42318', borderRadius: 10 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Aggiornamenti */}
      <section style={{ marginTop: 24 }}>
        <h3 style={{ marginBottom: 8 }}>📅 Aggiornamenti Giornalieri</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 12 }}>
          <div className="card" style={{ padding: 16, borderRadius: 12, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <div style={{ fontWeight: 700 }}>🎂 Compleanni oggi</div>
            <div style={{ color: '#667085' }}>Nessun compleanno oggi</div>
          </div>
          <div className="card" style={{ padding: 16, borderRadius: 12, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <div style={{ fontWeight: 700 }}>⛪ Santo del Giorno</div>
            <div style={{ color: '#667085' }}>Santa Teresa d’Ávila — Vergine, Dottore della Chiesa</div>
          </div>
          <div className="card" style={{ padding: 0, borderRadius: 12, overflow: 'hidden', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <MeteoWidget />
          </div>
        </div>
      </section>

      {/* Budget mensile */}
      <section style={{ marginTop: 24 }}>
        <h3>📊 Aggiungi / Aggiorna Budget Mensile</h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#667085' }}>Mese</label>
            <input type="month" value={meseCorrente} onChange={(e) => setMeseCorrente(e.target.value)} style={{ padding: '0.5rem', border: '1px solid #d0d5dd', borderRadius: 8 }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#667085' }}>Budget (€)</label>
            <input type="number" step="0.01" value={budgetInput} onChange={(e) => setBudgetInput(e.target.value)} placeholder="Es. 1200" style={{ padding: '0.5rem', border: '1px solid #d0d5dd', borderRadius: 8, minWidth: 160 }} />
          </div>
          <button onClick={salvaBudget} disabled={saving} style={{ padding: '0.55rem 0.9rem', background: '#155eef', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>
            {saving ? 'Salvataggio…' : '💾 Salva Budget'}
          </button>
          {budgetSalvato != null && (
            <div style={{ color: '#667085' }}>Budget salvato: <strong>{fmtEUR(budgetSalvato)}</strong></div>
          )}
        </div>
      </section>

      {/* Panoramica */}
      <section style={{ marginTop: 24 }}>
        <h3>📘 Il Tuo Budget</h3>
        <p style={{ color: '#667085', lineHeight: 1.6 }}>
          Monitora in tempo reale entrate, uscite e consumo del budget mensile. Cambia mese con il selettore in alto a destra e aggiorna il budget quando necessario.
        </p>
      </section>
    </div>
  );
};

export default Dashboard;

