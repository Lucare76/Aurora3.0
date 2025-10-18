// Import SDK modulari
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configurazione del progetto Firebase
const firebaseConfig = {
  apiKey: 'AIzaSyAOF_doem8cUCOnOhhHFmdNFPIb8PdEnYw',
  authDomain: 'aurora3-6e6b0.firebaseapp.com',
  projectId: 'aurora3-6e6b0',
  storageBucket: 'aurora3-6e6b0.appspot.com', // ✅ corretto
  messagingSenderId: '729422713053',
  appId: '1:729422713053:web:129b29a411279a0fd10b34',
};

// Inizializza Firebase
const app = initializeApp(firebaseConfig);

// Export di Auth e Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);
