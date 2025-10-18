import { db, auth } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { categorieDefault } from '../data/categorieDefault';

export const caricaCategorie = async () => {
  const user = auth.currentUser;
  if (!user) return [];

  const ref = doc(db, 'categorie', user.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    return snap.data().lista || [];
  } else {
    await setDoc(ref, { lista: categorieDefault });
    return categorieDefault;
  }
};

