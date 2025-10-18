import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { auth, db } from './firebase';

const TransazioniList = () => {
  const [transazioni, setTransazioni] = useState([]);

  useEffect(() => {
    const fetchTransazioni = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const transRef = collection(db, 'Aurora', user.uid, 'transazioni');
      const snapshot = await getDocs(transRef);
      const dati = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTransazioni(dati);
    };

    fetchTransazioni();
  }, []);

  return (
    <div>
      <h2>Le tue transazioni</h2>
      <ul>
        {transazioni.map(tx => (
          <li key={tx.id}>
            {tx.data} – {tx.descrizione} – {tx.importo}€ ({tx.tipo})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TransazioniList;

