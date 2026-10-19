import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, browserLocalPersistence, setPersistence } from "firebase/auth";
import { getAI, VertexAIBackend } from "firebase/ai";
import { getMessaging, isSupported as isMessagingSupported } from "firebase/messaging";
import { firebaseConfig } from "./firebase.config.js";

const alreadyInit = getApps().length > 0;
const app = alreadyInit ? getApp() : initializeApp(firebaseConfig);
let vertexAIInstance = undefined;

export function getVertexAI() {
  if (vertexAIInstance !== undefined) return vertexAIInstance;
  try {
    vertexAIInstance = getAI(app, { backend: new VertexAIBackend() });
  } catch (error) {
    console.warn("[firebase] Vertex AI init failed", error);
    vertexAIInstance = null;
  }
  return vertexAIInstance;
}

export const db = alreadyInit
  ? getFirestore(app)
  : initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });

export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch(() => {});

export const googleProvider = new GoogleAuthProvider();

let messagingPromise = null;
export async function getMessagingIfSupported() {
  if (typeof window === "undefined" || typeof navigator === "undefined") return null;
  if (!("serviceWorker" in navigator) || typeof Notification === "undefined") return null;
  if (!messagingPromise) {
    messagingPromise = isMessagingSupported().then((supported) => supported ? getMessaging(app) : null).catch(() => null);
  }
  return messagingPromise;
}
