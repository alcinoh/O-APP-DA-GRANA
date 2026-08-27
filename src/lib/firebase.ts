import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Custom databaseId if present
const dbId = (firebaseConfig as any).firestoreDatabaseId || (firebaseConfig as any).databaseId;
export const db = dbId 
  ? getFirestore(app, dbId)
  : getFirestore(app);
