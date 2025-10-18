// src/components/AggiungiObiettivo.jsx
import { useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

export default function AggiungiObiettivo() {
  const [titolo, setTitolo] = useState('');
  const [deadline, setDeadline] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    let user = auth.currentUser;
    if (!user) {
      await new Promise((res) => onAuthStateChanged(auth, (u) => u && res(u)));
      user = auth.currentUser;
    }
    await addDoc(collection(db, 'obiettivi'), {
      utente: user.uid,        // 🔴 OBBLIGATORIO con le regole
      titolo,
      deadline,
      stato: 'attivo',
      createdAt: serverTimestamp()
    });
    setTitolo(''); setDeadline('');
  };

  return (
    <form onSubmit={submit} className="inline-form">
      <input value={titolo} onChange={e=>setTitolo(e.target.value)} placeholder="Titolo" required/>
      <input type="date" value={deadline} onChange={e=>setDeadline(e.target.value)} required/>
      <button className="btn small">Aggiungi</button>
    </form>
  );
}
