import { getApp, getApps, initializeApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { enableIndexedDbPersistence, Firestore, getFirestore } from "firebase/firestore";


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyALffscTuGhmfpqYbIxIZkRUud36KMcIGU",
  authDomain: "appgado-controle.firebaseapp.com",
  projectId: "appgado-controle",
  storageBucket: "appgado-controle.firebasestorage.app",
  messagingSenderId: "494493075102",
  appId: "1:494493075102:web:0f5b4eec53e08c74819d8f",
  measurementId: "G-FKBGJL249Z"
};

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db: Firestore = getFirestore(app);
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code == 'failed-precondition') {
      // Isso pode acontecer se o usuário tiver o app aberto em múltiplas abas do navegador.
      console.warn("Firestore: Persistência falhou, múltiplas abas abertas.");
    } else if (err.code == 'unimplemented') {
      // O navegador não suporta a funcionalidade. No Expo Go, isso não deve ser um problema.
      console.warn("Firestore: Persistência não suportada neste navegador.");
    }
  });

const auth: Auth = getAuth(app);

export { auth, db };
