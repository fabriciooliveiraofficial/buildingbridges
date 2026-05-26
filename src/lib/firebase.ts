import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Connection test as per instructions
async function testConnection() {
  try {
    // Attempting a server-side get to verify connection
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("offline")) {
      console.warn("Firebase is currently offline or configuration is pending propagation.");
    }
    // Resource not found is expected if collection doesn't exist yet
  }
}

testConnection();

export interface FirestoreErrorInfo {
  error: string;
  operationType: "create" | "update" | "delete" | "list" | "get" | "write";
  path: string | null;
  authInfo: {
    userId: string;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
    providerInfo: { providerId: string; displayName: string; email: string }[];
  };
}

export function handleFirestoreError(error: any, operationType: FirestoreErrorInfo["operationType"], path: string | null): never {
  const authInfo = {
    userId: auth.currentUser?.uid || "anonymous",
    email: auth.currentUser?.email || "",
    emailVerified: auth.currentUser?.emailVerified || false,
    isAnonymous: auth.currentUser?.isAnonymous || true,
    providerInfo: auth.currentUser?.providerData.map(p => ({
      providerId: p.providerId,
      displayName: p.displayName || "",
      email: p.email || ""
    })) || []
  };

  const info: FirestoreErrorInfo = {
    error: error.message || "Unknown Firestore error",
    operationType,
    path,
    authInfo
  };

  throw new Error(JSON.stringify(info));
}
