// src/hooks/useTransazioniUtente.js
import { useEffect, useMemo, useState } from 'react';
import { auth, db } from '../firebase';
import { collection, getDocs, query as fsQuery, where } from 'firebase/firestore';

const yyyymm = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

export default function useTransazioniUtente(mese = yyyymm(new Date())) {
  const [transazioni, setTransazioni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const uid = auth.currentUser?.uid;

  useEffect(() => {
    let active = true;
    (async () => {
      if (!uid) { setTransazioni([]); setLoading(false); return; }
      setLoading(true); setErr(null);
      try {
        // Root
        const qRoot = fsQuery(collection(db, 'transazioni'), where('utente', '==', uid));
        const snapRoot = await getDocs(qRoot);
        const root = snapRoot.docs.map(d => ({ id: d.id, ...d.data() }));

        // Subcollezione
        const subRef = collection(db, 'Aurora', uid, 'transazioni');
        const snapSub = await getDocs(subRef);
        const sub = snapSub.docs.map(d => ({ id: d.id, ...d.data() }));

        const all = [...root, ...sub].map(t => ({
          id: t.id,
          data: String(t.data || ''),               // atteso YYYY-MM-DD
          categoria: t.categoria || 'Altro',
          sottocategoria: t.sottocategoria || '',
          descrizione: t.descrizione || '',
          importo: typeof t.importo === 'number' ? t.importo : Number(t.importo || 0),
        }));

        const meseFiltrato = all.filter(t => t.data.slice(0, 7) === mese && !Number.isNaN(t.importo));
        if (active) setTransazioni(meseFiltrato);
      } catch (e) {
        console.error('Statistiche: errore fetch transazioni', e);
        if (active) setErr('Impossibile leggere le transazioni');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [uid, mese]);

  const kpi = useMemo(() => {
    let entrate = 0, uscite = 0;
    for (const t of transazioni) {
      if (t.importo > 0) entrate += t.importo;
      else uscite += Math.abs(t.importo);
    }
    return { entrate, uscite, saldo: entrate - uscite };
  }, [transazioni]);

  return { transazioni, kpi, loading, error: err };
}
