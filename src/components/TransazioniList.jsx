// src/components/TransazioniList.jsx
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection, getDocs, limit, orderBy, query, startAfter, endBefore, limitToLast, where,
} from 'firebase/firestore';
import { auth, db } from '../firebase';

// Utils
const formatCurrency = (n) =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(Number(n) || 0);

const normalizeIsoDate = (val) => {
  if (!val) return '';
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val)) return val.slice(0, 10);
  const d = new Date(val);
  return isNaN(d) ? '' : d.toISOString().slice(0, 10);
};

const toCsv = (rows) => {
  const headers = ['ID', 'Data', 'Descrizione', 'Categoria', 'Importo'];
  const lines = rows.map((r) => [
    r.id,
    normalizeIsoDate(r.data || ''),
    (r.descrizione || '').toString().replace(/\s+/g, ' ').trim(),
    (r.categoria || '').toString().replace(/\s+/g, ' ').trim(),
    (Number(r.importo) || 0).toString().replace('.', ','),
  ]);
  return [headers, ...lines].map((arr) => arr.map(csvEscape).join(';')).join('\r\n');
};
function csvEscape(v) { const s = String(v ?? ''); return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; }
const useDebounced = (val, ms = 350) => { const [d, setD] = useState(val); useEffect(()=>{const t=setTimeout(()=>setD(val),ms); return ()=>clearTimeout(t);},[val,ms]); return d; };

export default function TransazioniList() {
  const [user, setUser] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // Filtri UI
  const [pageSize, setPageSize] = useState(20);
  const [categoria, setCategoria] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [search, setSearch] = useState('');
  const [tipo, setTipo] = useState('tutte'); // tutte | entrate | uscite
  const debouncedSearch = useDebounced(search, 300);

  // cursori
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const lastDocRef = useRef(null);
  const firstDocRef = useRef(null);
  const cursorStackRef = useRef([]);

  useEffect(() => {
    const off = onAuthStateChanged(auth, (u) => setUser(u || null));
    return () => off();
  }, []);

  const buildQuery = useCallback((direction = 'forward') => {
    if (!user) return null;
    const base = [collection(db, 'transazioni')];

    // 🔒 regola chiave: filtro utente
    base.push(where('utente', '==', user.uid));

    // filtri aggiuntivi
    if (categoria) base.push(where('categoria', '==', categoria));

    const from = normalizeIsoDate(dateFrom);
    const to   = normalizeIsoDate(dateTo);
    if (from) base.push(where('data', '>=', from));
    if (to)   base.push(where('data', '<=', to));

    base.push(orderBy('data', 'desc'));

    if (direction === 'forward' && lastDocRef.current) {
      base.push(startAfter(lastDocRef.current));
    } else if (direction === 'backward' && firstDocRef.current) {
      base.push(endBefore(firstDocRef.current));
    }

    if (direction === 'backward') base.push(limitToLast(pageSize));
    else base.push(limit(pageSize));

    return query(...base);
  }, [user, categoria, dateFrom, dateTo, pageSize]);

  const fetchPage = useCallback(async (direction = 'reset') => {
    if (!user) return;
    setLoading(true); setErr(null);
    try {
      const q = buildQuery(direction === 'reset' ? 'forward' : direction);
      if (!q) return;
      const snap = await getDocs(q);
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setRows(docs);
      firstDocRef.current = snap.docs[0] || null;
      lastDocRef.current  = snap.docs[snap.docs.length - 1] || null;
      setHasPrev(cursorStackRef.current.length > 0);
      setHasNext(snap.size === pageSize);
      if (direction === 'forward') {
        if (firstDocRef.current) cursorStackRef.current.push(firstDocRef.current);
      } else if (direction === 'reset') {
        cursorStackRef.current = [];
      }
    } catch (e) {
      console.error('[TransazioniList] getDocs error:', e);
      setErr('Permessi insufficienti o indice mancante. Crea l’indice composito se Firestore lo richiede.');
    } finally {
      setLoading(false);
    }
  }, [user, buildQuery, pageSize]);

  useEffect(() => {
    lastDocRef.current = null;
    firstDocRef.current = null;
    cursorStackRef.current = [];
    if (user) fetchPage('reset');
  }, [user, categoria, dateFrom, dateTo, pageSize, fetchPage]);

  const goNext = async () => { if (!hasNext) return; await fetchPage('forward'); };
  const goPrev = async () => { if (!hasPrev) return; cursorStackRef.current.pop(); await fetchPage('backward'); };

  // filtri client-side
  const filteredRows = useMemo(() => {
    let r = rows;
    const s = debouncedSearch.trim().toLowerCase();
    if (s) r = r.filter(x => String(x.descrizione||'').toLowerCase().includes(s) || String(x.categoria||'').toLowerCase().includes(s));
    if (tipo === 'entrate') r = r.filter(x => Number(x.importo) >= 0);
    else if (tipo === 'uscite') r = r.filter(x => Number(x.importo) < 0);
    return r;
  }, [rows, debouncedSearch, tipo]);

  const totals = useMemo(() => {
    let entr = 0, usc = 0;
    for (const t of filteredRows) {
      const v = Number(t.importo) || 0;
      if (v >= 0) entr += v; else usc += Math.abs(v);
    }
    return { entrate: entr, uscite: usc, netto: entr - usc };
  }, [filteredRows]);

  const handleExport = () => {
    const csv = toCsv(filteredRows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `transazioni_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  return (
    <div className="transazioni-list">
      {/* Filtri */}
      <div className="toolbar" style={{ display:'grid', gap:8, gridTemplateColumns:'repeat(6, minmax(0,1fr))', alignItems:'end' }}>
        <div className="field">
          <label>Categoria</label>
          <input value={categoria} onChange={e=>setCategoria(e.target.value)} placeholder="es. Spesa, Trasporti…" />
        </div>
        <div className="field">
          <label>Dal</label>
          <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} />
        </div>
        <div className="field">
          <label>Al</label>
          <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} />
        </div>
        <div className="field">
          <label>Tipo</label>
          <select value={tipo} onChange={e=>setTipo(e.target.value)}>
            <option value="tutte">Tutte</option>
            <option value="entrate">Entrate</option>
            <option value="uscite">Uscite</option>
          </select>
        </div>
        <div className="field">
          <label>Ricerca</label>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cerca descrizione/categoria…" />
        </div>
        <div className="field">
          <label>Per pagina</label>
          <select value={pageSize} onChange={e=>setPageSize(Number(e.target.value)||20)}>
            <option>10</option><option>20</option><option>50</option>
          </select>
        </div>
      </div>

      {/* Azioni */}
      <div className="toolbar" style={{ display:'flex', gap:8, alignItems:'center', justifyContent:'space-between', marginTop:8 }}>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn" onClick={()=>fetchPage('reset')}>↻ Aggiorna</button>
          <button className="btn" onClick={handleExport}>⬇️ Export CSV</button>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn" disabled={!hasPrev || loading} onClick={goPrev}>← Precedente</button>
          <button className="btn" disabled={!hasNext || loading} onClick={goNext}>Successiva →</button>
        </div>
      </div>

      {/* Totali */}
      <div className="totals card" style={{ marginTop:8, display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, padding:12 }}>
        <div><strong>Entrate:</strong> <span className="pos">{formatCurrency(totals.entrate)}</span></div>
        <div><strong>Uscite:</strong>  <span className="neg">{formatCurrency(totals.uscite)}</span></div>
        <div><strong>Netto:</strong>   <span className={totals.netto>=0?'pos':'neg'}>{formatCurrency(totals.netto)}</span></div>
      </div>

      {/* Lista */}
      <div className="card" style={{ marginTop:8, padding:0 }}>
        {loading ? (
          <div className="card skeleton" style={{height:160}} />
        ) : err ? (
          <div className="alert error">⚠️ {err}</div>
        ) : filteredRows.length === 0 ? (
          <div className="muted" style={{ padding:16 }}>Nessuna transazione trovata.</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th style={{width:'120px'}}>Data</th>
                <th>Descrizione</th>
                <th style={{width:'220px'}}>Categoria</th>
                <th style={{width:'160px', textAlign:'right'}}>Importo</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map(t => {
                const sign = Number(t.importo) >= 0 ? 'pos' : 'neg';
                return (
                  <tr key={t.id}>
                    <td>{normalizeIsoDate(t.data)}</td>
                    <td>{t.descrizione || '—'}</td>
                    <td>{t.categoria || '—'}</td>
                    <td style={{textAlign:'right'}} className={sign}>{formatCurrency(t.importo)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
