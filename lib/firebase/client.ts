"use client"

import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

// Configuración de Firebase para el cliente
const firebaseConfig = {
  apiKey: "AIzaSyDSEdNRW_7-hGzNvBuMyAxWQuGzTsk--Fk",
  authDomain: "multi-cliente.firebaseapp.com",
  databaseURL: "https://multi-cliente-default-rtdb.firebaseio.com",
  projectId: "multi-cliente",
  storageBucket: "multi-cliente.appspot.com", // Corregido el dominio del bucket
  messagingSenderId: "563434176386",
  appId: "1:563434176386:web:7aca513c0638b225b8d99b",
}

// Verificar que estamos en el cliente antes de inicializar Firebase
let app
let auth
let db

if (typeof window !== "undefined") {
  // Solo ejecutar en el cliente
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)

  // Habilitar persistencia para mejorar la experiencia offline
  import("firebase/firestore").then(({ enableIndexedDbPersistence }) => {
    enableIndexedDbPersistence(db).catch((err) => {
      console.error("Error enabling Firestore persistence:", err)
    })
  })
}

export { app, auth, db }
