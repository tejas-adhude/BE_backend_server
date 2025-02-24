const admin = require("firebase-admin");

// Load Firebase service account key (replace with your actual file path)
const serviceAccount = require("./firebase.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://console.firebase.google.com/project/bevoiceassistant/firestore/databases/-default-/data" // Replace with your Firebase Database URL
});

const db = admin.firestore();

module.exports = { admin, db };
