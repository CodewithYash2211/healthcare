import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAQ4Cz59Lyg41QtKv97W6kP_b358z0jbCY",
  authDomain: "sehatsetu-db.firebaseapp.com",
  projectId: "sehatsetu-db",
  storageBucket: "sehatsetu-db.firebasestorage.app",
  messagingSenderId: "62374207238",
  appId: "1:62374207238:web:737abd05c7c2efa82dc887",
  measurementId: "G-S7XJC8C4FR"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  console.log("Connecting and writing to Firestore...");
  try {
    await setDoc(doc(db, "patients", "test-patient"), {
      name: "Test Patient Backend",
      timestamp: new Date().toISOString()
    });
    console.log("Success! Data written to the cloud.");
  } catch (err) {
    console.error("Failed to write:", err.message);
  }
  process.exit();
}
test();
