import { getApp, getApps, initializeApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { Firestore, enablePersistence, getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_MEASUREMENT_ID
};

if (!firebaseConfig.apiKey) {
  throw new Error('As variáveis de ambiente do Firebase não foram carregadas. Verifique seu arquivo .env');
}

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db: Firestore = getFirestore(app);

enablePersistence(db)
  .catch((err) => {
    if (err.code == 'failed-precondition') {
      console.log('Persistência falhou, múltiplas abas abertas.');
    } else if (err.code == 'unimplemented') {
      console.log('Persistência não suportada neste ambiente.');
    }
  });

const auth: Auth = getAuth(app);

export { auth, db };
