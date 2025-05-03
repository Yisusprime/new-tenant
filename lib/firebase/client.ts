"use client"

import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore"

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

// Variables para almacenar las instancias
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

      // Usar el nuevo método recomendado para la caché local
      db = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
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
