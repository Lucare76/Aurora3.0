// src/components/AggiungiBudget.jsx
import { useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

export default function AggiungiBudget() {
  const [categoria, setCategoria] = useState('');
  const [mese, setMese] = useState(''); // "YYYY-MM"
  const [importo, setImporto] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    let user = auth.currentUser;
    if (!user) {
      await new Promise((res) => onAuthStateChanged(auth, (u) => u && res(u)));
      user = auth.currentUser;
    }
    await addDoc(collection(db, 'budget'), {
      utente: user.uid,         // 🔴 OBBLIGATORIO con le regole
      categoria,
      mese,
      importo: Number(importo) || 0,
      createdAt: serverTimestamp()
    });
    setCategoria(''); setMese(''); setImporto('');
  };

  return (
    <form onSubmit={submit} className="inline-form">
      <input value={categoria} onChange={e=>setCategoria(e.target.value)} placeholder="Categoria" required/>
      <input value={mese} onChange={e=>setMese(e.target.value)} placeholder="YYYY-MM" required/>
      <input value={importo} onChange={e=>setImporto(e.target.value)} placeholder="Importo" required/>
      <button className="btn small">Aggiungi</button>
    </form>
  );
}
