// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Importa Firestore si lo necesitas

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCMuJDIo2TTgXmXDYpzm7y2sTp3KKnqPDQ",
  authDomain: "fir-dl-af534.firebaseapp.com",
  databaseURL: "https://fir-dl-af534-default-rtdb.firebaseio.com",
  projectId: "fir-dl-af534",
  storageBucket: "fir-dl-af534.firebasestorage.app",
  messagingSenderId: "934466712676",
  appId: "1:934466712676:web:561b71e3c631475e06db71"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Inicializa Firestore (si lo necesitas)
const db = getFirestore(app);

export { db }; // Exporta Firestore si lo vas a usar en otros archivos