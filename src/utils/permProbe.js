// src/utils/permProbe.js
import {
  getDocs, getDoc, query, collection, where, limit, doc,
} from 'firebase/firestore';

/**
 * Esegue una serie di letture di prova per identificare permessi mancanti o path sbagliati.
 * Ritorna un array di risultati: { label, ok, extra }
 */
export async function runFirestoreProbe(db, uid) {
  if (!uid) return [{ label: 'Auth', ok: false, extra: 'Utente non loggato' }];

  const tests = [
    {
      label: "ROOT /transazioni (where utente)",
      run: () => getDocs(query(collection(db, 'transazioni'), where('utente', '==', uid), limit(1))),
      type: 'col',
    },
    {
      label: "ROOT /conti (where utente)",
      run: () => getDocs(query(collection(db, 'conti'), where('utente', '==', uid), limit(1))),
      type: 'col',
    },
    {
      label: "ROOT /obiettivi (where utente)",
      run: () => getDocs(query(collection(db, 'obiettivi'), where('utente', '==', uid), limit(1))),
      type: 'col',
    },
    {
      label: "ROOT /budget (where utente)",
      run: () => getDocs(query(collection(db, 'budget'), where('utente', '==', uid), limit(1))),
      type: 'col',
    },
    {
      label: "Aurora/{uid}/transazioni",
      run: () => getDocs(query(collection(db, 'Aurora', uid, 'transazioni'), limit(1))),
      type: 'col',
    },
    {
      label: "Aurora/{uid}/preferenze/dashboard",
      run: () => getDoc(doc(db, 'Aurora', uid, 'preferenze', 'dashboard')),
      type: 'doc',
    },
    {
      label: "Aurora/{uid}/compleanni",
      run: () => getDocs(query(collection(db, 'Aurora', uid, 'compleanni'), limit(1))),
      type: 'col',
    },
    // Aggiungi qui altre collezioni che sospetti (es. /categorie/{uid}/items)
    {
      label: "CATEGORIE /categorie/{uid}/items",
      run: () => getDocs(query(collection(db, 'categorie', uid, 'items'), limit(1))),
      type: 'col',
    },
  ];

  const results = [];
  for (const t of tests) {
    try {
      const res = await t.run();
      const extra = t.type === 'col'
        ? `size=${res.size}`
        : `exists=${res.exists()}`;
      results.push({ label: t.label, ok: true, extra });
    } catch (e) {
      results.push({ label: t.label, ok: false, extra: e?.message || String(e) });
    }
  }
  return results;
}
