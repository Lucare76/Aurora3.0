import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { caricaCategorie } from '../firebase/firebaseCategorie';
import { categorieDefault } from '../data/categorieDefault';

const AggiungiTransazione = () => {
  const [importo, setImporto] = useState('');
  const [categoria, setCategoria] = useState('');
  const [sottocategoria, setSottocategoria] = useState('');
  const [descrizione, setDescrizione] = useState('');
  const [categorie, setCategorie] = useState([]);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchCategorie = async () => {
      try {
        const caricate = await caricaCategorie();
        setCategorie(caricate.length ? caricate : categorieDefault);
      } catch (error) {
        console.error('Errore nel caricamento categorie:', error);
        setCategorie(categorieDefault);
      }
    };
    fetchCategorie();
  }, []);

  const resetForm = () => {
    setImporto('');
    setCategoria('');
    setSottocategoria('');
    setDescrizione('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) {
      alert('Utente non autenticato');
      return;
    }

    if (!importo || isNaN(importo) || !categoria || !sottocategoria) {
      alert('Compila tutti i campi obbligatori');
      return;
    }

    const nuovaTransazione = {
      importo: parseFloat(importo),
      categoria,
      sottocategoria,
      descrizione,
      data: new Date().toISOString(),
      utente: user.uid,
    };

    try {
      // Salva nella collezione globale
      await addDoc(collection(db, 'transazioni'), nuovaTransazione);

      // Salva anche nella collezione personale
      await addDoc(collection(db, 'Aurora', user.uid, 'transazioni'), {
        ...nuovaTransazione,
        utente: undefined, // opzionale
      });

      setSuccess(true);
      resetForm();
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Errore nel salvataggio:', error);
      alert('Errore nel salvataggio della transazione');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '500px', margin: '2rem auto' }}>
      <h2>💸 Aggiungi Transazione</h2>

      {success && <p style={{ color: 'green' }}>✅ Transazione salvata!</p>}

      <input
        type="number"
        value={importo}
        onChange={(e) => setImporto(e.target.value)}
        placeholder="Importo (€)"
        required
        style={{ display: 'block', marginBottom: '1rem', width: '100%' }}
      />

      <select
        value={categoria}
        onChange={(e) => setCategoria(e.target.value)}
        required
        style={{ display: 'block', marginBottom: '1rem', width: '100%' }}
      >
        <option value="">Seleziona categoria</option>
        {categorie.map((cat) => (
          <option key={cat.nome} value={cat.nome}>
            {cat.nome}
          </option>
        ))}
      </select>

      <select
        value={sottocategoria}
        onChange={(e) => setSottocategoria(e.target.value)}
        required
        style={{ display: 'block', marginBottom: '1rem', width: '100%' }}
      >
        <option value="">Seleziona sottocategoria</option>
        {categorie
          .find((c) => c.nome === categoria)
          ?.sottocategorie.map((sub) => (
            <option key={sub} value={sub}>
              {sub}
            </option>
          ))}
      </select>

      <input
        type="text"
        value={descrizione}
        onChange={(e) => setDescrizione(e.target.value)}
        placeholder="Descrizione (facoltativa)"
        style={{ display: 'block', marginBottom: '1rem', width: '100%' }}
      />

      <button type="submit" style={{ padding: '0.5rem 1rem' }}>
        💾 Salva
      </button>
    </form>
  );
};

export default AggiungiTransazione;
