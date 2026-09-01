// firebase-config.js
// Ces valeurs sont PUBLIQUES et destinées à être utilisées côté navigateur :
// c'est ainsi que fonctionne le SDK client Firebase. La sécurité réelle
// vient des règles Firestore (firestore.rules) et de la vérification des
// tokens côté backend, pas du secret de ce fichier.
//
// Remplace ces valeurs par celles de TON projet Firebase
// (Console Firebase > Paramètres du projet > Vos applications > Config SDK).

const firebaseConfig = {
  apiKey: "REMPLACE_MOI",
  authDomain: "REMPLACE_MOI.firebaseapp.com",
  projectId: "REMPLACE_MOI",
  storageBucket: "REMPLACE_MOI.appspot.com",
  messagingSenderId: "REMPLACE_MOI",
  appId: "REMPLACE_MOI"
};

// URL du backend sécurisé (Render, Railway, Fly.io, Cloud Run...).
// C'est ce backend qui détient les vraies clés secrètes Gemini/CinetPay.
const BACKEND_URL = "https://REMPLACE-PAR-TON-BACKEND.example.com";

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
