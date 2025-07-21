import { getApp, getApps, initializeApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";


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

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

export { auth, db };
