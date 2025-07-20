// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);