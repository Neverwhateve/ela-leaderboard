import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCvNccP1I4CqoApJCGRLyPuD-DldQNkUno",
  authDomain: "project-enrich.firebaseapp.com",
  projectId: "project-enrich",
  storageBucket: "project-enrich.firebasestorage.app",
  messagingSenderId: "355166109118",
  appId: "1:355166109118:web:533367dc4aaf978d0a4def",
  measurementId: "G-KEGFC3MDCD"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };