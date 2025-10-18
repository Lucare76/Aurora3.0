// src/components/Dashboard.jsx
import { useEffect, useMemo, useRef, useState, lazy, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  collection, onSnapshot, where, query as fsQuery, setLogLevel,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';

import Logout from './Logout';
import AggiungiBudget from './AggiungiBudget';
import BudgetList from './BudgetList';
import ContiList from './ContiList';
import TransazioniList from './TransazioniList';
import AggiungiObiettivo from './AggiungiObiettivo';
import ObiettiviList from './ObiettiviList';
import MeteoInput from './MeteoInput';
import CompleanniOggi from './CompleanniOggi';
import usePreferenzeDashboard from '../hooks/usePreferenzeDashboard';
import Sidebar from './Sidebar';
import './dashboard.css';

const GraficoEntrateUscite  = lazy(() => import('./GraficoEntrateUscite'));
const GraficoSpeseCategoria = lazy(() => import('./GraficoSpeseCategoria'));

const formatMonth = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

const formatCurrency = (n) =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(n || 0);

const parseIsoDate = (val) => {
  if (!val) return null;
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val)) return val.slice(0,10);
  const d = new Date(val);
  return isNaN(d) ? null : d.toISOString().slice(0,10);
};

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loadingKpi, setLoadingKpi] = useState(true);
  const [err, setErr] = useState(null);
  const [kpi, setKpi] = useState({ saldoTotale: 0, entrateTotali: 0, usciteTotali: 0, speseMese: 0 });

  const preferenze = usePreferenzeDashboard() || {};
  const navigate = useNavigate();
  const meseCorrente = useMemo(() => formatMonth(), []);
  const rootCacheRef = useRef([]);
  const subCacheRef  = useRef([]);
  const unsubsRef    = useRef([]);

  useEffect(() => {
    try { if (process.env.NODE_ENV !== 'production') setLogLevel('debug'); } catch {}
  }, []);

  useEffect(() => {
    const off = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) { setUser(null); navigate('/login'); return; }
      setUser(currentUser);
    });
    return () => off();
  }, [navigate]);

  useEffect(() => {
    unsubsRef.current.forEach((u) => { try { u(); } catch {} });
    unsubsRef.current = [];
    rootCacheRef.current = [];
    subCacheRef.current  = [];

    if (!user) return;

    setLoadingKpi(true);
    setErr(null);

    const recompute = () => {
      const all = [...rootCacheRef.current, ...subCacheRef.current];
      let entrateTotali = 0, usciteTotali = 0, speseMese = 0;
      for (const t of all) {
        const importo = typeof t.importo === 'number' ? t.importo : Number(t.importo || 0);
        const iso = parseIsoDate(t.data);
        if (importo >= 0) entrateTotali += importo; else usciteTotali += Math.abs(importo);
        if (iso && iso.startsWith(meseCorrente) && importo < 0) speseMese += Math.abs(importo);
      }
      setKpi({ saldoTotale: entrateTotali - usciteTotali, entrateTotali, usciteTotali, speseMese });
      setLoadingKpi(false);
    };

    // ROOT: /transazioni (serve where utente)
    const qRoot = fsQuery(collection(db, 'transazioni'), where('utente', '==', user.uid));
    const unsubRoot = onSnapshot(
      qRoot,
      (snap) => { rootCacheRef.current = snap.docs.map(d => ({ id:d.id, ...d.data() }));  recompute(); },
      (e) =>   { console.error('Transazioni root denied:', e); setErr('Impossibile caricare i dati (transazioni).'); setLoadingKpi(false); }
    );

    // SUB: /Aurora/{uid}/transazioni (namespace utente)
    const subRef = collection(db, 'Aurora', user.uid, 'transazioni');
    const unsubSub = onSnapshot(
      subRef,
      (snap) => { subCacheRef.current = snap.docs.map(d => ({ id:d.id, ...d.data() }));  recompute(); },
      (e) =>   { console.error('Transazioni sub denied:', e); setErr('Impossibile caricare i dati (area personale).'); setLoadingKpi(false); }
    );

    unsubsRef.current.push(unsubRoot, unsubSub);
    return () => { unsubsRef.current.forEach((u) => { try { u(); } catch {} }); unsubsRef.current = []; };
  }, [user, meseCorrente]);

  const saluto = useMemo(() => {
    const h = new Date().getHours();
    if (h < 5) return 'Buona notte';
    if (h < 12) return 'Buongiorno';
    if (h < 18) return 'Buon pomeriggio';
    return 'Buonasera';
  }, []);

  if (!user) return null;

  return (
    <div className="dashboard-root">
      <Sidebar />

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="dash-hero">
            <h1>{saluto}, {user.displayName || user.email} 👋</h1>
            <p className="dash-sub">Benvenuto in <strong>Aurora 3.0</strong> — la tua cabina di regia finanziaria.</p>
          </div>
          <div className="dash-actions">
            <Link to="/transazioni" className="btn primary">➕ Nuova transazione</Link>
            <Link to="/obiettivi" className="btn">🎯 Nuovo obiettivo</Link>
            <Logout />
          </div>
        </header>

        {/* KPI */}
        <section className="kpi-grid" aria-busy={loadingKpi}>
          <div className="kpi-card">
            <div className="kpi-label">Saldo Totale</div>
            <div className={`kpi-value ${kpi.saldoTotale >= 0 ? 'pos' : 'neg'}`}>{formatCurrency(kpi.saldoTotale)}</div>
            <div className="kpi-note">Entrate − Uscite (tutte le transazioni)</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Entrate Totali</div>
            <div className="kpi-value pos">{formatCurrency(kpi.entrateTotali)}</div>
            <div className="kpi-note">Somma importi positivi</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Uscite Totali</div>
            <div className="kpi-value neg">{formatCurrency(kpi.usciteTotali)}</div>
            <div className="kpi-note">Somma importi negativi</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Spese {meseCorrente}</div>
            <div className="kpi-value neg">{formatCurrency(kpi.speseMese)}</div>
            <div className="kpi-note">Uscite del mese corrente</div>
          </div>
        </section>

        {err && <div className="alert error">⚠️ {err}</div>}

        {/* Widget (senza Santo del Giorno) */}
        {(preferenze?.compleanni || preferenze?.meteo) && (
          <section className="widgets-grid">
            {preferenze?.compleanni && <CompleanniOggi />}
            {preferenze?.meteo && <MeteoInput />}
          </section>
        )}

        {/* Liste */}
        <section className="panel">
          <div className="panel-header">
            <h2>Budget</h2>
            <AggiungiBudget />
          </div>
          <BudgetList />
        </section>

        <section className="panel">
          <div className="panel-header"><h2>Conti</h2></div>
          <ContiList />
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>Transazioni recenti</h2>
            <Link to="/transazioni" className="btn-link">Vedi tutte →</Link>
          </div>
          <TransazioniList />
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>Obiettivi</h2>
            <AggiungiObiettivo />
          </div>
          <ObiettiviList />
        </section>

        {/* Grafici */}
        <section className="charts-grid">
          <Suspense fallback={<div className="card skeleton" style={{ height: 320 }} />}>
            <GraficoEntrateUscite />
          </Suspense>
          <Suspense fallback={<div className="card skeleton" style={{ height: 320 }} />}>
            <GraficoSpeseCategoria />
          </Suspense>
        </section>
      </main>
    </div>
  );
}
