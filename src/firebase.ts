import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import {
    getFirestore,
    enableIndexedDbPersistence,
    doc,
    getDoc
} from "firebase/firestore";

/*
  🔹 Get these values from:
  Firebase Console → SehatSetu-DB → Project Settings → Your Apps → Web App
*/

const firebaseConfig = {
    apiKey: "AIzaSyAQ4Cz59Lyg41QtKv97W6kP_b358z0jbCY",
    authDomain: "sehatsetu-db.firebaseapp.com",
    projectId: "sehatsetu-db",
    storageBucket: "sehatsetu-db.firebasestorage.app",
    messagingSenderId: "62374207238",
    appId: "1:62374207238:web:737abd05c7c2efa82dc887",
    measurementId: "G-S7XJC8C4FR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase Authentication
export const auth = getAuth(app);

// Firestore Database
export const db = getFirestore(app);

// Enable offline persistence (important for low connectivity areas)
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === "failed-precondition") {
        console.warn("Multiple tabs open. Persistence enabled only in one tab.");
    } else if (err.code === "unimplemented") {
        console.warn("Browser does not support offline persistence.");
    }
});

// Google Authentication
export const googleProvider = new GoogleAuthProvider();
export { signInWithPopup };

// Firestore connection test
async function testConnection() {
    try {
        await getDoc(doc(db, "test", "connection"));
        console.log("✅ Firestore connection successful");
    } catch (error) {
        console.error("❌ Firestore connection error:", error);
    }
}

testConnection();

// Operation types
export enum OperationType {
    CREATE = "create",
    UPDATE = "update",
    DELETE = "delete",
    LIST = "list",
    GET = "get",
    WRITE = "write"
}

// Firestore error structure
export interface FirestoreErrorInfo {
    error: string;
    operationType: OperationType;
    path: string | null;
    authInfo: {
        userId: string | undefined;
        email: string | null | undefined;
        emailVerified: boolean | undefined;
        isAnonymous: boolean | undefined;
        tenantId: string | null | undefined;
        providerInfo: {
            providerId: string;
            displayName: string | null;
            email: string | null;
            photoUrl: string | null;
        }[];
    };
}

// Firestore error handler
export function handleFirestoreError(
    error: unknown,
    operationType: OperationType,
    path: string | null
) {
    const errInfo: FirestoreErrorInfo = {
        error: error instanceof Error ? error.message : String(error),
        operationType,
        path,
        authInfo: {
            userId: auth.currentUser?.uid,
            email: auth.currentUser?.email,
            emailVerified: auth.currentUser?.emailVerified,
            isAnonymous: auth.currentUser?.isAnonymous,
            tenantId: auth.currentUser?.tenantId,
            providerInfo:
                auth.currentUser?.providerData.map((provider) => ({
                    providerId: provider.providerId,
                    displayName: provider.displayName,
                    email: provider.email,
                    photoUrl: provider.photoURL
                })) || []
        }
    };

    console.error("🔥 Firestore Error:", errInfo);
    throw new Error(JSON.stringify(errInfo));
}
