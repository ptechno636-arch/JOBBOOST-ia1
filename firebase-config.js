// firebase-config.js
const firebaseConfig = {
  apiKey: "AIzaSyBFIxJwUaTWPFUQcIbPsB-NEbsBhuzuwf4",
  authDomain: "jobboost-ai-65602.firebaseapp.com",
  projectId: "jobboost-ai-65602",
  storageBucket: "jobboost-ai-65602.firebasestorage.app",
  messagingSenderId: "964433105460",
  appId: "1:964433105460:web:1992239020e6151c26f061"
};

const BACKEND_URL = "https://jobboost-ai-backend-pemo.onrender.com";

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
