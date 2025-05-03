import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// Verificar si estamos en el navegador
const isBrowser = typeof window !== "undefined"

// Reemplazar la configuración de Firebase con valores hardcodeados para pruebas
// NOTA: Esto es solo para depuración, NO lo uses en producción

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDSEdNRW_7-hGzNvBuMyAxWQuGzTsk--Fk",
  authDomain: "multi-cliente.firebaseapp.com",
  projectId: "multi-cliente",
  storageBucket: "multi-cliente.appspot.com",
  messagingSenderId: "563434176386",
  appId: "1:563434176386:web:7aca513c0638b225b8d99b",
}

// Inicializar Firebase solo en el navegador
let app, auth, db, storage

if (isBrowser) {
  try {
    // Inicializar Firebase solo una vez
    if (!getApps().length) {
      app = initializeApp(firebaseConfig)
      console.log("Firebase inicializado correctamente")
    } else {
      app = getApp()
    }

    // Inicializar servicios
    auth = getAuth(app)
    db = getFirestore(app)
    storage = getStorage(app)
  } catch (error) {
    console.error("Error al inicializar Firebase:", error)
  }
}

export { app, auth, db, storage }
