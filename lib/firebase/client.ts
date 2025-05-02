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
  storageBucket: "multi-cliente.appspot.com",
  messagingSenderId: "563434176386",
  appId: "1:563434176386:web:7aca513c0638b225b8d99b",
}

// Inicializar Firebase solo en el cliente
let app
let auth
let db

// Función para inicializar Firebase
const initializeFirebase = () => {
  if (typeof window !== "undefined") {
    try {
      // Verificar si ya hay una app inicializada
      if (!getApps().length) {
        app = initializeApp(firebaseConfig)
        console.log("Firebase inicializado correctamente")
      } else {
        app = getApp()
        console.log("Firebase ya estaba inicializado")
      }

      auth = getAuth(app)
      db = getFirestore(app)

      // Habilitar persistencia para mejorar la experiencia offline
      import("firebase/firestore").then(({ enableIndexedDbPersistence }) => {
        enableIndexedDbPersistence(db).catch((err) => {
          if (err.code === "failed-precondition") {
            console.warn("La persistencia de Firestore no pudo ser habilitada porque múltiples pestañas están abiertas")
          } else if (err.code === "unimplemented") {
            console.warn("El navegador actual no soporta todas las características necesarias para la persistencia")
          } else {
            console.error("Error al habilitar la persistencia de Firestore:", err)
          }
        })
      })

      return { app, auth, db }
    } catch (error) {
      console.error("Error al inicializar Firebase:", error)
      throw error
    }
  }

  return { app: null, auth: null, db: null }
}

// Inicializar Firebase inmediatamente
const { app: initializedApp, auth: initializedAuth, db: initializedDb } = initializeFirebase()
app = initializedApp
auth = initializedAuth
db = initializedDb

// Exportar la función de inicialización y las instancias
export { app, auth, db, initializeFirebase }
