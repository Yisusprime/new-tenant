// Este script verifica que la configuración de Firebase Admin funciona correctamente
const admin = require("firebase-admin")

// Usar las credenciales proporcionadas
const serviceAccount = {
  type: "service_account",
  project_id: "multi-cliente",
  private_key_id: "58ef7117652d3c841ad6624f54955f713cd1e520",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDyUlNgw8NvTn1X\nMx3oHkKTjuMsKyrDA3xnSxtIdNCnenqy6W5cBVR6UCH5zX2/Xc+nDbPz/dKzyza/\nlIU4IUds4/b6ceG8hzSGSa1ppZyJtHalR8ZxINUkfUNNyJeu0Ew9ZDHVAUNsfjDI\nAOu96HTHgV2qOxVgIE4zpS+I6UeRNa06xeWNB7nMIUJLBuwtC9EBEonRgMcHlTZJ\no087+F811q+rMyqBsE/pn1IhKNWiXwOx3Gx25g6ajwdxX1g9ruqGjTjuTLnmrr8k\ncDrrzViwHzEWziVXPG6fpFzbrx7VOvKezPs0QzPX5zYL3j+5rdOm6xd1g14zAF0V\n3Mb84lehAgMBAAECggEAImRf1BSEyOftbzJglMCyt0mo4WxxAcOdZPWqdiKqOJLw\nFjN+R84z2rZD1DX/mmkAn1eZClCkloMJjrBQJhLHFePW+l2uabkQ0dxkIeHw8TRt\nQHEK76R2y9qBcmk9agDDSVVOo0ouHRhd6Q0EaGw1ItmwBwiitIVxQ/A2amqdjzS1\n4ZAzPEWbTJA791MEpNGQKq6y4yIOHH8jHB2UiBKN6irzNMVUeYim72tcDHSeqdvD\nxRunLCNTUInMowekfl/2QK8UqfP35A3o6ROEuk6j45VClODWizAviOgMXmUKweQM\nEyRq3L6Srt8Y/RmjHxhRg8WpTjWJ92R52psyBM6ySQKBgQD6Hmq11hRfKkZK4xeK\npmuaXfMGdn47K0sXAGEVRgzfpDC5v/axWlM/KcnuQw4bPtUGtS4OSxOztSiZZB/C\n+P+bhh9JOSEw7TAiyKnMrnOYs3gCDAseZhf/twORrxgLyUQsRwtphGBIO8m99o3i\nJRNjVKJ2cfHGVXGicF2x+yrtxQKBgQD4BPlA2R/CcTVgeKfIPn9hKpeef0zEg5d1\nFJbal1Ywfagt/WLjSLedeDnOfp/Z0e76cdil+6TK/65QTgBA170J7hqk1Pt8NBvu\nFjbPZg9WbqWcRlmhz12wArCHZtgF7yO7z2yGTVSQAL5CUA6fQaN2jYHVDHZ3C/1O\ntwbf1VEcLQKBgQCbPO22Vlzmg/KE4FXoNEps0QrZZAoM513/tLiM36F13Q5w+3g9\ns3Yfqewu+Wdz+Zd2RlWDgY2E6Fd+fOpJtQnQmXoplE/Jci2CKVFaPJx6lklR2++6\nulsC17BbZ3VhO1YYtS+cGhE4RAN+59xAFAroh8seALKzCq0wyNUedmm6kQKBgFJ4\nVOlbSVQ+kKEjfab4ISMOJpxtd/lgSFyGHCNTbzVwkxu3xcoNxAB4mcAwGrczN2PP\nt1p58rINksjhJvRoyFMk+XcV2wnRyffBKziLl04GPMtaGTPU4DJGsqxTZkGS4y7w\nKgX+cL/xf1JNjI8oJFKneyR8oGe1dOVXttF2/SGBAoGAKJXUskGAJzg1/SV//A9h\nOSdeV3en9GBMvMT0wI6dF6IrJT+H+woHuuA/03SEPmlW1ciet/kh5vt5L+5fNL/G\nMeVJtKZtGCgEdC9ELqWuQjI+bMkN5EoVHG1Gjj954EnsidpsPi+y5VvVW3Q6X9Ej\n4nuJFKW6SiDMP6buDQTFJjE=\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-fbsvc@multi-cliente.iam.gserviceaccount.com",
  client_id: "113628315944195279439",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40multi-cliente.iam.gserviceaccount.com",
  universe_domain: "googleapis.com",
}

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://multi-cliente-default-rtdb.firebaseio.com",
})

// Probar la conexión a Firestore
const db = admin.firestore()
db.collection("test")
  .doc("test")
  .set({
    test: "Conexión exitosa",
    timestamp: new Date(),
  })
  .then(() => {
    console.log("✅ Conexión a Firebase Admin exitosa")
    process.exit(0)
  })
  .catch((error) => {
    console.error("❌ Error al conectar con Firebase Admin:", error)
    process.exit(1)
  })
