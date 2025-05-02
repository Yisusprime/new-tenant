"use client"

import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyDSEdNRW_7-hGzNvBuMyAxWQuGzTsk--Fk",
  authDomain: "multi-cliente.firebaseapp.com",
  databaseURL: "https://multi-cliente-default-rtdb.firebaseio.com",
  projectId: "multi-cliente",
  storageBucket: "multi-cliente.appspot.com", // Corregido el dominio del bucket
  messagingSenderId: "563434176386",
  appId: "1:563434176386:web:7aca513c0638b225b8d99b",
}

// Initialize Firebase para el cliente
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

// Habilitar persistencia para mejorar la experiencia offline
if (typeof window !== "undefined") {
  // Solo ejecutar en el cliente
  import("firebase/firestore").then(({ enableIndexedDbPersistence }) => {
    enableIndexedDbPersistence(db).catch((err) => {
      console.error("Error enabling Firestore persistence:", err)
    })
  })
}

export { app, auth, db }
