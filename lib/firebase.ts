import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

// Configuración de Firebase para el cliente
const firebaseConfig = {
  apiKey: "AIzaSyDSEdNRW_7-hGzNvBuMyAxWQuGzTsk--Fk",
  authDomain: "multi-cliente.firebaseapp.com",
  databaseURL: "https://multi-cliente-default-rtdb.firebaseio.com",
  projectId: "multi-cliente",
  storageBucket: "multi-cliente.firebasestorage.app",
  messagingSenderId: "563434176386",
  appId: "1:563434176386:web:7aca513c0638b225b8d99b",
}

// Initialize Firebase para el cliente
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

export { app, auth, db }
