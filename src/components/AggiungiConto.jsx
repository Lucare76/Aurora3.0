// src/components/AggiungiConto.jsx
import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AggiungiConto = () => {
  const [nome, setNome] = useState('');
  const [saldo, setSaldo] = useState('');
  const [valuta, setValuta] = useState('EUR');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) {
      alert('Utente non autenticato');
      return;
    }

    try {
      await addDoc(collection(db, 'Aurora', user.uid, 'conti'), {
        nome,
        saldo: parseFloat(saldo),
        valuta
      });
      alert('Conto aggiunto con successo!');
      setNome('');
      setSaldo('');
      setValuta('EUR');
    } catch (error) {
      console.error('Errore durante l’aggiunta del conto:', error);
      alert('Errore durante l’aggiunta del conto');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
      <h3>➕ Aggiungi un conto</h3>
      <div>
        <label>Nome conto:</label>
        <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required />
      </div>
      <div>
        <label>Saldo iniziale (€):</label>
        <input type="number" value={saldo} onChange={(e) => setSaldo(e.target.value)} required />
      </div>
      <div>
        <label>Valuta:</label>
        <select value={valuta} onChange={(e) => setValuta(e.target.value)}>
          <option value="EUR">EUR</option>
          <option value="USD">USD</option>
          <option value="GBP">GBP</option>
        </select>
      </div>
      <button type="submit" style={{ marginTop: '1rem' }}>Aggiungi conto</button>
    </form>
  );
};

export default AggiungiConto;
