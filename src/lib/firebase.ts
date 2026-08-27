import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyCPMETGCYEF1K0tbJwY_M_UjQW9NxRSHH4",
  authDomain: "gen-lang-client-0571122927.firebaseapp.com",
  projectId: "gen-lang-client-0571122927",
  storageBucket: "gen-lang-client-0571122927.firebasestorage.app",
  messagingSenderId: "405876893524",
  appId: "1:405876893524:web:4918775b771a13f4ba8ac1"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Conecta ao Firestore usando a instância/databaseId correspondente
const firestoreDbId = "ai-studio-acessoriafinance-f0cfbc72-492d-49f3-9266-6c98ee6ab397";
export const db = getFirestore(app, firestoreDbId);

